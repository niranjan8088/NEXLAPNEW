"use client";

import { ChangeEvent, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";

interface ProductCatalogImportProps {
  onImported: () => void;
}

type ImportAction = "add" | "variant" | "update" | "skip" | "review";
type ImportStatus = "ready" | "review" | "invalid" | "duplicate";
type ImportSource = {
  sku: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number | null;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number | null;
  imageUrl: string;
  condition: string;
  specs: Record<string, string>;
  parentSku: string;
  variantGroup: string;
  variantType: string;
  variantValue: string;
  variantSku: string;
  variantPrice: number | null;
  variantStock: number | null;
  variantImageUrl: string;
  variantSpecs: Record<string, string>;
};
interface ImportPreviewRow {
  rowNumber: number;
  source: ImportSource;
  errors: string[];
  warnings: string[];
  status: ImportStatus;
  action: ImportAction;
  canAdd: boolean;
  canAddVariant: boolean;
  canUpdate: boolean;
  isVariantMatch: boolean;
  targetProductId?: string;
  targetProductTitle?: string;
  updateFields: string[];
  selected: boolean;
  fields: string[];
}
interface ImportResult {
  rowNumber: number;
  sku: string;
  action: ImportAction;
  status: "imported" | "updated" | "failed" | "skipped";
  message: string;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const TEMPLATE_COLUMNS = [
  "sku", "title", "description", "category", "brand", "price", "compareAtPrice",
  "costPrice", "stock", "imageUrl", "condition", "specs", "parentSku",
  "variantGroup", "variantType", "variantValue", "variantSku", "variantPrice",
  "variantStock", "variantImageUrl", "variantSpecs",
];
const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  category: "Category",
  brand: "Brand",
  price: "Price",
  compareAtPrice: "Compare-at price",
  costPrice: "Cost price",
  stock: "Stock",
  imageUrl: "Image",
  condition: "Condition",
  specs: "Specifications",
  variantType: "Variant type",
  variantValue: "Variant value",
  variantPrice: "Variant price",
  variantStock: "Variant stock",
  variantImageUrl: "Variant image",
  variantSpecs: "Variant specifications",
};
const STATUS_LABELS: Record<ImportStatus, string> = {
  ready: "Ready",
  review: "Review required",
  invalid: "Invalid",
  duplicate: "SKU match / conflict",
};

function toCsvCell(value: unknown) {
  let safeValue = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(safeValue)) safeValue = `'${safeValue}`;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function makeReport(previewRows: ImportPreviewRow[], results: ImportResult[]) {
  const resultByRow = new Map(results.map((result) => [result.rowNumber, result]));
  const rows = previewRows.filter((row) => {
    const result = resultByRow.get(row.rowNumber);
    return row.status !== "ready" || result?.status === "failed";
  });
  const header = ["row", "sku", "title", "action", "status", "messages"];
  const data = rows.map((row) => {
    const result = resultByRow.get(row.rowNumber);
    return [
      row.rowNumber,
      row.source.variantSku || row.source.sku,
      row.source.title,
      result?.action || row.action,
      result?.status || row.status,
      [...row.errors, ...row.warnings, ...(result?.status === "failed" ? [result.message] : [])].join(" | "),
    ];
  });
  results.filter((result) => result.status === "failed" && !rows.some((row) => row.rowNumber === result.rowNumber))
    .forEach((result) => data.push([result.rowNumber, result.sku, "", result.action, result.status, result.message]));
  return [header, ...data].map((row) => row.map(toCsvCell).join(",")).join("\r\n");
}

export default function ProductCatalogImport({ onImported }: ProductCatalogImportProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ImportPreviewRow[]>([]);
  const [fileError, setFileError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [filter, setFilter] = useState<"all" | ImportStatus>("all");

  const visibleRows = useMemo(
    () => filter === "all" ? rows : rows.filter((row) => row.status === filter),
    [filter, rows]
  );
  const selectedRows = rows.filter((row) =>
    row.selected && row.action !== "skip" && row.action !== "review" &&
    (row.action !== "update" || row.fields.length > 0)
  );
  const readyToAddCount = rows.filter((row) => row.action === "add" && row.canAdd).length;
  const variantCount = rows.filter((row) => row.action === "variant" && row.canAddVariant).length;
  const updateCount = rows.filter((row) => row.action === "update" && row.canUpdate).length;
  const invalidCount = rows.filter((row) => row.status === "invalid").length;
  const duplicateCount = rows.filter((row) => row.status === "duplicate").length;
  const reviewCount = rows.filter((row) => row.status === "review").length;
  const succeededCount = results.filter((result) => result.status === "imported" || result.status === "updated").length;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFileError("");
    setRows([]);
    setResults([]);
    setConfirming(false);
    setFileName(file.name);
    if (!/\.(xlsx|csv)$/i.test(file.name)) {
      setFileError("Choose an .xlsx or .csv file.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_FILE_BYTES) {
      setFileError("Choose a non-empty spreadsheet smaller than 10 MB.");
      return;
    }

    setParsing(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/catalog-import", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not preview this catalog.");
      setRows((data.rows as ImportPreviewRow[]).map((row) => ({
        ...row,
        selected: row.action === "add" && row.canAdd,
        fields: [],
      })));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Could not read this spreadsheet.");
    } finally {
      setParsing(false);
    }
  };

  const updateRow = (rowNumber: number, update: Partial<ImportPreviewRow>) => {
    setRows((current) => current.map((row) => row.rowNumber === rowNumber ? { ...row, ...update } : row));
  };

  const selectSafeProducts = () => {
    setRows((current) => current.map((row) => ({
      ...row,
      selected: row.canAdd && row.action === "add",
    })));
    setConfirming(false);
  };

  const selectAllVariants = () => {
    setRows((current) => current.map((row) => ({
      ...row,
      selected: row.canAddVariant && row.action === "variant",
    })));
    setConfirming(false);
  };

  const downloadTemplate = (format: "xlsx" | "csv") => {
    if (format === "csv") {
      const content = `${TEMPLATE_COLUMNS.map(toCsvCell).join(",")}\r\n`;
      const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "NexByte_Catalog_Import_Template.csv";
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const workbook = XLSX.utils.book_new();
    const template = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS]);
    template["!cols"] = TEMPLATE_COLUMNS.map((column) => ({ wch: Math.max(14, column.length + 2) }));
    XLSX.utils.book_append_sheet(workbook, template, "Import Template");
    const instructions = [
      ["Column", "Instructions"],
      ["Original columns", "sku, title, description, category, brand, price, compareAtPrice, costPrice, stock, imageUrl, condition, specs are retained unchanged."],
      ["Variant columns", "parentSku, variantGroup, variantType, variantValue, variantSku, variantPrice, variantStock, variantImageUrl, variantSpecs are appended."],
      ["SKU", "Use one unique SKU per sellable product or variant. For a variant, sku and variantSku must match."],
      ["Variants", "Set parentSku to an exact parent SKU. Variant rows require brand, category, variantType, variantValue, variantPrice, and variantStock. Variants are never inferred."],
      ["Pricing and stock", "Do not leave sellable price or stock unknown. A variant's own price and stock are never copied from its parent."],
      ["Specifications", 'Use JSON objects, for example {"interface":"PCIe Gen 4"}. Do not enter formulas.'],
      ["Updates", "Existing SKU rows are never overwritten automatically. Select Update and explicitly select non-empty fields."],
      ["Blank fields", "Blank values preserve existing data; this template does not provide a clear-field operation."],
      ["Images", "Use a verified http(s) URL or a site-relative path. Do not invent image locations."],
      ["Price source", "Provide only verified supplier/manufacturer data. This importer does not verify live market prices."],
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(instructions), "Instructions");
    XLSX.writeFile(workbook, "NexByte_Catalog_Import_Template.xlsx");
  };

  const downloadErrorReport = () => {
    const content = makeReport(rows, results);
    const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "NexByte_Catalog_Import_Report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const confirmImport = async () => {
    setImporting(true);
    setFileError("");
    try {
      const response = await fetch("/api/admin/catalog-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "commit",
          rows: rows.map((row) => ({ ...row.source, __rowNumber: row.rowNumber })),
          choices: rows.map(({ rowNumber, selected, action, fields }) => ({ rowNumber, selected, action, fields })),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Catalog import failed.");
      const completedResults = data.results as ImportResult[];
      setResults(completedResults);
      const completedRows = new Set(
        completedResults
          .filter((result) => result.status === "imported" || result.status === "updated")
          .map((result) => result.rowNumber)
      );
      setRows((current) => current.map((row) =>
        completedRows.has(row.rowNumber) ? { ...row, selected: false } : row
      ));
      setConfirming(false);
      if (data.summary?.succeeded > 0) onImported();
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Catalog import failed.");
    } finally {
      setImporting(false);
    }
  };

  const close = () => {
    if (importing || parsing) return;
    setOpen(false);
    setFileName("");
    setRows([]);
    setResults([]);
    setFileError("");
    setConfirming(false);
  };

  const availableActions = (row: ImportPreviewRow): Array<{ value: ImportAction; label: string; available: boolean }> => [
    { value: "add", label: "Add new product", available: row.canAdd },
    { value: "variant", label: "Add variant", available: row.canAddVariant },
    { value: "update", label: "Update existing", available: row.canUpdate },
    { value: "skip", label: "Skip", available: true },
    { value: "review", label: "Review required", available: true },
  ];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">
        <FileSpreadsheet className="h-4 w-4" /> Import catalog
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="catalog-import-title" className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Admin catalog tools</p>
                <h2 id="catalog-import-title" className="mt-1 text-lg font-extrabold">Import and review products</h2>
              </div>
              <button type="button" onClick={close} aria-label="Close catalog import" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </header>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-bold text-slate-900">Upload, inspect, then confirm</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    CSV or XLSX, up to 10 MB and 100 product rows. The server validates the file and previews duplicate SKUs and possible product matches without writing to the catalog. Variants must name an exact parentSku and include their own SKU, price, and stock.
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    Existing SKUs are never overwritten automatically. Updates require explicit field selection; blank fields preserve existing data. Similar products are marked for review rather than merged.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button type="button" onClick={() => downloadTemplate("xlsx")} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100">
                    <Download className="h-3.5 w-3.5" /> XLSX template
                  </button>
                  <button type="button" onClick={() => downloadTemplate("csv")} className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100">
                    <Download className="h-3.5 w-3.5" /> CSV template
                  </button>
                </div>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-7 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                {parsing ? <Loader2 className="h-7 w-7 animate-spin text-blue-700" /> : <Upload className="h-7 w-7 text-blue-700" />}
                <span className="text-sm font-bold text-slate-800">{parsing ? "Validating on server..." : fileName || "Choose a catalog file"}</span>
                <span className="text-xs text-slate-500">CSV or XLSX; formulas are rejected</span>
                <input type="file" accept=".csv,.xlsx" onChange={handleFile} disabled={parsing || importing} className="sr-only" />
              </label>

              {fileError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{fileError}</div>}
              {succeededCount > 0 && <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{succeededCount} catalog change{succeededCount === 1 ? "" : "s"} completed. See row results below.</div>}

              {rows.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
                    {[
                      ["Rows", rows.length, "text-slate-900"],
                      ["New products", readyToAddCount, "text-emerald-700"],
                      ["New variants", variantCount, "text-blue-700"],
                      ["Updates", updateCount, "text-indigo-700"],
                      ["SKU matches", duplicateCount, "text-amber-700"],
                      ["Review", reviewCount, "text-orange-700"],
                      ["Invalid", invalidCount, "text-rose-700"],
                    ].map(([label, value, color]) => (
                      <div key={String(label)} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                        <p className={`text-lg font-extrabold ${color}`}>{value}</p>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={selectSafeProducts} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Select safe new products</button>
                      <button type="button" onClick={selectAllVariants} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Select verified variant rows</button>
                      {(results.length > 0 || rows.some((row) => row.status !== "ready")) && <button type="button" onClick={downloadErrorReport} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50">Download error report</button>}
                    </div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      Filter
                      <select value={filter} onChange={(event) => setFilter(event.target.value as "all" | ImportStatus)} className="rounded-md border border-slate-300 bg-white px-2 py-1.5">
                        <option value="all">All statuses</option>
                        <option value="ready">Ready</option>
                        <option value="duplicate">SKU matches / conflicts</option>
                        <option value="review">Review required</option>
                        <option value="invalid">Invalid</option>
                      </select>
                    </label>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="w-10 px-3 py-2.5">Use</th>
                          <th className="px-3 py-2.5">Row / status</th>
                          <th className="px-3 py-2.5">SKU / product</th>
                          <th className="px-3 py-2.5">Variant</th>
                          <th className="px-3 py-2.5">Price / stock</th>
                          <th className="px-3 py-2.5">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {visibleRows.map((row) => {
                          const result = results.find((entry) => entry.rowNumber === row.rowNumber);
                          const rowSku = row.source.variantSku || row.source.sku;
                          const selectable = row.errors.length === 0 && row.action !== "review" && row.action !== "skip";
                          return (
                            <tr key={row.rowNumber} className="align-top hover:bg-slate-50/70">
                              <td className="px-3 py-3">
                                <input
                                  aria-label={`Select row ${row.rowNumber}`}
                                  type="checkbox"
                                  checked={row.selected}
                                  disabled={!selectable || importing}
                                  onChange={(event) => updateRow(row.rowNumber, { selected: event.target.checked, ...(event.target.checked ? {} : { fields: [] }) })}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600 disabled:opacity-40"
                                />
                              </td>
                              <td className="px-3 py-3">
                                <p className="font-bold text-slate-800">Row {row.rowNumber}</p>
                                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                  row.status === "ready" ? "bg-emerald-50 text-emerald-700" :
                                  row.status === "duplicate" ? "bg-amber-50 text-amber-700" :
                                  row.status === "review" ? "bg-orange-50 text-orange-700" : "bg-rose-50 text-rose-700"
                                }`}>{STATUS_LABELS[row.status]}</span>
                                {result && <p className={`mt-1 font-bold ${result.status === "failed" ? "text-rose-700" : "text-emerald-700"}`}>{result.status}: {result.message}</p>}
                              </td>
                              <td className="max-w-[320px] px-3 py-3">
                                <p className="font-bold text-slate-900">{row.source.title || "Untitled row"}</p>
                                <p className="mt-0.5 text-slate-600">{rowSku || "Missing SKU"} · {row.source.brand || "Brand not supplied"}</p>
                                <p className="mt-0.5 text-[10px] text-slate-500">{row.source.category || "No category"}{row.targetProductTitle ? ` · Parent: ${row.targetProductTitle}` : ""}</p>
                                {[...row.errors, ...row.warnings].map((message, index) => (
                                  <p key={`${row.rowNumber}-${index}`} className={`mt-1 leading-4 ${index < row.errors.length ? "text-rose-700" : "text-amber-700"}`}>{message}</p>
                                ))}
                              </td>
                              <td className="px-3 py-3 text-slate-700">
                                {row.source.variantType || row.source.variantValue ? (
                                  <>
                                    <p className="font-semibold">{row.source.variantType}: {row.source.variantValue}</p>
                                    <p className="mt-0.5 text-[10px] text-slate-500">Parent SKU: {row.source.parentSku || "Missing"}</p>
                                    {row.source.variantGroup && <p className="mt-0.5 text-[10px] text-slate-500">Group: {row.source.variantGroup}</p>}
                                  </>
                                ) : "—"}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-slate-700">
                                <p>₹{row.source.variantPrice ?? row.source.price ?? "—"}</p>
                                <p className="mt-0.5 text-[10px] text-slate-500">Stock: {row.source.variantStock ?? row.source.stock ?? "—"}</p>
                              </td>
                              <td className="min-w-[190px] px-3 py-3">
                                <select
                                  aria-label={`Action for row ${row.rowNumber}`}
                                  value={row.action}
                                  disabled={importing || Boolean(result && result.status !== "failed")}
                                  onChange={(event) => {
                                    const action = event.target.value as ImportAction;
                                    const actionAvailable = availableActions(row).find((option) => option.value === action)?.available;
                                    updateRow(row.rowNumber, {
                                      action,
                                      selected: Boolean(actionAvailable && action !== "skip" && action !== "review" && action !== "update" && row.errors.length === 0),
                                      fields: [],
                                    });
                                    setConfirming(false);
                                  }}
                                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] font-semibold"
                                >
                                  {availableActions(row).map((option) => (
                                    <option key={option.value} value={option.value} disabled={!option.available}>{option.label}</option>
                                  ))}
                                </select>
                                {row.action === "update" && row.canUpdate && (
                                  <fieldset className="mt-2 space-y-1 rounded-md bg-slate-50 p-2">
                                    <legend className="px-1 text-[10px] font-bold text-slate-600">Select fields to update</legend>
                                    {row.updateFields.filter((field) => {
                                      const value = row.source[field as keyof ImportSource];
                                      return value !== null && value !== undefined && value !== "";
                                    }).map((field) => (
                                      <label key={field} className="flex items-center gap-1.5 text-[10px] text-slate-700">
                                        <input
                                          type="checkbox"
                                          checked={row.fields.includes(field)}
                                          disabled={importing}
                                          onChange={(event) => updateRow(row.rowNumber, {
                                            fields: event.target.checked ? [...row.fields, field] : row.fields.filter((selected) => selected !== field),
                                          })}
                                          className="h-3 w-3 rounded border-slate-300 text-blue-700"
                                        />
                                        {FIELD_LABELS[field] || field}
                                      </label>
                                    ))}
                                    {row.fields.length === 0 && <p className="text-[10px] text-amber-700">Choose at least one field.</p>}
                                  </fieldset>
                                )}
                                {row.action === "variant" && row.canAddVariant && (
                                  <p className="mt-2 rounded-md bg-blue-50 px-2 py-1.5 text-[10px] leading-4 text-blue-800">
                                    Select this row only after verifying the exact product family and configuration.
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-600">
                      {selectedRows.length} selected change{selectedRows.length === 1 ? "" : "s"} · {results.filter((result) => result.status === "failed").length} failed
                    </p>
                    {!confirming ? (
                      <button
                        type="button"
                        disabled={selectedRows.length === 0 || importing}
                        onClick={() => setConfirming(true)}
                        className="rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        Review {selectedRows.length} selected change{selectedRows.length === 1 ? "" : "s"}
                      </button>
                    ) : (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <span className="mr-1 text-xs font-semibold text-slate-700">Confirm {selectedRows.length} selected database change{selectedRows.length === 1 ? "" : "s"}?</span>
                        <button type="button" onClick={() => setConfirming(false)} disabled={importing} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">Back to preview</button>
                        <button type="button" onClick={confirmImport} disabled={importing || selectedRows.length === 0} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-50">
                          {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {importing ? "Importing..." : "Confirm import"}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
