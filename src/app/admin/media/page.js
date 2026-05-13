"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, LayoutGrid, List, Upload, Trash2, RotateCcw,
  X, Copy, Check, Loader2, Image as ImageIcon, AlertTriangle
} from "lucide-react";

export default function AdminMedia() {
  const [items, setItems]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState("grid");          // grid | list
  const [tab, setTab]               = useState("library");       // library | trash
  const [search, setSearch]         = useState("");
  const [page, setPage]             = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected]     = useState(new Set());
  const [bulkMode, setBulkMode]     = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  const [editItem, setEditItem]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [copied, setCopied]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const fileInputRef = useRef(null);
  const searchTimeout = useRef(null);

  const fetchMedia = useCallback(async (q = search, pg = page, t = tab, type = 'all', s = 'newest') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: q, page: pg, limit: 30, trash: t === "trash", type, sort: s
      });
      const res = await fetch(`/api/admin/media?${params}`);
      const data = await res.json();
      if (data.success) { setItems(data.items); setPagination(data.pagination); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMedia("", 1, tab); setSelected(new Set()); setDetailItem(null); }, [tab]);

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setPage(1); fetchMedia(val, 1, tab); }, 400);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemClick = (item) => {
    if (bulkMode) { toggleSelect(item._id); return; }
    setDetailItem(item);
    setEditItem({ ...item });
  };

  // Upload files
  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append("file", f));
    try {
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) { await fetchMedia("", 1, "library"); setSearch(""); setPage(1); setTab("library"); }
      if (data.errors?.length) alert(data.errors.map(e => `${e.file}: ${e.error}`).join('\n'));
    } finally { setUploading(false); }
  };

  // Save metadata
  const saveMetadata = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/media/${editItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editItem.title, altText: editItem.altText, caption: editItem.caption, tags: editItem.tags }),
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(i => i._id === editItem._id ? data.media : i));
        setDetailItem(data.media);
        setEditItem({ ...data.media });
      }
    } finally { setSaving(false); }
  };

  // Soft delete
  const softDelete = async (id) => {
    await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
    setDetailItem(null);
    fetchMedia(search, page, tab);
  };

  // Permanent delete
  const permanentDelete = async (id) => {
    const res = await fetch(`/api/admin/media/${id}?permanent=true`, { method: "DELETE" });
    const data = await res.json();
    if (data.error === "Image is still in use") {
      alert(`Cannot delete — image is used in ${data.usageCount} place(s).`);
      return;
    }
    setDetailItem(null);
    setDeleteConfirm(null);
    fetchMedia(search, page, tab);
  };

  // Restore
  const restore = async (id) => {
    await fetch(`/api/admin/media/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ restore: true }),
    });
    setDetailItem(null);
    fetchMedia(search, page, tab);
  };

  // Bulk delete
  const bulkSoftDelete = async () => {
    await Promise.all([...selected].map(id => fetch(`/api/admin/media/${id}`, { method: "DELETE" })));
    setSelected(new Set());
    setBulkMode(false);
    fetchMedia(search, page, tab);
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="font-sans text-[#1d2327] flex flex-col h-full">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[23px] font-normal">Media Library</h1>
        <label className="flex items-center gap-2 px-4 py-1.5 bg-[#2271b1] text-white text-[13px] font-semibold rounded-sm hover:bg-[#135e96] cursor-pointer transition-colors">
          <Upload className="w-4 h-4" />
          {uploading ? "Uploading..." : "Add New"}
          <input type="file" multiple accept="image/*" className="hidden" onChange={e => handleFiles(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {/* ── Tabs: Library | Trash ── */}
      <div className="flex gap-0 mb-4 border-b border-[#c3c4c7]">
        {["library", "trash"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-[13px] capitalize font-medium border-b-2 transition-colors -mb-px ${
              tab === t ? "border-[#2271b1] text-[#2271b1]" : "border-transparent text-[#646970] hover:text-[#1d2327]"
            }`}
          >
            {t === "trash" ? "Trash" : "All Media"}
            {t === "trash" && pagination.total > 0 && tab === "trash" && (
              <span className="ml-1.5 bg-[#d63638] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pagination.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center border border-[#8c8f94] rounded-sm overflow-hidden shrink-0">
          <button onClick={() => setView("grid")} className={`p-1.5 ${view === "grid" ? "bg-[#1d2327] text-white" : "bg-white text-[#8c8f94] hover:bg-[#f0f0f1]"}`}><LayoutGrid className="w-4 h-4" /></button>
          <button onClick={() => setView("list")} className={`p-1.5 border-l border-[#8c8f94] ${view === "list" ? "bg-[#1d2327] text-white" : "bg-white text-[#8c8f94] hover:bg-[#f0f0f1]"}`}><List className="w-4 h-4" /></button>
        </div>

        <select 
          onChange={(e) => fetchMedia(search, 1, tab, e.target.value)}
          className="px-3 py-1.5 text-[13px] border border-[#8c8f94] bg-white outline-none focus:border-[#2271b1] rounded-sm"
        >
          <option value="all">All Media</option>
          <option value="image">Images</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
        </select>

        <select 
          onChange={(e) => fetchMedia(search, 1, tab, 'all', e.target.value)}
          className="px-3 py-1.5 text-[13px] border border-[#8c8f94] bg-white outline-none focus:border-[#2271b1] rounded-sm"
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="name">Sort: Name A-Z</option>
        </select>

        <button onClick={() => { setBulkMode(!bulkMode); setSelected(new Set()); }}
          className={`px-3 py-1.5 text-[13px] font-medium border rounded-sm transition-colors ${bulkMode ? "bg-[#1d2327] text-white border-[#1d2327]" : "border-[#8c8f94] text-[#646970] hover:bg-[#f0f0f1]"}`}>
          {bulkMode ? `Bulk Mode (${selected.size})` : "Bulk Select"}
        </button>

        {bulkMode && selected.size > 0 && (
          <button onClick={bulkSoftDelete} className="px-3 py-1.5 text-[13px] font-medium border border-[#d63638] text-[#d63638] hover:bg-red-50 rounded-sm transition-colors flex items-center gap-1">
            <Trash2 className="w-3.5 h-3.5" /> Delete {selected.size} selected
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8f94]" />
            <input value={search} onChange={e => handleSearch(e.target.value)}
              placeholder="Search media..." className="pl-8 pr-3 py-1.5 border border-[#8c8f94] text-[13px] outline-none focus:border-[#2271b1] w-52 bg-white" />
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 gap-5 min-h-0">

        {/* Left: Grid/List */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div
            className={`flex-1 bg-white border border-[#c3c4c7] overflow-auto relative ${dragOver ? "ring-2 ring-[#2271b1] ring-inset" : ""}`}
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
          >
            {dragOver && (
              <div className="absolute inset-0 bg-[#2271b1]/10 border-2 border-[#2271b1] border-dashed flex items-center justify-center z-10 pointer-events-none">
                <p className="text-[#2271b1] font-semibold text-[15px]">Drop files to upload</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 text-[#2271b1] animate-spin" /></div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <ImageIcon className="w-12 h-12 text-[#c3c4c7]" />
                <p className="text-[13px] text-[#8c8f94] italic">{tab === "trash" ? "Trash is empty." : "No media found. Drag files here or click Add New."}</p>
              </div>
            ) : view === "grid" ? (
              <div className="p-1 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-1">
                {items.map(item => (
                  <div key={item._id} onClick={() => handleItemClick(item)}
                    className={`relative aspect-square cursor-pointer group overflow-hidden border-[3px] transition-all ${
                      selected.has(item._id) ? "border-[#2271b1]"
                      : detailItem?._id === item._id ? "border-[#2271b1]"
                      : "border-transparent hover:border-[#2271b1]/50"
                    }`}
                  >
                    <img 
                      src={item.url.includes('cloudinary.com') ? item.url.replace('/upload/', '/upload/w_300,h_300,c_fill,f_auto,q_auto/') : item.url} 
                      alt={item.altText || ''} 
                      className="w-full h-full object-cover bg-[#f0f0f1]" 
                      loading="lazy"
                    />
                    {tab === "trash" && <div className="absolute inset-0 bg-red-900/30 flex items-end"><span className="w-full text-center bg-red-700 text-white text-[9px] py-0.5">TRASH</span></div>}
                    {(selected.has(item._id) || (bulkMode && selected.has(item._id))) && (
                      <div className="absolute top-1 right-1 w-5 h-5 bg-[#2271b1] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[9px] px-1 py-0.5 opacity-0 group-hover:opacity-100 truncate">{item.filename}</div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View */
              <table className="w-full text-[13px]">
                <thead className="bg-[#f6f7f7] border-b border-[#c3c4c7] sticky top-0">
                  <tr>
                    {bulkMode && <th className="px-3 py-2 w-8" />}
                    <th className="px-4 py-2 text-left font-semibold text-[#646970] text-[11px] uppercase">File</th>
                    <th className="px-4 py-2 text-left font-semibold text-[#646970] text-[11px] uppercase">Title</th>
                    <th className="px-4 py-2 text-center font-semibold text-[#646970] text-[11px] uppercase">Type</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#646970] text-[11px] uppercase">Size</th>
                    <th className="px-4 py-2 text-right font-semibold text-[#646970] text-[11px] uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1]">
                  {items.map(item => (
                    <tr key={item._id} onClick={() => handleItemClick(item)} className={`cursor-pointer hover:bg-[#f6f7f7] ${detailItem?._id === item._id ? "bg-[#f0f6fa]" : ""}`}>
                      {bulkMode && (
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selected.has(item._id)} onChange={() => toggleSelect(item._id)} onClick={e => e.stopPropagation()} />
                        </td>
                      )}
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#f0f0f1] border border-[#e0e0e0] overflow-hidden shrink-0">
                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                          </div>
                          <span className="font-medium text-[#2271b1] truncate max-w-[160px]">{item.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-[#646970]">{item.title || '—'}</td>
                      <td className="px-4 py-2 text-center text-[#8c8f94] text-[11px] uppercase">{item.format || item.mimeType?.split('/')[1]}</td>
                      <td className="px-4 py-2 text-right text-[#8c8f94]">{item.fileSize ? `${(item.fileSize/1024).toFixed(0)} KB` : '—'}</td>
                      <td className="px-4 py-2 text-right text-[#8c8f94]">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between py-2 border-t border-[#c3c4c7] bg-white px-4 text-[13px] text-[#646970]">
              <span>{pagination.total} items</span>
              <div className="flex items-center gap-2">
                <button disabled={page <= 1} onClick={() => { const p = page-1; setPage(p); fetchMedia(search, p, tab); }} className="px-3 py-1 border border-[#c3c4c7] disabled:opacity-30 hover:bg-[#f0f0f1] rounded-sm">←</button>
                <span>Page {page} of {pagination.pages}</span>
                <button disabled={page >= pagination.pages} onClick={() => { const p = page+1; setPage(p); fetchMedia(search, p, tab); }} className="px-3 py-1 border border-[#c3c4c7] disabled:opacity-30 hover:bg-[#f0f0f1] rounded-sm">→</button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Detail Sidebar */}
        {detailItem && (
          <div className="w-[280px] shrink-0 bg-white border border-[#c3c4c7] shadow-sm overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#1d2327]">Attachment Details</h3>
              <button onClick={() => setDetailItem(null)}><X className="w-4 h-4 text-[#8c8f94]" /></button>
            </div>
            <div className="p-4 space-y-4">
              {/* Preview */}
              <div className="bg-[#f0f0f1] border border-[#e0e0e0] aspect-square overflow-hidden">
                <img src={detailItem.url} alt="" className="w-full h-full object-contain" />
              </div>
              {/* File Info */}
              <div className="text-[11px] text-[#646970] space-y-1">
                <p className="font-bold text-[#1d2327] text-[12px] break-all">{detailItem.filename}</p>
                <p>{new Date(detailItem.createdAt).toLocaleString()}</p>
                {detailItem.width && <p>{detailItem.width} × {detailItem.height} px</p>}
                {detailItem.fileSize && <p>{(detailItem.fileSize/1024).toFixed(0)} KB</p>}
                {detailItem.format && <p>Format: {detailItem.format?.toUpperCase()}</p>}
                {detailItem.usageCount > 0 && (
                  <p className="bg-[#fff3cd] text-[#856404] px-2 py-1 rounded-sm mt-2">
                    Used in {detailItem.usageCount} place{detailItem.usageCount > 1 ? 's' : ''}
                  </p>
                )}
              </div>
              {/* Editable Fields */}
              {editItem && !detailItem.isDeleted && (
                <div className="space-y-3">
                  {[
                    { key: 'altText', label: 'Alternative Text', type: 'input', placeholder: 'Describe this image for accessibility...' },
                    { key: 'title', label: 'Title', type: 'input' },
                    { key: 'caption', label: 'Caption', type: 'textarea' },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-[11px] font-bold text-[#1d2327] block mb-1">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea rows={2} value={editItem[field.key] || ''} onChange={e => setEditItem(p => ({...p, [field.key]: e.target.value}))}
                          className="w-full border border-[#8c8f94] p-1.5 text-[12px] outline-none focus:border-[#2271b1] resize-none" />
                      ) : (
                        <input value={editItem[field.key] || ''} onChange={e => setEditItem(p => ({...p, [field.key]: e.target.value}))}
                          placeholder={field.placeholder} className="w-full border border-[#8c8f94] p-1.5 text-[12px] outline-none focus:border-[#2271b1]" />
                      )}
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gray-100">
                    <label className="text-[11px] font-bold text-[#1d2327] block mb-1">Tags</label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {(editItem.tags || []).map((tag, idx) => (
                        <span key={idx} className="bg-[#f0f6fa] text-[#2271b1] text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                          {tag}
                          <button type="button" onClick={() => setEditItem({...editItem, tags: editItem.tags.filter((_, i) => i !== idx)})}><X className="w-2 h-2" /></button>
                        </span>
                      ))}
                    </div>
                    <input 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          const newTag = e.target.value.trim();
                          if (!(editItem.tags || []).includes(newTag)) {
                            setEditItem({...editItem, tags: [...(editItem.tags || []), newTag]});
                          }
                          e.target.value = '';
                        }
                      }}
                      placeholder="Add tag and press Enter..." 
                      className="w-full border border-[#8c8f94] p-1.5 text-[11px] outline-none focus:border-[#2271b1]" 
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#1d2327] block mb-1">File URL</label>
                    <div className="flex gap-1">
                      <input readOnly value={detailItem.url} className="flex-1 border border-[#c3c4c7] p-1.5 text-[10px] bg-[#f6f7f7] outline-none truncate" />
                      <button onClick={() => copyUrl(detailItem.url)} className="px-2 border border-[#c3c4c7] text-[#2271b1] hover:bg-[#f0f6fa] flex items-center">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <button onClick={saveMetadata} disabled={saving}
                    className="w-full bg-[#2271b1] text-white py-2 text-[12px] font-semibold hover:bg-[#135e96] transition-colors disabled:opacity-60">
                    {saving ? "Saving..." : "Save Metadata"}
                  </button>
                </div>
              )}
              {/* Actions */}
              <div className="border-t border-[#f0f0f1] pt-3 space-y-2">
                {detailItem.isDeleted ? (
                  <>
                    <button onClick={() => restore(detailItem._id)} className="w-full flex items-center justify-center gap-2 border border-[#2271b1] text-[#2271b1] py-1.5 text-[12px] font-medium hover:bg-[#f0f6fa] transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> Restore
                    </button>
                    <button onClick={() => setDeleteConfirm(detailItem._id)} className="w-full flex items-center justify-center gap-2 border border-[#d63638] text-[#d63638] py-1.5 text-[12px] font-medium hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete Permanently
                    </button>
                  </>
                ) : (
                  <button onClick={() => softDelete(detailItem._id)} className="w-full flex items-center justify-center gap-2 border border-[#d63638] text-[#d63638] py-1.5 text-[12px] font-medium hover:bg-red-50 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Move to Trash
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Permanent Delete Confirmation ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/60">
          <div className="bg-white border border-[#c3c4c7] shadow-2xl p-6 max-w-sm w-full rounded-sm">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#d63638]" />
              <h3 className="text-[15px] font-semibold">Delete Permanently?</h3>
            </div>
            <p className="text-[13px] text-[#646970] mb-5">This will permanently delete the file from Cloudinary and cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2 border border-[#c3c4c7] text-[13px] hover:bg-[#f0f0f1] rounded-sm">Cancel</button>
              <button onClick={() => permanentDelete(deleteConfirm)} className="flex-1 py-2 bg-[#d63638] text-white text-[13px] font-semibold hover:bg-[#b32d2e] rounded-sm">Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
