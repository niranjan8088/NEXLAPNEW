/**
 * NEXLAPTECH — DYNAMIC CATALOG FILTER ENGINE
 * Dynamic filter definitions registry, category-aware filter loader,
 * product specification evaluator, and dynamic filter option calculator.
 */

import { FilterDefinition, DynamicFilterGroup, FilterQueryState, FilterOption } from "./types/ecommerce";
import { extractStructuredSpecs, normalizeBoolean } from "./normalization";

/** Default Admin-manageable Filter Definitions System */
export const DEFAULT_FILTER_DEFINITIONS: FilterDefinition[] = [
  // --- PRICE & COMMERCIAL (Global / All Categories) ---
  {
    id: "flt-price",
    categoryId: "all",
    name: "Price Range",
    key: "price",
    type: "price-range",
    minValue: 0,
    maxValue: 300000,
    unit: "₹",
    enabled: true,
    sortOrder: 1,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-brand",
    categoryId: "all",
    name: "Brand",
    key: "brand",
    type: "multi-select",
    options: [
      { label: "Dell", value: "Dell" },
      { label: "Lenovo", value: "Lenovo" },
      { label: "HP", value: "HP" },
      { label: "Apple", value: "Apple" },
      { label: "ASUS", value: "ASUS" },
      { label: "Acer", value: "Acer" },
      { label: "MSI", value: "MSI" },
      { label: "Samsung", value: "Samsung" },
      { label: "Kingston", value: "Kingston" },
      { label: "Crucial", value: "Crucial" },
    ],
    enabled: true,
    sortOrder: 2,
    isSearchable: true,
    isVisible: true,
  },

  // --- LAPTOP SPECIFIC FILTERS ---
  {
    id: "flt-proc-brand",
    categoryId: "business_laptops",
    name: "Processor Brand",
    key: "processorBrand",
    type: "multi-select",
    options: [
      { label: "Intel", value: "Intel" },
      { label: "AMD", value: "AMD" },
      { label: "Apple", value: "Apple" },
    ],
    enabled: true,
    sortOrder: 3,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-proc-family",
    categoryId: "business_laptops",
    name: "Processor",
    key: "processor",
    type: "multi-select",
    options: [
      { label: "Intel Core i3", value: "Intel Core i3" },
      { label: "Intel Core i5", value: "Intel Core i5" },
      { label: "Intel Core i7", value: "Intel Core i7" },
      { label: "Intel Core i9", value: "Intel Core i9" },
      { label: "AMD Ryzen 5", value: "AMD Ryzen 5" },
      { label: "AMD Ryzen 7", value: "AMD Ryzen 7" },
      { label: "Apple M1", value: "Apple M1" },
      { label: "Apple M2", value: "Apple M2" },
      { label: "Apple M3", value: "Apple M3" },
    ],
    enabled: true,
    sortOrder: 4,
    isSearchable: true,
    isVisible: true,
  },
  {
    id: "flt-proc-gen",
    categoryId: "business_laptops",
    name: "Processor Generation",
    key: "processorGen",
    type: "multi-select",
    options: [
      { label: "11th Gen", value: "11th Gen" },
      { label: "12th Gen", value: "12th Gen" },
      { label: "13th Gen", value: "13th Gen" },
      { label: "14th Gen", value: "14th Gen" },
      { label: "Apple Silicon", value: "Apple Silicon" },
    ],
    enabled: true,
    sortOrder: 5,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-ram-cap",
    categoryId: "business_laptops",
    name: "RAM Capacity",
    key: "ramCapacity",
    type: "multi-select",
    options: [
      { label: "4 GB", value: "4 GB" },
      { label: "8 GB", value: "8 GB" },
      { label: "16 GB", value: "16 GB" },
      { label: "32 GB", value: "32 GB" },
      { label: "64 GB", value: "64 GB" },
    ],
    enabled: true,
    sortOrder: 6,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-ram-type",
    categoryId: "business_laptops",
    name: "RAM Type",
    key: "ramType",
    type: "multi-select",
    options: [
      { label: "DDR4", value: "DDR4" },
      { label: "DDR5", value: "DDR5" },
      { label: "LPDDR5", value: "LPDDR5" },
    ],
    enabled: true,
    sortOrder: 7,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-ssd-cap",
    categoryId: "business_laptops",
    name: "SSD Capacity",
    key: "ssdCapacity",
    type: "multi-select",
    options: [
      { label: "128 GB", value: "128 GB" },
      { label: "256 GB", value: "256 GB" },
      { label: "512 GB", value: "512 GB" },
      { label: "1 TB", value: "1 TB" },
      { label: "2 TB", value: "2 TB" },
    ],
    enabled: true,
    sortOrder: 8,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-storage-type",
    categoryId: "business_laptops",
    name: "Storage Type",
    key: "storageType",
    type: "multi-select",
    options: [
      { label: "NVMe SSD", value: "NVMe SSD" },
      { label: "SATA SSD", value: "SATA SSD" },
      { label: "HDD", value: "HDD" },
    ],
    enabled: true,
    sortOrder: 9,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-screen-size",
    categoryId: "business_laptops",
    name: "Screen Size",
    key: "screenSize",
    type: "multi-select",
    options: [
      { label: "13.3 inch", value: "13.3 inch" },
      { label: "14 inch", value: "14 inch" },
      { label: "15.6 inch", value: "15.6 inch" },
      { label: "16 inch", value: "16 inch" },
      { label: "17.3 inch", value: "17.3 inch" },
    ],
    enabled: true,
    sortOrder: 10,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-gpu-name",
    categoryId: "business_laptops",
    name: "Graphics Processor Name",
    key: "graphics",
    type: "multi-select",
    options: [
      { label: "Integrated Graphics", value: "Integrated Graphics" },
      { label: "Intel Iris Xe", value: "Intel Iris Xe" },
      { label: "Nvidia GeForce RTX 4070", value: "Nvidia GeForce RTX 4070" },
      { label: "Nvidia GeForce RTX 4060", value: "Nvidia GeForce RTX 4060" },
      { label: "Nvidia GeForce RTX 3050", value: "Nvidia GeForce RTX 3050" },
      { label: "Apple M-Series GPU", value: "Apple M-Series GPU" },
    ],
    enabled: true,
    sortOrder: 11,
    isSearchable: true,
    isVisible: true,
  },
  {
    id: "flt-gpu-mem",
    categoryId: "business_laptops",
    name: "Dedicated Graphics Memory",
    key: "dedicatedGraphicsMemory",
    type: "multi-select",
    options: [
      { label: "Shared / System", value: "Shared" },
      { label: "4 GB", value: "4 GB" },
      { label: "6 GB", value: "6 GB" },
      { label: "8 GB", value: "8 GB" },
      { label: "12 GB", value: "12 GB" },
    ],
    enabled: true,
    sortOrder: 12,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-os",
    categoryId: "business_laptops",
    name: "Operating System",
    key: "operatingSystem",
    type: "multi-select",
    options: [
      { label: "Windows 11 Home", value: "Windows 11 Home" },
      { label: "Windows 11 Pro", value: "Windows 11 Pro" },
      { label: "macOS", value: "macOS" },
      { label: "Linux / Ubuntu", value: "Linux" },
    ],
    enabled: true,
    sortOrder: 13,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-touchscreen",
    categoryId: "business_laptops",
    name: "Touch Screen",
    key: "touchScreen",
    type: "boolean",
    enabled: true,
    sortOrder: 14,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-gst-invoice",
    categoryId: "all",
    name: "GST Invoice Available",
    key: "gstInvoiceAvailable",
    type: "boolean",
    enabled: true,
    sortOrder: 15,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-rating",
    categoryId: "all",
    name: "Customer Ratings",
    key: "rating",
    type: "rating",
    options: [
      { label: "4★ & above", value: "4" },
      { label: "3★ & above", value: "3" },
    ],
    enabled: true,
    sortOrder: 16,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-new-arrivals",
    categoryId: "all",
    name: "New Arrivals",
    key: "newArrival",
    type: "boolean",
    enabled: true,
    sortOrder: 17,
    isSearchable: false,
    isVisible: true,
  },

  // --- STORAGE CATEGORY FILTERS ---
  {
    id: "flt-storage-interface",
    categoryId: "storage",
    name: "Interface",
    key: "interface",
    type: "multi-select",
    options: [
      { label: "PCIe Gen 4.0 NVMe", value: "PCIe Gen 4.0 x4" },
      { label: "PCIe Gen 3.0 NVMe", value: "PCIe Gen 3.0 x4" },
      { label: "SATA III 6Gb/s", value: "SATA III" },
    ],
    enabled: true,
    sortOrder: 3,
    isSearchable: false,
    isVisible: true,
  },
  {
    id: "flt-storage-ff",
    categoryId: "storage",
    name: "Form Factor",
    key: "formFactor",
    type: "multi-select",
    options: [
      { label: "M.2 (2280)", value: "M.2 2280" },
      { label: "2.5 inch", value: "2.5 inch" },
    ],
    enabled: true,
    sortOrder: 4,
    isSearchable: false,
    isVisible: true,
  },

  // --- CCTV CATEGORY FILTERS ---
  {
    id: "flt-cctv-res",
    categoryId: "cctv",
    name: "Camera Resolution",
    key: "resolution",
    type: "multi-select",
    options: [
      { label: "2MP Full HD", value: "2MP" },
      { label: "4MP Ultra HD", value: "4MP" },
      { label: "8MP 4K", value: "8MP" },
    ],
    enabled: true,
    sortOrder: 3,
    isSearchable: false,
    isVisible: true,
  },
];

/** Check if a category matches a target category (supports laptop aliases) */
export function isCategoryMatching(productCategory: string, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === "all") return true;
  if (productCategory === targetCategory) return true;
  
  // Group laptop aliases
  const laptopCategories = ["business_laptops", "premium_used_laptops", "second_hand_laptops"];
  if (laptopCategories.includes(targetCategory) && laptopCategories.includes(productCategory)) {
    return true;
  }
  return false;
}

/** Get active filter definitions for a specific category */
export function getFilterDefinitionsForCategory(
  categoryId: string = "all",
  customDefinitions: FilterDefinition[] = DEFAULT_FILTER_DEFINITIONS
): FilterDefinition[] {
  const isLaptopGroup = ["business_laptops", "premium_used_laptops", "second_hand_laptops"].includes(categoryId);

  return customDefinitions
    .filter((def) => {
      if (!def.enabled || def.isVisible === false) return false;
      if (def.categoryId === "all") return true;
      if (def.categoryId === categoryId) return true;
      if (isLaptopGroup && def.categoryId === "business_laptops") return true;
      return false;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Evaluate if a single product meets all criteria in FilterQueryState */
export function evaluateProductFilters(product: any, query: FilterQueryState): boolean {
  if (!product) return false;

  // 1. Status Check (exclude deleted, hidden, unapproved)
  if (product.status === "deleted" || product.status === "hide" || product.status === "pending") return false;
  if (product.approval_status === "rejected" || product.approval_status === "pending") return false;

  // 2. Category Check
  if (query.category && query.category !== "all" && !isCategoryMatching(product.category, query.category)) {
    return false;
  }

  // 3. Search Query
  if (query.search) {
    const q = query.search.toLowerCase().trim();
    const titleStr = (product.title || "").toLowerCase();
    const descStr = (product.description || "").toLowerCase();
    const skuStr = (product.sku || "").toLowerCase();
    const brandStr = (product.brand || "").toLowerCase();
    const compStr = `${product.compatibility?.brand || ""} ${product.compatibility?.model || ""}`.toLowerCase();

    const matches =
      titleStr.includes(q) ||
      descStr.includes(q) ||
      skuStr.includes(q) ||
      brandStr.includes(q) ||
      compStr.includes(q);

    if (!matches) return false;
  }

  // Extract structured specs for deep property matching
  const specs = extractStructuredSpecs(product);

  // 4. Price Min & Max
  const price = Number(product.price || 0);
  if (query.priceMin !== undefined && price < query.priceMin) return false;
  if (query.priceMax !== undefined && price > query.priceMax) return false;

  // 5. Brand Multi-Select
  if (query.brand && query.brand.length > 0) {
    const prodBrand = (product.brand || "").toLowerCase();
    if (!query.brand.some((b) => b.toLowerCase() === prodBrand)) return false;
  }

  // 6. Processor Brand
  if (query.processorBrand && query.processorBrand.length > 0) {
    const pb = (specs.processorBrand || "").toLowerCase();
    if (!query.processorBrand.some((item) => pb.includes(item.toLowerCase()))) return false;
  }

  // 7. Processor Family
  if (query.processor && query.processor.length > 0) {
    const proc = (specs.processor || "").toLowerCase();
    if (!query.processor.some((item) => proc.includes(item.toLowerCase()))) return false;
  }

  // 8. Processor Gen
  if (query.processorGen && query.processorGen.length > 0) {
    const gen = (specs.processorGen || "").toLowerCase();
    if (!query.processorGen.some((item) => gen.includes(item.toLowerCase()))) return false;
  }

  // 9. RAM Capacity
  if (query.ramCapacity && query.ramCapacity.length > 0) {
    const ram = (specs.ramCapacity || "").toLowerCase();
    if (!query.ramCapacity.some((item) => ram.includes(item.toLowerCase()))) return false;
  }

  // 10. RAM Type
  if (query.ramType && query.ramType.length > 0) {
    const ramT = (specs.ramType || "").toLowerCase();
    if (!query.ramType.some((item) => ramT.includes(item.toLowerCase()))) return false;
  }

  // 11. SSD Capacity
  if (query.ssdCapacity && query.ssdCapacity.length > 0) {
    const ssd = (specs.ssdCapacity || "").toLowerCase();
    if (!query.ssdCapacity.some((item) => ssd.includes(item.toLowerCase()))) return false;
  }

  // 12. Screen Size
  if (query.screenSize && query.screenSize.length > 0) {
    const screen = (specs.screenSize || "").toLowerCase();
    if (!query.screenSize.some((item) => screen.includes(item.toLowerCase()))) return false;
  }

  // 13. Graphics
  if (query.graphics && query.graphics.length > 0) {
    const gpu = (specs.graphics || "").toLowerCase();
    if (!query.graphics.some((item) => gpu.includes(item.toLowerCase()))) return false;
  }

  // 14. Operating System
  if (query.operatingSystem && query.operatingSystem.length > 0) {
    const os = (specs.operatingSystem || "").toLowerCase();
    if (!query.operatingSystem.some((item) => os.includes(item.toLowerCase()))) return false;
  }

  // 15. Touch Screen
  if (query.touchScreen !== undefined) {
    if (specs.touchScreen !== query.touchScreen) return false;
  }

  // 16. GST Invoice
  if (query.gstInvoiceOnly) {
    if (!specs.gstInvoiceAvailable) return false;
  }

  // 17. Rating
  if (query.ratingMin !== undefined) {
    if ((specs.rating || 0) < query.ratingMin) return false;
  }

  // 18. Stock / Availability
  if (query.inStockOnly) {
    if ((product.stock || 0) <= 0) return false;
  }

  // 19. New Arrivals
  if (query.newArrivalsOnly) {
    if (!specs.newArrival) return false;
  }

  // 20. Offers Only
  if (query.offersOnly) {
    if (!product.discount || product.discount <= 0) return false;
  }

  return true;
}

/**
 * Builds category-aware dynamic filter groups populated with live matching product option counts.
 * Prevents showing filter options that have 0 matching products for the active category.
 */
export function buildDynamicCatalogFilters(
  products: any[],
  categoryId: string = "all",
  customDefinitions: FilterDefinition[] = DEFAULT_FILTER_DEFINITIONS
): DynamicFilterGroup[] {
  const definitions = getFilterDefinitionsForCategory(categoryId, customDefinitions);
  
  // Filter products matching current category first
  const categoryProducts = products.filter((p) => {
    if (p.status === "deleted" || p.status === "hide" || p.status === "pending") return false;
    return isCategoryMatching(p.category, categoryId);
  });

  return definitions.map((def) => {
    const optionCountsMap = new Map<string, number>();

    categoryProducts.forEach((p) => {
      const specs = extractStructuredSpecs(p);
      let rawVal: any;

      if (def.key === "brand") rawVal = p.brand;
      else if (def.key === "price") rawVal = p.price;
      else if (def.key === "rating") rawVal = specs.rating;
      else rawVal = specs[def.key];

      if (rawVal !== undefined && rawVal !== null && rawVal !== "") {
        const valStr = String(rawVal);
        optionCountsMap.set(valStr, (optionCountsMap.get(valStr) || 0) + 1);
      }
    });

    // Populate dynamic options with counts
    let availableOptions: FilterOption[] = [];

    if (def.options && def.options.length > 0) {
      availableOptions = def.options.map((opt) => ({
        ...opt,
        count: optionCountsMap.get(opt.value) || 0,
      }));
    } else if (optionCountsMap.size > 0) {
      availableOptions = Array.from(optionCountsMap.entries()).map(([val, count]) => ({
        label: val,
        value: val,
        count,
      }));
    }

    return {
      definition: def,
      availableOptions,
    };
  });
}
