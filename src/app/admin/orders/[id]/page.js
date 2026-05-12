"use client";

import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  User, 
  MapPin, 
  CreditCard, 
  Clock,
  Package,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import InvoiceTemplate from "@/components/admin/InvoiceTemplate";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) setOrder(data.order);
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  const addAdminNote = async () => {
    if (!newNote.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timelineMessage: newNote }),
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.order);
        setNewNote("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center text-[13px] text-gray-500 italic">
      Loading order details...
    </div>
  );
  if (!order) return (
    <div className="p-20 text-center text-[13px] text-red-500 font-bold">
      Order not found.
    </div>
  );

  return (
    <div className="bg-[#f0f0f1] min-h-screen p-4 md:p-8 font-sans text-[#2c3338]">
      <InvoiceTemplate order={order} />

      <div className="max-w-[1200px] mx-auto space-y-6 print:hidden">

        {/* WP Header */}
        <div className="flex items-center justify-between border-b border-[#ccd0d4] pb-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/orders" className="text-[#2271b1] hover:text-[#135e96] flex items-center gap-1 text-[13px]">
              <ChevronLeft className="w-4 h-4" /> Back to orders
            </Link>
            <h1 className="text-[23px] font-normal">
              Edit Order <span className="text-[#646970] font-light">#{order.orderNumber}</span>
            </h1>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-white border border-[#ccd0d4] text-[#2c3338] px-3 py-1.5 rounded text-[13px] font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            Download Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Order Data Box */}
            <div className="bg-white border border-[#ccd0d4] shadow-sm">
              <div className="px-4 py-3 border-b border-[#ccd0d4] bg-[#f6f7f7] flex items-center justify-between">
                <h2 className="text-[14px] font-bold">Order Details</h2>
                <span className="text-[11px] text-[#646970]">
                  {order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* Customer */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-bold flex items-center gap-2">
                    <User className="w-4 h-4 text-[#8c8f94]" /> General
                  </h3>
                  <div className="text-[13px] space-y-1">
                    <p className="font-bold">{order.shippingAddress?.fullName || "—"}</p>
                    <p className="text-[#2271b1]">{order.customer?.email || "—"}</p>
                    <p className="text-[#646970] pt-2 italic">
                      Purchased as {order.customer?.isGuest ? "Guest" : "Member"}
                    </p>
                  </div>
                </div>

                {/* Shipping */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#8c8f94]" /> Shipping
                  </h3>
                  <div className="text-[13px] space-y-1 leading-relaxed">
                    <p>{order.shippingAddress?.street || "—"}</p>
                    <p>
                      {order.shippingAddress?.city || "—"},{" "}
                      {order.shippingAddress?.zip || "—"}
                    </p>
                    <p>{order.shippingAddress?.country || "—"}</p>
                    <p className="pt-2 text-[#2271b1] font-medium">
                      {order.shippingAddress?.phone || "No phone provided"}
                    </p>
                  </div>
                </div>

                {/* Payment */}
                <div className="space-y-3">
                  <h3 className="text-[14px] font-bold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#8c8f94]" /> Payment
                  </h3>
                  <div className="text-[13px] space-y-1">
                    <p className="font-bold text-green-700">
                      {order.payment?.status || "Pending"}
                    </p>
                    <p className="text-[#646970]">
                      Method: {order.payment?.method || "Cash on Delivery"}
                    </p>
                    <p className="text-[11px] text-[#8c8f94] font-mono break-all pt-2">
                      ID: {order._id}
                    </p>
                  </div>
                </div>

              </div>

              {/* Customer Note */}
              {order.customerNote && (
                <div className="mx-6 mb-6 p-4 bg-[#fcf3d7] border border-[#ffeeba] text-[13px] text-[#856404] italic">
                  <strong>Customer Note:</strong> &ldquo;{order.customerNote}&rdquo;
                </div>
              )}
            </div>

            {/* Order Items Box */}
            <div className="bg-white border border-[#ccd0d4] shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-[#ccd0d4] bg-[#f6f7f7]">
                <h2 className="text-[14px] font-bold">Items to Fulfill</h2>
              </div>
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-[#fcfcfc] border-b border-[#ccd0d4]">
                    <th className="px-6 py-3 font-bold text-[#646970]">Product</th>
                    <th className="px-6 py-3 font-bold text-[#646970]">Cost</th>
                    <th className="px-6 py-3 font-bold text-[#646970]">Qty</th>
                    <th className="px-6 py-3 font-bold text-[#646970] text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0f1]">
                  {(order.items || []).map((item, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 flex gap-4 items-start">
                        <div className="w-12 h-14 bg-gray-50 border border-[#ccd0d4] rounded overflow-hidden shrink-0">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <p className="text-[#2271b1] font-bold">{item.name}</p>
                          <div className="flex flex-col gap-1">
                            {item.selectedVariant?.options &&
                              Object.entries(item.selectedVariant.options).map(([key, val]) => (
                                <p key={key} className="text-[11px] text-[#646970]">
                                  <span className="font-bold text-[#2c3338]">{key}:</span> {val}
                                </p>
                              ))}
                            <p className="text-[11px] text-gray-400 font-mono">
                              SKU: {item.sku || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        ${(item.priceAtPurchase || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">× {item.quantity || 1}</td>
                      <td className="px-6 py-4 text-right font-bold">
                        ${((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Financial Summary */}
              <div className="p-6 bg-gray-50/50 border-t border-[#ccd0d4] flex flex-col items-end space-y-2">
                <div className="flex justify-between w-48 text-[13px]">
                  <span className="text-[#646970]">Subtotal:</span>
                  <span className="font-bold">
                    ${(order.financials?.subtotal || 0).toLocaleString()}
                  </span>
                </div>
                {order.financials?.discountTotal > 0 && (
                  <div className="flex justify-between w-48 text-[13px]">
                    <span className="text-[#646970]">Discount:</span>
                    <span className="text-green-700 font-medium">
                      -${(order.financials.discountTotal).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between w-48 text-[13px]">
                  <span className="text-[#646970]">Shipping:</span>
                  <span className="text-green-700 font-medium">Free</span>
                </div>
                <div className="flex justify-between w-48 text-[16px] font-bold border-t border-[#ccd0d4] pt-2 mt-2">
                  <span>Total:</span>
                  <span>${(order.financials?.total || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-6">

            {/* Status Box */}
            <div className="bg-white border border-[#ccd0d4] shadow-sm">
              <div className="px-4 py-3 border-b border-[#ccd0d4] bg-[#f6f7f7]">
                <h2 className="text-[14px] font-bold">Order Status</h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <label className="text-[12px] text-[#646970]">Status</label>
                  <select
                    className="w-full border border-[#8c8f94] rounded px-2 py-1.5 text-[13px] outline-none bg-white"
                    value={order.status || "Pending"}
                    onChange={(e) => updateStatus(e.target.value)}
                    disabled={updating}
                  >
                    {[
                      "Pending",
                      "Confirmed",
                      "Processing",
                      "Packed",
                      "Shipped",
                      "Out for Delivery",
                      "Delivered",
                      "Cancelled",
                      "Refunded",
                    ].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#646970]">
                  <span>
                    Created:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                  <button
                    onClick={() => updateStatus(order.status)}
                    className="bg-[#2271b1] text-white px-4 py-1.5 rounded font-bold hover:bg-[#135e96] transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>

            {/* Order Notes / Timeline */}
            <div className="bg-white border border-[#ccd0d4] shadow-sm">
              <div className="px-4 py-3 border-b border-[#ccd0d4] bg-[#f6f7f7]">
                <h2 className="text-[14px] font-bold">Order Notes</h2>
              </div>
              <div className="p-4 space-y-6 max-h-[400px] overflow-y-auto scrollbar-hide">
                {(order.timeline || []).slice().reverse().map((event, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded text-[12px] leading-relaxed ${
                      event.source === "Admin"
                        ? "bg-[#d1ecf1] border-l-4 border-[#0c5460]"
                        : "bg-gray-50 border-l-4 border-[#8c8f94]"
                    }`}
                  >
                    <p className="font-bold mb-1">{event.status}</p>
                    <p className="text-[#2c3338] mb-2">{event.message}</p>
                    <p className="text-[10px] text-[#646970] italic">
                      {event.timestamp
                        ? new Date(event.timestamp).toLocaleString()
                        : "N/A"}{" "}
                      by {event.source}
                    </p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-[#ccd0d4] bg-[#fcfcfc]">
                <textarea
                  placeholder="Add an internal note..."
                  className="w-full border border-[#ccd0d4] rounded p-2 text-[12px] outline-none focus:border-[#2271b1] min-h-[80px]"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  onClick={addAdminNote}
                  disabled={updating || !newNote.trim()}
                  className="mt-2 w-full bg-white border border-[#ccd0d4] text-[#2c3338] py-1.5 rounded text-[12px] font-semibold hover:bg-gray-50 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
