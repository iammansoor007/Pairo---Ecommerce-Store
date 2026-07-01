"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Package, Palette, Layers, Settings, Feather, Image, FileText, Check, MessageSquare, AlertCircle, Ruler } from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import Link from "next/link";

const STATUS_OPTIONS = ["New", "Reviewed", "In Progress", "Completed", "Rejected"];
const STATUS_STYLES = {
  New:            "bg-blue-50   text-blue-700   border-blue-200",
  Reviewed:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  "In Progress":  "bg-purple-50 text-purple-700 border-purple-200",
  Completed:      "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected:       "bg-red-50    text-red-600    border-red-200"
};

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-[4px] p-5 space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
        <div className="p-1.5 bg-black/5 rounded-[3px]">
          <Icon className="w-3.5 h-3.5 text-black" />
        </div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function DataRow({ label, value }) {
  if (!value || value === "None") return null;
  return (
    <div className="flex gap-3">
      <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide w-32 shrink-0">{label}</span>
      <span className="text-[13px] text-black">{value}</span>
    </div>
  );
}

export default function CustomizationDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/customization-requests?id=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.requests?.[0]) { setRequest(d.requests[0]); setNewStatus(d.requests[0].status); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!newStatus && !note) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customization-requests?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, adminNote: note || undefined })
      });
      const data = await res.json();
      if (data.success) {
        setRequest(data.request);
        setNote("");
        setNewStatus(data.request.status);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminPageLayout title="Loading..."><div className="py-24 text-center text-neutral-400">Loading...</div></AdminPageLayout>;
  if (!request) return <AdminPageLayout title="Not Found"><div className="py-24 text-center text-neutral-400">Request not found.</div></AdminPageLayout>;

  const c = request.customizations || {};
  const artworkSlots = [
    { key: "leftChest",  label: "Left Chest" },
    { key: "rightChest", label: "Right Chest" },
    { key: "leftArm",    label: "Left Arm" },
    { key: "rightArm",   label: "Right Arm" },
    { key: "back",       label: "Back" },
    { key: "other",      label: "Other" }
  ];

  return (
    <AdminPageLayout
      title={`Request ${request.requestNumber}`}
      subtitle={`Submitted ${new Date(request.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
    >
      {/* Back + Status badge */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/admin/customizations">
          <button className="flex items-center gap-2 text-[12px] font-semibold text-neutral-500 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            All Requests
          </button>
        </Link>
        <span className={`inline-block px-3 py-1 rounded-[2px] text-[11px] font-bold uppercase tracking-wide border ${STATUS_STYLES[request.status]}`}>
          {request.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer */}
          <Section icon={User} title="Customer Information">
            <DataRow label="Full Name" value={request.customer?.name} />
            <DataRow label="Email"     value={request.customer?.email} />
            <DataRow label="Phone"     value={request.customer?.phone} />
          </Section>

          {/* Product */}
          <Section icon={Package} title="Product">
            {request.product && (
              <div className="flex items-center gap-3">
                {request.product.image && <img src={request.product.image} alt={request.product.name} className="w-14 h-14 object-cover rounded-[3px] border border-neutral-100" />}
                <div>
                  <p className="text-[14px] font-semibold text-black">{request.product.name}</p>
                  {request.product.price && <p className="text-[12px] text-neutral-400">Base price: ${request.product.price}</p>}
                </div>
              </div>
            )}
          </Section>

          {/* Leather Color */}
          {c.leatherColor && c.leatherColor !== "None" && (
            <Section icon={Palette} title="Leather Color">
              <DataRow label="Color"  value={c.leatherColor} />
              <DataRow label="Note"   value={c.leatherColorNote} />
            </Section>
          )}

          {/* Leather Type */}
          {c.leatherType && c.leatherType !== "None" && (
            <Section icon={Layers} title="Leather Type">
              <DataRow label="Type"  value={c.leatherType} />
              <DataRow label="Note"  value={c.leatherTypeNote} />
            </Section>
          )}

          {/* Inner Lining */}
          {c.innerLining && c.innerLining !== "None" && (
            <Section icon={Layers} title="Inner Lining">
              <DataRow label="Lining" value={c.innerLining} />
              <DataRow label="Note"   value={c.innerLiningNote} />
            </Section>
          )}

          {/* Hardware */}
          {c.hardwareColor && c.hardwareColor !== "None" && (
            <Section icon={Settings} title="Hardware Color">
              <DataRow label="Color" value={c.hardwareColor} />
              <DataRow label="Note"  value={c.hardwareColorNote} />
            </Section>
          )}

          {/* Fur */}
          {c.fur?.type && c.fur.type !== "None" && (
            <Section icon={Feather} title="Fur Customization">
              <DataRow label="Fur Type"   value={c.fur.type} />
              <DataRow label="Color"      value={c.fur.color} />
              <DataRow label="Placement"  value={c.fur.placement?.join(", ")} />
              <DataRow label="Density"    value={c.fur.density} />
              <DataRow label="Removable"  value={c.fur.removable === true ? "Yes" : c.fur.removable === false ? "No" : ""} />
            </Section>
          )}

          {/* Artwork */}
          {artworkSlots.some(s => c.artwork?.[s.key]) && (
            <Section icon={Image} title="Artwork / Logo Files">
              <div className="space-y-3">
                {artworkSlots.map(slot => {
                  const art = c.artwork?.[slot.key];
                  if (!art?.url) return null;
                  return (
                    <div key={slot.key} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-[3px] border border-neutral-100">
                      <div className="text-[11px] font-bold uppercase tracking-wide text-neutral-400 w-24 shrink-0">{slot.label}</div>
                      {art.url.match(/\.(png|jpg|jpeg|svg)$/i) ? (
                        <img src={art.url} alt={art.name} className="h-14 w-auto rounded-[2px] border border-neutral-200 object-contain bg-white" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-neutral-400" />
                          <a href={art.url} target="_blank" rel="noreferrer" className="text-[12px] text-blue-600 hover:underline">{art.name || "Download file"}</a>
                        </div>
                      )}
                      {slot.key === "other" && art.note && <p className="text-[11px] text-neutral-500 italic ml-2">{art.note}</p>}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Notes */}
          {request.additionalNotes && (
            <Section icon={FileText} title="Additional Notes">
              <p className="text-[13px] text-black leading-relaxed">{request.additionalNotes}</p>
            </Section>
          )}

          {/* Admin Notes history */}
          {request.adminNotes?.length > 0 && (
            <Section icon={MessageSquare} title="Admin Notes">
              <div className="space-y-3">
                {request.adminNotes.map((note, i) => (
                  <div key={i} className="p-3 bg-yellow-50 border border-yellow-100 rounded-[3px]">
                    <p className="text-[12px] text-black">{note.content}</p>
                    <p className="text-[10px] text-neutral-400 mt-1">{new Date(note.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-5">
          <div className="bg-white border border-neutral-200 rounded-[4px] p-5 space-y-4 sticky top-6">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.15em] text-black">Update Request</h3>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Status</label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full border border-neutral-200 rounded-[3px] px-3 py-2 text-[13px] text-black outline-none focus:border-black transition-all"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2">Add Admin Note</label>
              <textarea
                rows={4}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Add internal notes about this request..."
                className="w-full border border-neutral-200 rounded-[3px] px-3 py-2 text-[13px] text-black outline-none focus:border-black transition-all resize-none"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-10 bg-black text-white rounded-[3px] text-[11px] font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? "Saving..." : <><Check className="w-3.5 h-3.5" /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
