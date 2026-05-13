"use client";

import { useState } from "react";
import { ImageIcon, X, Plus } from "lucide-react";
import MediaPickerModal from "./MediaPickerModal";

/**
 * MediaPicker — Drop-in replacement for any image input in the admin
 *
 * Single image usage:
 *   <MediaPicker value={imageUrl} onChange={(url) => setImage(url)} label="Featured Image" />
 *
 * Multiple images (gallery):
 *   <MediaPicker multiple value={gallery} onChange={(urls) => setGallery(urls)} label="Gallery" />
 */
export default function MediaPicker({ value, onChange, label, multiple = false, className = "" }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selected) => {
    if (multiple) {
      const newUrls = Array.isArray(selected) ? selected.map(s => s.url) : [selected.url];
      const existing = Array.isArray(value) ? value : [];
      // Merge without duplicates
      const merged = [...existing, ...newUrls.filter(u => !existing.includes(u))];
      onChange(merged);
    } else {
      onChange(selected.url, selected);
    }
  };

  const removeImage = (url) => {
    if (multiple) {
      onChange((Array.isArray(value) ? value : []).filter(u => u !== url));
    } else {
      onChange('', null);
    }
  };

  const images = multiple
    ? (Array.isArray(value) ? value : [])
    : (value ? [value] : []);

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="text-[12px] font-semibold text-[#1d2327] block">{label}</label>
        )}

        {/* Preview area */}
        {images.length > 0 && (
          <div className={`${multiple ? "flex flex-wrap gap-2" : ""}`}>
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <div className={`overflow-hidden bg-[#f0f0f1] border border-[#c3c4c7] ${multiple ? "w-20 h-20" : "w-full h-40"}`}>
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute top-0.5 right-0.5 bg-red-600 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Add more button for gallery */}
            {multiple && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="w-20 h-20 border-2 border-dashed border-[#c3c4c7] hover:border-[#2271b1] flex items-center justify-center transition-colors group"
              >
                <Plus className="w-5 h-5 text-[#8c8f94] group-hover:text-[#2271b1]" />
              </button>
            )}
          </div>
        )}

        {/* Upload / Select button */}
        {(!multiple && images.length === 0) || (multiple && images.length === 0) ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="w-full border-2 border-dashed border-[#c3c4c7] hover:border-[#2271b1] p-6 flex flex-col items-center gap-2 transition-colors group"
          >
            <ImageIcon className="w-8 h-8 text-[#8c8f94] group-hover:text-[#2271b1]" />
            <span className="text-[12px] text-[#646970] group-hover:text-[#2271b1]">
              {multiple ? "Add Images" : "Select Image"}
            </span>
          </button>
        ) : !multiple ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[12px] text-[#2271b1] hover:text-[#135e96] font-medium"
          >
            Change Image
          </button>
        ) : null}
      </div>

      <MediaPickerModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={handleSelect}
        multiple={multiple}
        title={label || (multiple ? "Select Images" : "Select Image")}
      />
    </>
  );
}
