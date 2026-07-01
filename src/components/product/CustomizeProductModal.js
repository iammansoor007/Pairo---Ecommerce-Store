"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  ChevronDown,
  Palette,
  Layers,
  Settings,
  Feather,
  Image as ImageIcon,
  FileText,
  Check,
  Loader2,
  User,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";

/* ─── Option definitions ─────────────────────────────────────────────── */
const LEATHER_COLORS = ["None", "Black", "Brown", "Blue", "Other"];
const LEATHER_TYPES = ["None", "Sheepskin", "Goatskin", "Cowhide", "Calfhide", "Other"];
const INNER_LININGS = [
  "None",
  "Non Quilted (Polyester)",
  "Change Color (Quilted)",
  "Change Color (Non-Quilted)",
  "Synthetic Fur",
  "Other",
];
const HARDWARE_COLORS = ["None", "Silver", "Brass", "Black", "Other"];
const FUR_TYPES = ["None", "Faux Fur", "Shearling", "Rabbit", "Fox", "Mink", "Wool", "Other"];
const FUR_COLORS = ["White", "Black", "Brown", "Grey", "Cream", "Beige", "Custom"];
const FUR_PLACEMENTS = ["Collar", "Hood", "Sleeves", "Cuffs", "Front", "Back"];
const FUR_DENSITIES = ["Light", "Medium", "Heavy"];
const ARTWORK_SLOTS = [
  { key: "leftChest", label: "Left Chest" },
  { key: "rightChest", label: "Right Chest" },
  { key: "leftArm", label: "Left Arm" },
  { key: "rightArm", label: "Right Arm" },
  { key: "back", label: "Back" },
  { key: "other", label: "Other Placement" },
];
const ACCEPTED_FORMATS = ".png,.jpg,.jpeg,.svg,.pdf,.ai,.eps,.webp";

/* ─── Section accordion ──────────────────────────────────────────────── */
function Section({ icon: Icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 transition-colors text-left"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-800 shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 truncate">{title}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""
            }`}
        />
      </button>
      {open && (
        <div className="px-3 sm:px-5 pb-4 sm:pb-5 pt-3 space-y-3 sm:space-y-4 bg-white border-t-2 border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Pill select ────────────────────────────────────────────────────── */
function PillSelect({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border-2 transition-all ${value === opt
              ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
              : "bg-white text-gray-900 border-gray-400 hover:border-gray-900 hover:bg-gray-50 hover:shadow-sm"
            }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Multi-select pills ─────────────────────────────────────────────── */
function MultiPillSelect({ options, values, onChange }) {
  const toggle = (v) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider border-2 transition-all flex items-center gap-1.5 sm:gap-2 ${values.includes(opt)
              ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
              : "bg-white text-gray-900 border-gray-400 hover:border-gray-900 hover:bg-gray-50 hover:shadow-sm"
            }`}
        >
          {values.includes(opt) && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" strokeWidth={3} />}
          {opt}
        </button>
      ))}
    </div>
  );
}

/* ─── Text input shared style ────────────────────────────────────────── */
const inputCls =
  "w-full border-2 border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-gray-900 placeholder-gray-500 outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20 transition-all bg-white font-medium";

/* ─── Artwork upload slot ────────────────────────────────────────────── */
function ArtworkSlot({ slot, artwork, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads/artwork", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange({ url: data.url, name: file.name });
      } else {
        setUploadError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setUploadError("Network error. Please check your connection.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5 sm:space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg bg-white hover:border-gray-400 transition-colors">
        <div className="sm:w-24 shrink-0">
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900">{slot.label}</p>
        </div>
        <div className="flex-1 flex items-center gap-2">
          {artwork?.url ? (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded border-2 border-gray-300 overflow-hidden shrink-0">
                {artwork.url.match(/\.(png|jpg|jpeg|svg|webp)$/i) ? (
                  <img src={artwork.url} alt={artwork.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  </div>
                )}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-900 font-medium truncate flex-1">{artwork.name}</span>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setUploadError(null);
                }}
                className="text-gray-500 hover:text-red-600 transition-colors shrink-0 p-1"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 border-2 border-dashed border-gray-400 hover:border-gray-900 hover:bg-gray-50 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg transition-all bg-white disabled:opacity-50 w-full sm:w-auto justify-center"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              {uploading ? "Uploading..." : "Upload File"}
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_FORMATS}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </div>
      {uploadError && (
        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-red-700 bg-red-50 border-2 border-red-300 rounded-lg p-2 font-medium">
          <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          {uploadError}
        </div>
      )}
    </div>
  );
}

/* ─── Main Modal ─────────────────────────────────────────────────────── */
export default function CustomizeProductModal({ product, isOpen, onClose }) {
  const [step, setStep] = useState("form");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Customer info
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });

  // Customization state
  const [leatherColor, setLeatherColor] = useState("None");
  const [leatherColorNote, setLeatherColorNote] = useState("");
  const [leatherType, setLeatherType] = useState("None");
  const [leatherTypeNote, setLeatherTypeNote] = useState("");
  const [innerLining, setInnerLining] = useState("None");
  const [innerLiningNote, setInnerLiningNote] = useState("");
  const [hardwareColor, setHardwareColor] = useState("None");
  const [hardwareColorNote, setHardwareColorNote] = useState("");

  // Fur
  const [furType, setFurType] = useState("None");
  const [furTypeNote, setFurTypeNote] = useState("");
  const [furColor, setFurColor] = useState("");
  const [furPlacement, setFurPlacement] = useState([]);
  const [furDensity, setFurDensity] = useState("");
  const [furRemovable, setFurRemovable] = useState(null);

  // Artwork
  const [artwork, setArtwork] = useState({});
  const [artworkOtherNote, setArtworkOtherNote] = useState("");

  // Additional notes
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setSubmitError(null);
      setCustomer({ name: "", email: "", phone: "" });
      setLeatherColor("None");
      setLeatherColorNote("");
      setLeatherType("None");
      setLeatherTypeNote("");
      setInnerLining("None");
      setInnerLiningNote("");
      setHardwareColor("None");
      setHardwareColorNote("");
      setFurType("None");
      setFurTypeNote("");
      setFurColor("");
      setFurPlacement([]);
      setFurDensity("");
      setFurRemovable(null);
      setArtwork({});
      setArtworkOtherNote("");
      setAdditionalNotes("");
    }
  }, [isOpen]);

  // Trap scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const updateArtwork = (key, val) => setArtwork((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!customer.name.trim() || !customer.email.trim()) {
      setSubmitError("Please enter your name and email address.");
      return;
    }
    setSubmitError(null);
    setSubmitting(true);
    try {
      const payload = {
        customer,
        product: {
          id: product._id || product.id || null,
          name: product.name,
          slug: product.slug || "",
          image: product.images?.[0] || product.image || "",
          price: product.price,
        },
        customizations: {
          leatherColor,
          leatherColorNote,
          leatherType,
          leatherTypeNote,
          innerLining,
          innerLiningNote,
          hardwareColor,
          hardwareColorNote,
          fur: {
            type: furType,
            typeNote: furTypeNote,
            color: furColor,
            placement: furPlacement,
            density: furDensity,
            removable: furRemovable,
          },
          artwork: {
            ...Object.fromEntries(ARTWORK_SLOTS.map((s) => [s.key, artwork[s.key] || null])),
            ...(artwork.other ? { other: { ...artwork.other, note: artworkOtherNote } } : {}),
          },
        },
        additionalNotes,
      };

      const res = await fetch("/api/customization-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep("success");
      } else {
        setSubmitError(data.error || "Submission failed. Please try again.");
      }
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel - Centered at all screen sizes */}
      <div className="relative w-full max-w-[320px] xs:max-w-[400px] sm:max-w-xl lg:max-w-2xl xl:max-w-3xl max-h-[95dvh] sm:max-h-[92dvh] bg-gray-50 rounded-2xl sm:rounded-xl shadow-2xl flex flex-col overflow-hidden animate-slideUp border-2 border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b-2 border-gray-300 shrink-0 bg-white">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm lg:text-base font-bold uppercase tracking-widest text-gray-900">
              Customize Product
            </p>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-700 uppercase tracking-[0.1em] font-semibold mt-0.5">
              Bespoke Design Inquiry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          </button>
        </div>

        {step === "success" ? (
          /* ─── Success State ─── */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-8 sm:py-12 text-center bg-white">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300">
              <Check className="w-6 h-6 sm:w-7 sm:h-7 text-green-700" strokeWidth={3} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 uppercase tracking-wider">
                Inquiry Received
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-800 leading-relaxed max-w-xs sm:max-w-sm mt-2 font-medium">
                We&apos;ve received your customization request for{" "}
                <strong className="text-gray-900">{product?.name}</strong>.
                Our design team will review your specs and contact you within 24 hours.
              </p>
            </div>
            <p className="text-[10px] sm:text-xs lg:text-sm text-gray-600 uppercase tracking-widest font-semibold">
              Confirmation sent to {customer.email}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="h-10 sm:h-12 px-6 sm:px-8 bg-gray-900 text-white rounded-lg text-xs sm:text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg"
            >
              Done
            </button>
          </div>
        ) : (
          /* ─── Form State ─── */
          <>
            <div className="flex-1 overflow-y-auto px-3 sm:px-5 lg:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 min-h-0 bg-gray-50">
              {/* Product Reference */}
              {product && (
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                  {(product.images?.[0] || product.image) && (
                    <img
                      src={product.images?.[0] || product.image}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 object-cover rounded-lg border-2 border-gray-300 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm lg:text-base font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[280px] lg:max-w-[400px]">
                      {product.name}
                    </p>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-gray-700 uppercase tracking-wider font-semibold">
                      Configure Custom Parameters
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Info */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-300 pb-1.5">
                  Your Details
                </p>
                {[
                  { key: "name", icon: User, type: "text", placeholder: "Full Name" },
                  { key: "email", icon: Mail, type: "email", placeholder: "your@email.com" },
                  { key: "phone", icon: Phone, type: "tel", placeholder: "Phone Number (Optional)" },
                ].map((f) => (
                  <div key={f.key} className="relative">
                    <f.icon className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-700" />
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={customer[f.key]}
                      onChange={(e) => setCustomer((p) => ({ ...p, [f.key]: e.target.value }))}
                      className={`${inputCls} pl-9 sm:pl-11`}
                    />
                  </div>
                ))}
              </div>

              <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-widest text-gray-900 border-b-2 border-gray-300 pb-1.5 pt-1">
                Design Preferences
              </p>

              {/* Leather Color */}
              <Section icon={Palette} title="Leather Color">
                <PillSelect options={LEATHER_COLORS} value={leatherColor} onChange={setLeatherColor} />
                {leatherColor === "Other" && (
                  <input
                    type="text"
                    placeholder="Describe your custom leather color..."
                    value={leatherColorNote}
                    onChange={(e) => setLeatherColorNote(e.target.value)}
                    className={`${inputCls} mt-2`}
                  />
                )}
              </Section>

              {/* Leather Type */}
              <Section icon={Layers} title="Leather Type">
                <PillSelect options={LEATHER_TYPES} value={leatherType} onChange={setLeatherType} />
                {leatherType === "Other" && (
                  <input
                    type="text"
                    placeholder="Describe your custom leather type..."
                    value={leatherTypeNote}
                    onChange={(e) => setLeatherTypeNote(e.target.value)}
                    className={`${inputCls} mt-2`}
                  />
                )}
              </Section>

              {/* Inner Lining */}
              <Section icon={Layers} title="Inner Lining">
                <PillSelect options={INNER_LININGS} value={innerLining} onChange={setInnerLining} />
                {innerLining === "Other" && (
                  <input
                    type="text"
                    placeholder="Describe your custom lining..."
                    value={innerLiningNote}
                    onChange={(e) => setInnerLiningNote(e.target.value)}
                    className={`${inputCls} mt-2`}
                  />
                )}
              </Section>

              {/* Hardware Color */}
              <Section icon={Settings} title="Hardware Tone">
                <PillSelect options={HARDWARE_COLORS} value={hardwareColor} onChange={setHardwareColor} />
                {hardwareColor === "Other" && (
                  <input
                    type="text"
                    placeholder="Describe your custom hardware finish..."
                    value={hardwareColorNote}
                    onChange={(e) => setHardwareColorNote(e.target.value)}
                    className={`${inputCls} mt-2`}
                  />
                )}
              </Section>

              {/* Fur Customization */}
              <Section icon={Feather} title="Fur Accent (Optional)">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wide">
                      Fur Type
                    </p>
                    <PillSelect options={FUR_TYPES} value={furType} onChange={setFurType} />
                    {furType === "Other" && (
                      <input
                        type="text"
                        placeholder="Describe your custom fur type..."
                        value={furTypeNote}
                        onChange={(e) => setFurTypeNote(e.target.value)}
                        className={`${inputCls} mt-2`}
                      />
                    )}
                  </div>
                  {furType !== "None" && (
                    <>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wide">
                          Fur Color
                        </p>
                        <PillSelect options={FUR_COLORS} value={furColor} onChange={setFurColor} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wide">
                          Fur Placement
                        </p>
                        <MultiPillSelect
                          options={FUR_PLACEMENTS}
                          values={furPlacement}
                          onChange={setFurPlacement}
                        />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wide">
                          Fur Density
                        </p>
                        <PillSelect options={FUR_DENSITIES} value={furDensity} onChange={setFurDensity} />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1.5 sm:mb-2 uppercase tracking-wide">
                          Removable Fur?
                        </p>
                        <PillSelect
                          options={["Yes", "No"]}
                          value={furRemovable === true ? "Yes" : furRemovable === false ? "No" : ""}
                          onChange={(v) => setFurRemovable(v === "Yes")}
                        />
                      </div>
                    </>
                  )}
                </div>
              </Section>

              {/* Artwork / Logo */}
              <Section icon={ImageIcon} title="Artwork / Branding Logos">
                <div className="space-y-2 sm:space-y-3">
                  <p className="text-[10px] sm:text-xs text-gray-800 leading-relaxed uppercase tracking-wide font-semibold bg-gray-100 p-2.5 sm:p-3 rounded-lg border-2 border-gray-300">
                    PNG, JPG, SVG, PDF, AI, EPS — Max 10 MB per file.
                  </p>
                  {ARTWORK_SLOTS.map((slot) => (
                    <div key={slot.key} className="space-y-1.5">
                      <ArtworkSlot
                        slot={slot}
                        artwork={artwork[slot.key]}
                        onChange={(v) => updateArtwork(slot.key, v)}
                      />
                      {slot.key === "other" && artwork.other && (
                        <input
                          type="text"
                          placeholder="Describe the exact placement for this artwork..."
                          value={artworkOtherNote}
                          onChange={(e) => setArtworkOtherNote(e.target.value)}
                          className={`${inputCls} text-[10px] sm:text-xs`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Additional Notes */}
              <div className="space-y-1.5 sm:space-y-2">
                <p className="text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.15em] text-gray-900">
                  Special Instructions / Design Vision
                </p>
                <textarea
                  rows={3}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Describe your design vision in detail (e.g. stitching style, custom pockets, lining patterns, any special requests)..."
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-3 sm:px-5 lg:px-6 py-3 sm:py-4 border-t-2 border-gray-300 bg-white shrink-0">
              {/* Disclaimer */}
              <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4 p-2.5 sm:p-3.5 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-yellow-600 mt-1.5 sm:mt-2 shrink-0" />
                <p className="text-[10px] sm:text-xs lg:text-sm text-yellow-900 leading-relaxed font-medium">
                  Design inquiries do not initiate any charges. We will review your request and send a formal
                  invoice upon approval.
                </p>
              </div>

              {/* Inline error */}
              {submitError && (
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 text-xs sm:text-sm text-red-800 bg-red-50 border-2 border-red-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 font-medium">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  {submitError}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-10 sm:h-12 lg:h-14 rounded-lg font-bold uppercase tracking-[0.15em] text-xs sm:text-sm lg:text-base flex items-center justify-center gap-2 sm:gap-3 bg-gray-900 text-white hover:bg-gray-800 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Submitting Inquiry...
                  </>
                ) : (
                  "Submit Custom Design Request"
                )}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(28px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (max-width: 640px) {
          @keyframes slideUpMobile {
            from {
              opacity: 0;
              transform: translateY(100%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-slideUp {
            animation: slideUpMobile 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
        }

        /* Extra small screens (300px+) */
        @media (min-width: 300px) and (max-width: 399px) {
          .xs\\:max-w-\\[400px\\] {
            max-width: calc(100vw - 16px);
          }
        }
      `}</style>
    </div>
  );
}