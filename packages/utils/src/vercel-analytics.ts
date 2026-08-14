import { createClient } from "@genz/database/server";

export interface DailyDataPoint {
  date: string;
  fullDate: string;
  pageViews: number;
  uniqueVisitors: number;
  isDashed?: boolean;
}

export interface AnalyticsSummary {
  dailyData: DailyDataPoint[];
  totalPageViews: number;
  totalVisitors: number;
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; count: number }[];
}

export async function getAnalyticsData(): Promise<AnalyticsSummary> {
  const supabase = await createClient();

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: pageViews } = await supabase
    .from("page_views")
    .select("*")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const rows = pageViews ?? [];

  const dailyMap = new Map<string, { pageViews: number; visitors: Set<string> }>();
  const today = new Date();

  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { pageViews: 0, visitors: new Set() });
  }

  for (const row of rows) {
    const dayKey = new Date(row.created_at).toISOString().split("T")[0];
    const entry = dailyMap.get(dayKey);
    if (entry) {
      entry.pageViews++;
      if (row.user_agent) {
        entry.visitors.add(row.user_agent);
      }
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const todayStr = today.toISOString().split("T")[0];
  const dailyData: DailyDataPoint[] = [];

  for (const [dateStr, stats] of dailyMap) {
    const d = new Date(dateStr + "T00:00:00");
    const monthName = monthNames[d.getMonth()];
    const dayNum = d.getDate();
    const dayName = dayNames[d.getDay()];

    dailyData.push({
      date: `${monthName} ${dayNum}`,
      fullDate: `${monthName} ${String(dayNum).padStart(2, "0")} · ${dayName}`,
      pageViews: stats.pageViews,
      uniqueVisitors: stats.visitors.size,
      isDashed: dateStr === todayStr,
    });
  }

  const totalPageViews = rows.length;
  const allVisitors = new Set(rows.map((r) => r.user_agent).filter(Boolean));
  const totalVisitors = allVisitors.size;

  const pageMap = new Map<string, number>();
  for (const row of rows) {
    pageMap.set(row.path, (pageMap.get(row.path) || 0) + 1);
  }
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([path, views]) => ({ path, views }));

  const refMap = new Map<string, number>();
  for (const row of rows) {
    if (row.referrer) {
      try {
        const host = new URL(row.referrer).hostname || row.referrer;
        refMap.set(host, (refMap.get(host) || 0) + 1);
      } catch {
        refMap.set(row.referrer, (refMap.get(row.referrer) || 0) + 1);
      }
    }
  }
  const topReferrers = [...refMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  return {
    dailyData,
    totalPageViews,
    totalVisitors,
    topPages,
    topReferrers,
  };
}

export async function getSellerAnalyticsData(
  sellerId: string
): Promise<AnalyticsSummary> {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id")
    .eq("seller_id", sellerId);

  const productIds = products?.map((p) => p.id) || [];
  const productPaths = productIds.map((id) => `/products/${id}`);

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  interface PageViewRow {
    created_at: string;
    user_agent?: string | null;
    path: string;
    referrer?: string | null;
  }
  let rows: PageViewRow[] = [];
  if (productPaths.length > 0) {
    const { data: pageViews } = await supabase
      .from("page_views")
      .select("*")
      .in("path", productPaths)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: true });
    rows = pageViews ?? [];
  }

  if (rows.length === 0) {
    const dailyData: DailyDataPoint[] = [];
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    for (let i = 7; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const monthName = monthNames[d.getMonth()];
      const dayNum = d.getDate();
      const dayName = dayNames[d.getDay()];

      dailyData.push({
        date: `${monthName} ${dayNum}`,
        fullDate: `${monthName} ${String(dayNum).padStart(2, "0")} · ${dayName}`,
        pageViews: 0,
        uniqueVisitors: 0,
        isDashed: i === 0,
      });
    }

    return {
      dailyData,
      totalPageViews: 0,
      totalVisitors: 0,
      topPages: [],
      topReferrers: [],
    };
  }

  const dailyMap = new Map<string, { pageViews: number; visitors: Set<string> }>();
  const today = new Date();

  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { pageViews: 0, visitors: new Set() });
  }

  for (const row of rows) {
    const dayKey = new Date(row.created_at).toISOString().split("T")[0];
    const entry = dailyMap.get(dayKey);
    if (entry) {
      entry.pageViews++;
      if (row.user_agent) {
        entry.visitors.add(row.user_agent);
      }
    }
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const todayStr = today.toISOString().split("T")[0];
  const dailyData: DailyDataPoint[] = [];

  for (const [dateStr, stats] of dailyMap) {
    const d = new Date(dateStr + "T00:00:00");
    const monthName = monthNames[d.getMonth()];
    const dayNum = d.getDate();
    const dayName = dayNames[d.getDay()];

    dailyData.push({
      date: `${monthName} ${dayNum}`,
      fullDate: `${monthName} ${String(dayNum).padStart(2, "0")} · ${dayName}`,
      pageViews: stats.pageViews,
      uniqueVisitors: stats.visitors.size,
      isDashed: dateStr === todayStr,
    });
  }

  const totalPageViews = rows.length;
  const allVisitors = new Set(rows.map((r) => r.user_agent).filter(Boolean));
  const totalVisitors = allVisitors.size;

  const pageMap = new Map<string, number>();
  for (const row of rows) {
    pageMap.set(row.path, (pageMap.get(row.path) || 0) + 1);
  }
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([path, views]) => ({ path, views }));

  const refMap = new Map<string, number>();
  for (const row of rows) {
    if (row.referrer) {
      try {
        const host = new URL(row.referrer).hostname || row.referrer;
        refMap.set(host, (refMap.get(host) || 0) + 1);
      } catch {
        refMap.set(row.referrer, (refMap.get(row.referrer) || 0) + 1);
      }
    }
  }
  const topReferrers = [...refMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([source, count]) => ({ source, count }));

  return {
    dailyData,
    totalPageViews,
    totalVisitors,
    topPages,
    topReferrers,
  };
}
