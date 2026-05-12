"use client";

import { useEffect, useState } from "react";
import { 
  Image as ImageIcon, 
  Plus, 
  Search, 
  LayoutGrid, 
  List,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2
} from "lucide-react";

export default function AdminMedia() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMedia, setNewMedia] = useState({ filename: "", url: "", altText: "" });

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (res.ok) setMedia(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        const res = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
      } catch (err) {
        console.error(err);
      }
    }
    fetchMedia();
    setShowAddModal(false);
  };

  return (
    <div className="font-sans text-[#3c434a]">
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Media Library</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-md text-[13px] font-medium hover:bg-[#f0f6fa] transition-all"
        >
          Add New
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-4">
            <div className="flex items-center border border-[#8c8f94] bg-white rounded-sm overflow-hidden">
               <button className="p-1.5 bg-[#f0f0f1] border-r border-[#8c8f94]"><LayoutGrid className="w-4 h-4 text-[#1d2327]" /></button>
               <button className="p-1.5 hover:bg-[#f6f7f7]"><List className="w-4 h-4 text-[#8c8f94]" /></button>
            </div>
            <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1.5 rounded-sm outline-none">
               <option>All media items</option>
            </select>
            <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1.5 rounded-sm outline-none">
               <option>All dates</option>
            </select>
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa]">Bulk Select</button>
         </div>

         <div className="flex items-center gap-2">
            <label className="text-[13px] text-[#646970]">Search</label>
            <input 
              type="text" 
              className="border border-[#8c8f94] outline-none p-1.5 text-[13px] w-48 bg-white"
            />
         </div>
      </div>

      {/* Media Grid */}
      <div className="bg-white border border-[#c3c4c7] p-1 min-h-[600px]">
        {loading ? (
          <div className="p-20 text-center text-[13px]">Loading media...</div>
        ) : media.length === 0 ? (
          <div className="p-20 text-center text-[13px] text-black/30 italic">No media items found.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
            {media.map((item) => (
              <div 
                key={item._id} 
                onClick={() => setSelectedItem(item)}
                className={`relative aspect-square bg-[#f0f0f1] border-[3px] cursor-pointer group overflow-hidden transition-all ${
                  selectedItem?._id === item._id ? "border-[#2271b1] ring-2 ring-[#2271b1] ring-inset" : "border-transparent"
                }`}
              >
                 <img src={item.url} alt="" className="w-full h-full object-cover" />
                 {selectedItem?._id === item._id && (
                   <div className="absolute top-1 right-1 bg-[#2271b1] text-white p-0.5 rounded-sm">
                      <ChevronRight className="w-3 h-3 rotate-45" />
                   </div>
                 )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* WP Attachment Details Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-10 bg-black/70 backdrop-blur-sm">
           <div className="bg-[#f0f0f1] w-full max-w-6xl h-full max-h-[800px] flex flex-col md:flex-row shadow-2xl overflow-hidden relative border border-[#c3c4c7]">
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-[210] p-2 hover:bg-black/5 rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Left: Image Preview */}
              <div className="flex-1 bg-black/5 flex items-center justify-center p-10 relative">
                 <img src={selectedItem.url} alt="" className="max-w-full max-h-full shadow-lg object-contain" />
              </div>

              {/* Right: Details Panel */}
              <div className="w-full md:w-80 bg-white border-l border-[#c3c4c7] p-4 overflow-y-auto space-y-6">
                 <div>
                    <h2 className="text-[14px] font-bold text-[#1d2327] mb-4 uppercase tracking-wide">Attachment Details</h2>
                    <div className="flex items-start gap-4 text-[12px] text-[#646970] mb-6">
                       <div className="w-16 h-16 bg-[#f0f0f1] rounded-sm overflow-hidden shrink-0 border border-black/5">
                          <img src={selectedItem.url} alt="" className="w-full h-full object-cover" />
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <p className="font-bold text-[#1d2327] truncate">{selectedItem.filename}</p>
                          <p>{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                          <p className="text-[#d63638] cursor-pointer hover:underline mt-2">Delete Permanently</p>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[12px] font-bold text-[#1d2327]">Alternative Text</label>
                          <input className="w-full border border-[#8c8f94] p-1.5 text-[13px] outline-none focus:border-[#2271b1]" defaultValue={selectedItem.altText} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[12px] font-bold text-[#1d2327]">Title</label>
                          <input className="w-full border border-[#8c8f94] p-1.5 text-[13px] outline-none focus:border-[#2271b1]" defaultValue={selectedItem.filename} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[12px] font-bold text-[#1d2327]">File URL:</label>
                          <input className="w-full border border-[#8c8f94] bg-[#f6f7f7] p-1.5 text-[13px] outline-none" readOnly value={selectedItem.url} />
                          <button className="text-[11px] text-[#2271b1] hover:text-[#135e96] font-bold mt-1">Copy URL to clipboard</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* PC Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50">
           <div className="bg-white border border-[#c3c4c7] w-full max-w-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-[#f6f7f7] border-b border-[#c3c4c7]">
                 <h2 className="text-[14px] font-bold text-[#1d2327]">Upload New Media</h2>
                 <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-[#8c8f94]" /></button>
              </div>
              <div className="p-10 text-center">
                 <div className="border-2 border-dashed border-[#c3c4c7] rounded-sm p-12 bg-[#f0f0f1]/50 group hover:border-[#2271b1] transition-all relative">
                    <input 
                       type="file" 
                       multiple 
                       onChange={handleFileUpload}
                       className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="space-y-4">
                       <Plus className="w-10 h-10 text-[#8c8f94] mx-auto group-hover:text-[#2271b1]" />
                       <h3 className="text-[20px] font-light text-[#1d2327]">Drop files to upload</h3>
                       <p className="text-[13px] text-[#646970]">or</p>
                       <button className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-4 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa]">Select Files</button>
                    </div>
                 </div>
                 <p className="mt-4 text-[12px] text-[#646970]">Maximum upload file size: 2 MB.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
