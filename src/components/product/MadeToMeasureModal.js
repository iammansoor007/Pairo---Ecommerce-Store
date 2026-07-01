"use client";

import { useState, useEffect } from "react";
import { X, Info, Check } from "lucide-react";

const UPPER_BODY_FIELDS = [
  { key: "chest", label: "Chest", hint: "Measure around the fullest part of your chest, keeping the tape horizontal." },
  { key: "neck", label: "Neck", hint: "Measure around the base of your neck where the collar sits." },
  { key: "shoulder", label: "Shoulder", hint: "Measure from one shoulder point to the other across the back." },
  { key: "sleeveLength", label: "Sleeve Length", hint: "From shoulder point to the end of your wrist, with arm slightly bent." },
  { key: "bicep", label: "Bicep", hint: "Measure around the fullest part of your upper arm." },
  { key: "wrist", label: "Wrist", hint: "Measure around your wrist just below the wrist bone." },
];

const LOWER_BODY_FIELDS = [
  { key: "waist", label: "Waist", hint: "Measure around your natural waistline, the narrowest part of your torso." },
  { key: "lowerWaist", label: "Lower Waist", hint: "Measure around your hips at the widest point, about 8\" below your natural waist." },
  { key: "hips", label: "Hips", hint: "Measure around the fullest part of your hips." },
  { key: "jacketLength", label: "Jacket Length", hint: "From the back of your neck down to where you want the jacket to end." },
];

const PHYSICAL_PROFILE_FIELDS = [
  { key: "height", label: "Height", hint: "Your full standing height, measured without shoes." },
  { key: "weight", label: "Weight", hint: "Your approximate weight helps us fine-tune the fit pattern." },
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
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, val) =>
    setMeasurements((prev) => ({ ...prev, [key]: val }));

  const handleAdd = () => {
    setAdding(true);
    const surchargedPrice = (product.price || 0) + M2M_SURCHARGE;
    onAddToCart({
      ...product,
      price: surchargedPrice,
      madeToMeasure: { enabled: true, surcharge: M2M_SURCHARGE, unit, measurements, notes },
    });
    setTimeout(() => {
      setAdding(false);
      setAdded(true);
      setTimeout(() => { onClose(); }, 800);
    }, 500);
  };

  const unitLabel = unit === "inches" ? "in" : "cm";

  const renderField = (field) => (
    <div key={field.key} className="relative">
      {/* Label */}
      <label className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 mb-1.5 sm:mb-2">
        {field.label}
        <button
          type="button"
          className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors focus:outline-none"
          onMouseEnter={() => setActiveTooltip(field.key)}
          onMouseLeave={() => setActiveTooltip(null)}
          onClick={() => setActiveTooltip(activeTooltip === field.key ? null : field.key)}
          aria-label={`Info about ${field.label}`}
        >
          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </label>

      {/* Tooltip */}
      {activeTooltip === field.key && (
        <div className="absolute left-0 -top-2 z-10 translate-y-[-100%] bg-gray-900 text-white text-[10px] sm:text-xs leading-relaxed p-2.5 sm:p-3 rounded-lg shadow-xl w-52 sm:w-56 pointer-events-none font-medium">
          {field.hint}
          <div className="absolute left-3 sm:left-4 bottom-0 translate-y-full border-[4px] border-transparent border-t-gray-900" />
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.5"
          placeholder="0"
          value={measurements[field.key] || ""}
          onChange={(e) => handleChange(field.key, e.target.value)}
          className="w-full border-2 border-gray-300 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 pr-9 sm:pr-10 text-xs sm:text-sm text-gray-900 font-medium outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all bg-white placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold text-gray-700 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
          {unitLabel}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-[300px] xs:max-w-[400px] sm:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[95dvh] sm:max-h-[92dvh] bg-gray-50 rounded-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slideUp border-2 border-gray-200">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-300 shrink-0 bg-white">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-bold uppercase tracking-widest text-gray-900">Made to Measure</p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-700 uppercase tracking-[0.1em] font-semibold mt-0.5">
              Bespoke Fit Configuration — <span className="text-green-700 font-bold">+${M2M_SURCHARGE} Surcharge</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2">
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
        </div>

        {/* Unit Selector */}
        <div className="px-4 sm:px-5 pt-3 sm:pt-4 pb-2.5 sm:pb-3 shrink-0 flex items-center justify-between border-b-2 border-gray-200 bg-white">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-900">
            Measurement Unit
          </span>
          <div className="flex rounded-lg border-2 border-gray-300 overflow-hidden text-[10px] sm:text-xs font-bold shadow-sm">
            {["inches", "cm"].map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 transition-colors uppercase tracking-wider ${unit === u
                  ? "bg-gray-900 text-white"
                  : "bg-white text-gray-900 hover:bg-gray-100"
                  }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4 space-y-4 sm:space-y-5 min-h-0">

          {/* Upper Body */}
          <div className="space-y-2 sm:space-y-3 bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-gray-900 border-b-2 border-gray-300 pb-1.5 sm:pb-2">
              Upper Body Specs
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4">
              {UPPER_BODY_FIELDS.map(renderField)}
            </div>
          </div>

          {/* Lower Body */}
          <div className="space-y-2 sm:space-y-3 bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-gray-900 border-b-2 border-gray-300 pb-1.5 sm:pb-2">
              Lower Body &amp; Length
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {LOWER_BODY_FIELDS.map(renderField)}
            </div>
          </div>

          {/* Physical Profile */}
          <div className="space-y-2 sm:space-y-3 bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-gray-900 border-b-2 border-gray-300 pb-1.5 sm:pb-2">
              Physical Profile
            </p>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
              {PHYSICAL_PROFILE_FIELDS.map(renderField)}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1.5 sm:space-y-2 bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 shadow-sm">
            <label className="block text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-gray-900">
              Fitting Notes / Requests (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Posture detail, shoulder pads request, custom fit preferences..."
              className="w-full border-2 border-gray-300 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-900 font-medium placeholder-gray-400 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all bg-white resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 sm:px-5 lg:px-6 py-3 sm:py-4 border-t-2 border-gray-300 bg-white shrink-0">
          {/* Price Calculations */}
          <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div className="flex items-center justify-between text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 rounded-lg">
              <span className="text-gray-800 font-semibold">Base Product Price</span>
              <span className="font-bold text-gray-900">${product?.price?.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 bg-green-50 rounded-lg border border-green-200">
              <span className="text-gray-800 font-semibold">Made to Measure Upgrade</span>
              <span className="font-bold text-green-700">+${M2M_SURCHARGE}.00</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 sm:mb-4 py-2.5 sm:py-3.5 px-3 sm:px-4 bg-gray-900 text-white rounded-lg shadow-lg">
            <span className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider">Total</span>
            <span className="text-sm sm:text-base lg:text-lg font-bold">${((product?.price || 0) + M2M_SURCHARGE).toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || added}
            className={`w-full h-10 sm:h-12 lg:h-14 rounded-lg font-bold uppercase tracking-[0.15em] text-xs sm:text-sm lg:text-base flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 shadow-lg ${added
              ? "bg-green-600 text-white"
              : "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                Added to Cart!
              </>
            ) : adding ? (
              <>
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              "Confirm & Add to Cart"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        @media (max-width: 640px) {
          @keyframes slideUpMobile {
            from { opacity: 0; transform: translateY(100%) scale(0.95); }
            to   { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-slideUp { animation: slideUpMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        }
        
        /* Custom breakpoint for very small screens */
        @media (min-width: 300px) and (max-width: 400px) {
          .xs\\:max-w-\\[400px\\] {
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  );
}