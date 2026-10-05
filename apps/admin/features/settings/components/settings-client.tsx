"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Save,
  RotateCcw,
  Globe,
  Lock,
  Bell,
  Building2,
  Package,
  Database,
  ShieldCheck,
  CreditCard,
  Zap,
  Search,
  X,
  Check,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
}
interface SettingsClientProps {
  adminUser: AdminUser;
}

/* ─── Default settings ─── */
const DEFAULT_SETTINGS = {
  platformName: "GenZ Enterprise Commerce Platform",
  supportEmail: "genz.official.hq@gmail.com",
  baseCurrency: "INR (₹)",
  defaultGstRate: "18",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  defaultLanguage: "en",

  autoApproveSellers: false,
  requireGstVerification: true,
  requireFactoryAddress: true,
  requireBankVerification: true,
  sellerApplicationCooldown: "30",
  maxProductsPerSeller: "500",
  requireProductApproval: true,

  autoConfirmOrders: false,
  orderCancellationWindow: "24",
  enableCOD: true,
  enablePrepaid: true,
  defaultShippingPartner: "shiprocket",
  enableReturnPolicy: true,
  returnWindow: "7",
  enableRefunds: true,
  autoAssignWarehouse: true,

  lowStockThreshold: "10",
  outOfStockBehavior: "hide",
  enableInventoryAlerts: true,
  enableMultiWarehouse: false,
  enableBatchTracking: false,

  forceAdmin2FA: true,
  maintenanceMode: false,
  rlsGuardActive: true,
  rateLimitingEnabled: true,
  sessionTimeout: "60",
  maxLoginAttempts: "5",
  ipWhitelistEnabled: false,
  auditLogRetention: "90",
  enableApiKeys: true,

  notifyNewOrder: true,
  notifyNewSellerSignup: true,
  notifyDocumentUpload: true,
  dailySummaryDigest: false,
  notifyLowStock: true,
  notifyRefundProcessed: true,
  notifySellerApplicationStatus: true,
  notifyOrderStatusChange: true,

  enableWhatsappNotifications: false,
  whatsappApiKey: "",
  enableSlackIntegration: false,
  slackWebhookUrl: "",
  enableGoogleAnalytics: false,
  gaTrackingId: "",
  enableWebhooks: false,
  webhookEndpoint: "",

  enableAutoBackup: true,
  backupFrequency: "daily",
  backupRetention: "30",
  enableDataExport: true,
  exportFormat: "csv",
};
type Settings = typeof DEFAULT_SETTINGS;
type Key = keyof Settings;
const STORAGE_KEY = "genz_admin_system_settings";

/* ─── Config model ─── */
type FieldItem = {
  kind: "text" | "email" | "url" | "password" | "number" | "select" | "color";
  key: Key;
  label: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  options?: [string, string][];
};
type ToggleItem = {
  kind: "toggle";
  key: Key;
  title: string;
  desc: string;
  danger?: boolean;
  reveals?: FieldItem;
};
type StatusItem = { kind: "status"; title: string; desc: string; badge: string };
type Item = FieldItem | ToggleItem | StatusItem;
type Section = { title: string; layout: "fields" | "toggles"; items: Item[] };
type TabId =
  | "general"
  | "sellers"
  | "orders"
  | "inventory"
  | "security"
  | "notifications"
  | "integrations"
  | "data";

const tg = (
  key: Key,
  title: string,
  desc: string,
  extra: Partial<ToggleItem> = {}
): ToggleItem => ({ kind: "toggle", key, title, desc, ...extra });
const num = (key: Key, label: string, hint?: string): FieldItem => ({
  kind: "number",
  key,
  label,
  hint,
});

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  description: string;
  sections: Section[];
}[] = [
  {
    id: "general",
    label: "General",
    icon: Globe,
    description: "Platform name, currency, locale and tax.",
    sections: [
      {
        title: "Identity",
        layout: "fields",
        items: [
          {
            kind: "text",
            key: "platformName",
            label: "Platform name",
            hint: "Shown in emails, invoices and the browser tab.",
          },
          {
            kind: "email",
            key: "supportEmail",
            label: "Support email",
            hint: "Where customers and sellers reach you.",
          },
        ],
      },
      {
        title: "Locale and tax",
        layout: "fields",
        items: [
          {
            kind: "text",
            key: "baseCurrency",
            label: "Currency",
            hint: "Locked to INR for compliance.",
            disabled: true,
          },
          num("defaultGstRate", "Default GST rate (%)"),
          {
            kind: "select",
            key: "timezone",
            label: "Timezone",
            options: [
              ["Asia/Kolkata", "Asia/Kolkata (IST)"],
              ["UTC", "UTC"],
              ["America/New_York", "America/New York (EST)"],
            ],
          },
          {
            kind: "select",
            key: "dateFormat",
            label: "Date format",
            options: [
              ["DD/MM/YYYY", "DD/MM/YYYY"],
              ["MM/DD/YYYY", "MM/DD/YYYY"],
              ["YYYY-MM-DD", "YYYY-MM-DD"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sellers",
    label: "Sellers",
    icon: Building2,
    description: "Onboarding and verification rules.",
    sections: [
      {
        title: "Verification",
        layout: "toggles",
        items: [
          tg(
            "requireGstVerification",
            "Require GST verification",
            "Verify the 15-character GSTIN for every new seller."
          ),
          tg(
            "requireFactoryAddress",
            "Require factory address",
            "Ask manufacturers for their registered location and pincode."
          ),
          tg(
            "requireBankVerification",
            "Require bank verification",
            "Validate bank details before payouts are enabled."
          ),
        ],
      },
      {
        title: "Approvals",
        layout: "toggles",
        items: [
          tg(
            "autoApproveSellers",
            "Auto-approve sellers",
            "Skip manual admin review for new applications."
          ),
          tg(
            "requireProductApproval",
            "Require product approval",
            "New products need admin approval before they go live."
          ),
        ],
      },
      {
        title: "Limits",
        layout: "fields",
        items: [
          num(
            "sellerApplicationCooldown",
            "Reapply cooldown (days)",
            "How long a rejected seller waits to reapply."
          ),
          num(
            "maxProductsPerSeller",
            "Max products per seller",
            "Listing cap for each seller."
          ),
        ],
      },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    icon: CreditCard,
    description: "Checkout, fulfilment and returns.",
    sections: [
      {
        title: "Checkout",
        layout: "toggles",
        items: [
          tg(
            "autoConfirmOrders",
            "Auto-confirm orders",
            "Confirm orders without manual approval."
          ),
          tg(
            "enableCOD",
            "Cash on delivery",
            "Let customers pay when the order arrives."
          ),
          tg(
            "enablePrepaid",
            "Prepaid payments",
            "UPI, cards and net banking at checkout."
          ),
          tg(
            "autoAssignWarehouse",
            "Auto-assign warehouse",
            "Route each order to the nearest available warehouse."
          ),
        ],
      },
      {
        title: "Returns and refunds",
        layout: "toggles",
        items: [
          tg(
            "enableReturnPolicy",
            "Return policy",
            "Allow returns within the window below."
          ),
          tg(
            "enableRefunds",
            "Automatic refunds",
            "Refund approved returns without manual steps."
          ),
        ],
      },
      {
        title: "Windows and shipping",
        layout: "fields",
        items: [
          num(
            "orderCancellationWindow",
            "Cancellation window (hours)",
            "How long customers can cancel."
          ),
          num(
            "returnWindow",
            "Return window (days)",
            "Days a product stays eligible for return."
          ),
          {
            kind: "select",
            key: "defaultShippingPartner",
            label: "Default shipping partner",
            options: [
              ["shiprocket", "Shiprocket"],
              ["delhivery", "Delhivery"],
              ["bluedart", "BlueDart"],
              ["india_post", "India Post"],
              ["manual", "Manual / self-shipping"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Package,
    description: "Stock thresholds and warehousing.",
    sections: [
      {
        title: "Tracking",
        layout: "toggles",
        items: [
          tg(
            "enableInventoryAlerts",
            "Inventory alerts",
            "Notify when stock drops below the threshold."
          ),
          tg(
            "enableMultiWarehouse",
            "Multi-warehouse",
            "Track stock across several fulfilment centers."
          ),
          tg(
            "enableBatchTracking",
            "Batch and lot tracking",
            "Track perishable and manufactured goods by batch."
          ),
        ],
      },
      {
        title: "Thresholds",
        layout: "fields",
        items: [
          num(
            "lowStockThreshold",
            "Low stock threshold",
            "Products below this quantity are flagged."
          ),
          {
            kind: "select",
            key: "outOfStockBehavior",
            label: "When out of stock",
            options: [
              ["hide", "Hide from catalog"],
              ["show_oos", "Show as out of stock"],
              ["backorder", "Allow backorder"],
            ],
          },
        ],
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    icon: Lock,
    description: "Access, sessions and protection.",
    sections: [
      {
        title: "Protection",
        layout: "toggles",
        items: [
          {
            kind: "status",
            title: "Database data shield (RLS)",
            desc: "Isolation guard that stops unauthorized access to user profiles.",
            badge: "Active",
          },
          tg(
            "rateLimitingEnabled",
            "Rate limiting",
            "Block rapid requests, repeated logins and automated spam."
          ),
          tg(
            "forceAdmin2FA",
            "Require admin 2FA",
            "Admins confirm with a second code when signing in."
          ),
          tg(
            "ipWhitelistEnabled",
            "IP whitelist",
            "Limit admin portal access to approved IP addresses."
          ),
          tg(
            "enableApiKeys",
            "API keys",
            "Allow programmatic access for third-party tools."
          ),
        ],
      },
      {
        title: "Availability",
        layout: "toggles",
        items: [
          tg(
            "maintenanceMode",
            "Maintenance mode",
            "Pause public browsing and show a maintenance notice to buyers.",
            { danger: true }
          ),
        ],
      },
      {
        title: "Sessions and logs",
        layout: "fields",
        items: [
          num(
            "sessionTimeout",
            "Session timeout (min)",
            "Sign out after this much inactivity."
          ),
          num(
            "maxLoginAttempts",
            "Max login attempts",
            "Lock the account after this many failures."
          ),
          num(
            "auditLogRetention",
            "Audit log retention (days)",
            "How long admin activity is kept."
          ),
        ],
      },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: Bell,
    description: "Choose which events email the admin team.",
    sections: [
      {
        title: "Orders",
        layout: "toggles",
        items: [
          tg(
            "notifyNewOrder",
            "New customer order",
            "Email when a customer places an order."
          ),
          tg(
            "notifyOrderStatusChange",
            "Order status changes",
            "Confirmation, dispatch, delivery or cancellation."
          ),
          tg(
            "notifyRefundProcessed",
            "Refund processed",
            "Email when a refund goes through."
          ),
        ],
      },
      {
        title: "Sellers",
        layout: "toggles",
        items: [
          tg(
            "notifyNewSellerSignup",
            "New seller application",
            "Email when a seller applies."
          ),
          tg(
            "notifySellerApplicationStatus",
            "Application status change",
            "Email when an application is approved or rejected."
          ),
          tg(
            "notifyDocumentUpload",
            "Document upload",
            "Email when a seller uploads documents to review."
          ),
        ],
      },
      {
        title: "Stock and summaries",
        layout: "toggles",
        items: [
          tg(
            "notifyLowStock",
            "Low stock alerts",
            "Email when stock falls below the threshold."
          ),
          tg(
            "dailySummaryDigest",
            "Daily digest",
            "A morning summary of orders, revenue and key metrics."
          ),
        ],
      },
    ],
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Zap,
    description: "WhatsApp, Slack, analytics and webhooks.",
    sections: [
      {
        title: "Messaging",
        layout: "toggles",
        items: [
          tg(
            "enableWhatsappNotifications",
            "WhatsApp notifications",
            "Send order updates through the WhatsApp Business API.",
            {
              reveals: {
                kind: "password",
                key: "whatsappApiKey",
                label: "WhatsApp API key",
                placeholder: "Enter your API key",
              },
            }
          ),
          tg(
            "enableSlackIntegration",
            "Slack",
            "Post order and task updates to a Slack channel.",
            {
              reveals: {
                kind: "url",
                key: "slackWebhookUrl",
                label: "Slack webhook URL",
                placeholder: "https://hooks.slack.com/services/...",
              },
            }
          ),
        ],
      },
      {
        title: "Analytics and events",
        layout: "toggles",
        items: [
          tg(
            "enableGoogleAnalytics",
            "Google Analytics",
            "Track storefront visitors and conversions.",
            {
              reveals: {
                kind: "text",
                key: "gaTrackingId",
                label: "GA4 measurement ID",
                placeholder: "G-XXXXXXXXXX",
              },
            }
          ),
          tg(
            "enableWebhooks",
            "Custom webhooks",
            "Send real-time event payloads to your own endpoint.",
            {
              reveals: {
                kind: "url",
                key: "webhookEndpoint",
                label: "Webhook endpoint",
                hint: "Events such as order.created and seller.approved are POSTed here.",
                placeholder: "https://your-app.com/webhooks",
              },
            }
          ),
        ],
      },
    ],
  },
  {
    id: "data",
    label: "Data and export",
    icon: Database,
    description: "Backups, exports and retention.",
    sections: [
      {
        title: "Backups and exports",
        layout: "toggles",
        items: [
          tg(
            "enableAutoBackup",
            "Automated backups",
            "Back up the database and configuration on a schedule."
          ),
          tg(
            "enableDataExport",
            "Data export",
            "Let admins export orders, products and reports."
          ),
        ],
      },
      {
        title: "Schedule",
        layout: "fields",
        items: [
          {
            kind: "select",
            key: "backupFrequency",
            label: "Backup frequency",
            options: [
              ["hourly", "Hourly"],
              ["daily", "Daily"],
              ["weekly", "Weekly"],
            ],
          },
          num(
            "backupRetention",
            "Backup retention (days)",
            "How long snapshots are kept."
          ),
          {
            kind: "select",
            key: "exportFormat",
            label: "Export format",
            options: [
              ["csv", "CSV"],
              ["xlsx", "Excel (XLSX)"],
              ["json", "JSON"],
            ],
          },
        ],
      },
    ],
  },
];

const NOTIFY_KEYS: Key[] = [
  "notifyNewOrder",
  "notifyNewSellerSignup",
  "notifyDocumentUpload",
  "dailySummaryDigest",
  "notifyLowStock",
  "notifyRefundProcessed",
  "notifySellerApplicationStatus",
  "notifyOrderStatusChange",
];

const itemKeys = (it: Item): Key[] =>
  it.kind === "status"
    ? []
    : it.kind === "toggle"
      ? [it.key, ...(it.reveals ? [it.reveals.key] : [])]
      : [it.key];
const itemText = (it: Item) =>
  (it.kind === "toggle"
    ? `${it.title} ${it.desc} ${it.reveals?.label ?? ""}`
    : it.kind === "status"
      ? `${it.title} ${it.desc}`
      : `${it.label} ${it.hint ?? ""}`
  ).toLowerCase();

/* ─── M3 switch ─── */
function Switch({
  checked,
  onChange,
  danger = false,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  danger?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`focus-visible:ring-primary relative inline-flex h-8 w-[52px] shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none ${
        checked
          ? danger
            ? "border-[#ef4444] bg-[#ef4444]"
            : "border-primary bg-primary"
          : "border-outline bg-surface-container-highest"
      }`}
    >
      <span
        className={`absolute flex items-center justify-center rounded-full transition-all ${
          checked ? "left-[22px] h-6 w-6 bg-white" : "bg-outline left-[6px] h-4 w-4"
        }`}
      >
        {checked && (
          <Check
            className={`h-3.5 w-3.5 ${danger ? "text-[#ef4444]" : "text-primary"}`}
            strokeWidth={3}
          />
        )}
      </span>
    </button>
  );
}

/* ═══════════════ MAIN ═══════════════ */
export function SettingsClient({ adminUser }: SettingsClientProps) {
  const [tab, setTab] = useState<TabId>("general");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState<Settings>(DEFAULT_SETTINGS);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const merged = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
          setSettings(merged);
          setSaved(merged);
        }
      } catch {
        /* use defaults */
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!snack) return;
    const id = setTimeout(() => setSnack(null), 3200);
    return () => clearTimeout(id);
  }, [snack]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setResetOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const set = (key: Key, value: string | boolean) =>
    setSettings((p) => ({ ...p, [key]: value }));
  const changed = (k: Key) => settings[k] !== saved[k];
  const dirtyCount = (Object.keys(settings) as Key[]).filter(changed).length;
  const dirtyTabs = useMemo(
    () =>
      new Set(
        TABS.filter((t) =>
          t.sections.some((s) => s.items.some((i) => itemKeys(i).some(changed)))
        ).map((t) => t.id)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [settings, saved]
  );

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        setSaved(settings);
        setSnack("Settings saved");
      } catch {
        setSnack("Couldn't save settings. Check your browser storage and try again.");
      }
      setSaving(false);
    }, 350);
  };
  const discard = () => setSettings(saved);
  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSaved(DEFAULT_SETTINGS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setResetOpen(false);
    setSnack("Settings reset to defaults");
  };

  /* ─── Renderers ─── */
  const inputCls =
    "border-outline-variant bg-surface-container-lowest text-on-surface focus:border-primary focus:ring-primary h-12 w-full rounded-xl border px-4 text-sm transition focus:ring-1 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

  const renderField = (f: FieldItem) => (
    <div key={f.key}>
      <label className="text-on-surface mb-1.5 flex items-center gap-1.5 text-sm font-medium">
        {f.label}
        {changed(f.key) && (
          <span className="bg-primary h-1.5 w-1.5 rounded-full" aria-label="Unsaved" />
        )}
      </label>
      {f.kind === "select" ? (
        <select
          value={settings[f.key] as string}
          onChange={(e) => set(f.key, e.target.value)}
          className={`${inputCls} cursor-pointer`}
        >
          {f.options!.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ) : f.kind === "color" ? (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={settings[f.key] as string}
            onChange={(e) => set(f.key, e.target.value)}
            aria-label={f.label}
            className="h-12 w-14 shrink-0 cursor-pointer rounded-xl border-0 bg-transparent p-0"
          />
          <input
            type="text"
            value={settings[f.key] as string}
            onChange={(e) => set(f.key, e.target.value)}
            className={inputCls}
          />
        </div>
      ) : (
        <input
          type={f.kind}
          value={settings[f.key] as string}
          disabled={f.disabled}
          placeholder={f.placeholder}
          onChange={(e) => set(f.key, e.target.value)}
          className={inputCls}
        />
      )}
      {f.hint && <p className="text-on-surface-variant mt-1.5 text-xs">{f.hint}</p>}
    </div>
  );

  const renderToggle = (t: ToggleItem) => {
    const on = settings[t.key] as boolean;
    return (
      <div key={t.key} className="py-4">
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0 flex-1">
            <h4 className="text-on-surface flex items-center gap-1.5 text-sm font-medium">
              {t.title}
              {changed(t.key) && (
                <span
                  className="bg-primary h-1.5 w-1.5 rounded-full"
                  aria-label="Unsaved"
                />
              )}
            </h4>
            <p className="text-on-surface-variant mt-0.5 text-xs leading-relaxed">
              {t.desc}
            </p>
          </div>
          <Switch
            checked={on}
            onChange={(v) => set(t.key, v)}
            danger={t.danger}
            label={t.title}
          />
        </div>
        {t.reveals && on && (
          <div className="mt-3 max-w-xl">{renderField(t.reveals)}</div>
        )}
      </div>
    );
  };

  const renderSection = (s: Section, items: Item[]) => (
    <section key={s.title} className="space-y-3">
      <h3 className="text-on-surface-variant text-sm font-medium">{s.title}</h3>
      {s.layout === "fields" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((i) =>
            i.kind !== "toggle" && i.kind !== "status" ? renderField(i) : null
          )}
        </div>
      ) : (
        <div className="bg-surface-container-low divide-outline-variant/40 divide-y rounded-2xl px-5">
          {items.map((i) =>
            i.kind === "toggle" ? (
              renderToggle(i)
            ) : i.kind === "status" ? (
              <div
                key={i.title}
                className="flex items-center justify-between gap-6 py-4"
              >
                <div>
                  <h4 className="text-on-surface text-sm font-medium">{i.title}</h4>
                  <p className="text-on-surface-variant mt-0.5 text-xs leading-relaxed">
                    {i.desc}
                  </p>
                </div>
                <span className="bg-success-container text-on-success-container shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
                  {i.badge}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </section>
  );

  /* ─── Search ─── */
  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      q
        ? TABS.map((t) => ({
            tab: t,
            sections: t.sections
              .map((s) => ({
                s,
                items: s.items.filter((i) => itemText(i).includes(q)),
              }))
              .filter((x) => x.items.length),
          })).filter((r) => r.sections.length)
        : [],
    [q]
  );

  const active = TABS.find((t) => t.id === tab)!;
  const notifyOn = NOTIFY_KEYS.filter((k) => settings[k]).length;
  const statCell = (
    label: string,
    value: string,
    hint: string,
    tone = "text-on-surface"
  ) => (
    <div className="px-6 py-5">
      <p className="text-on-surface-variant text-sm">{label}</p>
      <p className={`mt-3 text-2xl font-semibold ${tone}`}>{value}</p>
      <p className="text-on-surface-variant mt-2 text-sm">{hint}</p>
    </div>
  );

  return (
    <div className="w-full space-y-6 pb-24">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-on-surface text-3xl font-normal tracking-tight sm:text-[34px]">
            Settings
          </h1>
          <p className="text-on-surface-variant mt-1 text-sm sm:text-base">
            Manage platform configuration, policies, security and integrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setResetOpen(true)}
            className="border-outline-variant text-on-surface hover:bg-surface-container-low inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl border px-5 text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || dirtyCount === 0}
            className="bg-primary text-on-primary hover:shadow-elevation-2 inline-flex h-12 cursor-pointer items-center gap-2 rounded-xl px-5 text-sm font-semibold tracking-wide uppercase transition-shadow disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save changes
          </button>
        </div>
      </div>

      {/* ─── Overview ─── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <div className="border-outline-variant/50 bg-surface-container-lowest shadow-elevation-1 md:divide-outline-variant/40 grid grid-cols-2 overflow-hidden rounded-3xl border md:grid-cols-4 md:divide-x">
          {statCell(
            "Admin 2FA",
            settings.forceAdmin2FA ? "On" : "Off",
            settings.forceAdmin2FA ? "Required at sign-in" : "Not enforced",
            settings.forceAdmin2FA ? "text-success" : "text-[#ef4444]"
          )}
          {statCell(
            "Maintenance",
            settings.maintenanceMode ? "On" : "Off",
            settings.maintenanceMode ? "Buyers see a notice" : "Storefront is live",
            settings.maintenanceMode ? "text-[#ef4444]" : "text-on-surface"
          )}
          {statCell(
            "Backups",
            settings.enableAutoBackup
              ? settings.backupFrequency[0].toUpperCase() +
                  settings.backupFrequency.slice(1)
              : "Off",
            settings.enableAutoBackup
              ? `Kept ${settings.backupRetention} days`
              : "Turn on to protect data"
          )}
          {statCell(
            "Email alerts",
            `${notifyOn} of ${NOTIFY_KEYS.length}`,
            "Events enabled"
          )}
        </div>
        <div className="bg-surface-container-low flex items-center gap-4 rounded-3xl p-6">
          <span className="bg-primary text-on-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold">
            {(adminUser.fullName || "?")[0].toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-on-surface truncate text-base font-medium">
              {adminUser.fullName}
            </p>
            <p className="text-on-surface-variant truncate text-sm">
              {adminUser.email}
            </p>
            <span className="bg-success-container text-on-success-container mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              Super admin
            </span>
          </div>
        </div>
      </div>

      {/* ─── Settings card ─── */}
      <section
        className="border-outline-variant/50 bg-surface-container-lowest shadow-elevation-1 overflow-hidden rounded-3xl border"
        aria-label="Settings"
      >
        {/* Tabs */}
        <div
          className="border-outline-variant/50 flex items-end overflow-x-auto border-b px-3"
          role="tablist"
          aria-label="Settings sections"
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const on = !q && tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setQuery("");
                  setTab(t.id);
                }}
                className={`relative flex cursor-pointer items-center gap-2 px-4 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                  on
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/60"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {t.label}
                {dirtyTabs.has(t.id) && (
                  <span
                    className="bg-primary h-1.5 w-1.5 rounded-full"
                    aria-label="Unsaved changes"
                  />
                )}
                {on && (
                  <span className="bg-primary absolute right-3 bottom-0 left-3 h-[3px] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Title + search */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
          <div>
            <h2 className="text-on-surface text-2xl font-normal">
              {q ? "Search results" : active.label}
            </h2>
            <p className="text-on-surface-variant mt-0.5 text-sm">
              {q
                ? `${results.reduce((n, r) => n + r.sections.reduce((m, x) => m + x.items.length, 0), 0)} matching settings`
                : active.description}
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="text-on-surface-variant pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search all settings"
              className="bg-surface-container text-on-surface placeholder:text-on-surface-variant/70 focus:ring-primary h-10 w-full rounded-full pr-10 pl-10 text-sm outline-none focus:ring-2"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="text-on-surface-variant hover:bg-surface-container-high absolute top-1/2 right-1.5 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8 px-6 pt-6 pb-8" role="tabpanel">
          {!q && active.sections.map((s) => renderSection(s, s.items))}

          {q && results.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Search className="text-on-surface-variant h-10 w-10 stroke-[1.5]" />
              <h3 className="text-on-surface mt-3 text-base font-medium">
                No settings match “{query}”
              </h3>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-primary mt-2 cursor-pointer text-sm font-medium hover:underline"
              >
                Clear search
              </button>
            </div>
          )}

          {q &&
            results.map(({ tab: t, sections }) => (
              <div key={t.id} className="space-y-5">
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setTab(t.id);
                  }}
                  className="text-primary flex cursor-pointer items-center gap-2 text-sm font-semibold hover:underline"
                >
                  <t.icon className="h-4 w-4" />
                  {t.label}
                </button>
                {sections.map(({ s, items }) => renderSection(s, items))}
              </div>
            ))}
        </div>
      </section>

      {/* ─── Unsaved changes bar ─── */}
      {dirtyCount > 0 && (
        <div
          role="status"
          className="bg-on-surface text-surface shadow-elevation-2 fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 items-center gap-3 rounded-2xl py-2.5 pr-2.5 pl-5 text-sm"
        >
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {dirtyCount} unsaved {dirtyCount === 1 ? "change" : "changes"}
          </span>
          <button
            type="button"
            onClick={discard}
            className="h-9 cursor-pointer rounded-full px-4 font-medium hover:bg-white/10"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="bg-surface text-on-surface inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-5 font-semibold disabled:opacity-60"
          >
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save
          </button>
        </div>
      )}

      {/* ─── Reset dialog ─── */}
      {resetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setResetOpen(false)}
        >
          <div
            role="alertdialog"
            aria-labelledby="reset-title"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest shadow-elevation-2 w-full max-w-sm rounded-[28px] p-6"
          >
            <h3 id="reset-title" className="text-on-surface text-2xl font-normal">
              Reset all settings?
            </h3>
            <p className="text-on-surface-variant mt-3 text-sm leading-relaxed">
              Every platform setting goes back to its default value, including any saved
              changes. This can&apos;t be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setResetOpen(false)}
                className="text-primary hover:bg-primary/10 h-10 cursor-pointer rounded-full px-5 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={reset}
                className="h-10 cursor-pointer rounded-full bg-[#ef4444] px-6 text-sm font-medium text-white"
              >
                Reset settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Snackbar ─── */}
      {snack && dirtyCount === 0 && (
        <div
          role="status"
          className="bg-on-surface text-surface shadow-elevation-2 fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-5 py-3 text-sm"
        >
          {snack}
        </div>
      )}
    </div>
  );
}
