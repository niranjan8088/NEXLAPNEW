import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { authErrorResponse, requireRole } from "@/lib/auth";
import { dbHelper } from "@/lib/dbHelper";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_IMPORT_ROWS = 100;
const TEMPLATE_COLUMNS = [
  "sku", "title", "description", "category", "brand", "price", "compareAtPrice",
  "costPrice", "stock", "imageUrl", "condition", "specs", "parentSku",
  "variantGroup", "variantType", "variantValue", "variantSku", "variantPrice",
  "variantStock", "variantImageUrl", "variantSpecs",
] as const;

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
type ParsedRow = {
  rowNumber: number;
  source: ImportSource;
  errors: string[];
  warnings: string[];
  duplicateInFile: boolean;
  isVariant: boolean;
};
type ProductRecord = Record<string, any>;
type PlannedRow = ParsedRow & {
  status: ImportStatus;
  action: ImportAction;
  canAdd: boolean;
  canAddVariant: boolean;
  canUpdate: boolean;
  isVariantMatch: boolean;
  targetProductId?: string;
  targetProductTitle?: string;
  updateFields: string[];
};

const PARENT_UPDATE_FIELDS = [
  "title", "description", "category", "brand", "price", "compareAtPrice",
  "costPrice", "stock", "imageUrl", "condition", "specs",
];
const VARIANT_UPDATE_FIELDS = [
  "variantType", "variantValue", "variantPrice", "variantStock",
  "variantImageUrl", "variantSpecs",
];

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function normalizeSku(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeName(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function readField(row: Record<string, unknown>, name: string): unknown {
  const expected = normalizeHeader(name);
  const key = Object.keys(row).find((header) => normalizeHeader(header) === expected);
  return key === undefined ? undefined : row[key];
}

function text(value: unknown) {
  return String(value ?? "").trim();
}

function parseNumber(value: unknown, wholeNumber = false): number | null {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const cleaned = String(value).trim().replace(/^₹\s*/, "").replace(/,/g, "");
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed < 0 || (wholeNumber && !Number.isInteger(parsed))) return Number.NaN;
  return parsed;
}

function parseObject(value: unknown, field: string, errors: string[]): Record<string, string> {
  if (value === undefined || value === null || String(value).trim() === "") return {};
  let parsed: unknown = value;
  if (typeof value === "string") {
    try {
      parsed = JSON.parse(value);
    } catch {
      errors.push(`${field} must be valid JSON containing key/value pairs.`);
      return {};
    }
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    errors.push(`${field} must be a JSON object.`);
    return {};
  }
  const result: Record<string, string> = {};
  for (const [key, item] of Object.entries(parsed)) {
    if (!key.trim() || item === null || item === undefined ||
      !["string", "number", "boolean"].includes(typeof item)) {
      errors.push(`${field} values must be text, numbers, or booleans.`);
      return {};
    }
    if (String(item).trim()) result[key.trim()] = String(item).trim();
  }
  return result;
}

function isValidImageUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function parseRows(inputRows: Record<string, unknown>[]): ParsedRow[] {
  const rows = inputRows.map((raw, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const price = parseNumber(readField(raw, "price"));
    const compareAtPrice = parseNumber(readField(raw, "compareAtPrice"));
    const costPrice = parseNumber(readField(raw, "costPrice"));
    const stock = parseNumber(readField(raw, "stock"), true);
    const variantPrice = parseNumber(readField(raw, "variantPrice"));
    const variantStock = parseNumber(readField(raw, "variantStock"), true);
    const imageUrl = text(readField(raw, "imageUrl"));
    const variantImageUrl = text(readField(raw, "variantImageUrl"));
    const condition = text(readField(raw, "condition")).toLowerCase();
    const specs = parseObject(readField(raw, "specs"), "Specs", errors);
    const variantSpecs = parseObject(readField(raw, "variantSpecs"), "Variant specs", errors);
    const knownColumns = new Set(TEMPLATE_COLUMNS.map(normalizeHeader));
    for (const [header, value] of Object.entries(raw)) {
      if (header.startsWith("__") || knownColumns.has(normalizeHeader(header)) || !text(value)) continue;
      specs[header.trim()] = text(value);
    }
    const variantType = text(readField(raw, "variantType"));
    const variantValue = text(readField(raw, "variantValue"));
    const variantSku = normalizeSku(readField(raw, "variantSku"));
    const sku = normalizeSku(readField(raw, "sku"));
    const parentSku = normalizeSku(readField(raw, "parentSku"));
    const isVariant = Boolean(
      parentSku || variantType || variantValue || variantSku || variantPrice !== null || variantStock !== null ||
      variantImageUrl || Object.keys(variantSpecs).length
    );
    const effectiveSku = variantSku || sku;
    const source: ImportSource = {
      sku,
      title: text(readField(raw, "title")),
      description: text(readField(raw, "description")),
      category: text(readField(raw, "category")).toLowerCase().replace(/[\s&/]+/g, "_").replace(/[^a-z0-9_-]/g, ""),
      brand: text(readField(raw, "brand")),
      price: Number.isNaN(price) ? null : price,
      compareAtPrice: Number.isNaN(compareAtPrice) ? null : compareAtPrice,
      costPrice: Number.isNaN(costPrice) ? null : costPrice,
      stock: Number.isNaN(stock) ? null : stock,
      imageUrl,
      condition,
      specs,
      parentSku,
      variantGroup: text(readField(raw, "variantGroup")),
      variantType,
      variantValue,
      variantSku,
      variantPrice: Number.isNaN(variantPrice) ? null : variantPrice,
      variantStock: Number.isNaN(variantStock) ? null : variantStock,
      variantImageUrl,
      variantSpecs,
    };

    if (source.sku.length > 120 || effectiveSku.length > 120) errors.push("SKU values may not exceed 120 characters.");
    if (source.title.length > 500) errors.push("Product title may not exceed 500 characters.");
    if (source.description.length > 20000) errors.push("Description may not exceed 20,000 characters.");
    if (source.brand.length > 200 || source.category.length > 120) errors.push("Brand/category values are too long.");
    if (!sku) errors.push("A unique SKU is required.");
    if (!source.title) errors.push("Product title is required.");
    if (!source.category) errors.push("Category is required.");
    if (price === null && !isVariant) errors.push("Price is required for a sellable product.");
    if (Number.isNaN(price)) errors.push("Price must be a valid non-negative number.");
    if (stock === null && !isVariant) errors.push("Stock is required for a sellable product.");
    if (Number.isNaN(stock)) errors.push("Stock must be a non-negative whole number.");
    if (compareAtPrice !== null && Number.isNaN(compareAtPrice)) errors.push("Compare-at price must be a valid non-negative number.");
    if (costPrice !== null && Number.isNaN(costPrice)) errors.push("Cost price must be a valid non-negative number.");
    if (price !== null && compareAtPrice !== null && compareAtPrice < price) {
      errors.push("Compare-at price cannot be lower than the selling price.");
    }
    if (imageUrl && !isValidImageUrl(imageUrl)) errors.push("Image URL must use http(s) or a site-relative path.");
    if (condition && !["new", "refurbished", "premium_used"].includes(condition)) {
      errors.push("Condition must be new, refurbished, or premium_used.");
    }

    if (isVariant) {
      if (!parentSku) errors.push("parentSku is required for a variant row; variants are never inferred from title or brand.");
      if (!variantType || !variantValue) errors.push("variantType and variantValue are required for a variant.");
      if (!variantSku) errors.push("variantSku is required for a variant and must match sku.");
      if (variantPrice === null) errors.push("variantPrice is required; the parent price is never copied to a variant.");
      if (Number.isNaN(variantPrice)) errors.push("variantPrice must be a valid non-negative number.");
      if (variantStock === null) errors.push("variantStock is required; unknown inventory is never set to zero.");
      if (Number.isNaN(variantStock)) errors.push("variantStock must be a non-negative whole number.");
      if (variantSku && variantSku !== sku) errors.push("sku and variantSku must match so each sellable variant has one SKU.");
      if (variantImageUrl && !isValidImageUrl(variantImageUrl)) errors.push("Variant image URL must use http(s) or a site-relative path.");
      if (!source.brand) errors.push("Brand is required to verify a variant's product family.");
      if (condition) warnings.push("Condition is stored on the parent product, not on an individual variant.");
    } else if (variantType || variantValue || variantSku) {
      errors.push("Variant fields require parentSku and a complete variant configuration.");
    }

    if (!source.imageUrl && !isVariant) warnings.push("No image was supplied; the catalog's existing fallback image will be used.");
    if (!source.brand) warnings.push("No brand was supplied.");
    if (!source.specs || !Object.keys(source.specs).length) warnings.push("No product specifications were supplied.");

    return {
      rowNumber: typeof raw.__rowNumber === "number" ? raw.__rowNumber : index + 2,
      source,
      errors: [...new Set(errors)],
      warnings,
      duplicateInFile: false,
      isVariant,
    };
  }).filter((row) => {
    const source = row.source;
    return Boolean(source.sku || source.title || source.category || source.parentSku || source.variantValue);
  });

  const skuRows = new Map<string, ParsedRow[]>();
  for (const row of rows) {
    const key = normalizeSku(row.source.variantSku || row.source.sku);
    if (key) skuRows.set(key, [...(skuRows.get(key) || []), row]);
  }
  for (const matchingRows of skuRows.values()) {
    if (matchingRows.length > 1) {
      for (const row of matchingRows) {
        row.duplicateInFile = true;
        row.errors.push(`SKU "${row.source.variantSku || row.source.sku}" appears more than once in this file.`);
      }
    }
  }
  return rows;
}

function getSkuMatches(products: ProductRecord[], sku: string) {
  const normalized = normalizeSku(sku);
  const matches: Array<{ product: ProductRecord; variantId?: string }> = [];
  for (const product of products) {
    if (normalizeSku(product.sku) === normalized) matches.push({ product, variantId: undefined });
    if (Array.isArray(product.variants)) {
      product.variants
        .filter((entry: ProductRecord) => normalizeSku(entry.sku) === normalized)
        .forEach((variant: ProductRecord) => matches.push({
          product,
          variantId: String(variant.id || normalizeSku(variant.sku)),
        }));
    }
  }
  return matches;
}

function getSkuMatch(products: ProductRecord[], sku: string) {
  const matches = getSkuMatches(products, sku);
  return matches.length === 1 ? matches[0] : undefined;
}

function findParent(products: ProductRecord[], sku: string) {
  return products.find((product) =>
    product.status !== "deleted" && normalizeSku(product.sku) === normalizeSku(sku)
  );
}

function getPartNumber(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const entry = Object.entries(value as Record<string, unknown>).find(([key]) =>
    ["mpn", "manufacturerpartnumber", "partnumber"].includes(normalizeHeader(key))
  );
  return entry ? normalizeSku(entry[1]) : "";
}

function variantConfigurationKey(source: ImportSource) {
  return Object.entries(getVariantAttributes(source))
    .filter(([key]) => normalizeHeader(key) !== "variantgroup")
    .map(([key, value]) => [normalizeHeader(key), normalizeName(value)])
    .sort(([left], [right]) => String(left).localeCompare(String(right)))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

function hasDuplicateVariantRow(rows: ParsedRow[], row: ParsedRow) {
  const key = variantConfigurationKey(row.source);
  return rows.some((other) =>
    other.rowNumber !== row.rowNumber && other.isVariant &&
    normalizeSku(other.source.parentSku) === normalizeSku(row.source.parentSku) &&
    variantConfigurationKey(other.source) === key
  );
}

function looksLikeSameProduct(row: ParsedRow, product: ProductRecord) {
  const rowPartNumber = getPartNumber(row.source.specs);
  const productPartNumber = getPartNumber(product.specs) ||
    normalizeSku(product.compatibility?.partNumber);
  if (rowPartNumber && productPartNumber && rowPartNumber === productPartNumber) return true;
  const rowName = normalizeName(row.source.title);
  const productName = normalizeName(product.title);
  if (!rowName || !productName) return false;
  const sameCategory = normalizeName(row.source.category) === normalizeName(product.category);
  if (sameCategory && rowName === productName) return true;
  const sameBrand = normalizeName(row.source.brand) === normalizeName(product.brand);
  if (!sameBrand || !sameCategory) return false;
  const rowWords = new Set(rowName.split(" "));
  const productWords = new Set(productName.split(" "));
  const overlap = [...rowWords].filter((word) => productWords.has(word)).length;
  return overlap >= 2 && overlap / Math.max(rowWords.size, productWords.size) >= 0.8;
}

function getImportConflicts(row: ParsedRow, product: ProductRecord, variantId?: string) {
  const conflicts: string[] = [];
  const serialize = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(serialize).join(",")}]`;
    if (value && typeof value === "object") {
      return `{${Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => `${JSON.stringify(key)}:${serialize(entry)}`)
        .join(",")}}`;
    }
    return JSON.stringify(value);
  };
  const addConflict = (field: string, imported: unknown, existing: unknown) => {
    if (imported === undefined || imported === null || imported === "") return;
    if (existing !== undefined && existing !== null && existing !== "" && serialize(imported) !== serialize(existing)) {
      conflicts.push(`Existing ${field} differs from the uploaded value.`);
    }
  };

  if (variantId) {
    const variant = (Array.isArray(product.variants) ? product.variants : []).find((entry: ProductRecord) =>
      String(entry.id || normalizeSku(entry.sku)) === variantId
    );
    if (!variant) return conflicts;
    addConflict("variant value", row.source.variantValue, variant.name);
    addConflict("variant price", row.source.variantPrice, variant.price);
    addConflict("variant stock", row.source.variantStock, variant.stock);
    addConflict("variant image", row.source.variantImageUrl, variant.image);
    const attributes = variant.attributes || {};
    if (row.source.variantType) {
      const currentType = Object.entries(attributes).find(([key, value]) =>
        key !== "variantGroup" && value === variant.name
      )?.[0];
      addConflict("variant type", row.source.variantType, currentType);
    }
    addConflict("variant group", row.source.variantGroup, attributes.variantGroup);
    for (const [key, value] of Object.entries(row.source.variantSpecs)) {
      addConflict(`variant specification "${key}"`, value, attributes[key]);
    }
    return conflicts;
  }

  addConflict("title", row.source.title, product.title);
  addConflict("category", row.source.category, product.category);
  addConflict("brand", row.source.brand, product.brand);
  addConflict("description", row.source.description, product.description);
  addConflict("price", row.source.price, product.price);
  addConflict("compare-at price", row.source.compareAtPrice, product.compareAtPrice);
  addConflict("cost price", row.source.costPrice, product.costPrice);
  addConflict("stock", row.source.stock, product.stock);
  addConflict("image", row.source.imageUrl, product.image);
  addConflict("condition", row.source.condition, product.condition);
  for (const [key, value] of Object.entries(row.source.specs)) {
    addConflict(`specification "${key}"`, value, product.specs?.[key]);
  }
  return conflicts;
}

function makePlan(rows: ParsedRow[], products: ProductRecord[]): PlannedRow[] {
  const availableProducts = [...products];
  const parentRowsBySku = new Map<string, ParsedRow>();
  for (const row of rows) {
    if (!row.isVariant && row.source.sku) parentRowsBySku.set(normalizeSku(row.source.sku), row);
  }

  return rows.map((row) => {
    const source = row.source;
    const effectiveSku = normalizeSku(source.variantSku || source.sku);
    const skuMatches = getSkuMatches(products, effectiveSku);
    const skuMatch = skuMatches.length === 1 ? skuMatches[0] : undefined;
    let parent = source.parentSku ? findParent(availableProducts, source.parentSku) : undefined;
    const sameFileParent = source.parentSku ? parentRowsBySku.get(normalizeSku(source.parentSku)) : undefined;
    const hasSimilarProduct = products.some((product) => looksLikeSameProduct(row, product));
    const duplicateNameInFile = !row.isVariant && rows.some((other) =>
      other.rowNumber !== row.rowNumber && !other.isVariant &&
      normalizeName(other.source.title) === normalizeName(source.title) &&
      normalizeName(other.source.category) === normalizeName(source.category)
    );
    const duplicateVariantInFile = row.isVariant && hasDuplicateVariantRow(rows, row);
    let canAdd = false;
    let canAddVariant = false;
    let canUpdate = false;
    let isVariantMatch = false;
    let action: ImportAction = "review";
    let targetProductId: string | undefined;
    let targetProductTitle: string | undefined;
    let updateFields: string[] = [];
    const warnings = [...row.warnings];
    const errors = [...row.errors];
    let status: ImportStatus = errors.length ? "invalid" : "ready";

    if (skuMatches.length > 1) {
      errors.push(`SKU "${effectiveSku}" is already assigned to more than one catalog item; resolve the existing catalog conflict first.`);
      action = "review";
      status = "duplicate";
    } else if (skuMatch) {
      targetProductId = String(skuMatch.product.id || "");
      targetProductTitle = String(skuMatch.product.title || "");
      isVariantMatch = Boolean(skuMatch.variantId);
      if (row.isVariant && !skuMatch.variantId) {
        errors.push("Variant SKU conflicts with the parent product SKU.");
        status = "duplicate";
      } else if (row.isVariant && normalizeSku(source.parentSku) !== normalizeSku(skuMatch.product.sku)) {
        errors.push("This variant SKU already belongs to a different product family.");
        status = "duplicate";
      } else if (!row.isVariant && skuMatch.variantId) {
        errors.push("This SKU already belongs to a variant; update the owning product's variant instead.");
        status = "duplicate";
      } else if (!errors.length) {
        canUpdate = true;
        updateFields = skuMatch.variantId ? [...VARIANT_UPDATE_FIELDS] : [...PARENT_UPDATE_FIELDS];
        warnings.push(...getImportConflicts(row, skuMatch.product, skuMatch.variantId));
        action = "update";
        status = "duplicate";
      }
    } else if (row.isVariant && !errors.length) {
      if (parent) {
        targetProductId = String(parent.id || "");
        targetProductTitle = String(parent.title || "");
        const identityMatches = normalizeName(source.brand) === normalizeName(parent.brand) &&
          normalizeName(source.category) === normalizeName(parent.category);
        if (hasSameVariantConfiguration(parent, source)) {
          errors.push("This variant configuration already exists on the selected parent.");
          action = "review";
          status = "duplicate";
        } else if (identityMatches) {
          canAddVariant = true;
          action = normalizeName(source.title) === normalizeName(parent.title) ? "variant" : "review";
          if (action === "review") warnings.push("Title differs from the selected parent. Confirm the exact product family before adding this variant.");
        } else {
          warnings.push("Brand/category do not exactly match parentSku; review the product-family identity.");
          action = "review";
        }
      } else if (sameFileParent && !sameFileParent.errors.length) {
        targetProductTitle = sameFileParent.source.title;
        const identityMatches = normalizeName(source.brand) === normalizeName(sameFileParent.source.brand) &&
          normalizeName(source.category) === normalizeName(sameFileParent.source.category);
        if (identityMatches) {
          canAddVariant = true;
          action = normalizeName(source.title) === normalizeName(sameFileParent.source.title) ? "variant" : "review";
          if (action === "review") warnings.push("Title differs from the selected parent row. Confirm the exact product family before adding this variant.");
        } else {
          warnings.push("Brand/category do not exactly match the parent row; review the product-family identity.");
        }
      } else {
        errors.push(`Parent SKU "${source.parentSku}" was not found in the catalog or this file.`);
        status = "invalid";
      }
    } else if (!row.isVariant && !errors.length) {
      if (hasSimilarProduct || duplicateNameInFile) {
        warnings.push("A possible duplicate product matches by manufacturer part number or normalized name/category.");
        action = "review";
        status = "review";
      } else {
        canAdd = true;
        action = "add";
      }
    }

    if (row.duplicateInFile) {
      action = "review";
      status = "duplicate";
      canAdd = false;
      canAddVariant = false;
      canUpdate = false;
    } else if (duplicateVariantInFile) {
      errors.push("This variant configuration is duplicated within the uploaded file.");
      action = "review";
      status = "duplicate";
      canAdd = false;
      canAddVariant = false;
      canUpdate = false;
    } else if (errors.length && status !== "duplicate") {
      action = "review";
      status = "invalid";
      canAdd = false;
      canAddVariant = false;
      canUpdate = false;
    } else if (warnings.length && status === "ready" && action === "review") {
      status = "review";
    }

    return {
      ...row,
      errors,
      warnings: [...new Set(warnings)],
      status,
      action,
      canAdd,
      canAddVariant,
      canUpdate,
      isVariantMatch,
      targetProductId,
      targetProductTitle,
      updateFields,
    };
  });
}

function valueForUpdate(row: PlannedRow, field: string): unknown {
  const source = row.source;
  switch (field) {
    case "title": return source.title;
    case "description": return source.description;
    case "category": return source.category;
    case "brand": return source.brand;
    case "price": return source.price;
    case "compareAtPrice": return source.compareAtPrice;
    case "costPrice": return source.costPrice;
    case "stock": return source.stock;
    case "imageUrl": return source.imageUrl;
    case "condition": return source.condition;
    case "specs": return source.specs;
    case "variantType": return source.variantType;
    case "variantValue": return source.variantValue;
    case "variantPrice": return source.variantPrice;
    case "variantStock": return source.variantStock;
    case "variantImageUrl": return source.variantImageUrl;
    case "variantSpecs": return source.variantSpecs;
    default: return undefined;
  }
}

function getVariantAttributes(source: ImportSource) {
  const attributes = { ...source.variantSpecs };
  attributes[source.variantType] = source.variantValue;
  if (source.variantGroup) attributes.variantGroup = source.variantGroup;
  return attributes;
}

function hasSameVariantConfiguration(existing: ProductRecord, source: ImportSource) {
  const expected = getVariantAttributes(source);
  const expectedKeys = Object.keys(expected).filter((key) => key !== "variantGroup").sort();
  return (Array.isArray(existing.variants) ? existing.variants : []).some((variant: ProductRecord) => {
    const actual = variant.attributes || {};
    const actualKeys = Object.keys(actual).filter((key) => key !== "variantGroup").sort();
    return expectedKeys.length > 0 && expectedKeys.length === actualKeys.length &&
      expectedKeys.every((key) => normalizeName(actual[key]) === normalizeName(expected[key]));
  });
}

function csvSafe(value: unknown) {
  let output = String(value ?? "");
  if (/^[\s]*[=+\-@]/.test(output)) output = `'${output}`;
  return `"${output.replace(/"/g, '""')}"`;
}

function failure(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function parseUploadedFile(request: NextRequest): Promise<Record<string, unknown>[]> {
  const form = await request.formData();
  const entry = form.get("file");
  if (!entry || typeof entry === "string") throw new Error("Select an .xlsx or .csv file to preview.");
  const filename = entry.name.toLowerCase();
  if (!filename.endsWith(".xlsx") && !filename.endsWith(".csv")) {
    throw new Error("Only .xlsx and .csv files are supported.");
  }
  if (entry.size <= 0 || entry.size > MAX_FILE_BYTES) throw new Error("Choose a non-empty spreadsheet smaller than 10 MB.");

  const workbook = XLSX.read(Buffer.from(await entry.arrayBuffer()), {
    type: "buffer",
    cellFormula: true,
    cellDates: false,
  });
  const sheetName = workbook.SheetNames[0];
  const worksheet = sheetName ? workbook.Sheets[sheetName] : undefined;
  if (!worksheet) throw new Error("The selected file does not contain a worksheet.");
  for (const [address, cell] of Object.entries(worksheet)) {
    if (address.startsWith("!") || !cell || typeof cell !== "object") continue;
    if ("f" in cell) throw new Error("Spreadsheet formula cells are not accepted. Replace them with verified values.");
  }
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1, defval: "", raw: false });
  const headerRow = matrix.shift();
  if (!headerRow || !headerRow.some((header) => text(header))) throw new Error("The first worksheet needs a header row.");
  const headers = headerRow.map((header) => text(header));
  const normalizedHeaders = headers.map(normalizeHeader).filter(Boolean);
  if (new Set(normalizedHeaders).size !== normalizedHeaders.length) throw new Error("The file contains duplicate column headers.");
  const headerSet = new Set(normalizedHeaders);
  if (!headerSet.has("sku") || !headerSet.has("title") || !headerSet.has("category")) {
    throw new Error("Required headers are sku, title, and category.");
  }

  const dataRows = matrix
    .map((cells, index) => ({ cells, rowNumber: index + 2 }))
    .filter(({ cells }) => cells.some((cell) => text(cell)));
  if (dataRows.length === 0) throw new Error("The first worksheet contains no product rows.");
  if (dataRows.length > MAX_IMPORT_ROWS) throw new Error(`Import is limited to ${MAX_IMPORT_ROWS} rows per file.`);
  return dataRows.map(({ cells, rowNumber }) => {
    const row: Record<string, unknown> = { __rowNumber: rowNumber };
    headers.forEach((header, index) => {
      if (header) row[header] = cells[index] ?? "";
    });
    return row;
  });
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      let rawRows: Record<string, unknown>[];
      try {
        rawRows = await parseUploadedFile(request);
      } catch (error) {
        return failure(error instanceof Error ? error.message : "Could not parse the uploaded spreadsheet.");
      }
      const parsedRows = parseRows(rawRows);
      const products = await dbHelper.products.list();
      const rows = makePlan(parsedRows, products);
      return NextResponse.json({
        rows,
        summary: {
          total: rows.length,
          newProducts: rows.filter((row) => row.action === "add" && row.canAdd).length,
          newVariants: rows.filter((row) => row.action === "variant" && row.canAddVariant).length,
          updates: rows.filter((row) => row.action === "update" && row.canUpdate).length,
          duplicateSkus: rows.filter((row) => row.status === "duplicate").length,
          review: rows.filter((row) => row.status === "review").length,
          invalid: rows.filter((row) => row.status === "invalid").length,
          skipped: rows.filter((row) => row.action === "skip").length,
        },
      });
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return failure("Import confirmation must be valid JSON.");
    }
    if (body?.mode !== "commit" || !Array.isArray(body.rows) || !Array.isArray(body.choices)) {
      return failure("Invalid import confirmation payload.");
    }
    if (body.rows.length === 0 || body.rows.length > MAX_IMPORT_ROWS) {
      return failure(`Import must contain between 1 and ${MAX_IMPORT_ROWS} rows.`);
    }
    if (body.rows.some((row: unknown) => !row || typeof row !== "object" || Array.isArray(row))) {
      return failure("Each import row must be an object.");
    }

    const parsedRows = parseRows(body.rows as Record<string, unknown>[]);
    const products = await dbHelper.products.list();
    const plannedRows = makePlan(parsedRows, products);
    const choices = new Map<number, { selected: boolean; action: ImportAction; fields: string[] }>();
    for (const entry of body.choices) {
      if (!entry || typeof entry !== "object" || !Number.isInteger(entry.rowNumber)) continue;
      choices.set(entry.rowNumber, {
        selected: entry.selected === true,
        action: entry.action,
        fields: Array.isArray(entry.fields) ? entry.fields.filter((field: unknown) => typeof field === "string") : [],
      });
    }

    const results: Array<{ rowNumber: number; sku: string; action: ImportAction; status: string; message: string }> = [];
    const createdProducts = new Map<string, ProductRecord>();
    let currentProducts = [...products];
    const orderedRows = [...plannedRows].sort((left, right) => {
      const rank = (row: PlannedRow) => row.action === "add" ? 0 : row.action === "variant" ? 1 : 2;
      return rank(left) - rank(right) || left.rowNumber - right.rowNumber;
    });

    for (const row of orderedRows) {
      const choice = choices.get(row.rowNumber);
      const chosenAction = choice?.action;
      if (!choice?.selected || chosenAction === "skip") {
        results.push({ rowNumber: row.rowNumber, sku: row.source.sku, action: "skip", status: "skipped", message: "No changes made." });
        continue;
      }
      if (!choice || !chosenAction || !["add", "variant", "update"].includes(chosenAction)) {
        results.push({ rowNumber: row.rowNumber, sku: row.source.sku, action: "review", status: "failed", message: "Choose Add product, Add variant, Update, or Skip." });
        continue;
      }

      try {
        const effectiveSku = normalizeSku(row.source.variantSku || row.source.sku);
        const currentMatch = getSkuMatch(currentProducts, effectiveSku);
        if (row.errors.length) throw new Error(row.errors.join(" "));

        if (chosenAction === "add") {
          if (!row.canAdd || row.isVariant || currentMatch) {
            throw new Error("This row is not safe to add as a new product. Preview the latest catalog and resolve possible matches.");
          }
          const product = await dbHelper.products.create({
            id: `product-${randomUUID()}`,
            sku: effectiveSku,
            title: row.source.title,
            description: row.source.description,
            category: row.source.category,
            brand: row.source.brand || undefined,
            price: row.source.price,
            compareAtPrice: row.source.compareAtPrice ?? undefined,
            costPrice: row.source.costPrice ?? undefined,
            stock: row.source.stock,
            image: row.source.imageUrl || undefined,
            images: [],
            specs: row.source.specs,
            condition: row.source.condition || "new",
            status: "show",
            variants: [],
          });
          if (!product) throw new Error("Product creation returned no saved record.");
          createdProducts.set(normalizeSku(row.source.sku), product);
          currentProducts = [...currentProducts, product];
          results.push({ rowNumber: row.rowNumber, sku: effectiveSku, action: "add", status: "imported", message: "Product added." });
          continue;
        }

        if (chosenAction === "variant") {
          if (!row.isVariant || !row.canAddVariant || currentMatch) {
            throw new Error("This row is not verified for addition as a new variant. Resolve the parent identity and SKU conflict.");
          }
          const parent = findParent(currentProducts, row.source.parentSku) ||
            createdProducts.get(normalizeSku(row.source.parentSku));
          if (!parent) throw new Error(`Parent SKU "${row.source.parentSku}" was not created or found.`);
          if (normalizeName(parent.brand) !== normalizeName(row.source.brand) ||
            normalizeName(parent.category) !== normalizeName(row.source.category)) {
            throw new Error("Variant brand/category no longer match the selected parent.");
          }
          if (getSkuMatch(currentProducts, effectiveSku)) throw new Error(`SKU "${effectiveSku}" already exists.`);
          if (hasSameVariantConfiguration(parent, row.source)) throw new Error("This variant configuration already exists on the parent product.");
          const existingVariants = Array.isArray(parent.variants) ? parent.variants : [];
          const variant = {
            id: `variant-${randomUUID()}`,
            sku: effectiveSku,
            name: row.source.variantValue,
            price: row.source.variantPrice,
            stock: row.source.variantStock,
            image: row.source.variantImageUrl || undefined,
            attributes: getVariantAttributes(row.source),
            active: true,
          };
          const updated = await dbHelper.products.update(String(parent.id), {
            variants: [...existingVariants, variant],
          });
          if (!updated) throw new Error("Variant update returned no saved product.");
          currentProducts = currentProducts.map((product) => product.id === updated.id ? updated : product);
          createdProducts.set(normalizeSku(row.source.parentSku), updated);
          results.push({ rowNumber: row.rowNumber, sku: effectiveSku, action: "variant", status: "imported", message: `Variant added to ${parent.title}.` });
          continue;
        }

        if (chosenAction === "update") {
          if (!row.canUpdate || !currentMatch) throw new Error("The SKU no longer matches an existing product or variant.");
          const allowedFields = currentMatch.variantId ? VARIANT_UPDATE_FIELDS : PARENT_UPDATE_FIELDS;
          const selectedFields = [...new Set(choice.fields)].filter((field) => allowedFields.includes(field));
          if (!selectedFields.length) throw new Error("Select one or more non-empty fields to update.");
          const updates: Record<string, unknown> = {};
          const variantFields: Record<string, unknown> = {};
          for (const field of selectedFields) {
            const value = valueForUpdate(row, field);
            if (value === undefined || value === null || value === "") {
              throw new Error(`The selected "${field}" field is blank; blank fields are preserved.`);
            }
            if (currentMatch.variantId) {
              if (field === "variantType" || field === "variantValue" || field === "variantSpecs") {
                const currentVariant = (currentMatch.product.variants || []).find((variant: ProductRecord) =>
                  String(variant.id || normalizeSku(variant.sku)) === currentMatch.variantId
                );
                const attributes = { ...(currentVariant?.attributes || {}) };
                if (field === "variantType") {
                  const oldType = Object.entries(attributes).find(([key, value]) =>
                    key !== "variantGroup" && String(value) === String(currentVariant?.name)
                  )?.[0];
                  if (oldType) delete attributes[oldType];
                  attributes[row.source.variantType] = String(currentVariant?.name || row.source.variantValue);
                } else if (field === "variantValue") {
                  const type = Object.entries(attributes).find(([key, value]) =>
                    key !== "variantGroup" && String(value) === String(currentVariant?.name)
                  )?.[0] || row.source.variantType;
                  attributes[type] = row.source.variantValue;
                  variantFields.name = row.source.variantValue;
                } else {
                  Object.assign(attributes, row.source.variantSpecs);
                }
                variantFields.attributes = attributes;
              } else if (field === "variantPrice") variantFields.price = row.source.variantPrice;
              else if (field === "variantStock") variantFields.stock = row.source.variantStock;
              else if (field === "variantImageUrl") variantFields.image = row.source.variantImageUrl;
            } else if (field === "imageUrl") {
              updates.image = row.source.imageUrl;
              updates.images = [{ url: row.source.imageUrl, is_primary: true, sort_order: 1 }];
            } else {
              updates[field] = value;
            }
          }

          if (currentMatch.variantId) {
            const variants = (currentMatch.product.variants || []).map((variant: ProductRecord) =>
              String(variant.id || normalizeSku(variant.sku)) === currentMatch.variantId ? { ...variant, ...variantFields } : variant
            );
            updates.variants = variants;
          }
          const updated = await dbHelper.products.update(String(currentMatch.product.id), updates);
          if (!updated) throw new Error("Product update returned no saved record.");
          currentProducts = currentProducts.map((product) => product.id === updated.id ? updated : product);
          results.push({ rowNumber: row.rowNumber, sku: effectiveSku, action: "update", status: "updated", message: `Selected fields updated: ${selectedFields.join(", ")}.` });
        }
      } catch (error) {
        results.push({
          rowNumber: row.rowNumber,
          sku: row.source.variantSku || row.source.sku,
          action: chosenAction,
          status: "failed",
          message: error instanceof Error ? error.message : "Import failed.",
        });
      }
    }

    const succeeded = results.filter((result) => result.status === "imported" || result.status === "updated").length;
    if (succeeded > 0) {
      return NextResponse.json({ results, summary: { succeeded, failed: results.filter((result) => result.status === "failed").length, skipped: results.filter((result) => result.status === "skipped").length } });
    }
    return NextResponse.json({
      results,
      summary: { succeeded: 0, failed: results.filter((result) => result.status === "failed").length, skipped: results.filter((result) => result.status === "skipped").length },
    });
  } catch (error) {
    if (error instanceof Error && (
      error.message.startsWith("Select ") ||
      error.message.startsWith("Only ") ||
      error.message.startsWith("Choose ") ||
      error.message.startsWith("The selected ") ||
      error.message.startsWith("The first ") ||
      error.message.startsWith("Required headers") ||
      error.message.startsWith("Import is limited") ||
      error.message.startsWith("Spreadsheet formula") ||
      error.message.startsWith("The file contains")
    )) {
      return failure(error.message);
    }
    const auth = authErrorResponse(error);
    if (auth.status !== 500) return NextResponse.json({ error: auth.message }, { status: auth.status });
    console.error("Catalog import failed.", error);
    return failure("Catalog import could not be completed. Check the server logs and retry.", 500);
  }
}
