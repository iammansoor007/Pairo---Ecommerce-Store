"use client";

import { useEffect, useState } from "react";
import { Mail, CheckCircle2, Trash2 } from "lucide-react";

export default function AdminContact() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="font-sans text-[#3c434a]">
      <h1 className="text-[23px] font-normal text-[#1d2327] mb-5">Submissions</h1>

      {/* Filter Links */}
      <ul className="flex items-center gap-2 text-[13px] mb-4">
         <li className="text-[#1d2327] font-bold">All <span className="text-[#646970] font-normal">({submissions.length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Pending <span className="text-[#646970] font-normal">({submissions.filter(s => s.status === 'New').length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Approved <span className="text-[#646970] font-normal">(0)</span></li>
      </ul>

      {/* WP List Table */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7]">
              <th className="px-3 py-2 w-10"><input type="checkbox" /></th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Author</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Submission</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Submitted on</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {loading ? (
              <tr><td colSpan={4} className="p-8 text-center text-[13px]">Loading submissions...</td></tr>
            ) : submissions.length === 0 ? (
              <tr><td colSpan={4} className="p-8 text-center text-[13px]">No submissions found.</td></tr>
            ) : (
              submissions.map((s) => (
                <tr key={s._id} className="hover:bg-[#f6f7f7] group">
                  <td className="px-3 py-4"><input type="checkbox" /></td>
                  <td className="px-3 py-4 w-48">
                    <div className="flex items-start gap-3">
                       <div className="w-8 h-8 bg-[#f0f0f1] rounded-sm flex items-center justify-center text-[#8c8f94]">
                          <span className="text-[12px] font-bold">{s.name.charAt(0)}</span>
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#1d2327]">{s.name}</span>
                          <span className="text-[12px] text-[#2271b1] hover:text-[#135e96] cursor-pointer">{s.email}</span>
                       </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                       <p className="text-[14px] leading-relaxed mb-2 text-[#3c434a]">{s.message}</p>
                       <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                          <button className="text-[#2271b1] hover:text-[#135e96]">Approve</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="text-[#2271b1] hover:text-[#135e96]">Reply</button>
                          <span className="text-[#c3c4c7]">|</span>
                          <button className="text-[#d63638] hover:text-[#bc0b0d]">Trash</button>
                       </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-[13px] text-[#3c434a]">
                     {new Date(s.createdAt).toLocaleDateString()} at {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
