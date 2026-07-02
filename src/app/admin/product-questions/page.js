"use client";

import React, { useState, useEffect } from "react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import { MessageSquare, Check, EyeOff, Trash2, Reply, Eye, Search, AlertCircle, X, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminProductQuestionsPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState({ pendingCount: 0, approvedCount: 0, hiddenCount: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter States
  const [status, setStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  // Modals
  const [replyingQuestion, setReplyingQuestion] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const [viewingQuestion, setViewingQuestion] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [page, status, appliedSearch]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page,
        status,
        search: appliedSearch,
        limit: 10
      });
      const res = await fetch(`/api/admin/products/questions?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.questions || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setStats(data.stats || { pendingCount: 0, approvedCount: 0, hiddenCount: 0 });
    } catch (err) {
      console.error(err);
      toast.error("Error loading questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(searchTerm);
  };

  const handleStatusChange = (newStatus) => {
    setPage(1);
    setStatus(newStatus);
  };

  // Toggle Visibility Status (Approved <-> Hidden)
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "Approved" ? "Hidden" : "Approved";
    try {
      const res = await fetch(`/api/admin/products/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_status", status: nextStatus })
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      
      toast.success(`Question is now ${nextStatus === "Approved" ? "Publicly Visible" : "Hidden"}`);
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error("Error updating status");
    }
  };

  // Submit Answer/Reply
  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Reply text cannot be empty");
      return;
    }
    setReplying(true);
    try {
      const res = await fetch(`/api/admin/products/questions/${replyingQuestion._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", replyText: replyText.trim() })
      });
      if (!res.ok) throw new Error("Failed to submit reply");

      toast.success("Reply saved and email sent to customer");
      setReplyingQuestion(null);
      setReplyText("");
      fetchQuestions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit reply");
    } finally {
      setReplying(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id) => {
    if (confirm("Are you sure you want to delete this question?")) {
      try {
        const res = await fetch(`/api/admin/products/questions/${id}`, {
          method: "DELETE"
        });
        if (!res.ok) throw new Error("Failed to delete question");

        toast.success("Question deleted");
        fetchQuestions();
      } catch (err) {
        console.error(err);
        toast.error("Error deleting question");
      }
    }
  };

  return (
    <AdminPageLayout
      title="Product Questions & Answers"
      subtitle="Moderate, reply to, and toggle visibility for product Q&As"
      breadcrumbs={[{ label: "Products", href: "/admin/products" }, { label: "Questions" }]}
    >
      <div className="space-y-6">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 border border-[#ccd0d4] rounded-[3px] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#646970] font-bold uppercase tracking-wider">Pending Questions</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingCount}</h3>
            </div>
            <AlertCircle className="w-8 h-8 text-amber-500/20" />
          </div>
          <div className="bg-white p-4 border border-[#ccd0d4] rounded-[3px] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#646970] font-bold uppercase tracking-wider">Approved Questions</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.approvedCount}</h3>
            </div>
            <Check className="w-8 h-8 text-emerald-500/20" />
          </div>
          <div className="bg-white p-4 border border-[#ccd0d4] rounded-[3px] shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#646970] font-bold uppercase tracking-wider">Hidden Questions</p>
              <h3 className="text-2xl font-bold text-gray-600 mt-1">{stats.hiddenCount}</h3>
            </div>
            <EyeOff className="w-8 h-8 text-gray-500/20" />
          </div>
        </div>

        {/* Toolbar & Filtering */}
        <div className="bg-white p-4 border border-[#ccd0d4] rounded-[3px] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Pending", "Approved", "Hidden"].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 text-[12px] font-bold rounded-[3px] transition-all cursor-pointer ${
                  status === s
                    ? "bg-[#2271b1] text-white"
                    : "bg-[#f6f7f7] border border-[#dcdcde] text-[#2c3338] hover:bg-[#f0f0f1]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="flex max-w-sm w-full gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search name, email, question..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#f6f7f7] border border-[#dcdcde] pl-8 pr-3 py-1.5 text-[13px] focus:outline-none focus:border-[#2271b1] focus:bg-white transition-all rounded-[3px]"
              />
              <Search className="w-4 h-4 text-[#8c8f94] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="bg-[#f6f7f7] border border-[#dcdcde] hover:bg-[#f0f0f1] text-[#2c3338] px-4 py-1.5 text-[12px] font-bold rounded-[3px] cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        {/* Questions Table */}
        <div className="bg-white border border-[#ccd0d4] rounded-[3px] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f6f7f7] border-b border-[#ccd0d4] text-[#2c3338] uppercase text-[10px] font-bold tracking-wider">
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Product</th>
                <th className="p-3.5 w-1/3">Question</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0f1]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="w-6 h-6 border-2 border-[#2271b1] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-[12px] text-[#646970]">Loading questions...</span>
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#646970]">
                    No questions found matching your filters.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id} className="hover:bg-[#fcfcfc] transition-colors align-top">
                    <td className="p-3.5">
                      <p className="font-bold text-[#1d2327]">{q.customerName}</p>
                      <p className="text-[11px] text-[#646970]">{q.customerEmail}</p>
                    </td>
                    <td className="p-3.5">
                      {q.productId ? (
                        <div className="flex items-center gap-2">
                          {q.productId.image || q.productId.images?.[0] ? (
                            <img src={q.productId.image || q.productId.images?.[0]} alt="" className="w-8 h-8 rounded object-cover border border-black/5 shrink-0" />
                          ) : null}
                          <a
                            href={`/product/${q.productId.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#2271b1] hover:underline flex items-center gap-1 min-w-0"
                          >
                            <span className="truncate">{q.productId.name}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </div>
                      ) : (
                        <span className="text-red-500 font-bold">Deleted Product</span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <p className="font-medium text-[#1d2327] line-clamp-3">"{q.question}"</p>
                      {q.replies && q.replies.length > 0 && (
                        <div className="mt-2 bg-[#f0f7ff] border-l-2 border-[#0070f3] p-2 rounded-[3px] text-[11px]">
                          <span className="font-bold text-[#0070f3]">Staff Answer:</span> "{q.replies[0].answer}"
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-nowrap text-[#646970]">
                      {new Date(q.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border ${
                        q.status === "Approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : q.status === "Pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-gray-50 text-gray-700 border-gray-200"
                      }`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right shrink-0">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingQuestion(q)}
                          className="p-1.5 hover:bg-[#f0f0f1] text-[#2c3338] rounded transition-colors"
                          title="View Question Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingQuestion(q);
                            setReplyText(q.replies?.[0]?.answer || "");
                          }}
                          className="p-1.5 hover:bg-[#f0f6fb] text-[#2271b1] rounded transition-colors"
                          title="Reply / Answer"
                        >
                          <Reply className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(q._id, q.status)}
                          className={`p-1.5 rounded transition-colors ${
                            q.status === "Approved"
                              ? "hover:bg-amber-50 text-amber-600"
                              : "hover:bg-emerald-50 text-emerald-600"
                          }`}
                          title={q.status === "Approved" ? "Hide from Public" : "Show Publicly"}
                        >
                          {q.status === "Approved" ? <EyeOff className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q._id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 bg-white border border-[#ccd0d4] rounded-[3px] text-[12px] font-semibold text-[#2c3338] disabled:opacity-50 hover:bg-[#f6f7f7] cursor-pointer"
            >
              Previous
            </button>
            <span className="text-[12px] text-[#646970]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 bg-white border border-[#ccd0d4] rounded-[3px] text-[12px] font-semibold text-[#2c3338] disabled:opacity-50 hover:bg-[#f6f7f7] cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {replyingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ccd0d4] rounded-[3px] shadow-lg max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 bg-[#f6f7f7] border-b border-[#ccd0d4]">
              <h3 className="text-[14px] font-bold text-[#1d2327] flex items-center gap-2">
                <Reply className="w-4 h-4" />
                Reply to Question
              </h3>
              <button onClick={() => setReplyingQuestion(null)} className="text-[#646970] hover:text-[#1d2327]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-[#f9f9fa] border border-[#ccd0d4] p-3 rounded text-[13px] text-[#2c3338]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#646970] mb-1">
                  Customer Question:
                </p>
                <p className="italic font-medium">"{replyingQuestion.question}"</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-[#1d2327]">Your Reply / Answer</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={6}
                  placeholder="Type your official store response here..."
                  className="w-full bg-[#f6f7f7] border border-[#dcdcde] px-3 py-2 text-[13px] focus:outline-none focus:border-[#2271b1] focus:bg-white transition-all rounded-[3px]"
                />
                <p className="text-[11px] text-[#646970]">
                  * Replying will automatically approve and publish the question. An email containing your response will be sent to the customer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-4 bg-[#f6f7f7] border-t border-[#ccd0d4]">
              <button
                type="button"
                onClick={() => setReplyingQuestion(null)}
                className="bg-white border border-[#dcdcde] text-[#3c434a] hover:bg-[#f6f7f7] px-4 py-2 rounded-[3px] text-[12px] font-bold transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendReply}
                disabled={replying}
                className="bg-[#2271b1] text-white hover:bg-[#135e96] px-4 py-2 rounded-[3px] text-[12px] font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {replying ? "Sending Reply..." : "Submit Answer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {viewingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white border border-[#ccd0d4] rounded-[3px] shadow-lg max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 bg-[#f6f7f7] border-b border-[#ccd0d4]">
              <h3 className="text-[14px] font-bold text-[#1d2327] flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Question Details
              </h3>
              <button onClick={() => setViewingQuestion(null)} className="text-[#646970] hover:text-[#1d2327]">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-[13px] border-b border-[#ccd0d4] pb-4">
                <div>
                  <span className="block text-[11px] text-[#646970] uppercase font-bold tracking-wider">Customer</span>
                  <span className="font-bold text-[#1d2327]">{viewingQuestion.customerName}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#646970] uppercase font-bold tracking-wider">Email</span>
                  <span className="font-medium text-[#1d2327]">{viewingQuestion.customerEmail}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#646970] uppercase font-bold tracking-wider">Product</span>
                  <span className="font-semibold text-[#1d2327]">{viewingQuestion.productId?.name || "Deleted Product"}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#646970] uppercase font-bold tracking-wider">Status</span>
                  <span className="font-bold text-[#1d2327]">{viewingQuestion.status}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="block text-[11px] text-[#646970] uppercase font-bold tracking-wider">Customer Question</span>
                <div className="bg-[#f9f9fa] border border-[#ccd0d4] p-3 rounded text-[13px] text-[#2c3338] italic">
                  "{viewingQuestion.question}"
                </div>
              </div>

              {viewingQuestion.replies && viewingQuestion.replies.length > 0 ? (
                <div className="space-y-2">
                  <span className="block text-[11px] text-[#646970] uppercase font-bold tracking-wider">Official Answers</span>
                  {viewingQuestion.replies.map((rep, idx) => (
                    <div key={idx} className="bg-[#f0f7ff] border border-[#b3d4ff] p-3 rounded text-[13px] text-[#2c3338]">
                      <div className="flex items-center justify-between text-[11px] text-[#0070f3] font-bold uppercase mb-1">
                        <span>{rep.staffName}</span>
                        <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-medium">"{rep.answer}"</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-[#fff9db] border border-[#ffe066] rounded text-amber-800 text-[12px] font-semibold">
                  No replies submitted yet for this question.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end p-4 bg-[#f6f7f7] border-t border-[#ccd0d4]">
              <button
                type="button"
                onClick={() => setViewingQuestion(null)}
                className="bg-white border border-[#dcdcde] text-[#3c434a] hover:bg-[#f6f7f7] px-5 py-2 rounded-[3px] text-[12px] font-bold transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
