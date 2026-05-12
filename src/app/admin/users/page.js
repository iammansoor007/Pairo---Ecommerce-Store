"use client";

import { useEffect, useState } from "react";
import { Search, User as UserIcon } from "lucide-react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans text-[#3c434a]">
      <div className="flex items-center gap-4 mb-5">
        <h1 className="text-[23px] font-normal text-[#1d2327]">Users</h1>
        <button className="border border-[#2271b1] text-[#2271b1] px-2 py-0.5 rounded-md text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">
          Add New
        </button>
      </div>

      {/* Filter Links */}
      <ul className="flex items-center gap-2 text-[13px] mb-4">
         <li className="text-[#1d2327] font-bold">All <span className="text-[#646970] font-normal">({users.length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Administrator <span className="text-[#646970] font-normal">({users.filter(u => u.role === 'admin').length})</span></li>
         <span className="text-[#c3c4c7]">|</span>
         <li className="text-[#2271b1] hover:text-[#135e96] cursor-pointer">Customer <span className="text-[#646970] font-normal">({users.filter(u => u.role !== 'admin').length})</span></li>
      </ul>

      {/* Bulk Actions & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-2">
         <div className="flex items-center gap-2">
            <select className="border border-[#8c8f94] bg-white text-[13px] px-2 py-1 rounded-sm outline-none">
               <option>Bulk actions</option>
               <option>Delete</option>
               <option>Send Password Reset</option>
            </select>
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Apply</button>
         </div>

         <div className="flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#8c8f94] outline-none p-1.5 text-[13px] w-48"
            />
            <button className="border border-[#2271b1] text-[#2271b1] px-3 py-1.5 rounded-sm text-[13px] font-medium hover:bg-[#f0f6fa] transition-all">Search Users</button>
         </div>
      </div>

      {/* WP List Table */}
      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7]">
              <th className="px-3 py-2 w-10"><input type="checkbox" /></th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Username</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Name</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Email</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327]">Role</th>
              <th className="px-3 py-2 text-[14px] font-bold text-[#1d2327] text-right">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0f0f1]">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-[13px]">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-[13px]">No users found.</td></tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-[#f6f7f7] group">
                  <td className="px-3 py-3"><input type="checkbox" /></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-[#f0f0f1] rounded-sm flex items-center justify-center text-[#8c8f94]">
                          <UserIcon className="w-4 h-4" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#2271b1] hover:text-[#135e96] cursor-pointer">{u.email.split('@')[0]}</span>
                          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                             <button className="text-[#2271b1] hover:text-[#135e96]">Edit</button>
                             <span className="text-[#c3c4c7]">|</span>
                             <button className="text-[#d63638] hover:text-[#bc0b0d]">Delete</button>
                             <span className="text-[#c3c4c7]">|</span>
                             <button className="text-[#2271b1] hover:text-[#135e96]">View</button>
                          </div>
                       </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[13px] text-[#3c434a]">{u.name}</td>
                  <td className="px-3 py-3 text-[13px] text-[#2271b1] hover:text-[#135e96] cursor-pointer">{u.email}</td>
                  <td className="px-3 py-3 text-[13px] text-[#3c434a] uppercase font-bold tracking-tight">{u.role}</td>
                  <td className="px-3 py-3 text-[13px] text-[#2271b1] font-bold text-right">{u.orderHistory?.length || 0}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
