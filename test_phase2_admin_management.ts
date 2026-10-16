/**
 * NEXLAPTECH — PHASE 2 REGRESSION & COMPREHENSIVE SUITE
 * Verifies Category-Aware Specs, RAM/SSD Cross-Assignment Protection,
 * Specification Normalization (TESTS A through H), Admin Filter CRUD, and Option Expansion.
 */

import { dbHelper } from "./lib/dbHelper";
import { DEFAULT_FILTER_DEFINITIONS, buildDynamicCatalogFilters } from "./lib/filterEngine";
import { extractStructuredSpecs, normalizeRamCapacity } from "./lib/normalization";
import { FilterDefinition } from "./lib/types/ecommerce";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

async function runPhase2ComprehensiveSuite() {
  console.log("\n==================================================");
  console.log("NEXLAPTECH PHASE 2: COMPREHENSIVE REGRESSION SUITE");
  console.log("==================================================\n");

  // TEST A: Laptop RAM = 16 GB
  console.log("--- TEST A: Laptop RAM = 16 GB ---");
  const laptopA = await dbHelper.products.create({
    sku: "NEX-LTP-TEST-A",
    title: "Dell Latitude 5440 16GB",
    category: "business_laptops",
    price: 75000,
    specs: { "RAM Capacity": "16 GB", "SSD Capacity": "512 GB" },
  });
  const specsA = extractStructuredSpecs(laptopA);
  assert(specsA.ramCapacity === "16 GB", "Laptop RAM capacity is 16 GB");

  // TEST B: SSD Capacity = 2 TB
  console.log("\n--- TEST B: SSD Capacity = 2 TB ---");
  const ssdB = await dbHelper.products.create({
    sku: "NEX-SSD-TEST-B",
    title: "Samsung 990 PRO 2TB SSD",
    category: "storage",
    price: 18000,
    specs: { Capacity: "2 TB" },
  });
  const specsB = extractStructuredSpecs(ssdB);
  assert(specsB.ssdCapacity === "2 TB", "SSD capacity is 2 TB");

  // TEST C: RAM Capacity = 32 GB
  console.log("\n--- TEST C: RAM Capacity = 32 GB ---");
  const ramC = await dbHelper.products.create({
    sku: "NEX-RAM-TEST-C",
    title: "Corsair Vengeance 32GB RAM",
    category: "ram",
    price: 9500,
    specs: { Capacity: "32 GB" },
  });
  const specsC = extractStructuredSpecs(ramC);
  assert(specsC.ramCapacity === "32 GB", "RAM capacity is 32 GB");

  // TEST D: RAM Capacity = 64 GB
  console.log("\n--- TEST D: RAM Capacity = 64 GB ---");
  const ramD = await dbHelper.products.create({
    sku: "NEX-RAM-TEST-D",
    title: "Kingston Fury 64GB DDR5 RAM",
    category: "ram",
    price: 18500,
    specs: { Capacity: "64 GB" },
  });
  const specsD = extractStructuredSpecs(ramD);
  assert(specsD.ramCapacity === "64 GB", "RAM capacity is 64 GB");

  // TEST E: RAM Input = "32GB" -> Normalized = "32 GB"
  console.log("\n--- TEST E: RAM Input = '32GB' ---");
  const normE = normalizeRamCapacity("32GB");
  assert(normE === "32 GB", "Input '32GB' normalized to '32 GB'");

  // TEST F: RAM Input = "32 gb" -> Normalized = "32 GB"
  console.log("\n--- TEST F: RAM Input = '32 gb' ---");
  const normF = normalizeRamCapacity("32 gb");
  assert(normF === "32 GB", "Input '32 gb' normalized to '32 GB'");

  // TEST G: Laptop RAM = 32 GB & SSD = 1 TB (Cross-Assignment Protection)
  console.log("\n--- TEST G: Cross-Assignment Protection (RAM 32GB & SSD 1TB) ---");
  const laptopG = await dbHelper.products.create({
    sku: "NEX-LTP-TEST-G",
    title: "Workstation Pro 16",
    category: "business_laptops",
    price: 145000,
    specs: { "RAM Capacity": "32 GB", "SSD Capacity": "1 TB" },
  });
  const specsG = extractStructuredSpecs(laptopG);
  assert(specsG.ramCapacity === "32 GB", "Laptop RAM capacity correctly assigned as 32 GB");
  assert(specsG.ssdCapacity === "1 TB", "Laptop SSD capacity correctly assigned as 1 TB");
  assert(specsG.ramCapacity !== specsG.ssdCapacity, "No cross-assignment pollution between RAM and SSD");

  // TEST H: RAM Input = "32 GB DDR4 3200 MHz" -> Capacity = 32 GB, RAM Type = DDR4, Speed = 3200 MHz
  console.log("\n--- TEST H: Compound RAM Spec Parsing ---");
  const ramH = await dbHelper.products.create({
    sku: "NEX-RAM-TEST-H",
    title: "Crucial Desktop RAM Kit",
    category: "ram",
    price: 8000,
    specs: { Capacity: "32 GB DDR4 3200 MHz" },
  });
  const specsH = extractStructuredSpecs(ramH);
  assert(specsH.ramCapacity === "32 GB", "Compound capacity extracted as '32 GB'");
  assert(specsH.ramType === "DDR4", "Compound RAM type extracted as 'DDR4'");
  assert(specsH.speed === "3200 MHz", "Compound speed extracted as '3200 MHz'");

  // ADMIN FILTER DEFINITION CRUD & CUSTOM OPTION EXPANSION
  console.log("\n--- ADMIN FILTER CRUD & 128 GB OPTION EXPANSION ---");
  const filterList = await dbHelper.filterDefinitions.list();
  const ramFilter = filterList.find((f: FilterDefinition) => f.key === "ramCapacity");
  assert(Boolean(ramFilter), "RAM capacity filter definition exists");

  const updatedOptions = [...(ramFilter.options || []), { label: "128 GB", value: "128 GB" }];
  const updatedFilters = filterList.map((f: FilterDefinition) =>
    f.key === "ramCapacity" ? { ...f, options: updatedOptions } : f
  );

  await dbHelper.filterDefinitions.save(updatedFilters);
  const reloaded = await dbHelper.filterDefinitions.list();
  const reloadedRamFilter = reloaded.find((f: FilterDefinition) => f.key === "ramCapacity");
  assert(
    reloadedRamFilter?.options?.some((o: any) => o.value === "128 GB"),
    "Admin dynamically added '128 GB' option to RAM Capacity filter"
  );

  console.log("\n==================================================");
  console.log("🎉 ALL REGRESSION & PHASE 2 TESTS PASSED!");
  console.log("==================================================\n");
}

runPhase2ComprehensiveSuite().catch((err) => {
  console.error("Suite execution failed:", err);
  process.exit(1);
});
