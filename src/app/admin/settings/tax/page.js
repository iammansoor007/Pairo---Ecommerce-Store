"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Save, ReceiptText, Plus, X, AlertCircle, Loader2,
  Info, Trash2, Globe, Check
} from "lucide-react";
import AdminPageLayout from "@/components/admin/AdminPageLayout";

// ─── Shared WordPress input styles ─────────────────────────────────────────────
const inp  = "w-full border border-[#8c8f94] rounded-[3px] px-3 py-[6px] text-[13px] outline-none focus:border-[#2271b1] focus:shadow-[0_0_0_1px_#2271b1] bg-white transition-all shadow-sm";
const lbl  = "block text-[13px] font-semibold text-[#1d2327] mb-1.5";
const hint = "text-[12px] text-[#646970] mt-1.5 italic leading-relaxed";

const defaultSettings = {
  enabled: false,
  taxLabel: "Tax",
  defaultTaxRate: 0,
  calculationMethod: "exclusive",
  taxRoundingMode: "round",
  applyToShipping: false,
  taxRules: [],
  zonalRules: [],
};

// ─── WordPress Navigation Tabs ──────────────────────────────────────────────────
function NavTabs({ activeTab }) {
  return (
    <div className="flex border-b border-[#c3c4c7] mb-6 mt-1 gap-1">
      <Link
        href="/admin/settings/shipping"
        className={`px-4 py-2 text-[14px] font-semibold border-t-2 border-x border-b transition-all ${
          activeTab === "shipping"
            ? "bg-[#f0f2f1] border-t-[#2271b1] border-x-[#c3c4c7] border-b-transparent translate-y-[1px] text-[#1d2327]"
            : "bg-white border-t-transparent border-x-transparent border-b-[#c3c4c7] text-[#2271b1] hover:text-[#135e96] hover:bg-[#fafafa]"
        }`}
      >
        Shipping
      </Link>
      <Link
        href="/admin/settings/tax"
        className={`px-4 py-2 text-[14px] font-semibold border-t-2 border-x border-b transition-all ${
          activeTab === "tax"
            ? "bg-[#f0f2f1] border-t-[#2271b1] border-x-[#c3c4c7] border-b-transparent translate-y-[1px] text-[#1d2327]"
            : "bg-white border-t-transparent border-x-transparent border-b-[#c3c4c7] text-[#2271b1] hover:text-[#135e96] hover:bg-[#fafafa]"
        }`}
      >
        Tax Settings
      </Link>
    </div>
  );
}

// ─── WordPress Postbox (Metabox) ────────────────────────────────────────────────
function Postbox({ title, subtitle, badge, children, dim, action }) {
  return (
    <div className={`bg-white border border-[#c3c4c7] shadow-sm mb-5 rounded-none transition-opacity ${dim ? "opacity-55 pointer-events-none select-none" : ""}`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#c3c4c7] bg-white">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-bold text-[#1d2327] m-0">{title}</h2>
          {badge}
        </div>
        {action}
      </div>
      {subtitle && <div className="px-4 py-2 bg-[#f6f7f7] border-b border-[#c3c4c7] text-[12px] text-[#646970] italic">{subtitle}</div>}
      <div className="p-5">{children}</div>
    </div>
  );
}

// ─── WordPress Settings Row (Table Format) ──────────────────────────────────────
function SettingsRow({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-x-6 gap-y-2 py-4 border-b border-[#f0f0f1] last:border-b-0 items-start text-[13px]">
      <div className="font-semibold text-[#1d2327] pt-1.5">
        {label}
      </div>
      <div>
        {children}
        {hint && <p className="text-[12px] text-[#646970] mt-1.5 italic font-normal leading-relaxed">{hint}</p>}
      </div>
    </div>
  );
}

// ─── WordPress Style Toggle (Check Switch) ──────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button type="button" onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${on ? "bg-[#2271b1]" : "bg-[#c3c4c7]"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

// ─── Priority Badge ────────────────────────────────────────────────────────────
function PriorityBadge({ level }) {
  const styles = {
    highest: "border border-[#b5a1e2] bg-[#f7f5fc] text-[#6846b0]",
    high:    "border border-[#72aee6] bg-[#f0f6fb] text-[#2271b1]",
    base:    "border border-[#c3c4c7] bg-[#f6f7f7] text-[#50575e]",
  };
  const labels = { highest: "Zonal Rules (Highest)", high: "Region Rules (Medium)", base: "Base Rate (Fallback)" };
  return <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-[3px] ${styles[level]}`}>{labels[level]}</span>;
}

export default function TaxSettingsPage() {
  const [settings, setSettings]   = useState(defaultSettings);
  const [zones, setZones]         = useState([]);        // shipping zones list
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [taxRes, zoneRes] = await Promise.all([
          fetch("/api/admin/tax"),
          fetch("/api/admin/shipping/zones"),
        ]);
        const taxData  = await taxRes.json();
        const zoneData = await zoneRes.json();
        if (taxData.success && taxData.settings)   setSettings({ ...defaultSettings, ...taxData.settings });
        else if (!taxData.success) toast.error(taxData.error || "Failed to load tax settings.");
        if (zoneData.success) setZones(zoneData.zones ?? []);
      } catch { toast.error("Failed to load settings."); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (k, v) => setSettings(p => ({ ...p, [k]: v }));

  // ── Region rules ────────────────────────────────────────────────────────────
  const addRegionRule  = () => set("taxRules", [...(settings.taxRules ?? []), { name: "", rateType: "country", region: "", rate: 0, priority: 0 }]);
  const updRegionRule  = (i, u) => set("taxRules", settings.taxRules.map((r, idx) => idx === i ? { ...r, ...u } : r));
  const delRegionRule  = (i) => set("taxRules", settings.taxRules.filter((_, idx) => idx !== i));

  // ── Zonal rules ─────────────────────────────────────────────────────────────
  const configuredZoneIds = new Set((settings.zonalRules ?? []).map(r => r.zoneId));

  const addZonalRule = (zone) => {
    if (configuredZoneIds.has(zone._id.toString())) return;
    set("zonalRules", [...(settings.zonalRules ?? []), { zoneId: zone._id.toString(), zoneName: zone.name, rate: 0, enabled: true }]);
  };
  const updZonalRule = (i, u) => set("zonalRules", settings.zonalRules.map((r, idx) => idx === i ? { ...r, ...u } : r));
  const delZonalRule = (i)    => set("zonalRules", settings.zonalRules.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res  = await fetch("/api/admin/tax", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setSettings({ ...defaultSettings, ...data.settings });
      toast.success("Tax settings saved.");
    } catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <AdminPageLayout title="Tax" breadcrumbs={[{ label: "Settings" }, { label: "Tax" }]}>
      <div className="flex items-center justify-center py-20 gap-2 text-[13px] text-[#646970]">
        <Loader2 className="w-4 h-4 animate-spin" />Loading tax settings…
      </div>
    </AdminPageLayout>
  );

  const availableZones = zones.filter(z => !configuredZoneIds.has(z._id.toString()));

  return (
    <AdminPageLayout
      title="Tax settings"
      breadcrumbs={[{ label: "Settings" }, { label: "Tax" }]}
    >
      <NavTabs activeTab="tax" />

      {/* WordPress Style Notice Callout */}
      <div className="bg-white border-l-4 border-[#72aee6] shadow-sm p-4 mb-6 text-[13.5px] text-[#1d2327]">
        <p className="font-semibold mb-1">Taxation Priority & Matching System</p>
        <p className="text-[#646970] leading-relaxed">
          The taxation module evaluates customer rates using the following priority order:
          <span className="font-semibold text-[#1d2327]"> Zonal Tax Rules</span> (tied directly to matched Shipping Zones) &rarr;
          <span className="font-semibold text-[#1d2327]"> Region Rules</span> (country/state overrides) &rarr;
          <span className="font-semibold text-[#1d2327]"> Default Rate</span> (fallback for all other locations).
        </p>
      </div>

      <div className="space-y-6 pb-28">

        {/* ── 1. Enable / Disable Section ─────────────────────── */}
        <div className="bg-white border border-[#c3c4c7] shadow-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[3px] bg-[#f0f6fb] flex items-center justify-center border border-[#c3c4c7]">
              <ReceiptText className="w-4 h-4 text-[#2271b1]" />
            </div>
            <div>
              <p className="text-[13.5px] font-bold text-[#1d2327]">Enable Taxes</p>
              <p className="text-[11.5px] text-[#646970]">Toggle tax calculations on the storefront cart and checkout pages.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[12px] font-bold ${settings.enabled ? "text-green-600" : "text-[#646970]"}`}>
              {settings.enabled ? "ACTIVE" : "INACTIVE"}
            </span>
            <Toggle on={settings.enabled} onChange={() => set("enabled", !settings.enabled)} />
          </div>
        </div>

        {/* ── 2. General Settings Postbox ────────────────────── */}
        <Postbox
          title="Tax Options"
          subtitle="Define global fallbacks and tax label configuration"
          badge={<PriorityBadge level="base" />}
          dim={!settings.enabled}
        >
          <div className="divide-y divide-[#f0f0f1]">
            <SettingsRow label="Tax Label" hint="This is how tax will be displayed to customers on invoices, cart totals, and checkout pages (e.g., VAT, GST, Sales Tax).">
              <input
                type="text"
                className={`${inp} max-w-[350px]`}
                value={settings.taxLabel}
                onChange={e => set("taxLabel", e.target.value)}
                placeholder="Tax"
              />
            </SettingsRow>

            <SettingsRow label="Default Tax Rate (%)" hint="Applied globally to all sales unless a specific zonal or regional tax rule matches.">
              <div className="relative inline-block w-[130px]">
                <input
                  type="number"
                  min="0" max="100" step="0.01"
                  className={`${inp} pr-8 font-semibold text-center`}
                  value={settings.defaultTaxRate}
                  onChange={e => set("defaultTaxRate", Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-[#646970]">%</span>
              </div>
            </SettingsRow>

            <SettingsRow label="Calculation Method" hint="Inclusive means prices already include tax. Exclusive adds tax on top of your prices.">
              <select
                className={`${inp} max-w-[350px] cursor-pointer`}
                value={settings.calculationMethod}
                onChange={e => set("calculationMethod", e.target.value)}
              >
                <option value="exclusive">Exclusive — tax added on top of product prices</option>
                <option value="inclusive">Inclusive — tax is included in product prices</option>
              </select>
            </SettingsRow>

            <SettingsRow label="Rounding Mode" hint="Determines how fractional cents are rounded in tax calculations.">
              <select
                className={`${inp} max-w-[350px] cursor-pointer`}
                value={settings.taxRoundingMode}
                onChange={e => set("taxRoundingMode", e.target.value)}
              >
                <option value="round">Round to nearest (standard)</option>
                <option value="floor">Floor (always round down)</option>
                <option value="ceil">Ceil (always round up)</option>
              </select>
            </SettingsRow>

            <SettingsRow label="Shipping Tax" hint="Check this to calculate and charge tax on shipping fees in addition to products.">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="applyToShipping"
                  checked={settings.applyToShipping}
                  onChange={e => set("applyToShipping", e.target.checked)}
                  className="w-4 h-4 accent-[#2271b1] border-[#c3c4c7] rounded-[3px] mr-2"
                />
                <span className="text-[13px] text-[#2c3338] font-medium">Apply tax rate to shipping fees</span>
              </label>
            </SettingsRow>
          </div>
        </Postbox>

        {/* ── 3. Zonal Tax Rates Postbox ─────────────────────── */}
        <Postbox
          title="Zonal Tax Rates"
          subtitle="Assign specific tax rates to your Shipping Zones. Matches priority and zone logic."
          badge={<PriorityBadge level="highest" />}
          dim={!settings.enabled}
        >
          {availableZones.length > 0 && (
            <div className="mb-6 p-4 bg-[#f6f7f7] border border-[#c3c4c7]">
              <p className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wider mb-2">Available Zones (Click to configure tax rate)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableZones.map(zone => (
                  <button
                    key={zone._id}
                    type="button"
                    onClick={() => addZonalRule(zone)}
                    className="flex items-center justify-between p-2.5 bg-white border border-[#c3c4c7] hover:border-[#2271b1] text-left transition-all group rounded-[3px]"
                  >
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold text-[#1d2327] truncate">{zone.name}</p>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-[#2271b1] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {(settings.zonalRules ?? []).length === 0 ? (
            <div className="border border-dashed border-[#c3c4c7] p-8 text-center bg-[#fcfcfc]">
              <Globe className="w-8 h-8 text-[#ccd0d4] mx-auto mb-2" />
              <p className="text-[13px] font-bold text-[#1d2327] mb-1">No zonal tax rates assigned</p>
              <p className="text-[11.5px] text-[#646970] max-w-md mx-auto">
                {zones.length === 0
                  ? "Please create shipping zones first in Shipping settings, then configure their tax rates here."
                  : "Tax rules can be tied directly to shipping zones. Select an available zone above."}
              </p>
            </div>
          ) : (
            <table className="wp-list-table widefat fixed striped posts w-full border border-[#c3c4c7] border-collapse bg-white text-left text-[13px]">
              <thead>
                <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[#2c3338]">
                  <th className="px-4 py-2 font-bold w-[45%]">Shipping Zone</th>
                  <th className="px-4 py-2 font-bold w-[25%]">Tax Rate (%)</th>
                  <th className="px-4 py-2 font-bold w-[20%]">Status</th>
                  <th className="px-4 py-2 font-bold w-[10%] text-center"></th>
                </tr>
              </thead>
              <tbody>
                {settings.zonalRules.map((rule, i) => (
                  <tr key={i} className="hover:bg-[#f0f6fb] border-b border-[#f0f0f1] last:border-0 group">
                    <td className="px-4 py-3">
                      <p className="font-bold text-[#1d2327]">{rule.zoneName}</p>
                      <p className="text-[11px] text-[#646970]">Tied to zone: {rule.zoneName}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative inline-block w-[110px]">
                        <input
                          type="number" min="0" max="100" step="0.01"
                          className={`${inp} pr-6 text-center font-bold`}
                          value={rule.rate}
                          onChange={e => updZonalRule(i, { rate: Number(e.target.value) })}
                          placeholder="0"
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#646970]">%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Toggle on={rule.enabled} onChange={() => updZonalRule(i, { enabled: !rule.enabled })} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => delZonalRule(i)}
                        className="text-[#b32d2e] hover:text-[#d63638] text-[12px] font-semibold hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Postbox>

        {/* ── 4. Region Rules Postbox ────────────────────────── */}
        <Postbox
          title="Region-based Tax Rates"
          subtitle="Add tax rates for specific countries or provinces. Matches customer billing/shipping details."
          badge={<PriorityBadge level="high" />}
          dim={!settings.enabled}
          action={
            <button
              type="button"
              onClick={addRegionRule}
              className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fb] px-3 py-1 rounded-[3px] text-[12px] font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />Add Tax Rate
            </button>
          }
        >
          {(settings.taxRules ?? []).length === 0 ? (
            <div className="border border-dashed border-[#c3c4c7] p-8 text-center bg-[#fcfcfc]">
              <Info className="w-8 h-8 text-[#ccd0d4] mx-auto mb-2" />
              <p className="text-[13px] font-bold text-[#1d2327] mb-1">No region-specific rules configured</p>
              <p className="text-[11.5px] text-[#646970]">Only the default fallback tax rate will be charged at checkout.</p>
            </div>
          ) : (
            <table className="wp-list-table widefat fixed striped posts w-full border border-[#c3c4c7] border-collapse bg-white text-left text-[13px]">
              <thead>
                <tr className="bg-[#f6f7f7] border-b border-[#c3c4c7] text-[#2c3338]">
                  <th className="px-3 py-2 font-bold w-[25%]">Rule Name</th>
                  <th className="px-3 py-2 font-bold w-[20%]">Rule Type</th>
                  <th className="px-3 py-2 font-bold w-[25%]">Region Value</th>
                  <th className="px-3 py-2 font-bold w-[15%]">Rate (%)</th>
                  <th className="px-3 py-2 font-bold w-[10%]">Priority</th>
                  <th className="px-3 py-2 font-bold w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {settings.taxRules.map((rule, i) => (
                  <tr key={i} className="hover:bg-[#f0f6fb] border-b border-[#f0f0f1] last:border-0">
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        className={inp}
                        value={rule.name}
                        onChange={e => updRegionRule(i, { name: e.target.value })}
                        placeholder="e.g. Sales Tax"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        className={`${inp} cursor-pointer`}
                        value={rule.rateType}
                        onChange={e => updRegionRule(i, { rateType: e.target.value })}
                      >
                        <option value="country">Country</option>
                        <option value="state">State / Province</option>
                        <option value="city">City</option>
                      </select>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="text"
                        className={inp}
                        value={rule.region}
                        onChange={e => updRegionRule(i, { region: e.target.value })}
                        placeholder="e.g. PK or Punjab"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="relative">
                        <input
                          type="number" min="0" max="100" step="0.01"
                          className={`${inp} pr-6 text-center`}
                          value={rule.rate}
                          onChange={e => updRegionRule(i, { rate: Number(e.target.value) })}
                          placeholder="0"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-[#646970]">%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <input
                        type="number" min="0"
                        className={`${inp} text-center`}
                        value={rule.priority}
                        onChange={e => updRegionRule(i, { priority: Number(e.target.value) })}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => delRegionRule(i)}
                        className="text-[#b32d2e] hover:text-[#d63638] text-[12px] font-semibold hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Postbox>

      </div>

      <div className="fixed bottom-0 left-[160px] right-0 z-40 bg-white border-t border-[#c3c4c7] shadow-lg">
        <div className="w-full flex items-center justify-between px-6 py-3.5">
          <p className="text-[12px] text-[#646970] italic">Make sure to save changes for settings to take effect instantly.</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#2271b1] border border-[#2271b1] text-white text-[13px] font-bold rounded-[3px] hover:bg-[#135e96] hover:border-[#135e96] shadow-sm disabled:opacity-60 transition-colors cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving Changes…" : "Save Changes"}
          </button>
        </div>
      </div>
    </AdminPageLayout>
  );
}
