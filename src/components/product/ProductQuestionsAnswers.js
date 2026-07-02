"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, HelpCircle, ChevronDown, Check, X, ArrowUpRight, Loader } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

// Helper to generate initials from customer name
const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

export default function ProductQuestionsAnswers({ productId, productName }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0);
  
  // Submit Question Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [productId]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/questions`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      setQuestions(data.questions || []);
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
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header with Ask button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black/5">
        <div>
          <h3 className="text-[16px] font-bold text-black uppercase tracking-[0.2em] mb-1">
            Questions & Answers
          </h3>
          <p className="text-[11px] text-black/50 uppercase tracking-widest font-semibold">
            Ask our team about materials, sizing, and styling details.
          </p>
        </div>
        
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-black text-white hover:bg-black/90 px-5 py-3 rounded-[var(--radius,0px)] font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] transition-all cursor-pointer shadow-sm active:scale-95 border border-black shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Ask a Question
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <Loader className="w-6 h-6 animate-spin text-black/35" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/35">Loading Q&A Engine...</span>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-black/10 rounded-[var(--radius,0px)] bg-black/[0.01] px-4">
          <MessageSquare className="w-10 h-10 text-black/20 mx-auto mb-4" />
          <p className="text-xs text-black/45 font-bold uppercase tracking-widest leading-relaxed">
            No questions have been asked about this product yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const isOpen = openIndex === idx;
            const initials = getInitials(q.customerName);
            const dateStr = new Date(q.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric"
            });
            const reply = q.replies?.[0];

            return (
              <div
                key={q._id}
                className={`rounded-[var(--radius,0px)] border transition-all duration-300 overflow-hidden ${
                  isOpen ? "bg-black/[0.01] border-black/20" : "bg-transparent border-black/5 hover:border-black/25"
                }`}
              >
                {/* Question Trigger */}
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="w-full px-5 py-5 md:px-6 md:py-6 flex items-start justify-between text-left group"
                >
                  <div className="flex gap-4">
                    <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shrink-0 select-none">
                      {initials}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2 text-[10px] font-bold text-black/40 uppercase tracking-widest">
                        <span>{q.customerName}</span>
                        <span>•</span>
                        <span>{dateStr}</span>
                      </div>
                      <p className="text-[13px] md:text-sm font-semibold uppercase tracking-wider text-black leading-snug">
                        {q.question}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-black" : "text-black/40"}`} />
                </button>

                {/* Collapsible Answer */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-6 md:px-6 md:pb-8 border-t border-black/5 pt-5 pl-[52px] md:pl-[60px] space-y-4">
                        {reply ? (
                          <div className="space-y-1.5">
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-800 bg-emerald-50/80 px-2 py-0.5 rounded uppercase tracking-widest border border-emerald-200">
                              <span className="w-1 h-1 rounded-full bg-emerald-600" />
                              Official Answer
                            </span>
                            <p className="text-black text-sm md:text-base leading-loose font-normal tracking-wide text-justify">
                              {reply.answer}
                            </p>
                            <span className="block text-[10px] text-black/40 font-bold uppercase tracking-wider">
                              Answered by {reply.staffName}
                            </span>
                          </div>
                        ) : (
                          <div className="text-black/40 text-xs italic font-semibold">
                            Question is being reviewed by our master tailors.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Ask Question Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-black/10 rounded-[var(--radius,0px)] shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-black/5">
                <div>
                  <h3 className="text-xs font-bold text-black uppercase tracking-[0.25em]">
                    Ask a Question
                  </h3>
                  <p className="text-[10px] text-black/50 uppercase tracking-widest mt-0.5">
                    {productName}
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-black/40 hover:text-black p-1 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAskQuestion}>
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Mansoor Ahmed"
                      className="w-full bg-[#fcfcfc] border border-black/15 px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:bg-white transition-all rounded-[var(--radius,0px)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. mansoor@example.com"
                      className="w-full bg-[#fcfcfc] border border-black/15 px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:bg-white transition-all rounded-[var(--radius,0px)]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-black">
                      Your Question
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Describe what you want to know about sizing, materials, or custom details..."
                      className="w-full bg-[#fcfcfc] border border-black/15 px-3 py-2.5 text-xs font-medium focus:outline-none focus:border-black focus:bg-white transition-all rounded-[var(--radius,0px)]"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2.5 p-5 bg-black/[0.01] border-t border-black/5">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="bg-transparent border border-black/20 hover:border-black text-black font-bold uppercase tracking-[0.2em] text-[10px] px-5 py-3 rounded-[var(--radius,0px)] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-black text-white hover:bg-black/95 font-bold uppercase tracking-[0.2em] text-[10px] px-5 py-3 rounded-[var(--radius,0px)] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
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
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
