"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, HelpCircle, Plus, X, ArrowUpRight, Loader, HelpCircle as QuestionIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Helper to generate initials from customer name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

// Helper to generate color theme based on name hashing (matches ProductReviews avatar theme)
const getAvatarColor = (name) => {
  if (!name) return "bg-[#FAF7F0] text-[#6F655B]/60 border-[#E3DACB]";
  const colors = [
    "bg-[#FAF7F0] text-[#1E1B19] border-[#E3DACB]",
    "bg-[#F2EBDD] text-[#1E1B19] border-[#C7B9A1]",
    "bg-[#FAF7F0] text-[#6F655B] border-[#E3DACB]/50",
    "bg-[#F5EFE6] text-[#43302A] border-[#C7B9A1]/40",
    "bg-[#EAE3D2] text-[#1E1B19] border-[#C7B9A1]/60"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function ProductQuestionsAnswers({ productId, productName }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  
  // Submit Question Drawer State (now matching Reviews right-side drawer)
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions(1);
  }, [productId]);

  const fetchQuestions = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/questions?page=${pageNumber}&limit=5`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.questions || []);
      setPagination(data.pagination || { page: 1, limit: 5, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim() || !questionText.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim(),
          question: questionText.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit question");

      toast.success("Thank you! Your question has been submitted for review.");
      setModalOpen(false);
      setCustomerName("");
      setCustomerEmail("");
      setQuestionText("");
      fetchQuestions(1);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white border border-[#E3DACB] rounded-[var(--radius,0px)] p-6 md:p-10 font-sans">
      
      {/* Header section matching Reviews tab */}
      <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between border-b border-black/5 pb-8 mb-8">
        <div>
          <p className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight uppercase heading-font text-[#1E1B19] mb-1">
            Questions & Answers
          </p>
          <p className="text-xs text-[#6F655B]/60 uppercase tracking-widest font-medium">
            Ask our team about materials, sizing, and styling details.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-accent text-white hover:opacity-90 transition-colors px-6 py-3.5 rounded-[var(--radius,0px)] text-xs font-medium uppercase tracking-[0.2em] cursor-pointer active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Ask a Question
        </button>
      </div>

      {loading ? (
        /* Loading Skeletons matching Reviews */
        <div className="space-y-6">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="border-b border-black/5 pb-8 last:border-0 space-y-4 animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-1/3">
                  <div className="h-4 bg-neutral-200 rounded w-2/3" />
                  <div className="h-3 bg-neutral-100 rounded w-1/2" />
                </div>
                <div className="h-3 bg-neutral-150 rounded w-16" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200" />
                <div className="h-3.5 bg-neutral-100 rounded w-24" />
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-neutral-100 rounded w-full" />
                <div className="h-3.5 bg-neutral-100 rounded w-5/6" />
              </div>
            </div>
          ))}
        </div>
      ) : questions.length === 0 ? (
        /* Empty state matching Reviews styling */
        <div className="py-16 text-center border border-dashed border-[#E3DACB] rounded-[var(--radius,0px)] bg-[#FAF7F0]/30">
          <MessageSquare className="w-10 h-10 text-[#6F655B]/40 mx-auto mb-4" />
          <p className="text-xs sm:text-sm font-medium uppercase tracking-wider text-[#1E1B19] mb-1">No questions yet</p>
          <p className="text-xs text-[#6F655B]/60 max-w-sm mx-auto leading-relaxed mb-6">
            Be the first to ask a question about this product! Share your queries with our team.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-accent text-white hover:opacity-90 transition-colors px-6 py-3 rounded-[var(--radius,0px)] text-xs font-medium uppercase tracking-[0.2em]"
          >
            Ask a question
          </button>
        </div>
      ) : (
        /* Questions List matching Reviews layout */
        <div className="space-y-8">
          {questions.map((q) => {
            const initials = getInitials(q.customerName);
            const dateStr = new Date(q.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            });
            const reply = q.replies?.[0];

            return (
              <div key={q._id} className="border-b border-black/5 pb-8 last:border-0 last:pb-0 space-y-4">
                
                {/* Topic & Date Row */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-accent bg-accent/5 px-2 py-0.5 rounded-[var(--radius,0px)] border border-accent/20 text-xs uppercase tracking-wider">
                      Product Question
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                    {dateStr}
                  </span>
                </div>

                {/* Author Info Row */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-[var(--radius,0px)] border flex items-center justify-center text-xs font-medium ${getAvatarColor(q.customerName)} shrink-0 select-none`}>
                    {initials}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#6F655B]/70 font-medium uppercase tracking-wider">
                    <span className="text-[#1E1B19]">{q.customerName}</span>
                  </div>
                </div>

                {/* Question Comment block */}
                <div className="text-sm text-[#6F655B] leading-relaxed font-normal">
                  <p className="font-semibold text-black italic">"{q.question}"</p>
                </div>

                {/* Store Reply matching Reviews admin comment block */}
                {reply && (
                  <div className="bg-[#FAF7F0]/60 border-l-2 border-[#1E1B19] p-4 rounded-[var(--radius,0px)] space-y-1.5 ml-4">
                    <div className="flex items-center gap-2 text-[9px] text-[#1E1B19] font-medium uppercase tracking-wider">
                      <div className="w-1 h-1 bg-[#1E1B19] rounded-full" />
                      {reply.staffName} Response
                    </div>
                    <p className="text-xs text-[#6F655B] leading-relaxed font-normal">
                      {reply.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination matching Reviews */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 pt-6 border-t border-black/5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchQuestions(pagination.page - 1)}
                className="px-5 py-2.5 border border-neutral-200 hover:border-black disabled:border-neutral-100 disabled:text-neutral-300 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              >
                Prev
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchQuestions(pagination.page + 1)}
                className="px-5 py-2.5 border border-neutral-200 hover:border-black disabled:border-neutral-100 disabled:text-neutral-300 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Ask Question Drawer — now matching the premium Slide-Over form of Reviews */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-end transition-opacity duration-300">
            <motion.div
              initial={{ x: "100%", opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.8 }}
              transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
              className="w-full max-w-xl bg-white h-full shadow-2xl p-6 md:p-8 flex flex-col justify-between overflow-y-auto"
            >
              <div>
                <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black heading-font uppercase text-black">
                      Ask a Question
                    </h3>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                      For {productName}
                    </p>
                  </div>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>

                <form onSubmit={handleAskQuestion} className="space-y-6">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mansoor Ahmed"
                      className="w-full border border-neutral-200 rounded-lg p-3 text-xs outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Email field */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. mansoor@example.com"
                      className="w-full border border-neutral-200 rounded-lg p-3 text-xs outline-none focus:border-black transition-colors"
                    />
                  </div>

                  {/* Question textarea */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest block">
                      Your Question
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ask about materials, sizing fit, or custom design request options..."
                      className="w-full border border-neutral-200 rounded-lg p-3 text-xs outline-none focus:border-black transition-colors resize-none"
                    />
                  </div>
                </form>
              </div>

              {/* Drawer footer actions */}
              <div className="border-t border-neutral-100 pt-4 mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-1/3 border border-neutral-200 hover:bg-neutral-50 px-4 py-3 rounded-full text-xs font-bold uppercase tracking-[0.1em] text-neutral-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskQuestion}
                  disabled={submitting}
                  className="w-2/3 bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-300 transition-colors px-4 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Submit Question
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
