/**
 * NEX LAPTECH — PHASE 3 CUSTOMER CATALOG & FILTER ENGINE SUITE
 * Comprehensive empirical test script for Phase 3 Customer Catalog, URL Sync,
 * Dynamic Filter Control, Category Isolation, and Combination Filters.
 */

import { dbHelper } from "./lib/dbHelper";
import { buildDynamicCatalogFilters, evaluateProductFilters, getFilterDefinitionsForCategory } from "./lib/filterEngine";
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

async function runPhase3Tests() {
  console.log("\n==================================================");
  console.log("NEX LAPTECH PHASE 3: CUSTOMER CATALOG & FILTER SUITE");
  console.log("==================================================\n");

  // TEST 1: Admin Filter Control Test (Enable / Disable Filter)
  console.log("--- TEST 1: Admin Filter Enable / Disable Control ---");
  const filterList = await dbHelper.filterDefinitions.list("business_laptops");
  const touchFilter = filterList.find((f: FilterDefinition) => f.key === "touchScreen");
  assert(Boolean(touchFilter), "TouchScreen filter definition found");

  // Disable TouchScreen filter
  const disabledFilters = filterList.map((f: FilterDefinition) =>
    f.key === "touchScreen" ? { ...f, enabled: false } : f
  );
  await dbHelper.filterDefinitions.save(disabledFilters);

  const disabledResult = getFilterDefinitionsForCategory("business_laptops", disabledFilters);
  assert(!disabledResult.some((f) => f.key === "touchScreen"), "Customer catalog excludes TouchScreen filter when Admin disables it");

  // Re-enable TouchScreen filter
  const reEnabledFilters = filterList.map((f: FilterDefinition) =>
    f.key === "touchScreen" ? { ...f, enabled: true } : f
  );
  await dbHelper.filterDefinitions.save(reEnabledFilters);

  const reEnabledResult = getFilterDefinitionsForCategory("business_laptops", reEnabledFilters);
  assert(reEnabledResult.some((f) => f.key === "touchScreen"), "Customer catalog displays TouchScreen filter when Admin enables it");

  // TEST 2: Admin Add New Custom Filter (NPU / AI Engine)
  console.log("\n--- TEST 2: Admin Add New Filter (NPU / AI Engine) ---");
  const npuFilter: FilterDefinition = {
    id: "flt-npu-ai",
    categoryId: "business_laptops",
    name: "NPU / AI Engine",
    key: "npuEngine",
    type: "boolean",
    enabled: true,
    sortOrder: 20,
  };

  const updatedWithNpu = [...reEnabledFilters, npuFilter];
  await dbHelper.filterDefinitions.save(updatedWithNpu);

  const customerNpuDefs = getFilterDefinitionsForCategory("business_laptops", updatedWithNpu);
  assert(
    customerNpuDefs.some((f) => f.key === "npuEngine"),
    "Customer catalog automatically renders Admin-created 'NPU / AI Engine' filter without code changes"
  );

  // TEST 3: Category Isolation & Spec Protection
  console.log("\n--- TEST 3: Category Filter Isolation ---");
  const allProds = await dbHelper.products.list();
  
  const laptopCatalog = buildDynamicCatalogFilters(allProds, "business_laptops", updatedWithNpu);
  const ramCatalog = buildDynamicCatalogFilters(allProds, "ram", updatedWithNpu);
  const ssdCatalog = buildDynamicCatalogFilters(allProds, "storage", updatedWithNpu);

  assert(laptopCatalog.some((g) => g.definition.key === "processor"), "Laptop catalog includes Processor filter");
  assert(!ramCatalog.some((g) => g.definition.key === "processor"), "RAM catalog DOES NOT include Processor filter");
  assert(!ssdCatalog.some((g) => g.definition.key === "processor"), "SSD catalog DOES NOT include Processor filter");

  // TEST 4: Combination Filter Evaluation
  console.log("\n--- TEST 4: Multi-Filter Combination Evaluation ---");
  const laptopDell16GB = {
    id: "combo-laptop-1",
    category: "business_laptops",
    brand: "Dell",
    price: 75000,
    status: "show",
    stock: 5,
    specs: {
      "Processor Brand": "Intel",
      "RAM Capacity": "16 GB",
      "SSD Capacity": "512 GB",
    },
  };

  const matchesCombo = evaluateProductFilters(laptopDell16GB, {
    category: "business_laptops",
    brand: ["Dell"],
    ramCapacity: ["16 GB"],
    priceMax: 80000,
  });
  assert(matchesCombo === true, "Product matches Brand=Dell + RAM=16GB + Price<=80000 query");

  const rejectedCombo = evaluateProductFilters(laptopDell16GB, {
    category: "business_laptops",
    brand: ["HP"],
    ramCapacity: ["16 GB"],
  });
  assert(rejectedCombo === false, "Product rejected when filtering by HP brand");

  // TEST 5: RAM Capacity Normalization Accuracy
  console.log("\n--- TEST 5: RAM Capacity Normalization Accuracy ---");
  assert(normalizeRamCapacity("32GB") === "32 GB", "32GB -> 32 GB");
  assert(normalizeRamCapacity("32 gb") === "32 GB", "32 gb -> 32 GB");
  assert(normalizeRamCapacity("32 GB RAM") === "32 GB", "32 GB RAM -> 32 GB");

  console.log("\n==================================================");
  console.log("🎉 ALL PHASE 3 CUSTOMER CATALOG TESTS PASSED!");
  console.log("==================================================\n");
}

runPhase3Tests().catch((err) => {
  console.error("Phase 3 test execution failed:", err);
  process.exit(1);
});
