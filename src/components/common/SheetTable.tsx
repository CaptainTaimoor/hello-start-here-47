import { useMemo, useState } from "react";
import { Download, Filter, Plus, RefreshCw, Search, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/lib/app-store";
import { getSheetDef } from "@/lib/sheet-defs";
import { StatusBadge } from "./StatusBadge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { SheetRow } from "@/lib/types";

export function SheetTable({ sheetKey }: { sheetKey: string }) {
  const def = getSheetDef(sheetKey);
  const { sheets, updateSheetCell, addSheetRow } = useApp();
  const rows = sheets[sheetKey] ?? [];
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<SheetRow | null>(null);

  const filtered = useMemo(() => {
    if (!query) return rows;
    const q = query.toLowerCase();
    return rows.filter((r) =>
      Object.values(r).some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [rows, query]);

  if (!def) return <div className="text-sm text-muted-foreground">Unknown sheet.</div>;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 px-4 py-3 border-b bg-card">
        <div>
          <div className="text-sm font-semibold">{def.name}</div>
          <div className="text-xs text-muted-foreground">{def.description}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rows"
              className="h-8 pl-8 w-56"
            />
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="size-3.5 mr-1.5" /> Filter
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => toast.success("Sheet synced", { description: "Last synced just now" })}
          >
            <RefreshCw className="size-3.5 mr-1.5" /> Sync
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => toast("Import (mock)")}>
            <Upload className="size-3.5 mr-1.5" /> Import
          </Button>
          <Button variant="outline" size="sm" className="h-8" onClick={() => toast("Export (mock)")}>
            <Download className="size-3.5 mr-1.5" /> Export
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={() => {
              const row: SheetRow = { id: `r${Date.now()}` } as SheetRow;
              def.columns.forEach((c) => {
                (row as Record<string, string | number>)[c.key] = c.type === "number" ? 0 : "";
              });
              addSheetRow(sheetKey, row);
              toast.success("Row added");
            }}
          >
            <Plus className="size-3.5 mr-1.5" /> Add row
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="bg-muted/40">
              <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground w-12">
                #
              </th>
              {def.columns.map((c) => (
                <th
                  key={c.key}
                  className="px-3 py-2 text-left text-[11px] uppercase tracking-wide font-semibold text-muted-foreground border-l border-border whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr
                key={r.id}
                className="group hover:bg-accent/30 cursor-pointer"
                onClick={() => setActive(r)}
              >
                <td className="sticky left-0 bg-card group-hover:bg-accent/30 px-3 py-2 text-xs text-muted-foreground border-t border-border w-12">
                  {i + 1}
                </td>
                {def.columns.map((c) => {
                  const v = (r as Record<string, string | number>)[c.key];
                  return (
                    <td
                      key={c.key}
                      className="px-3 py-1.5 border-t border-l border-border align-middle whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.type === "status" ? (
                        <StatusBadge value={String(v || "Pending")} />
                      ) : c.type === "user" ? (
                        <div className="flex items-center gap-2">
                          <span className="inline-grid place-items-center size-5 rounded-full bg-primary/15 text-primary text-[10px] font-semibold">
                            {String(v || "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                          </span>
                          <span className="text-xs">{String(v || "—")}</span>
                        </div>
                      ) : (
                        <input
                          className="bg-transparent w-full focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 -mx-1 text-xs"
                          value={String(v ?? "")}
                          onChange={(e) =>
                            updateSheetCell(
                              sheetKey,
                              r.id,
                              c.key,
                              c.type === "number" ? Number(e.target.value) : e.target.value,
                            )
                          }
                          onBlur={() => toast.success("Saved", { duration: 1200 })}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={def.columns.length + 1} className="px-3 py-12 text-center text-sm text-muted-foreground border-t">
                  No rows yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 border-t flex items-center justify-between text-xs text-muted-foreground">
        <div>{filtered.length} rows · Google Sheets sync placeholder</div>
        <div>Last synced 2 min ago</div>
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{def.name} — Row detail</SheetTitle>
            <SheetDescription>View and discuss this row.</SheetDescription>
          </SheetHeader>
          {active && (
            <div className="mt-4 space-y-3 px-1">
              {def.columns.map((c) => (
                <div key={c.key}>
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </div>
                  <div className="text-sm mt-0.5">{String((active as Record<string, string | number>)[c.key] || "—")}</div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="text-xs font-semibold mb-2">Comments</div>
                <div className="text-xs text-muted-foreground">No comments yet (mock).</div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}