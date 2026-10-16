/**
 * NEX LAPTECH — E-COMMERCE CATALOG & DYNAMIC FILTER ARCHITECTURE
 * Phase 1 TypeScript definitions for category-aware product specifications,
 * filter definitions, normalized attributes, and catalog filter state.
 */

export type FilterType =
  | "checkbox"
  | "multi-select"
  | "single-select"
  | "range"
  | "price-range"
  | "rating"
  | "boolean"
  | "text"
  | "number";

export interface FilterOption {
  label: string;
  value: string;
  count?: number; // Calculated dynamic count of matching products
}

export interface FilterDefinition {
  id: string;
  categoryId: string; // Target category e.g., 'business_laptops', 'storage', 'ram', 'cctv', 'all'
  name: string; // User-facing display title, e.g. "Processor Brand"
  key: string; // Spec key or attribute key, e.g. "processorBrand", "ramCapacity", "price"
  type: FilterType;
  options?: FilterOption[]; // Pre-configured or dynamically populated options
  minValue?: number;
  maxValue?: number;
  unit?: string; // Unit representation e.g. "GB", "GHz", "₹", "inch"
  enabled: boolean;
  sortOrder: number;
  isSearchable?: boolean;
  isVisible?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductStructuredSpecs {
  // --- Hardware Specifications ---
  processor?: string;
  processorBrand?: string; // "Intel" | "AMD" | "Apple"
  processorGen?: string; // "12th Gen" | "13th Gen" | "14th Gen" | "M1" | "M2"
  ramCapacity?: string; // "8 GB" | "16 GB" | "32 GB" | "64 GB"
  ramType?: string; // "DDR4" | "DDR5" | "LPDDR5"
  ssdCapacity?: string; // "256 GB" | "512 GB" | "1 TB" | "2 TB"
  storageType?: string; // "NVMe SSD" | "SATA SSD" | "HDD"
  hddCapacity?: string;
  graphics?: string; // "Nvidia RTX 4070" | "Intel Iris Xe"
  dedicatedGraphicsMemory?: string; // "4 GB" | "6 GB" | "8 GB" | "12 GB"
  screenSize?: string; // "14.0 inch" | "15.6 inch" | "16.0 inch"
  displayType?: string; // "FHD IPS" | "OLED" | "Retina"
  operatingSystem?: string; // "Windows 11" | "macOS" | "Linux"
  weight?: string; // "1.4 kg"
  touchScreen?: boolean;

  // --- Category Specific Specifications ---
  // Storage / SSD
  interface?: string; // "PCIe 4.0" | "SATA III"
  formFactor?: string; // "M.2 2280" | "2.5 inch"
  readSpeed?: string; // "7000 MB/s"
  writeSpeed?: string; // "5100 MB/s"
  nvmeSata?: string; // "NVMe" | "SATA"

  // CCTV
  cameraType?: string; // "Dome" | "Bullet" | "IP"
  resolution?: string; // "4MP" | "4K" | "1080p"
  nightVision?: string; // "Color Night Vision" | "IR 30m"
  connectivity?: string; // "PoE" | "Wireless" | "BNC"

  // Commercial & Meta
  offers?: string[];
  gstInvoiceAvailable?: boolean;
  countryOfOrigin?: string;
  warranty?: string;
  availability?: string; // "In Stock" | "Low Stock" | "Out of Stock"
  newArrival?: boolean;
  featured?: boolean;
  rating?: number;
  reviewsCount?: number;

  // Key-value index signature for custom dynamic specs
  [customKey: string]: any;
}

export interface DynamicFilterGroup {
  definition: FilterDefinition;
  availableOptions: FilterOption[];
  currentMin?: number;
  currentMax?: number;
}

export interface FilterQueryState {
  category?: string;
  brand?: string[];
  processorBrand?: string[];
  processor?: string[];
  processorGen?: string[];
  ramCapacity?: string[];
  ramType?: string[];
  ssdCapacity?: string[];
  storageType?: string[];
  screenSize?: string[];
  graphics?: string[];
  dedicatedGraphicsMemory?: string[];
  operatingSystem?: string[];
  touchScreen?: boolean;
  condition?: string[];
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  discountMin?: number;
  offersOnly?: boolean;
  gstInvoiceOnly?: boolean;
  newArrivalsOnly?: boolean;
  inStockOnly?: boolean;
  search?: string;
  sortBy?: "recommended" | "price_low" | "price_high" | "discount" | "newest" | "rating";
}
