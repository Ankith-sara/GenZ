import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/require-role";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductsPage() {
  await requireRole("admin");
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <div className="border-ash space-y-6 rounded-3xl border bg-white p-4 shadow-xs sm:p-6">
      <div>
        <h2 className="font-nantes text-ink-black text-xl font-bold sm:text-2xl">
          Platform Product Catalog
        </h2>
        <p className="font-graphik text-smoke text-sm">
          Overview of all manufacturer products listed on GenZ marketplace.
        </p>
      </div>

      {(products ?? []).length === 0 ? (
        <p className="font-graphik text-smoke text-sm">No products listed.</p>
      ) : (
        <div className="border-ash overflow-x-auto rounded-2xl border">
          <table className="font-graphik w-full text-left text-sm">
            <thead className="border-ash text-smoke border-b bg-[#FAF7F0] text-xs font-semibold tracking-wider uppercase">
              <tr>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (INR)</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-ash/60 divide-y bg-white">
              {(products ?? []).map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-[#FAF7F0]/60">
                  <td className="text-ink-black p-4 font-semibold">{p.name}</td>
                  <td className="text-smoke p-4">{p.category}</td>
                  <td className="p-4 font-mono text-xs">
                    ₹{p.price_inr?.toLocaleString() || "—"}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={p.status === "published" ? "verified" : "not_submitted"}
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
