"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

export default function AdminContact() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      const data = await res.json();
      if (res.ok) setSubmissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminPageLayout
      title="Submissions"
      breadcrumbs={[{ label: "Submissions" }]}
    >
      <div className="space-y-4">
        {/* Filter Links */}
        <ul className="flex items-center gap-2 text-[13px] text-[#2271b1]">
          <li className="text-[#1d2327] font-bold">All <span className="text-[#646970] font-normal">({submissions.length})</span></li>
          <span className="text-[#c3c4c7]">|</span>
          <li className="cursor-pointer hover:text-[#135e96]">Pending <span className="text-[#646970] font-normal">({submissions.filter(s => s.status === 'New').length})</span></li>
          <span className="text-[#c3c4c7]">|</span>
          <li className="cursor-pointer hover:text-[#135e96]">Marked as Read</li>
        </ul>

        {/* Action Bar */}
        <div className="bg-white border border-[#ccd0d4] p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2">
            <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-[3px] outline-none">
              <option>Bulk actions</option>
              <option>Mark as read</option>
              <option>Move to Trash</option>
            </select>
            <button className="border border-[#8c8f94] text-[#3c434a] px-3 py-1 rounded-[3px] text-[13px] font-medium bg-[#f6f7f7] hover:bg-[#f0f0f1]">Apply</button>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#8c8f94] outline-none px-3 py-1 text-[13px] flex-1 md:w-48 bg-white focus:border-[#2271b1] rounded-[3px]"
            />
            <button className="border border-[#8c8f94] text-[#3c434a] px-3 py-1 rounded-[3px] text-[13px] font-medium bg-[#f6f7f7] hover:bg-[#f0f0f1]">Search</button>
          </div>
        </div>

        {/* WP List Table */}
        <div className="bg-white border border-[#ccd0d4] shadow-sm overflow-x-auto rounded-[2px]">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f6f7f7] border-b border-[#ccd0d4]">
                <th className="px-3 py-2 w-10 text-center"><input type="checkbox" /></th>
                <th className="px-3 py-2 font-bold text-[#1d2327]">Author</th>
                <th className="px-3 py-2 font-bold text-[#1d2327]">Submission</th>
                <th className="px-3 py-2 font-bold text-[#1d2327]">Submitted on</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {loading ? (
                <tr><td colSpan={4} className="p-10 text-center italic text-gray-400">Loading submissions...</td></tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center italic text-gray-400">No submissions found.</td></tr>
              ) : (
                filteredSubmissions.map((s) => (
                  <tr key={s._id} className="hover:bg-[#f6f7f7] group">
                    <td className="px-3 py-4 text-center align-top pt-5"><input type="checkbox" /></td>
                    <td className="px-3 py-4 w-52 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-[#f0f2f1] border border-gray-200 rounded-[2px] flex items-center justify-center text-[#8c8f94] shrink-0 font-bold text-[11px]">
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[14px] font-bold text-[#1d2327] truncate">{s.name}</span>
                          <span className="text-[12px] text-[#2271b1] hover:underline cursor-pointer truncate">{s.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 align-top">
                      <div className="flex flex-col">
                        <p className="text-[13px] leading-relaxed mb-2 text-[#3c434a] max-w-xl">{s.message}</p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium text-[#2271b1]">
                          <button className="hover:text-[#135e96]">Mark as Read</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="hover:text-[#135e96]">Reply</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="text-[#d63638] hover:text-[#bc0b0d]">Trash</button>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-[12px] text-[#646970] align-top font-medium">
                      {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-[13px] text-[#646970]">
          <div>{filteredSubmissions.length} items</div>
          <div className="flex items-center gap-1">
            <button className="p-1 border border-[#ccd0d4] bg-white rounded disabled:opacity-50"><ChevronLeft className="w-4 h-4" /></button>
            <span className="px-3 font-bold text-[#2c3338]">1 of 1</span>
            <button className="p-1 border border-[#ccd0d4] bg-white rounded disabled:opacity-50"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
