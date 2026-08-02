import { createClient } from "@/lib/supabase/server";
import type { DailyDataPoint } from "@/components/admin/vercel-analytics-chart";

export interface AnalyticsSummary {
  dailyData: DailyDataPoint[];
  totalPageViews: number;
  totalVisitors: number;
  topPages: { path: string; views: number }[];
  topReferrers: { source: string; count: number }[];
}

export async function getAnalyticsData(): Promise<AnalyticsSummary> {
  const supabase = await createClient();

  // Get page views from the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: pageViews } = await supabase
    .from("page_views")
    .select("*")
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: true });

  const rows = pageViews ?? [];

  // Group by date for daily breakdown
  const dailyMap = new Map<string, { pageViews: number; visitors: Set<string> }>();
  const today = new Date();

  for (let i = 7; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]; // YYYY-MM-DD
    dailyMap.set(key, { pageViews: 0, visitors: new Set() });
  }

  for (const row of rows) {
    const dayKey = new Date(row.created_at).toISOString().split("T")[0];
    const entry = dailyMap.get(dayKey);
    if (entry) {
      entry.pageViews++;
      // Use user_agent as a rough unique visitor fingerprint
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

  // Total counts
  const totalPageViews = rows.length;
  const allVisitors = new Set(rows.map((r) => r.user_agent).filter(Boolean));
  const totalVisitors = allVisitors.size;

  // Top pages
  const pageMap = new Map<string, number>();
  for (const row of rows) {
    pageMap.set(row.path, (pageMap.get(row.path) || 0) + 1);
  }
  const topPages = [...pageMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([path, views]) => ({ path, views }));

  // Top referrers
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
