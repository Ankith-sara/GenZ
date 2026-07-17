"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Building2, Users, ShoppingBag, Mail, MessageSquare, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  deleteWaitlistEntry, deleteContactMessage, deleteProduct, toggleProductPublish 
} from "./actions";

interface ManufacturerProfile {
  id: string;
  business_name: string;
  gst_number: string;
  established_year: number | null;
  description: string | null;
  status: "not_submitted" | "pending" | "verified" | "rejected" | null;
  city: string | null;
  state: string | null;
}

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  city: string | null;
  role: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price_inr: number | null;
  status: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  status: string;
  product_id: string;
  created_at: string;
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  reason: string | null;
  message: string;
  created_at: string;
}

interface AdminTabsProps {
  initialData: {
    pendingManufacturers: ManufacturerProfile[];
    verifiedManufacturers: ManufacturerProfile[];
    waitlist: WaitlistEntry[];
    products: Product[];
    inquiries: Inquiry[];
    contactMessages: ContactMessage[];
  };
}

export function AdminDashboardTabs({ initialData }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<"verifications" | "waitlist" | "products" | "inquiries" | "contact">("verifications");

  const [waitlist, setWaitlist] = useState(initialData.waitlist);
  const [products, setProducts] = useState(initialData.products);
  const [contactMessages, setContactMessages] = useState(initialData.contactMessages);

  const handleDeleteWaitlist = async (id: string) => {
    if (confirm("Are you sure you want to remove this waitlist entry?")) {
      setWaitlist(waitlist.filter(w => w.id !== id));
      await deleteWaitlistEntry(id);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (confirm("Are you sure you want to delete this contact message?")) {
      setContactMessages(contactMessages.filter(c => c.id !== id));
      await deleteContactMessage(id);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product from the platform?")) {
      setProducts(products.filter(p => p.id !== id));
      await deleteProduct(id);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    setProducts(products.map(p => p.id === id ? { ...p, status: nextStatus } : p));
    await toggleProductPublish(id, currentStatus);
  };

  return (
    <div className="mt-8">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-px mb-6">
        {[
          { id: "verifications", label: "Verifications", icon: Building2, count: initialData.pendingManufacturers.length },
          { id: "waitlist", label: "Waitlist", icon: Users, count: waitlist.length },
          { id: "products", label: "Products", icon: ShoppingBag, count: products.length },
          { id: "inquiries", label: "Product Inquiries", icon: MessageSquare, count: initialData.inquiries.length },
          { id: "contact", label: "Contact Form", icon: Mail, count: contactMessages.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "verifications" | "waitlist" | "products" | "inquiries" | "contact")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === tab.id
                ? "border-forest-green text-black"
                : "border-transparent text-smoke hover:text-black hover:border-forest-green/50"
            }`}
          >
            <tab.icon className="h-4.5 w-4.5" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-forest-green text-black" : "bg-gray-100 text-smoke"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="bg-paper-white border rounded-[4px]  overflow-hidden min-h-[300px]">
        {/* VERIFICATIONS TAB */}
        {activeTab === "verifications" && (
          <div className="p-6">
            <h3 className="font-serif text-lg font-semibold text-black mb-4">Pending Verification Queue</h3>
            {initialData.pendingManufacturers.length === 0 ? (
              <p className="text-sm text-smoke py-6 text-center">No pending manufacturer verifications.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-smoke bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 font-semibold">Company Name</th>
                      <th className="p-4 font-semibold">GSTIN</th>
                      <th className="p-4 font-semibold">Established</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {initialData.pendingManufacturers.map((m) => {
                      let meta: Record<string, string | number | boolean | null | undefined> = {};
                      try { if (m.description && m.description.startsWith("{")) meta = JSON.parse(m.description); } catch {}
                      const businessType = String(meta["business_type"] || "manufacturer");

                      return (
                        <tr key={m.id} className="hover:bg-gray-50/50">
                          <td className="p-4">
                            <span className="font-semibold text-primary block">{m.business_name}</span>
                            <span className="text-xs text-smoke block mt-0.5">{String(meta["owner_name"] || meta["founder_name"] || "—")}</span>
                          </td>
                          <td className="p-4 font-mono text-xs">{m.gst_number}</td>
                          <td className="p-4">{m.established_year || "—"}</td>
                          <td className="p-4 capitalize">
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                              {businessType}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <Button asChild variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/5">
                              <Link href={`/admin/dashboard/verifications/${m.id}`}>
                                Review Details
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <h3 className="font-serif text-lg font-semibold text-black mt-10 mb-4 border-t pt-8">Other Verified / Rejected Manufacturers</h3>
            {initialData.verifiedManufacturers.length === 0 ? (
              <p className="text-sm text-smoke py-6 text-center">No other manufacturers listed.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-smoke bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 font-semibold">Company Name</th>
                      <th className="p-4 font-semibold">GSTIN</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {initialData.verifiedManufacturers.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50/50">
                        <td className="p-4">
                          <span className="font-semibold text-gray-700 block">{m.business_name}</span>
                          <span className="text-xs text-smoke block mt-0.5">{m.city}, {m.state}</span>
                        </td>
                        <td className="p-4 font-mono text-xs">{m.gst_number}</td>
                        <td className="p-4">
                          <Badge variant={m.status}>
                            {m.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/dashboard/verifications/${m.id}`}>
                              View Audit
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* WAITLIST TAB */}
        {activeTab === "waitlist" && (
          <div className="p-6">
            <h3 className="font-serif text-lg font-semibold text-black mb-4">Waitlist Signups</h3>
            {waitlist.length === 0 ? (
              <p className="text-sm text-smoke py-6 text-center">No waitlist entries.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-smoke bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Location</th>
                      <th className="p-4 font-semibold">Desired Role</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {waitlist.map((w) => (
                      <tr key={w.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-semibold text-gray-700">{w.name}</td>
                        <td className="p-4 font-mono text-xs">{w.email}</td>
                        <td className="p-4">{w.city || "—"}</td>
                        <td className="p-4 capitalize">
                          <Badge className="bg-gray-100 text-neutral-800">{w.role}</Badge>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteWaitlist(w.id)}
                            className="text-smoke hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                            title="Remove entry"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="p-6">
            <h3 className="font-serif text-lg font-semibold text-black mb-4">Platform Products</h3>
            {products.length === 0 ? (
              <p className="text-sm text-smoke py-6 text-center">No products listed on the platform.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-smoke bg-gray-50 border-b">
                    <tr>
                      <th className="p-4 font-semibold">Product Name</th>
                      <th className="p-4 font-semibold">Category</th>
                      <th className="p-4 font-semibold">Price</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-semibold text-gray-700">{p.name}</td>
                        <td className="p-4">{p.category}</td>
                        <td className="p-4 font-mono text-xs">₹{p.price_inr?.toLocaleString() || "—"}</td>
                        <td className="p-4">
                          <Badge variant={p.status === "published" ? "verified" : "not_submitted"}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-2">
                          <Button 
                            onClick={() => handleTogglePublish(p.id, p.status)}
                            variant="outline" 
                            size="sm"
                            className="h-8 text-xs border-primary text-primary hover:bg-primary/5"
                          >
                            {p.status === "published" ? "Unpublish" : "Publish"}
                          </Button>
                          <button 
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-smoke hover:text-red-600 transition-colors p-1.5 rounded hover:bg-red-50"
                            title="Delete Product"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* INQUIRIES TAB */}
        {activeTab === "inquiries" && (
          <div className="p-6">
            <h3 className="font-serif text-lg font-semibold text-black mb-4">Buyer-to-Manufacturer Inquiries</h3>
            {initialData.inquiries.length === 0 ? (
              <p className="text-sm text-smoke py-6 text-center">No inquiries submitted yet.</p>
            ) : (
              <div className="space-y-4">
                {initialData.inquiries.map((inq) => (
                  <div key={inq.id} className="border rounded p-4 bg-gray-50/50 flex flex-col gap-2 hover: transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs text-smoke font-semibold block uppercase">From: {inq.name} ({inq.email})</span>
                        <span className="text-xs text-smoke block mt-0.5">Phone: {inq.phone || "—"}</span>
                      </div>
                      <Badge className="bg-gray-200 text-neutral-800 capitalize">{inq.status}</Badge>
                    </div>
                    <div className="my-2 p-3 bg-paper-white border rounded text-sm text-neutral-800 italic">
                      &ldquo;{inq.message}&rdquo;
                    </div>
                    <div className="flex justify-between items-center text-xs text-smoke mt-1">
                      <span>Product ID: {inq.product_id}</span>
                      <span>Date: {new Date(inq.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTACT MESSAGES TAB */}
        {activeTab === "contact" && (
          <div className="p-6">
            <h3 className="font-serif text-lg font-semibold text-black mb-4">General Contact Submissions</h3>
            {contactMessages.length === 0 ? (
              <p className="text-sm text-smoke py-6 text-center">No contact form messages.</p>
            ) : (
              <div className="space-y-4">
                {contactMessages.map((msg) => (
                  <div key={msg.id} className="border rounded p-4 bg-gray-50/50 flex flex-col gap-2 hover: transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-sm font-semibold text-primary">{msg.name}</span>
                        <span className="text-xs text-smoke block mt-0.5">{msg.email}</span>
                      </div>
                      {msg.reason && <Badge className="bg-gray-100 text-neutral-800">{msg.reason}</Badge>}
                    </div>
                    <div className="my-2 p-3 bg-paper-white border rounded text-sm text-neutral-800 italic">
                      &ldquo;{msg.message}&rdquo;
                    </div>
                    <div className="flex justify-between items-center text-xs text-smoke mt-1">
                      <span>Date: {new Date(msg.created_at).toLocaleDateString()}</span>
                      <button 
                        onClick={() => handleDeleteContact(msg.id)}
                        className="text-smoke hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
