"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Eye, Ruler, Palette, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

const STATUS_OPTIONS = ["all", "New", "Reviewed", "In Progress", "Completed", "Rejected"];

const STATUS_STYLES = {
  New:        "bg-blue-50 text-blue-700 border-blue-200",
  Reviewed:   "bg-yellow-50 text-yellow-700 border-yellow-200",
  "In Progress": "bg-purple-50 text-purple-700 border-purple-200",
  Completed:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected:   "bg-red-50 text-red-600 border-red-200"
};

export default function AdminCustomizationsPage() {
  const [requests, setRequests] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [status,   setStatus]   = useState("all");
  const [pagination, setPagination] = useState({ total: 0, pages: 1, currentPage: 1 });

  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customization-requests?page=${page}&status=${status}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRequests(1), 400);
    return () => clearTimeout(timer);
  }, [fetchRequests]);

  return (
    <AdminPageLayout title="Customization Requests" subtitle={`${pagination.total} total requests`}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by name, email, product..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-[4px] text-[13px] bg-white outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-[3px] text-[11px] font-bold uppercase tracking-widest border transition-all ${
                status === s ? "bg-black text-white border-black" : "bg-white text-neutral-500 border-neutral-200 hover:border-neutral-400"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-neutral-100 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Request #</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Customer</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Product</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Customizations</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Date</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Status</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[13px] text-neutral-400">Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Palette className="w-8 h-8 text-neutral-200" />
                      <p className="text-[13px] text-neutral-400">No customization requests found</p>
                    </div>
                  </td>
                </tr>
              ) : requests.map(req => (
                <tr key={req._id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3 text-[12px] font-mono font-bold text-neutral-700">
                    {req.requestNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-semibold text-black">{req.customer?.name}</p>
                    <p className="text-[11px] text-neutral-400">{req.customer?.email}</p>
                    {req.customer?.phone && <p className="text-[11px] text-neutral-400">{req.customer?.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {req.product?.image && (
                        <img src={req.product.image} alt={req.product.name} className="w-8 h-8 object-cover rounded-[2px] border border-neutral-100" />
                      )}
                      <p className="text-[12px] font-medium text-black line-clamp-1 max-w-[140px]">{req.product?.name || "—"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {req.customizations?.leatherColor && req.customizations.leatherColor !== "None" && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                          🎨 {req.customizations.leatherColor}
                        </span>
                      )}
                      {req.customizations?.fur?.type && req.customizations.fur.type !== "None" && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                          🪶 Fur
                        </span>
                      )}
                      {Object.values(req.customizations?.artwork || {}).some(Boolean) && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-medium">
                          🖼 Artwork
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-neutral-400 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wide border ${STATUS_STYLES[req.status] || "bg-neutral-50 text-neutral-500 border-neutral-200"}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/customizations/${req._id}`}>
                      <button className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-600 hover:text-black transition-colors px-2.5 py-1.5 border border-neutral-200 rounded-[3px] hover:border-neutral-400">
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100">
            <p className="text-[11px] text-neutral-400">
              Showing page {pagination.currentPage} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => fetchRequests(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1}
                className="p-1.5 border border-neutral-200 rounded-[3px] hover:border-neutral-400 disabled:opacity-40 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => fetchRequests(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.pages}
                className="p-1.5 border border-neutral-200 rounded-[3px] hover:border-neutral-400 disabled:opacity-40 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminPageLayout>
  );
}
