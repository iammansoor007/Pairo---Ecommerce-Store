"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import * as LucideIcons from "lucide-react";
import {
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Save,
  ArrowLeft,
  ChevronDown,
  GripVertical,
  ExternalLink,
  Settings,
  Globe,
  FileText
} from "lucide-react";
import { toast } from "react-hot-toast";
import { SECTION_SCHEMAS } from "@/lib/section-schemas";
import Link from "next/link";
import MediaPickerModal from "@/components/admin/MediaPickerModal";

// Massive icon library for the picker
const COMMON_ICONS = [
  // Essentials
  "Zap", "Shield", "Truck", "RotateCcw", "Globe", "HelpCircle", "Package",
  "ShoppingBag", "Star", "Heart", "Search", "User", "Mail", "Phone",
  "MapPin", "Gift", "Award", "Clock", "Check", "Info", "AlertCircle",
  "ArrowRight", "ArrowLeft", "ChevronUp", "ChevronDown", "CreditCard", "Tag",
  "ThumbsUp", "Bell", "Eye", "Lock", "Unlock", "Camera", "Image", "Video",
  "Play", "Pause", "Home", "Settings", "Menu", "X", "Filter", "Download",
  // Commerce & Marketing
  "DollarSign", "Percent", "TrendingUp", "ShoppingCart", "CreditCard", "Ticket",
  "BadgeCheck", "Sparkles", "Flame", "Crown", "Gem", "Medal", "Target", "Zap",
  // Action & Navigation
  "ExternalLink", "Link", "Copy", "Trash2", "Edit", "Plus", "Minus", "CheckCircle",
  "RefreshCw", "Share2", "Maximize", "Minimize", "MoreHorizontal", "MoreVertical",
  // Nature & Travel
  "Leaf", "Wind", "Sun", "Moon", "Cloud", "Mountain", "Umbrella", "Compass",
  "Plane", "Anchor", "Bicycle", "Car", "Ship", "Map", "Tent", "PalmTree",
  // Objects & Tech
  "Smartphone", "Laptop", "Watch", "Tv", "Speaker", "Mic", "Headphones", "Key",
  "Scissors", "Hammer", "Wrench", "PenTool", "Brush", "Coffee", "Grape", "Pizza",
  // Shapes & Symbols
  "Square", "Circle", "Triangle", "Hexagon", "Octagon", "Smile", "Frown",
  "Ghost", "Skull", "Rocket", "LifeBuoy", "Flag"
];

const IconPicker = ({ value, onChange }) => {
  const [search, setSearch] = useState("");
  const Icon = LucideIcons[value] || LucideIcons.HelpCircle;

  const filteredIcons = COMMON_ICONS.filter(name => 
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2 border border-[#ccd0d4] bg-[#f6f7f7] p-2 rounded-sm">
      <div className="flex items-center gap-3 p-2 bg-white border border-[#ccd0d4] rounded-sm">
        <div className="w-10 h-10 bg-gray-50 border border-gray-100 flex items-center justify-center text-[#2271b1]">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Search icons..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-[13px] border-none p-0 focus:ring-0 placeholder:text-[#646970] font-medium"
          />
          <p className="text-[10px] text-[#646970] mt-0.5">{value || "None selected"}</p>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 p-1 max-h-[140px] overflow-y-auto bg-white border border-[#ccd0d4]">
        {filteredIcons.map(iconName => {
          const ItemIcon = LucideIcons[iconName];
          if (!ItemIcon) return null; // Safety check to prevent crashes if icon name is invalid
          return (
            <button
              key={iconName}
              type="button"
              onClick={() => onChange(iconName)}
              className={`p-2 flex items-center justify-center rounded-sm transition-all ${value === iconName ? 'bg-[#2271b1] text-white shadow-inner' : 'bg-white hover:bg-gray-100 text-[#646970]'}`}
              title={iconName}
            >
              <ItemIcon className="w-4 h-4" />
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
           <div className="col-span-7 py-4 text-center text-[11px] text-[#646970]">No icons found</div>
        )}
      </div>
    </div>
  );
};

// --- Sortable Section Item (Classic WordPress Style) ---
const SortableSection = ({
  section,
  index,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onDelete,
  onDuplicate,
  onOpenMediaPicker,
  renderField
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const schema = SECTION_SCHEMAS[section.type] || { name: section.type, fields: [] };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-[#ccd0d4] mb-2 shadow-sm transition-all`}
    >
      {/* Header / Handle */}
      <div
        className={`px-3 py-2 border-b border-[#ccd0d4] flex items-center justify-between cursor-pointer bg-[#f6f7f7] hover:bg-white`}
        onClick={() => onToggleExpand(section.id)}
      >
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 text-[#646970] hover:text-[#2271b1]"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-[#1d2327]">{schema.name}</h3>
            {!section.enabled && <span className="text-[11px] text-[#646970] italic">(Hidden)</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(section.id); }} className="p-1 text-[#646970] hover:text-[#2271b1]" title="Duplicate"><Copy className="w-3.5 h-3.5" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(section.id); }} className="p-1 text-[#d63638] hover:underline text-[11px]" title="Delete">Delete</button>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#646970] transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="p-4 bg-white border-t border-[#f0f0f1]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.fields.filter(field => {
              if (field.dependsOn) {
                const depVal = section.config[field.dependsOn];
                return depVal === field.visibleIf;
              }
              return true;
            }).map((field) => (
              <div key={field.name} className={`space-y-1 ${field.type === 'repeater' || field.type === 'group' || field.type === 'icon' || field.type === 'multiselect' ? 'md:col-span-2' : ''}`}>
                <label className="text-[13px] font-medium text-[#1d2327]">{field.label}</label>
                {renderField(field, section.config[field.name], (val) => onUpdate(section.id, { [field.name]: val }), onOpenMediaPicker)}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[#f0f0f1] flex items-center justify-between">
            <button
              onClick={() => onUpdate(section.id, null, !section.enabled)}
              className={`text-[12px] hover:underline ${section.enabled ? 'text-[#2271b1]' : 'text-[#646970]'}`}
            >
              {section.enabled ? 'Hide Section' : 'Show Section'}
            </button>
            <span className="text-[11px] text-[#646970] font-mono">{section.type} | ID: {section.id}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Page Builder Main ---
export default function PageBuilder({ initialPage }) {
  const [page, setPage] = useState(initialPage);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("content");
  const [expandedSectionId, setExpandedSectionId] = useState(page.sections[0]?.id || null);
  const [mediaPicker, setMediaPicker] = useState({ open: false, onSelect: null });
  const [dynamicOptions, setDynamicOptions] = useState({ 
    categories: [],
    products: [],
    blogs: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, prodsRes, blogsRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/products"),
          fetch("/api/admin/blogs")
        ]);
        const cats = await catsRes.json();
        const prods = await prodsRes.json();
        const blogs = await blogsRes.json();

        setDynamicOptions({
          categories: Array.isArray(cats) ? cats.filter(c => c.status === 'Published').map(c => ({ label: c.name, value: c.slug })) : [],
          products: Array.isArray(prods) ? prods.map(p => ({ label: p.name, value: p.slug || p._id })) : [],
          blogs: Array.isArray(blogs) ? blogs.filter(b => b.status === 'Published').map(b => ({ label: b.title, value: b._id })) : []
        });
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const toggleExpand = (id) => {
    setExpandedSectionId(prev => prev === id ? null : id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setPage((prev) => {
        const oldIndex = prev.sections.findIndex(s => s.id === active.id);
        const newIndex = prev.sections.findIndex(s => s.id === over.id);
        const newSections = arrayMove(prev.sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i }));
        return { ...prev, sections: newSections };
      });
    }
  };

  const renderField = (field, value, onChange, onOpenMediaPicker) => {
    const inputClass = "w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] bg-white transition-all";

    switch (field.type) {
      case "text":
        return <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
      case "textarea":
        return <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} className={`${inputClass} resize-none`} />;
      case "number":
        return <input type="number" value={value || 0} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />;
      case "icon":
        return <IconPicker value={value} onChange={onChange} />;
      case "select":
        return (
          <select value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            <option value="">Select Option</option>
            {field.options === 'categories' ? (
              dynamicOptions.categories.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))
            ) : field.options === 'products' ? (
              dynamicOptions.products.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))
            ) : field.options === 'blogs' ? (
              dynamicOptions.blogs.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))
            ) : Array.isArray(field.options) ? field.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            )) : null}
          </select>
        );
      case "multiselect":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto p-3 border border-[#8c8f94] bg-white rounded-sm">
            {(
              field.options === 'categories' ? dynamicOptions.categories : 
              field.options === 'products' ? dynamicOptions.products :
              field.options === 'blogs' ? dynamicOptions.blogs :
              field.options || []
            ).map(opt => (
              <label key={opt.value} className="flex items-center gap-2.5 text-[13px] cursor-pointer hover:bg-gray-50 py-1 px-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 border-[#8c8f94] rounded-sm text-[#2271b1] focus:ring-[#2271b1]"
                  checked={selectedValues.includes(opt.value)}
                  onChange={(e) => {
                    const newVal = e.target.checked
                      ? [...selectedValues, opt.value]
                      : selectedValues.filter(v => v !== opt.value);
                    onChange(newVal);
                  }}
                />
                <span className="text-[#1d2327]">{opt.label}</span>
              </label>
            ))}
          </div>
        );
      case "repeater":
        const items = value || [];
        return (
          <div className="space-y-3 bg-[#f0f0f1] p-3 border border-[#ccd0d4]">
            {items.map((item, index) => (
              <div key={index} className="bg-white border border-[#ccd0d4] p-3 relative group/item">
                <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2 mb-3">
                  <span className="text-[11px] font-bold text-[#646970]">Item {index + 1}</span>
                  <button onClick={() => {
                    const newItems = [...items];
                    newItems.splice(index, 1);
                    onChange(newItems);
                  }} className="text-[#d63638] text-[11px] hover:underline">Remove</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {field.fields.map(subField => (
                    <div key={subField.name} className="space-y-0.5">
                      <label className="text-[12px] text-[#1d2327]">{subField.label}</label>
                      {renderField(subField, item[subField.name], (val) => {
                        const newItems = [...items];
                        newItems[index] = { ...item, [subField.name]: val };
                        onChange(newItems);
                      }, onOpenMediaPicker)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={() => onChange([...items, {}])}
              className="px-3 py-1 bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] text-[13px] hover:bg-[#2271b1] hover:text-white transition-all"
            >
              + Add {field.label.slice(0, -1)}
            </button>
          </div>
        );
      case "image":
        return (
          <div className="space-y-2">
            {value ? (
              <div className="relative w-full max-w-[300px] border border-[#ccd0d4] group">
                <img src={value} className="w-full aspect-video object-cover bg-gray-50" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => onOpenMediaPicker(onChange)}
                    className="bg-white border border-[#ccd0d4] px-3 py-1.5 text-[12px] font-bold hover:bg-[#f6f7f7]"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => onChange("")}
                    className="bg-[#d63638] text-white px-3 py-1.5 text-[12px] font-bold hover:bg-[#b32d2e]"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onOpenMediaPicker(onChange)}
                className="w-full py-10 border-2 border-dashed border-[#ccd0d4] bg-[#f9f9f9] text-[#2271b1] text-[13px] font-bold hover:bg-[#f0f6fa] hover:border-[#2271b1] transition-all flex flex-col items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Select or Upload Image
              </button>
            )}
          </div>
        );
      case "group":
        return (
          <div className="space-y-4 p-3 border border-[#ccd0d4] bg-[#f6f7f7]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {field.fields.map(sub => (
                <div key={sub.name} className="space-y-0.5">
                  <label className="text-[12px] text-[#1d2327] font-medium">{sub.label}</label>
                  {renderField(sub, (value || {})[sub.name], (val) => onChange({ ...value, [sub.name]: val }), onOpenMediaPicker)}
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const updateSection = (id, newConfig, enabled) => {
    setPage(prev => ({
      ...prev,
      sections: prev.sections.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          enabled: enabled !== undefined ? enabled : s.enabled,
          config: newConfig ? { ...s.config, ...newConfig } : s.config
        };
      })
    }));
  };

  const addSection = (type) => {
    const newId = Math.random().toString(36).substring(2, 11);
    const newSection = {
      id: newId,
      type,
      enabled: true,
      order: page.sections.length,
      config: {},
      overrides: { padding: "py-0", background: "transparent" }
    };
    setPage(prev => ({ ...prev, sections: [...prev.sections, newSection] }));
    setExpandedSectionId(newId);
    toast.success("Section added.");
  };

  const deleteSection = (id) => {
    if (!confirm("Remove this section?")) return;
    setPage(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== id) }));
    if (expandedSectionId === id) setExpandedSectionId(null);
    toast.success("Section removed.");
  };

  const savePage = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${page._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page)
      });
      if (res.ok) toast.success("Page updated.");
      else toast.error("Update failed.");
    } catch (err) {
      toast.error("Error saving page.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f1] text-[#1d2327] font-sans pb-40">
      {/* Top Bar */}
      <div className="bg-[#1d2327] h-8 flex items-center px-4 justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-4">
          <Link href="/admin/pages" className="text-[#c3c4c7] hover:text-[#72aee6] text-[13px] flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back
          </Link>
          <span className="text-[#72aee6] text-[13px] font-bold">Edit: {page.title}</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={`/${page.slug === 'home' ? '' : page.slug}`} target="_blank" className="text-[#c3c4c7] hover:text-[#72aee6] text-[11px] flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> View Page
          </a>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Main Column */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <input
                type="text"
                value={page.title}
                onChange={(e) => setPage({ ...page, title: e.target.value })}
                placeholder="Enter title here"
                className="w-full bg-white border border-[#ccd0d4] px-3 py-1 text-[32px] font-normal outline-none focus:border-[#2271b1] shadow-inner"
              />
            </div>

            {/* Tab Bar */}
            <div className="flex border-b border-[#ccd0d4] mb-4">
              <button
                onClick={() => setActiveMainTab("content")}
                className={`px-4 py-2 text-[14px] font-normal border-b-2 -mb-px transition-all ${activeMainTab === 'content' ? 'border-[#2271b1] text-[#1d2327] bg-white font-bold' : 'border-transparent text-[#2271b1] hover:text-[#135e96]'}`}
              >
                Manage Content
              </button>
              <button
                onClick={() => setActiveMainTab("seo")}
                className={`px-4 py-2 text-[14px] font-normal border-b-2 -mb-px transition-all ${activeMainTab === 'seo' ? 'border-[#2271b1] text-[#1d2327] bg-white font-bold' : 'border-transparent text-[#2271b1] hover:text-[#135e96]'}`}
              >
                SEO Settings
              </button>
            </div>

            {activeMainTab === 'content' ? (
              <div className="space-y-4">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={page.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {page.sections.map((section, index) => (
                        <SortableSection
                          key={section.id}
                          section={section}
                          isExpanded={expandedSectionId === section.id}
                          onToggleExpand={(id) => setExpandedSectionId(expandedSectionId === id ? null : id)}
                          onUpdate={updateSection}
                          onDelete={deleteSection}
                          onDuplicate={() => {
                            const original = page.sections[index];
                            const copy = { ...JSON.parse(JSON.stringify(original)), id: Math.random().toString(36).substring(2, 11), order: index + 1 };
                            const newSections = [...page.sections];
                            newSections.splice(index + 1, 0, copy);
                            setPage({ ...page, sections: newSections.map((s, i) => ({ ...s, order: i })) });
                            setExpandedSectionId(copy.id);
                          }}
                          onOpenMediaPicker={(callback) => setMediaPicker({ open: true, onSelect: callback })}
                          renderField={(field, value, onChange, onOpenMediaPicker) => renderField(field, value, onChange, onOpenMediaPicker)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                <div className="bg-white border border-[#ccd0d4] mt-8 p-4">
                  <h3 className="text-[14px] font-bold mb-3 border-b pb-2">Add Content Section</h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(SECTION_SCHEMAS).map(([type, schema]) => (
                      <button
                        key={type}
                        onClick={() => addSection(type)}
                        className="bg-[#f6f7f7] border border-[#ccd0d4] px-3 py-1.5 text-[13px] hover:bg-[#2271b1] hover:text-white transition-colors"
                      >
                        + {schema.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white border border-[#ccd0d4] shadow-sm">
                  <div className="px-4 py-2 border-b border-[#ccd0d4] bg-[#f6f7f7] font-bold text-[14px]">General SEO</div>
                  <div className="p-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold uppercase text-[#1d2327]">Meta Title</label>
                        <input
                          type="text"
                          value={page.seo?.title || ""}
                          onChange={(e) => setPage({ ...page, seo: { ...page.seo, title: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold uppercase text-[#1d2327]">Canonical URL</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={page.seo?.canonicalUrl || ""}
                            onChange={(e) => setPage({ ...page, seo: { ...page.seo, canonicalUrl: e.target.value } })}
                            className="flex-1 border border-[#8c8f94] px-2 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                          />
                          <button onClick={() => setPage({ ...page, seo: { ...page.seo, canonicalUrl: `https://pairo.com/${page.slug}` } })} className="px-2 bg-gray-50 border border-gray-300 text-[10px] hover:bg-white font-bold">AUTO</button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[12px] font-bold uppercase text-[#1d2327]">Meta Description</label>
                      <textarea
                        rows={3}
                        value={page.seo?.description || ""}
                        onChange={(e) => setPage({ ...page, seo: { ...page.seo, description: e.target.value } })}
                        className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] outline-none focus:border-[#2271b1] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#f0f0f1]">
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold uppercase text-[#1d2327]">Focus Keyword</label>
                        <input
                          type="text"
                          value={page.seo?.focusKeyword || ""}
                          onChange={(e) => setPage({ ...page, seo: { ...page.seo, focusKeyword: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[12px] font-bold uppercase text-[#1d2327]">Secondary Keywords</label>
                        <input
                          type="text"
                          value={page.seo?.secondaryKeywords || ""}
                          onChange={(e) => setPage({ ...page, seo: { ...page.seo, secondaryKeywords: e.target.value } })}
                          className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 pt-4 border-t border-[#f0f0f1]">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={page.seo?.noIndex} onChange={(e) => setPage({ ...page, seo: { ...page.seo, noIndex: e.target.checked } })} />
                          <span className="text-[13px] font-medium">No-Index</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={page.seo?.noFollow} onChange={(e) => setPage({ ...page, seo: { ...page.seo, noFollow: e.target.checked } })} />
                          <span className="text-[13px] font-medium">No-Follow</span>
                       </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-[#ccd0d4] shadow-sm">
                   <div className="px-4 py-2 border-b border-[#ccd0d4] bg-[#f6f7f7] font-bold text-[14px]">Social & Open Graph</div>
                   <div className="p-4 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase text-[#1d2327] border-b pb-1">Facebook (OG)</h4>
                            <div className="space-y-3">
                               <input type="text" placeholder="OG Title" value={page.seo?.ogTitle || ""} onChange={(e) => setPage({ ...page, seo: { ...page.seo, ogTitle: e.target.value } })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px]" />
                               <textarea placeholder="OG Description" value={page.seo?.ogDescription || ""} onChange={(e) => setPage({ ...page, seo: { ...page.seo, ogDescription: e.target.value } })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] resize-none" rows={2} />
                               <div onClick={() => setMediaPicker({ open: true, onSelect: (url) => setPage({ ...page, seo: { ...page.seo, ogImage: url } }) })} className="aspect-video bg-gray-50 border border-dashed border-[#ccd0d4] flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all overflow-hidden relative">
                                  {page.seo?.ogImage ? <img src={page.seo.ogImage} className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-[#2271b1]">SELECT OG IMAGE</span>}
                               </div>
                            </div>
                         </div>
                         <div className="space-y-4">
                            <h4 className="text-[11px] font-black uppercase text-[#1d2327] border-b pb-1">Twitter (X)</h4>
                            <div className="space-y-3">
                               <input type="text" placeholder="Twitter Title" value={page.seo?.twitterTitle || ""} onChange={(e) => setPage({ ...page, seo: { ...page.seo, twitterTitle: e.target.value } })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px]" />
                               <textarea placeholder="Twitter Description" value={page.seo?.twitterDescription || ""} onChange={(e) => setPage({ ...page, seo: { ...page.seo, twitterDescription: e.target.value } })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[13px] resize-none" rows={2} />
                               <div onClick={() => setMediaPicker({ open: true, onSelect: (url) => setPage({ ...page, seo: { ...page.seo, twitterImage: url } }) })} className="aspect-video bg-gray-50 border border-dashed border-[#ccd0d4] flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-all overflow-hidden relative">
                                  {page.seo?.twitterImage ? <img src={page.seo.twitterImage} className="w-full h-full object-cover" /> : <span className="text-[10px] font-bold text-[#2271b1]">SELECT TWITTER IMAGE</span>}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white border border-[#ccd0d4] shadow-sm">
                   <div className="px-4 py-2 border-b border-[#ccd0d4] bg-[#f6f7f7] font-bold text-[14px] flex items-center justify-between">
                      <span>Structured Data (JSON-LD)</span>
                      <button 
                        onClick={() => {
                          const schema = { "@context": "https://schema.org", "@type": "WebPage", "name": page.seo?.title || page.title, "description": page.seo?.description, "url": `https://pairo.com/${page.slug}` };
                          setPage({ ...page, seo: { ...page.seo, structuredData: JSON.stringify(schema, null, 2) } });
                        }}
                        className="text-[10px] font-bold text-[#2271b1] hover:underline"
                      >AUTO-GENERATE</button>
                   </div>
                   <div className="p-4">
                      <textarea rows={10} value={page.seo?.structuredData || ""} onChange={(e) => setPage({ ...page, seo: { ...page.seo, structuredData: e.target.value } })} className="w-full border border-[#8c8f94] p-3 text-[12px] font-mono bg-gray-50 outline-none focus:bg-white" />
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="w-full lg:w-[280px] shrink-0 space-y-4">
            <div className="bg-white border border-[#ccd0d4] shadow-sm">
              <div className="px-3 py-2 border-b border-[#ccd0d4] bg-[#f6f7f7] font-bold text-[14px]">Page Publishing</div>
              <div className="p-3 space-y-4">
                <div className="text-[13px] space-y-2">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#646970]" />
                    <span>Status: <select value={page.status} onChange={(e) => setPage({ ...page, status: e.target.value })} className="bg-transparent font-bold outline-none cursor-pointer text-[#2271b1] hover:underline decoration-dotted"><option value="Draft">Draft</option><option value="Published">Published</option></select></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#646970]" />
                    <div className="flex-1 truncate">Slug: <input type="text" value={page.slug} onChange={(e) => setPage({ ...page, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} className="inline-block w-24 border-b border-gray-200 outline-none focus:border-[#2271b1] bg-transparent" /></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-[#f0f0f1] flex items-center justify-between">
                  <button onClick={() => setPage({ ...page, status: 'Draft' })} className="text-[#d63638] text-[13px] hover:underline">Trash</button>
                  <button
                    onClick={savePage}
                    disabled={isSaving}
                    className="bg-[#2271b1] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold hover:bg-[#135e96] shadow-[0_1px_0_#135e96] disabled:opacity-50 min-w-[80px]"
                  >
                    {isSaving ? "Wait..." : "Update"}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#ccd0d4] shadow-sm">
               <div className="px-3 py-2 border-b border-[#ccd0d4] bg-[#f6f7f7] font-bold text-[14px]">Page Settings</div>
               <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between text-[12px]">
                     <span className="text-[#646970]">Created:</span>
                     <span className="font-medium">{new Date(page.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-[12px]">
                     <span className="text-[#646970]">Last Edit:</span>
                     <span className="font-medium">{new Date(page.updatedAt).toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {mediaPicker.open && (
        <MediaPickerModal
          onClose={() => setMediaPicker({ open: false, onSelect: null })}
          onSelect={(url) => {
            if (mediaPicker.onSelect) mediaPicker.onSelect(url);
            setMediaPicker({ open: false, onSelect: null });
          }}
          title="Select Section Image"
        />
      )}
    </div>
  );
}
