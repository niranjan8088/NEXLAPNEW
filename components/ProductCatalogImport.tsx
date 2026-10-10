"use client";

import { ChangeEvent, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";

interface ProductCatalogImportProps {
  onImported: () => void;
}

interface ProductImportRow {
  rowNumber: number;
  payload: Record<string, unknown>;
  errors: string[];
  variantCount: number;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMPORT_ROWS = 100;
const HEADER_ALIASES: Record<string, string[]> = {
  sku: ["sku", "productsku", "sellersku", "itemsku"],
  title: ["title", "productname", "name", "itemname"],
  description: ["description", "productdescription", "details"],
  category: ["category", "productcategory", "department"],
  brand: ["brand", "brandname", "manufacturer"],
  price: ["price", "sellingprice", "saleprice"],
  compareAtPrice: ["compareatprice", "mrp", "listprice", "originalprice"],
  costPrice: ["costprice", "purchaseprice"],
  stock: ["stock", "quantity", "qty", "inventory", "stockquantity"],
  imageUrl: ["image", "imageurl", "productimage", "mainimage"],
  condition: ["condition", "itemcondition"],
  specs: ["specs", "specifications", "productspecs"],
  variants: ["variants", "productvariants"],
  variantName: ["variantname", "optionname"],
  variantSku: ["variantsku", "optionsku"],
  variantPrice: ["variantprice", "optionprice"],
  variantCompareAtPrice: ["variantcompareatprice", "variantmrp"],
  variantCostPrice: ["variantcostprice"],
  variantStock: ["variantstock", "optionstock"],
  variantImageUrl: ["variantimage", "variantimageurl", "optionimage"],
  variantAttributes: ["variantattributes", "optionattributes"],
};

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getField(row: Record<string, unknown>, field: string) {
  const aliases = HEADER_ALIASES[field] || [field.toLowerCase()];
  const key = Object.keys(row).find((header) => aliases.includes(normalizeHeader(header)));
  return key ? row[key] : undefined;
}

function parseRows(rawRows: Record<string, unknown>[]): ProductImportRow[] {
  const parsedRows = rawRows.map((row, index) => {
    const title = String(getField(row, "title") ?? "").trim();
    const category = String(getField(row, "category") ?? "").trim().toLowerCase().replace(/[\s&/]+/g, "_").replace(/[^a-z0-9_-]/g, "");
    const priceValue = getField(row, "price");
    const stockValue = getField(row, "stock");
    const compareValue = getField(row, "compareAtPrice");
    const costValue = getField(row, "costPrice");
    const price = Number(priceValue);
    const stock = stockValue === undefined || stockValue === "" ? 10 : Number(stockValue);
    const compareAtPrice = compareValue === undefined || compareValue === "" ? undefined : Number(compareValue);
    const costPrice = costValue === undefined || costValue === "" ? undefined : Number(costValue);
    const sku = String(getField(row, "sku") ?? "").trim().toUpperCase();
    const imageUrl = String(getField(row, "imageUrl") ?? "").trim();
    const errors: string[] = [];
    const specs: Record<string, string> = {};
    const variantName = String(getField(row, "variantName") ?? "").trim();
    const variantSku = String(getField(row, "variantSku") ?? "").trim().toUpperCase();
    const variantPriceValue = getField(row, "variantPrice");
    const variantPrice = variantPriceValue === undefined || variantPriceValue === "" ? undefined : Number(variantPriceValue);
    const variantCompareValue = getField(row, "variantCompareAtPrice");
    const variantCompareAtPrice = variantCompareValue === undefined || variantCompareValue === "" ? undefined : Number(variantCompareValue);
    const variantCostValue = getField(row, "variantCostPrice");
    const variantCostPrice = variantCostValue === undefined || variantCostValue === "" ? undefined : Number(variantCostValue);
    const variantStockValue = getField(row, "variantStock");
    const variantStock = variantStockValue === undefined || variantStockValue === "" ? undefined : Number(variantStockValue);
    const variantImage = String(getField(row, "variantImageUrl") ?? "").trim();
    let variantAttributes: Record<string, string> | undefined;

    const rawSpecs = getField(row, "specs");
    if (rawSpecs && typeof rawSpecs === "object" && !Array.isArray(rawSpecs)) {
      Object.entries(rawSpecs as Record<string, unknown>).forEach(([key, value]) => {
        if (value !== undefined && value !== null && String(value).trim()) specs[key] = String(value).trim();
      });
    } else if (rawSpecs !== undefined && String(rawSpecs).trim()) {
      try {
        const parsedSpecs = JSON.parse(String(rawSpecs));
        if (!parsedSpecs || typeof parsedSpecs !== "object" || Array.isArray(parsedSpecs)) throw new Error();
        Object.entries(parsedSpecs as Record<string, unknown>).forEach(([key, value]) => {
          if (value !== undefined && value !== null && String(value).trim()) specs[key] = String(value).trim();
        });
      } catch {
        errors.push("Specs must be valid JSON with key/value pairs.");
      }
    }

    const knownHeaders = new Set(Object.values(HEADER_ALIASES).flat());
    Object.entries(row).forEach(([header, value]) => {
      const normalizedHeader = normalizeHeader(header);
      if (!normalizedHeader || knownHeaders.has(normalizedHeader) || value === undefined || value === null || !String(value).trim()) return;
      const label = header.replace(/^spec(?:ification)?s?[\s_-]*/i, "").trim();
      specs[label || header.trim()] = String(value).trim();
    });

    if (!title) errors.push("Product name is required.");
    if (!category) errors.push("Category is required.");
    if (priceValue === undefined || priceValue === "" || !Number.isFinite(price) || price < 0) errors.push("Price must be a valid non-negative number.");
    if (!Number.isFinite(stock) || stock < 0) errors.push("Stock must be a valid non-negative number.");
    if (compareAtPrice !== undefined && (!Number.isFinite(compareAtPrice) || compareAtPrice < 0)) errors.push("MRP/compare-at price is invalid.");
    if (costPrice !== undefined && (!Number.isFinite(costPrice) || costPrice < 0)) errors.push("Cost price is invalid.");
    if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith("/")) errors.push("Image must be an http(s) URL or a site-relative path.");
    if (variantPrice !== undefined && (!Number.isFinite(variantPrice) || variantPrice < 0)) errors.push("Variant price must be a valid non-negative number.");
    if (variantCompareAtPrice !== undefined && (!Number.isFinite(variantCompareAtPrice) || variantCompareAtPrice < 0)) errors.push("Variant compare-at price is invalid.");
    if (variantCostPrice !== undefined && (!Number.isFinite(variantCostPrice) || variantCostPrice < 0)) errors.push("Variant cost price is invalid.");
    if (variantStock !== undefined && (!Number.isInteger(variantStock) || variantStock < 0)) errors.push("Variant stock must be a non-negative whole number.");
    if (variantImage && !/^https?:\/\//i.test(variantImage) && !variantImage.startsWith("/")) errors.push("Variant image must be an http(s) URL or a site-relative path.");

    const rawAttributes = getField(row, "variantAttributes");
    if (rawAttributes && typeof rawAttributes === "object" && !Array.isArray(rawAttributes)) {
      variantAttributes = Object.fromEntries(
        Object.entries(rawAttributes as Record<string, unknown>)
          .filter(([, value]) => value !== undefined && value !== null && String(value).trim())
          .map(([key, value]) => [key.trim(), String(value).trim()])
      );
    } else if (rawAttributes !== undefined && String(rawAttributes).trim()) {
      try {
        const parsed = JSON.parse(String(rawAttributes));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
        const entries = Object.entries(parsed as Record<string, unknown>)
          .filter(([, value]) => value !== undefined && value !== null && String(value).trim());
        if (entries.some(([, value]) => typeof value === "object")) throw new Error();
        variantAttributes = Object.fromEntries(entries.map(([key, value]) => [key.trim(), String(value).trim()]));
      } catch {
        errors.push("Variant attributes must be valid JSON with key/value pairs.");
      }
    }

    const image = imageUrl ? [{ url: imageUrl, is_primary: true, sort_order: 1 }] : [];
    const payload: Record<string, unknown> = {
      sku: sku || undefined,
      title,
      description: String(getField(row, "description") ?? "").trim(),
      category,
      brand: String(getField(row, "brand") ?? "").trim() || undefined,
      price,
      compareAtPrice,
      costPrice,
      stock,
      images: image,
      specs,
      condition: String(getField(row, "condition") ?? "new").trim().toLowerCase() || "new",
    };
    const normalizedParentPayload = JSON.stringify(payload);

    let explicitVariants: Record<string, unknown>[] = [];
    const rawVariants = getField(row, "variants");
    if (rawVariants && String(rawVariants).trim()) {
      try {
        const parsed = typeof rawVariants === "string" ? JSON.parse(rawVariants) : rawVariants;
        if (!Array.isArray(parsed)) throw new Error();
        explicitVariants = parsed as Record<string, unknown>[];
        if (explicitVariants.some((variant) => !variant || typeof variant !== "object" || Array.isArray(variant))) throw new Error();
      } catch {
        errors.push("Variants must be a valid JSON array of variant objects.");
      }
    }

    const hasVariantColumns = Boolean(
      variantName || variantSku || variantPrice !== undefined || variantCompareAtPrice !== undefined ||
      variantCostPrice !== undefined || variantStock !== undefined || variantImage || variantAttributes
    );
    if (hasVariantColumns && (!variantName || variantPrice === undefined)) {
      errors.push("Variant name and variant price are required when variant columns are used.");
    }
    if (hasVariantColumns) {
      explicitVariants.push({
        name: variantName,
        sku: variantSku || undefined,
        price: variantPrice,
        compareAtPrice: variantCompareAtPrice,
        costPrice: variantCostPrice,
        stock: variantStock,
        image: variantImage || undefined,
        attributes: variantAttributes,
      });
    }

    explicitVariants.forEach((variant, variantIndex) => {
      const name = String(variant.name ?? "").trim();
      const variantPrice = Number(variant.price);
      if (!name) errors.push(`Variant ${variantIndex + 1} needs an explicit name.`);
      if (variant.price === undefined || variant.price === null || variant.price === "" || !Number.isFinite(variantPrice) || variantPrice < 0) {
        errors.push(`Variant ${variantIndex + 1} needs a valid non-negative price.`);
      }
      const compareAtPrice = variant.compareAtPrice;
      if (compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice !== "" &&
        (!Number.isFinite(Number(compareAtPrice)) || Number(compareAtPrice) < 0)) {
        errors.push(`Compare-at price for variant "${name || variantIndex + 1}" is invalid.`);
      }
      const costPrice = variant.costPrice;
      if (costPrice !== undefined && costPrice !== null && costPrice !== "" &&
        (!Number.isFinite(Number(costPrice)) || Number(costPrice) < 0)) {
        errors.push(`Cost price for variant "${name || variantIndex + 1}" is invalid.`);
      }
      const stock = variant.stock;
      if (stock !== undefined && stock !== null && stock !== "" &&
        (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
        errors.push(`Stock for variant "${name || variantIndex + 1}" must be a non-negative whole number.`);
      }
      const image = String(variant.image ?? variant.variantImageUrl ?? "").trim();
      if (image && !/^https?:\/\//i.test(image) && !image.startsWith("/")) {
        errors.push(`Image for variant "${name || variantIndex + 1}" must be an http(s) URL or a site-relative path.`);
      }
      if (variant.attributes !== undefined &&
        (!variant.attributes || typeof variant.attributes !== "object" || Array.isArray(variant.attributes) ||
          Object.values(variant.attributes as Record<string, unknown>).some((value) =>
            value !== null && typeof value === "object"
          ))) {
        errors.push(`Attributes for variant "${name || variantIndex + 1}" must contain only text or numeric values.`);
      }
    });

    return {
      rowNumber: index + 2,
      sku,
      payload,
      normalizedParentPayload,
      variants: explicitVariants,
      errors,
    };
  });

  const groups = new Map<string, typeof parsedRows>();
  parsedRows.forEach((row) => {
    const key = row.sku ? `sku:${row.sku}` : `row:${row.rowNumber}`;
    groups.set(key, [...(groups.get(key) || []), row]);
  });

  return [...groups.values()].map((group) => {
    const first = group[0];
    const errors = group.flatMap((row) => row.errors.map((error) => `Row ${row.rowNumber}: ${error}`));
    const hasRepeatedSku = group.length > 1;
    const variants = group.flatMap((row) => row.variants);
    if (hasRepeatedSku && group.some((row) => row.variants.length === 0)) {
      errors.push("Repeated product SKUs are only allowed when every row defines an explicit variant name and price.");
    }
    if (group.some((row) => row.normalizedParentPayload !== first.normalizedParentPayload)) {
      errors.push("Rows with the same product SKU must have identical parent product details; put variant-specific data in variant columns.");
    }

    const variantNames = new Set<string>();
    const variantSkus = new Set<string>();
    variants.forEach((variant) => {
      const name = String(variant.name ?? "").trim().toLowerCase();
      const sku = String(variant.sku ?? "").trim().toUpperCase();
      if (name && variantNames.has(name)) errors.push(`Variant name "${String(variant.name).trim()}" is duplicated.`);
      if (sku && variantSkus.has(sku)) errors.push(`Variant SKU "${sku}" is duplicated.`);
      if (name) variantNames.add(name);
      if (sku) variantSkus.add(sku);
    });
    if (variants.length) first.payload.variants = variants;

    return {
      rowNumber: first.rowNumber,
      payload: first.payload,
      errors: [...new Set(errors)],
      variantCount: variants.length,
    };
  });
}

export default function ProductCatalogImport({ onImported }: ProductCatalogImportProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState<ProductImportRow[]>([]);
  const [fileError, setFileError] = useState("");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState("");
  const validRows = useMemo(() => rows.filter((row) => row.errors.length === 0), [rows]);
  const invalidCount = rows.length - validRows.length;

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setFileError("");
    setResult("");
    setRows([]);
    if (file.size > MAX_FILE_BYTES) {
      setFileError("Choose a spreadsheet smaller than 10 MB.");
      return;
    }

    setParsing(true);
    setFileName(file.name);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("The selected file does not contain a worksheet.");
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: false });
      if (rawRows.length === 0) throw new Error("The first worksheet is empty.");
      if (rawRows.length > MAX_IMPORT_ROWS) throw new Error(`Import is limited to ${MAX_IMPORT_ROWS} rows per file.`);
      setRows(parseRows(rawRows));
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Could not read this spreadsheet.");
    } finally {
      setParsing(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ["sku", "title", "description", "category", "brand", "price", "compareAtPrice", "costPrice", "stock", "imageUrl", "condition", "specs", "variantName", "variantSKU", "variantPrice", "variantCompareAtPrice", "variantCostPrice", "variantStock", "variantImageUrl", "variantAttributes", "variants"];
    const example = ["NL-SSD-001", "Example NVMe SSD", "Example product description", "storage", "Example Brand", "5999", "7499", "4200", "12", "https://example.com/product.jpg", "new", '{"interface":"PCIe Gen 4","formFactor":"M.2 2280"}', "1TB", "NL-SSD-001-1TB", "5999", "7499", "4200", "12", "https://example.com/1tb.jpg", '{"capacity":"1TB"}', ""];
    const csv = [headers, example].map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "nex-laptech-product-import-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importRows = async () => {
    setImporting(true);
    setFileError("");
    let imported = 0;
    const failures: string[] = [];
    for (const row of validRows) {
      setProgress(`Importing product ${imported + failures.length + 1} of ${validRows.length}...`);
      try {
        const response = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row.payload),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Product could not be imported.");
        imported += 1;
      } catch (error) {
        failures.push(`Row ${row.rowNumber}: ${error instanceof Error ? error.message : "Import failed."}`);
      }
    }
    setProgress("");
    setImporting(false);
    setResult(`${imported} product${imported === 1 ? "" : "s"} imported${failures.length ? `; ${failures.length} failed` : " successfully"}.`);
    if (imported > 0) onImported();
    if (failures.length) setFileError(failures.slice(0, 5).join(" "));
  };

  const close = () => {
    if (importing) return;
    setOpen(false);
    setFileName("");
    setRows([]);
    setFileError("");
    setResult("");
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800">
        <FileSpreadsheet className="h-4 w-4" /> Import catalog
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="catalog-import-title" className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Catalog tools</p>
                <h2 id="catalog-import-title" className="mt-1 text-lg font-extrabold">Import products</h2>
              </div>
              <button type="button" onClick={close} aria-label="Close catalog import" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </header>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-900">Your catalog, in one upload</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">CSV, XLSX, or XLS. Up to 100 rows and 10 MB. Required columns: title, category, price. Import only variants explicitly listed in variant columns or a JSON variants array. Repeated product SKUs group rows only when their parent details match.</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Variant columns: variantName, variantSKU, variantPrice, variantCompareAtPrice, variantCostPrice, variantStock, variantImageUrl, and variantAttributes (JSON). No colors, capacities, or combinations are inferred.</p>
                </div>
                <button type="button" onClick={downloadTemplate} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-100">
                  <Download className="h-3.5 w-3.5" /> Download template
                </button>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/50">
                {parsing ? <Loader2 className="h-7 w-7 animate-spin text-blue-700" /> : <Upload className="h-7 w-7 text-blue-700" />}
                <span className="text-sm font-bold text-slate-800">{parsing ? "Reading spreadsheet..." : fileName || "Choose a catalog file"}</span>
                <span className="text-xs text-slate-500">CSV, Excel workbook</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} disabled={parsing || importing} className="sr-only" />
              </label>

              {fileError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{fileError}</div>}
              {result && <div role="status" className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{result}</div>}

              {rows.length > 0 && (
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <span className="font-bold text-slate-800">{rows.length} products found</span>
                    <span className="text-emerald-700">{validRows.length} ready</span>
                    {invalidCount > 0 && <span className="text-rose-700">{invalidCount} need attention</span>}
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full min-w-[620px] border-collapse text-left text-xs">
                      <thead className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                        <tr><th className="px-3 py-2.5">Row</th><th className="px-3 py-2.5">Product</th><th className="px-3 py-2.5">Category</th><th className="px-3 py-2.5">Price</th><th className="px-3 py-2.5">Variants</th><th className="px-3 py-2.5">Stock</th><th className="px-3 py-2.5">Validation</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.slice(0, 8).map((row) => (
                          <tr key={row.rowNumber} className="align-top">
                            <td className="px-3 py-2.5 text-slate-500">{row.rowNumber}</td>
                            <td className="max-w-48 truncate px-3 py-2.5 font-semibold text-slate-800">{String(row.payload.title || "Untitled")}</td>
                            <td className="px-3 py-2.5 text-slate-600">{String(row.payload.category || "-")}</td>
                            <td className="px-3 py-2.5 text-slate-700">{Number.isFinite(Number(row.payload.price)) ? `₹${Number(row.payload.price).toLocaleString("en-IN")}` : "-"}</td>
                            <td className="px-3 py-2.5 text-slate-700">{row.variantCount ? `${row.variantCount}: ${((row.payload.variants || []) as Array<{ name?: string }>).map((variant) => variant.name).join(", ")}` : "None"}</td>
                            <td className="px-3 py-2.5 text-slate-700">{String(row.payload.stock ?? "-")}</td>
                            <td className={`px-3 py-2.5 font-semibold ${row.errors.length ? "text-rose-700" : "text-emerald-700"}`}>{row.errors.length ? row.errors.join(" ") : "Ready"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {rows.length > 8 && <p className="border-t border-slate-100 px-3 py-2 text-[11px] text-slate-500">Showing the first 8 of {rows.length} rows.</p>}
                  </div>
                </>
              )}
            </div>

            <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" onClick={close} disabled={importing} className="rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-60">Close</button>
              <button type="button" onClick={importRows} disabled={importing || validRows.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {importing ? progress || "Importing..." : `Import ${validRows.length} product${validRows.length === 1 ? "" : "s"}`}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}
