"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AvatarUploader } from "@/components/avatar-uploader";
import { updateProfile, saveAddresses } from "./actions";
import { updatePassword } from "@/app/login/actions";
import { User, MapPin, ShieldAlert, Plus, Trash2 } from "lucide-react";

interface Address {
  id: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
}

interface ProfileClientProps {
  userId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  initialAddresses: Address[];
}

export function ProfileClient({
  userId,
  email,
  fullName: initialFullName,
  phone: initialPhone,
  city: initialCity,
  avatarUrl,
  initialAddresses,
}: ProfileClientProps) {
  const [activeTab, setActiveTab] = useState<"info" | "addresses" | "security">("info");

  // Personal Info State
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [city, setCity] = useState(initialCity ?? "");
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoPending, setInfoPending] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [addressPhone, setAddressPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPincode, setAddressPincode] = useState("");
  const [addressPending, setAddressPending] = useState(false);

  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState(false);
  const [passPending, setPassPending] = useState(false);

  async function handleInfoSubmit(e: React.FormEvent) {
    e.preventDefault();
    setInfoError(null);
    setInfoSuccess(false);
    setInfoPending(true);

    try {
      const res = await updateProfile({ fullName, phone, city });
      if (res.error) {
        setInfoError(res.error);
      } else {
        setInfoSuccess(true);
      }
    } catch (err: unknown) {
      setInfoError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setInfoPending(false);
    }
  }

  async function handleAddAddress(e: React.FormEvent) {
    e.preventDefault();
    setAddressPending(true);

    const newAddress: Address = {
      id: Math.random().toString(36).substr(2, 9),
      recipientName,
      phone: addressPhone,
      addressLine,
      city: addressCity,
      state: addressState,
      pincode: addressPincode,
    };

    const updated = [...addresses, newAddress];
    try {
      const res = await saveAddresses(updated);
      if (res.error) {
        alert(res.error);
      } else {
        setAddresses(updated);
        setShowAddAddress(false);
        // Reset form
        setRecipientName("");
        setAddressPhone("");
        setAddressLine("");
        setAddressCity("");
        setAddressState("");
        setAddressPincode("");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setAddressPending(false);
    }
  }

  async function handleDeleteAddress(id: string) {
    if (!confirm("Are you sure you want to delete this address?")) return;
    const updated = addresses.filter((a) => a.id !== id);
    try {
      const res = await saveAddresses(updated);
      if (res.error) {
        alert(res.error);
      } else {
        setAddresses(updated);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An error occurred.");
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(false);

    if (password !== confirmPassword) {
      setPassError("Passwords do not match.");
      return;
    }

    setPassPending(true);

    try {
      const res = await updatePassword(password);
      if (res.error) {
        setPassError(res.error);
      } else {
        setPassSuccess(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err: unknown) {
      setPassError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setPassPending(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Navigation */}
      <div className="md:col-span-1 flex flex-col gap-1 border-r border-black/5 pr-4">
        {[
          { id: "info", label: "Personal Info", icon: User },
          { id: "addresses", label: "Shipping Addresses", icon: MapPin },
          { id: "security", label: "Security & Password", icon: ShieldAlert },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "info" | "addresses" | "security")}
              className={`flex h-11 items-center gap-3 rounded-[4px] px-3 text-sm font-semibold transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-forest-green text-white"
                  : "text-smoke hover:bg-black/5 hover:text-forest-green"
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="md:col-span-3 bg-paper-white border border-black/5 rounded-[4px] p-8 min-h-[400px]">
        {/* PERSONAL INFO TAB */}
        {activeTab === "info" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="font-serif text-xl text-forest-green font-normal">Personal Information</h2>
              <p className="text-xs text-smoke mt-1">Manage your basic profile details and avatar photo.</p>
            </div>

            <div className="border-b pb-6">
              <Label className="text-xs font-bold text-smoke uppercase mb-3 block">Profile photo</Label>
              <AvatarUploader userId={userId} fullName={fullName} currentUrl={avatarUrl} />
            </div>

            <form onSubmit={handleInfoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="border-black/10 focus-visible:ring-forest-green mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-gray-50 border-black/10 mt-1 cursor-not-allowed font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border-black/10 focus-visible:ring-forest-green mt-1"
                    placeholder="e.g. +91 9999999999"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="border-black/10 focus-visible:ring-forest-green mt-1"
                    placeholder="e.g. New Delhi"
                  />
                </div>
              </div>

              {infoError && <p className="text-xs font-semibold text-destructive mt-2">{infoError}</p>}
              {infoSuccess && <p className="text-xs font-semibold text-green-600 mt-2">Profile updated successfully!</p>}

              <div className="pt-4">
                <Button type="submit" className="bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11 px-6" disabled={infoPending}>
                  {infoPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* SHIPPING ADDRESSES TAB */}
        {activeTab === "addresses" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="font-serif text-xl text-forest-green font-normal">Shipping Address Book</h2>
                <p className="text-xs text-smoke mt-1">Add and manage your primary product delivery destinations.</p>
              </div>
              {!showAddAddress && (
                <Button onClick={() => setShowAddAddress(true)} className="bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] text-xs font-semibold uppercase tracking-wider h-9">
                  <Plus className="mr-1.5 h-4 w-4" /> Add Address
                </Button>
              )}
            </div>

            {showAddAddress && (
              <form onSubmit={handleAddAddress} className="bg-gray-50/50 p-6 border rounded-[4px] space-y-4 animate-fade-in">
                <h3 className="font-serif text-base text-forest-green font-normal">Add Shipping Address</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Full Name</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                      placeholder="e.g. Saravanan"
                      className="border-black/10 focus-visible:ring-forest-green mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressPhone">Recipient Phone</Label>
                    <Input
                      id="addressPhone"
                      value={addressPhone}
                      onChange={(e) => setAddressPhone(e.target.value)}
                      required
                      placeholder="e.g. 9876543210"
                      className="border-black/10 focus-visible:ring-forest-green mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="addressLine">Street Address / Landmark</Label>
                  <Input
                    id="addressLine"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    required
                    placeholder="e.g. Flat 301, Emerald Towers, Near Metro Station"
                    className="border-black/10 focus-visible:ring-forest-green mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="addressCity">City</Label>
                    <Input
                      id="addressCity"
                      value={addressCity}
                      onChange={(e) => setAddressCity(e.target.value)}
                      required
                      placeholder="e.g. Bangalore"
                      className="border-black/10 focus-visible:ring-forest-green mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressState">State</Label>
                    <Input
                      id="addressState"
                      value={addressState}
                      onChange={(e) => setAddressState(e.target.value)}
                      required
                      placeholder="e.g. Karnataka"
                      className="border-black/10 focus-visible:ring-forest-green mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="addressPincode">Pincode</Label>
                    <Input
                      id="addressPincode"
                      value={addressPincode}
                      onChange={(e) => setAddressPincode(e.target.value)}
                      required
                      placeholder="e.g. 560001"
                      className="border-black/10 focus-visible:ring-forest-green mt-1"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowAddAddress(false)} className="rounded-[4px] text-xs font-semibold h-10 px-4">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] text-xs font-semibold uppercase tracking-wider h-10 px-4" disabled={addressPending}>
                    {addressPending ? "Saving..." : "Save Address"}
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {addresses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50/50 rounded border border-dashed border-gray-200">
                  <p className="text-sm text-smoke">No shipping addresses saved yet.</p>
                </div>
              ) : (
                addresses.map((addr) => (
                  <div key={addr.id} className="flex justify-between items-start p-5 border rounded-[4px] hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-semibold text-neutral-800">{addr.recipientName}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{addr.phone}</p>
                      <p className="text-sm text-neutral-700 mt-2">{addr.addressLine}</p>
                      <p className="text-xs text-smoke font-medium mt-1">
                        {addr.city}, {addr.state} - <span className="font-mono">{addr.pincode}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-smoke hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors"
                      title="Delete Address"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === "security" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="font-serif text-xl text-forest-green font-normal">Security & password</h2>
              <p className="text-xs text-smoke mt-1">Update your password regularly to keep your account safe.</p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 border-t pt-6">
              <div>
                <Label htmlFor="pass">New Password</Label>
                <Input
                  id="pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  className="border-black/10 focus-visible:ring-forest-green mt-1 max-w-md"
                />
              </div>

              <div>
                <Label htmlFor="confirmPass">Confirm New Password</Label>
                <Input
                  id="confirmPass"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="border-black/10 focus-visible:ring-forest-green mt-1 max-w-md"
                />
              </div>

              {passError && <p className="text-xs font-semibold text-destructive mt-2">{passError}</p>}
              {passSuccess && <p className="text-xs font-semibold text-green-600 mt-2">Password updated successfully!</p>}

              <div className="pt-4">
                <Button type="submit" className="bg-forest-green text-white hover:bg-forest-green/90 rounded-[4px] font-medium uppercase tracking-wider h-11 px-6" disabled={passPending}>
                  {passPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
