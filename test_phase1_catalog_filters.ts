/**
 * NEX LAPTECH — PHASE 1 E-COMMERCE CATALOG & FILTER SUITE
 * Comprehensive empirical test script for normalization, filter engine, and API routes.
 */

import {
  normalizeRamCapacity,
  normalizeStorageCapacity,
  normalizeProcessorBrand,
  normalizeProcessorFamily,
  normalizeScreenSize,
  extractStructuredSpecs,
} from "./lib/normalization";
import {
  DEFAULT_FILTER_DEFINITIONS,
  getFilterDefinitionsForCategory,
  evaluateProductFilters,
  buildDynamicCatalogFilters,
} from "./lib/filterEngine";
import { products as mockProducts } from "./lib/data";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runTestSuite() {
  console.log("\n==================================================");
  console.log("NEX LAPTECH PHASE 1: DYNAMIC CATALOG & FILTER SUITE");
  console.log("==================================================\n");

  // TEST 1: Data Normalization
  console.log("--- TEST 1: Specification Normalization ---");
  assert(normalizeRamCapacity("8GB") === "8 GB", "RAM 8GB normalized to '8 GB'");
  assert(normalizeRamCapacity("8 gb ddr4") === "8 GB", "RAM '8 gb ddr4' normalized to '8 GB'");
  assert(normalizeStorageCapacity("512GB") === "512 GB", "Storage 512GB normalized to '512 GB'");
  assert(normalizeStorageCapacity("1TB NVMe") === "1 TB", "Storage 1TB NVMe normalized to '1 TB'");
  assert(normalizeProcessorBrand("Intel Core i7-14700K") === "Intel", "Processor Brand normalized to 'Intel'");
  assert(normalizeProcessorFamily("Intel Core™ i5-1335U") === "Intel Core i5", "Processor Family normalized to 'Intel Core i5'");
  assert(normalizeScreenSize("14.0-inch") === "14 inch", "Screen size normalized to '14 inch'");

  // TEST 2: Specs Extraction from Product
  console.log("\n--- TEST 2: Product Structured Specs Extraction ---");
  const testLaptop = {
    id: "test-laptop-1",
    title: "Dell Latitude 5440",
    category: "business_laptops",
    brand: "Dell",
    price: 78000,
    stock: 10,
    specs: {
      Processor: "Intel Core i5-1335U",
      RAM: "16GB DDR5 4800MHz",
      Display: "14.0-inch FHD (1920x1080)",
      Storage: "512GB M.2 PCIe Gen4 NVMe SSD",
      OS: "Windows 11 Pro",
    },
  };

  const extracted = extractStructuredSpecs(testLaptop);
  assert(extracted.processorBrand === "Intel", "Extracted processor brand is Intel");
  assert(extracted.processor === "Intel Core i5", "Extracted processor family is Intel Core i5");
  assert(extracted.ramCapacity === "16 GB", "Extracted RAM capacity is 16 GB");
  assert(extracted.ssdCapacity === "512 GB", "Extracted SSD capacity is 512 GB");
  assert(extracted.screenSize === "14 inch", "Extracted Screen size is 14 inch");

  // TEST 3: Category-Aware Filter Definitions Loading
  console.log("\n--- TEST 3: Category-Aware Filter Definitions ---");
  const laptopFilters = getFilterDefinitionsForCategory("business_laptops");
  const storageFilters = getFilterDefinitionsForCategory("storage");

  assert(laptopFilters.length > 5, "Laptop filters loaded");
  assert(laptopFilters.some((f) => f.key === "processor"), "Laptop filters include Processor");
  assert(laptopFilters.some((f) => f.key === "ramCapacity"), "Laptop filters include RAM Capacity");

  assert(storageFilters.some((f) => f.key === "brand"), "Storage filters include Brand");
  assert(!storageFilters.some((f) => f.key === "processor"), "Storage filters DO NOT include Processor (category aware)");

  // TEST 4: Product Filter Evaluator
  console.log("\n--- TEST 4: Product Filter Evaluator ---");
  const passDell = evaluateProductFilters(testLaptop, {
    category: "business_laptops",
    brand: ["Dell"],
    processorBrand: ["Intel"],
    ramCapacity: ["16 GB"],
  });
  assert(passDell === true, "Dell laptop matches Dell + Intel + 16GB RAM query");

  const failHP = evaluateProductFilters(testLaptop, {
    category: "business_laptops",
    brand: ["HP"],
  });
  assert(failHP === false, "Dell laptop rejected when filtering by HP brand");

  // TEST 5: Dynamic Filter Option Calculator
  console.log("\n--- TEST 5: Dynamic Filter Option Calculator ---");
  const dynamicGroups = buildDynamicCatalogFilters(mockProducts, "business_laptops");
  assert(dynamicGroups.length > 0, "Dynamic catalog filter groups generated");
  
  const brandGroup = dynamicGroups.find((g) => g.definition.key === "brand");
  assert(Boolean(brandGroup), "Brand filter group found");
  console.log("Extracted Brand Options:", brandGroup?.availableOptions.map((o) => `${o.label} (${o.count})`).join(", "));

  console.log("\n==================================================");
  console.log("🎉 ALL PHASE 1 TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
