"use client";

import React, { useState } from "react";
import { Eye, CheckCircle, AlertTriangle, RefreshCw, Smartphone, Monitor } from "lucide-react";
import MediaPicker from "./MediaPicker";

export default function SEOConfigPanel({
  seo = {},
  onChange,
  parentTitle = "",
  parentDescription = "",
  parentSlug = "",
  parentImage = "",
  parentType = "product"
}) {
  const [activePreviewTab, setActivePreviewTab] = useState("google-mobile");
  const [activeSubTab, setActiveSubTab] = useState("general");

  // Initialize fields safely
  const title = seo.title || "";
  const description = seo.description || "";
  const keywords = Array.isArray(seo.keywords) ? seo.keywords.join(", ") : (seo.keywords || "");
  const focusKeyword = seo.focusKeyword || "";
  const canonicalUrl = seo.canonicalUrl || "";
  const noIndex = !!seo.noIndex;
  const noFollow = !!seo.noFollow;
  const ogTitle = seo.ogTitle || "";
  const ogDescription = seo.ogDescription || "";
  const ogImage = seo.ogImage || "";
  const twitterTitle = seo.twitterTitle || "";
  const twitterDescription = seo.twitterDescription || "";
  const twitterImage = seo.twitterImage || "";
  const structuredData = seo.structuredData || "";

  // Perform JSON-LD validation on render
  let jsonLdError = null;
  if (structuredData.trim()) {
    try {
      JSON.parse(structuredData);
    } catch (err) {
      jsonLdError = err.message;
    }
  }

  // Update a single SEO field and propagate changes
  const updateField = (field, val) => {
    let updatedVal = val;
    if (field === "keywords") {
      updatedVal = val.split(",").map(k => k.trim()).filter(Boolean);
    }
    onChange({
      ...seo,
      [field]: updatedVal
    });
  };

  // Strip HTML utility for auto-generation
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<\/?[^>]+(>|$)/g, "").trim();
  };

  // Auto-generate fields from parent values
  const handleAutoGenerate = () => {
    const cleanDesc = stripHtml(parentDescription).substring(0, 155);
    const resolvedSlug = parentSlug ? parentSlug.toLowerCase() : "";
    const siteUrl = "https://pairo.store";
    
    let pathPrefix = "/";
    if (parentType === "product") pathPrefix = "/shop/";
    else if (parentType === "blog") pathPrefix = "/blog/";
    else if (parentType === "category") pathPrefix = "/";

    const generated = {
      ...seo,
      title: parentTitle.substring(0, 60),
      description: cleanDesc,
      focusKeyword: parentTitle.split(" ")[0]?.toLowerCase() || "",
      canonicalUrl: resolvedSlug ? `${siteUrl}${pathPrefix}${resolvedSlug}` : "",
      ogTitle: parentTitle.substring(0, 60),
      ogDescription: cleanDesc,
      ogImage: parentImage || seo.ogImage || "",
      twitterTitle: parentTitle.substring(0, 60),
      twitterDescription: cleanDesc,
      twitterImage: parentImage || seo.twitterImage || seo.ogImage || "",
    };
    onChange(generated);
  };

  // Live fallback titles & descriptions for preview calculations
  const displayTitle = title || parentTitle || "Pairo Store | Premium Shearling Jackets";
  const displayDesc = description || stripHtml(parentDescription) || "Experience the ultimate warmth and luxury with Pairo's handcrafted shearling jackets.";
  const displayOgTitle = ogTitle || displayTitle;
  const displayOgDesc = ogDescription || displayDesc;
  const displayOgImage = ogImage || parentImage || "/placeholder.jpg";
  const displayTwTitle = twitterTitle || displayOgTitle;
  const displayTwDesc = twitterDescription || displayOgDesc;
  const displayTwImage = twitterImage || displayOgImage;

  // Keyword validation metrics
  const checks = [];
  let score = 0;

  // 1. Meta Title length check
  const titleLen = displayTitle.length;
  const titleOk = titleLen >= 50 && titleLen <= 60;
  checks.push({
    label: `Meta Title Length: ${titleLen} chars (Recommended: 50-60)`,
    status: titleOk ? "success" : "warning",
    message: titleOk ? "Perfect length." : titleLen < 50 ? "Too short." : "Too long."
  });
  if (titleOk) score += 25;

  // 2. Meta Description length check
  const descLen = displayDesc.length;
  const descOk = descLen >= 120 && descLen <= 160;
  checks.push({
    label: `Meta Description Length: ${descLen} chars (Recommended: 120-160)`,
    status: descOk ? "success" : "warning",
    message: descOk ? "Perfect length." : descLen < 120 ? "Too short." : "Too long."
  });
  if (descOk) score += 25;

  // 3. Focus keyword in Meta Title check
  if (focusKeyword) {
    const hasFocusInTitle = displayTitle.toLowerCase().includes(focusKeyword.toLowerCase());
    checks.push({
      label: `Focus Keyword in Meta Title`,
      status: hasFocusInTitle ? "success" : "error",
      message: hasFocusInTitle ? "Found in title." : "Not found in title."
    });
    if (hasFocusInTitle) score += 25;
  } else {
    checks.push({
      label: "Focus Keyword Defined",
      status: "warning",
      message: "Define a focus keyword to evaluate search optimization."
    });
  }

  // 4. Focus keyword in Meta Description check
  if (focusKeyword) {
    const hasFocusInDesc = displayDesc.toLowerCase().includes(focusKeyword.toLowerCase());
    checks.push({
      label: `Focus Keyword in Meta Description`,
      status: hasFocusInDesc ? "success" : "error",
      message: hasFocusInDesc ? "Found in description." : "Not found in description."
    });
    if (hasFocusInDesc) score += 25;
  }

  return (
    <div className="bg-white border border-[#c3c4c7] p-8 space-y-10">
      {/* Header and Auto Generator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-neutral-200 pb-6">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-black uppercase tracking-wider">Search Engine Optimization (SEO)</h3>
          <p className="text-xs text-neutral-600">Configure search indexing, metadata fallbacks, and social sharing templates.</p>
        </div>
        <button
          type="button"
          onClick={handleAutoGenerate}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-black hover:bg-neutral-50 text-black text-xs font-bold uppercase tracking-wider transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Auto-Generate Fields
        </button>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex border-b border-neutral-200 gap-8 pb-3 overflow-x-auto scrollbar-hide">
        {[
          { id: "general", label: "General SEO" },
          { id: "robots", label: "Robots Directives" },
          { id: "social", label: "Social Media" },
          { id: "schema", label: "JSON-LD Schema" }
        ].map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveSubTab(t.id)}
            className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 -mb-[14px] cursor-pointer ${
              activeSubTab === t.id
                ? "border-black text-black"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="space-y-10">
        {/* GENERAL SEO TAB */}
        {activeSubTab === "general" && (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left Column: Form Inputs */}
            <div className="lg:col-span-7 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-black uppercase tracking-wider block">Focus Keyword</label>
                  <input
                    type="text"
                    placeholder="e.g. shearling jacket"
                    className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black placeholder-neutral-400 outline-none transition-all"
                    value={focusKeyword}
                    onChange={e => updateField("focusKeyword", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-black uppercase tracking-wider block">Keywords (Comma-separated)</label>
                  <input
                    type="text"
                    placeholder="jacket, leather, shearling"
                    className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black placeholder-neutral-400 outline-none transition-all"
                    value={keywords}
                    onChange={e => updateField("keywords", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">Meta Title</label>
                  <span className={`text-[11px] font-bold ${titleOk ? "text-green-700" : "text-amber-700"}`}>{titleLen}/60 chars</span>
                </div>
                <input
                  type="text"
                  placeholder="Primary Brand Title | Category Description"
                  className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black font-semibold outline-none transition-all"
                  value={title}
                  onChange={e => updateField("title", e.target.value)}
                />
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${titleOk ? "bg-green-600" : titleLen > 60 ? "bg-red-600" : "bg-amber-500"}`}
                    style={{ width: `${Math.min((titleLen / 60) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-black uppercase tracking-wider">Meta Description</label>
                  <span className={`text-[11px] font-bold ${descOk ? "text-green-700" : "text-amber-700"}`}>{descLen}/160 chars</span>
                </div>
                <textarea
                  placeholder="Summarize page content for search result listings..."
                  rows={5}
                  className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black outline-none transition-all resize-none"
                  value={description}
                  onChange={e => updateField("description", e.target.value)}
                />
                <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${descOk ? "bg-green-600" : descLen > 160 ? "bg-red-600" : "bg-amber-500"}`}
                    style={{ width: `${Math.min((descLen / 160) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-black uppercase tracking-wider block">Canonical URL override</label>
                <input
                  type="url"
                  placeholder="Leave empty for auto-generated canonical tag"
                  className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black outline-none transition-all"
                  value={canonicalUrl}
                  onChange={e => updateField("canonicalUrl", e.target.value)}
                />
              </div>
            </div>

            {/* Right Column: Preview & Analysis */}
            <div className="lg:col-span-5 space-y-8">
              {/* Google Search Snippet Preview Box */}
              <div className="border-2 border-neutral-200 bg-white overflow-hidden">
                <div className="border-b border-neutral-200 px-5 py-4 flex justify-between items-center">
                  <span className="text-xs font-bold text-black uppercase tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4 text-black" />
                    Google Search Preview
                  </span>
                  <div className="flex border border-neutral-200 p-0.5 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("google-mobile")}
                      className={`p-1.5 transition-colors cursor-pointer ${activePreviewTab === "google-mobile" ? "bg-black text-white" : "text-neutral-400 hover:text-neutral-700"}`}
                      title="Google Mobile Preview"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivePreviewTab("google-desktop")}
                      className={`p-1.5 transition-colors cursor-pointer ${activePreviewTab === "google-desktop" ? "bg-black text-white" : "text-neutral-400 hover:text-neutral-700"}`}
                      title="Google Desktop Preview"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="p-5 bg-white min-h-[120px] flex flex-col justify-center">
                  {activePreviewTab === "google-mobile" ? (
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-1 text-[11px] text-neutral-600">
                        <span className="font-semibold text-neutral-800">pairo.store</span>
                        <span>› {parentSlug || "slug"}</span>
                      </div>
                      <h4 className="text-[#1a0dab] text-[16px] leading-[20px] font-medium hover:underline cursor-pointer font-sans">
                        {displayTitle}
                      </h4>
                      <p className="text-neutral-800 text-[12px] leading-[18px] font-sans break-words">
                        {displayDesc.substring(0, 155)}
                        {displayDesc.length > 155 && "..."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 text-left">
                      <div className="text-[11px] text-neutral-600">
                        https://pairo.store › {parentSlug || "slug"}
                      </div>
                      <h4 className="text-[#1a0dab] text-[19px] leading-[24px] font-medium hover:underline cursor-pointer font-sans">
                        {displayTitle}
                      </h4>
                      <p className="text-neutral-800 text-[13px] leading-[20px] font-sans break-words">
                        {displayDesc.substring(0, 155)}
                        {displayDesc.length > 155 && "..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Checklist & Scores */}
              <div className="border-2 border-neutral-200 bg-white p-6 space-y-4">
                <div className="flex justify-between items-center border-b border-neutral-200 pb-4">
                  <span className="text-xs font-bold text-black uppercase tracking-wider">Optimization Checklist</span>
                  <span className={`px-3 py-1.5 text-xs font-bold border ${score >= 75 ? "bg-white text-green-700 border-green-400" : score >= 50 ? "bg-white text-amber-700 border-amber-400" : "bg-white text-red-700 border-red-400"}`}>
                    Score: {score}%
                  </span>
                </div>
                
                <div className="space-y-4 max-h-[240px] overflow-y-auto custom-scrollbar pr-1">
                  {checks.map((c, i) => (
                    <div key={i} className="flex gap-3 text-xs border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                      <div className="shrink-0 pt-0.5">
                        {c.status === "success" && <span className="text-green-700 font-bold bg-green-50 border border-green-200 w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span>}
                        {c.status === "warning" && <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 w-6 h-6 rounded-full flex items-center justify-center text-xs">⚠</span>}
                        {c.status === "error" && <span className="text-red-700 font-bold bg-red-50 border border-red-200 w-6 h-6 rounded-full flex items-center justify-center text-xs">✗</span>}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-black leading-tight">{c.label}</div>
                        <div className="text-[11px] text-neutral-500 leading-relaxed">{c.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ROBOTS DIRECTIVES TAB */}
        {activeSubTab === "robots" && (
          <div className="space-y-6 max-w-3xl">
            <div className="border-2 border-neutral-200 p-6 bg-white space-y-5">
              <label className="text-xs font-bold text-black uppercase tracking-wider block">Robots Directives</label>
              <div className="flex flex-col gap-4 text-sm text-black">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="border-2 border-neutral-300 text-black focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    checked={noIndex}
                    onChange={e => updateField("noIndex", e.target.checked)}
                  />
                  <span className="font-semibold text-neutral-800 group-hover:text-black transition-colors">noindex (Hide this page from search engine listings)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="border-2 border-neutral-300 text-black focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                    checked={noFollow}
                    onChange={e => updateField("noFollow", e.target.checked)}
                  />
                  <span className="font-semibold text-neutral-800 group-hover:text-black transition-colors">nofollow (Prevent crawlers from following links on this page)</span>
                </label>
              </div>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 p-4 border border-neutral-200">
              By default, all pages are indexable and links will be crawled. Checking "noindex" instructs search engines not to display this page in their search results. Checking "nofollow" prevents search engines from following the links on this page.
            </p>
          </div>
        )}

        {/* SOCIAL MEDIA TAB */}
        {activeSubTab === "social" && (
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            {/* Left: Social Config Inputs */}
            <div className="lg:col-span-6 space-y-8">
              {/* Facebook Inputs */}
              <div className="p-6 border-2 border-neutral-200 bg-white space-y-5">
                <h4 className="text-xs font-bold text-black border-b border-neutral-200 pb-3 uppercase tracking-wider">Facebook (Open Graph)</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">OG Share Title</label>
                    <input
                      type="text"
                      placeholder="OG Share Title"
                      className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black outline-none transition-all"
                      value={ogTitle}
                      onChange={e => updateField("ogTitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">OG Share Description</label>
                    <textarea
                      placeholder="OG Share Description"
                      rows={3}
                      className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black outline-none transition-all resize-none"
                      value={ogDescription}
                      onChange={e => updateField("ogDescription", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">OG Social Image</label>
                    <MediaPicker
                      value={ogImage}
                      onChange={url => updateField("ogImage", url)}
                      label="OG Social Image"
                    />
                  </div>
                </div>
              </div>

              {/* Twitter Inputs */}
              <div className="p-6 border-2 border-neutral-200 bg-white space-y-5">
                <h4 className="text-xs font-bold text-black border-b border-neutral-200 pb-3 uppercase tracking-wider">Twitter (Cards)</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">Twitter Card Title</label>
                    <input
                      type="text"
                      placeholder="Twitter Card Title"
                      className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black outline-none transition-all"
                      value={twitterTitle}
                      onChange={e => updateField("twitterTitle", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">Twitter Card Description</label>
                    <textarea
                      placeholder="Twitter Card Description"
                      rows={3}
                      className="w-full bg-white border-2 border-neutral-200 hover:border-neutral-350 focus:border-black px-4 py-3 text-sm text-black outline-none transition-all resize-none"
                      value={twitterDescription}
                      onChange={e => updateField("twitterDescription", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-black uppercase tracking-wider block">Twitter Social Image</label>
                    <MediaPicker
                      value={twitterImage}
                      onChange={url => updateField("twitterImage", url)}
                      label="Twitter Social Image"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Previews */}
            <div className="lg:col-span-6 space-y-8">
              {/* Facebook Card Preview */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">Facebook Share Preview</label>
                <div className="border-2 border-neutral-200 rounded-xl overflow-hidden bg-white font-sans text-left shadow-sm">
                  <div className="w-full h-48 overflow-hidden bg-neutral-100 relative">
                    <img src={displayOgImage} alt="OG Card" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 border-t border-neutral-200 bg-white">
                    <div className="text-neutral-500 uppercase text-[10px] tracking-wider font-bold">pairo.store</div>
                    <div className="font-extrabold text-[15px] text-black truncate mt-1">{displayOgTitle}</div>
                    <div className="text-neutral-700 text-xs mt-2 line-clamp-2 leading-relaxed">{displayOgDesc}</div>
                  </div>
                </div>
              </div>

              {/* Twitter Card Preview */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-black uppercase tracking-wider block">Twitter Card Preview</label>
                <div className="border-2 border-neutral-200 rounded-xl overflow-hidden bg-white font-sans text-left shadow-sm">
                  <div className="w-full h-48 overflow-hidden bg-neutral-100 relative">
                    <img src={displayTwImage} alt="Twitter Card" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 border-t border-neutral-200 bg-white">
                    <div className="text-neutral-500 text-[10px] tracking-wider font-bold uppercase">pairo.store</div>
                    <div className="font-extrabold text-[15px] text-black truncate mt-1">{displayTwTitle}</div>
                    <div className="text-neutral-700 text-xs mt-2 line-clamp-2 leading-relaxed">{displayTwDesc}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* JSON-LD SCHEMA TAB */}
        {activeSubTab === "schema" && (
          <div className="space-y-6 max-w-3xl">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-black uppercase tracking-wider">Custom JSON-LD Structured Data</label>
                {jsonLdError ? (
                  <span className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-white px-3 py-1 rounded-full border border-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    JSON Syntax Error
                  </span>
                ) : structuredData.trim() ? (
                  <span className="flex items-center gap-1.5 text-green-700 text-xs font-bold bg-white px-3 py-1 rounded-full border border-green-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Valid Schema
                  </span>
                ) : (
                  <span className="text-neutral-500 text-[11px] bg-white px-3 py-1 rounded-full border border-neutral-200">Using fallback schemas</span>
                )}
              </div>
              <textarea
                placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Product",\n  "name": "Custom Shearling Jacket"\n}`}
                rows={12}
                className={`w-full font-mono text-xs p-4 border-2 outline-none transition-all bg-white ${jsonLdError ? "border-red-400 focus:border-red-500" : "border-neutral-200 focus:border-black"}`}
                value={structuredData}
                onChange={e => updateField("structuredData", e.target.value)}
              />
              {jsonLdError && (
                <p className="text-xs text-red-700 mt-2 bg-white p-4 border border-red-200 font-bold leading-relaxed">{jsonLdError}</p>
              )}
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed bg-neutral-50 p-4 border border-neutral-200">
              Add custom JSON-LD schema blocks to explicitly describe this entity to Google. Ensure the markup contains valid JSON syntax.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
