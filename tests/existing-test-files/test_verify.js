const http = require('http');

async function checkRouteExists(route) {
    try {
        const url = `http://localhost:3000${route}`;
        console.log(`Checking: ${url}`);
        const response = await fetch(url);
        return { status: response.status, ok: response.ok };
    } catch (e) {
        return { status: 0, error: e.message };
    }
}

async function runTests() {
    console.log("=== PUBLIC VERIFICATION E2E TEST ===");
    
    console.log("\n1. Checking /api/verify?regid=NBT-TR-2026-001");
    // We expect a 404 or 200, but not a 500 error.
    let verifyRes = await checkRouteExists("/api/verify?regid=NBT-TR-2026-001");
    console.log(`Status: ${verifyRes.status}`);

    console.log("\n2. Checking /api/certificates/NBT-TR-2026-001/download");
    let downloadRes = await checkRouteExists("/api/certificates/NBT-TR-2026-001/download");
    console.log(`Status: ${downloadRes.status}`);
}

runTests();
