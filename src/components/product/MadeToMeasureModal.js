"use client";

import { useState, useEffect } from "react";
import { X, Ruler, Info, ChevronDown, ChevronUp, Check, ShoppingBag } from "lucide-react";

const MEASUREMENT_FIELDS = [
  { key: "chest",       label: "Chest",         hint: "Measure around the fullest part of your chest, keeping the tape horizontal." },
  { key: "neck",        label: "Neck",           hint: "Measure around the base of your neck where the collar sits." },
  { key: "shoulder",    label: "Shoulder",       hint: "Measure from one shoulder point to the other across the back." },
  { key: "sleeveLength",label: "Sleeve Length",  hint: "From shoulder point to the end of your wrist, with arm slightly bent." },
  { key: "bicep",       label: "Bicep",          hint: "Measure around the fullest part of your upper arm." },
  { key: "wrist",       label: "Wrist",          hint: "Measure around your wrist just below the wrist bone." },
  { key: "waist",       label: "Waist",          hint: "Measure around your natural waistline, the narrowest part of your torso." },
  { key: "lowerWaist",  label: "Lower Waist",    hint: "Measure around your hips at the widest point, about 8\" below your natural waist." },
  { key: "hips",        label: "Hips",           hint: "Measure around the fullest part of your hips." },
  { key: "jacketLength",label: "Jacket Length",  hint: "From the back of your neck down to where you want the jacket to end." },
  { key: "height",      label: "Height",         hint: "Your full standing height, measured without shoes." },
  { key: "weight",      label: "Weight",         hint: "Your approximate weight helps us fine-tune the fit pattern." },
];

const M2M_SURCHARGE = 25;

export default function MadeToMeasureModal({ product, isOpen, onClose, onAddToCart }) {
  const [unit, setUnit] = useState("inches");
  const [measurements, setMeasurements] = useState({});
  const [notes, setNotes] = useState("");
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setMeasurements({});
      setNotes("");
      setAdded(false);
      setUnit("inches");
    }
  }, [isOpen]);

  // Trap scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, val) => {
    setMeasurements(prev => ({ ...prev, [key]: val }));
  };

  const handleAdd = () => {
    setAdding(true);
    const surchargedPrice = (product.price || 0) + M2M_SURCHARGE;
    onAddToCart({
      ...product,
      price: surchargedPrice,
      madeToMeasure: {
        enabled: true,
        surcharge: M2M_SURCHARGE,
        unit,
        measurements,
        notes
      }
    });
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => {
        onClose();
      }, 900);
    }, 600);
  };

  const unitLabel = unit === "inches" ? "in" : "cm";

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl max-h-[95dvh] bg-white rounded-t-[20px] sm:rounded-[4px] shadow-2xl flex flex-col overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-black/8 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-white rounded-[2px]">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-primary">Made to Measure</h2>
              <p className="text-[11px] text-primary/50 uppercase tracking-[0.15em] font-medium">Bespoke Fitting — +${M2M_SURCHARGE}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-4 h-4 text-primary/60" />
          </button>
        </div>

        {/* Unit Toggle */}
        <div className="px-6 pt-5 pb-3 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary/60">Measurements</p>
            <div className="flex rounded-[2px] border border-black/10 overflow-hidden text-[11px] font-bold">
              {["inches", "cm"].map(u => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1.5 transition-colors uppercase tracking-widest ${unit === u ? "bg-primary text-white" : "bg-white text-primary/50 hover:text-primary"}`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fields — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-0">
          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_FIELDS.map(field => (
              <div key={field.key} className="relative">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-primary/60 mb-1.5">
                  {field.label}
                  <button
                    type="button"
                    className="text-primary/30 hover:text-primary/60 transition-colors"
                    onMouseEnter={() => setActiveTooltip(field.key)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() => setActiveTooltip(activeTooltip === field.key ? null : field.key)}
                  >
                    <Info className="w-3 h-3" />
                  </button>
                </label>

                {/* Tooltip */}
                {activeTooltip === field.key && (
                  <div className="absolute left-0 -top-1 z-10 translate-y-[-100%] bg-primary text-white text-[10px] leading-relaxed p-2.5 rounded-[2px] shadow-xl w-56 pointer-events-none">
                    {field.hint}
                    <div className="absolute left-3 bottom-0 translate-y-full border-4 border-transparent border-t-primary" />
                  </div>
                )}

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="0"
                    value={measurements[field.key] || ""}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="w-full border border-black/10 rounded-[2px] px-3 py-2.5 pr-12 text-[13px] text-primary outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all bg-white placeholder-primary/25 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary/40 uppercase">
                    {unitLabel}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-primary/60 mb-1.5">
              Additional Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any special fitting requirements, posture notes, or preferences..."
              className="w-full border border-black/10 rounded-[2px] px-3 py-2.5 text-[13px] text-primary outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all bg-white placeholder-primary/25 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-black/8 bg-white shrink-0">
          {/* Price summary */}
          <div className="flex items-center justify-between mb-4 py-3 px-4 bg-primary/[0.04] rounded-[2px]">
            <span className="text-[12px] font-medium text-primary/70">Product Price</span>
            <span className="text-[13px] font-semibold text-primary">${product?.price?.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between mb-4 py-3 px-4 bg-primary/[0.04] rounded-[2px]">
            <span className="text-[12px] font-medium text-primary/70">Made to Measure</span>
            <span className="text-[13px] font-semibold text-emerald-600">+${M2M_SURCHARGE}.00</span>
          </div>
          <div className="flex items-center justify-between mb-5 py-3 px-4 bg-primary rounded-[2px]">
            <span className="text-[12px] font-bold text-white uppercase tracking-[0.1em]">Total Price</span>
            <span className="text-[15px] font-bold text-white">${((product?.price || 0) + M2M_SURCHARGE).toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || added}
            className={`w-full h-12 rounded-[2px] font-bold uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-2.5 transition-all duration-300 ${
              added
                ? "bg-emerald-600 text-white"
                : "bg-primary text-white hover:bg-primary/90 active:scale-[0.99]"
            }`}
          >
            {added ? (
              <><Check className="w-4 h-4" strokeWidth={2.5} /> Added to Cart!</>
            ) : adding ? (
              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Adding...</>
            ) : (
              <><ShoppingBag className="w-4 h-4" /> Add to Cart — ${((product?.price || 0) + M2M_SURCHARGE).toFixed(2)}</>
            )}
          </button>
          <p className="text-center text-[10px] text-primary/40 mt-3 leading-relaxed">
            Your measurements are saved with the order and sent to our master tailors. You can checkout immediately.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>
    </div>
  );
}
