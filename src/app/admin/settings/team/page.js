"use client";

import { useEffect, useState } from "react";
import { UserPlus, Search, Shield, Mail, Key, UserCheck, UserX, MoreVertical } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (res.ok) setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminPageLayout 
      title="Team Management" 
      addNewLink="/admin/settings/team/new"
      addNewLabel="Invite Staff Member"
      breadcrumbs={[{ label: "Settings", href: "/admin/settings" }, { label: "Team" }]}
    >
      <div className="space-y-4">
        {/* Statistics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#ccd0d4] p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#f0f6fb] text-[#2271b1] rounded-full"><Shield className="w-5 h-5" /></div>
            <div><p className="text-[11px] font-bold text-[#646970] uppercase">Total Admins</p><p className="text-xl font-bold">{staff.length}</p></div>
          </div>
          <div className="bg-white border border-[#ccd0d4] p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-[#f6f7f7] text-[#1d2327] rounded-full"><UserCheck className="w-5 h-5" /></div>
            <div><p className="text-[11px] font-bold text-[#646970] uppercase">Active Sessions</p><p className="text-xl font-bold">{staff.filter(s => s.status === 'Active').length}</p></div>
          </div>
          <div className="bg-white border border-[#ccd0d4] p-4 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-50 text-red-600 rounded-full"><UserX className="w-5 h-5" /></div>
            <div><p className="text-[11px] font-bold text-[#646970] uppercase">Suspended</p><p className="text-xl font-bold text-red-600">{staff.filter(s => s.status !== 'Active').length}</p></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-[#ccd0d4] p-3 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
           <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c8f94]" />
              <input 
                type="text" 
                placeholder="Search staff by name or email..."
                className="w-full pl-10 pr-4 py-1.5 bg-white border border-[#8c8f94] text-[13px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2">
              <select className="border border-[#8c8f94] text-[13px] px-3 py-1.5 outline-none focus:border-[#2271b1]">
                 <option>All Roles</option>
                 <option>Super Admin</option>
                 <option>Admin</option>
                 <option>Editor</option>
              </select>
              <button className="bg-white border border-[#2271b1] text-[#2271b1] px-4 py-1.5 font-bold text-[13px] hover:bg-[#f0f6fb]">Filter</button>
           </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white border border-[#ccd0d4] shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f6f7f7] border-b border-[#ccd0d4] text-[#1d2327]">
                <th className="px-4 py-3 font-bold uppercase text-[11px]">Staff Member</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px]">Role</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px]">Status</th>
                <th className="px-4 py-3 font-bold uppercase text-[11px]">Last Login</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center italic text-gray-400">Loading team members...</td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center italic text-gray-400">No staff members found.</td></tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr key={s._id} className="hover:bg-[#fbfbfb] group transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-[#f0f6fb] border border-[#2271b1]/10 rounded-full flex items-center justify-center text-[#2271b1] font-bold">
                            {s.name?.charAt(0)}
                         </div>
                         <div className="flex flex-col">
                            <span className="font-bold text-[#1d2327]">{s.name}</span>
                            <div className="flex items-center gap-2 text-[11px] text-[#646970]">
                               <Mail className="w-3 h-3" /> {s.email}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider ${
                        s.roleId?.slug === 'super-admin' ? 'bg-[#2271b1] text-white' : 'bg-[#d9ebf5] text-[#1a4a6e]'
                      }`}>
                        {s.roleId?.name || "No Role"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                       <span className={`flex items-center gap-1.5 text-[11px] font-bold ${
                         s.status === 'Active' ? 'text-green-600' : 'text-red-600'
                       }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-green-600' : 'bg-red-600'}`} />
                          {s.status}
                       </span>
                    </td>
                    <td className="px-4 py-4 text-[#646970]">
                       {s.security?.lastLogin ? new Date(s.security.lastLogin).toLocaleString() : "Never"}
                    </td>
                    <td className="px-4 py-4 text-center">
                       <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 justify-end transition-opacity">
                          <button title="Reset Password" className="p-1.5 text-[#646970] hover:text-[#2271b1] hover:bg-[#f0f6fb] rounded"><Key className="w-4 h-4" /></button>
                          <button title="Edit Member" className="p-1.5 text-[#646970] hover:text-[#2271b1] hover:bg-[#f0f6fb] rounded"><MoreVertical className="w-4 h-4" /></button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminPageLayout>
  );
}
