const http = require('http');

async function checkRouteExists(route) {
    try {
        const url = `http://localhost:3000${route}`;
        const response = await fetch(url);
        let data = null;
        try { data = await response.json(); } catch(e) {}
        return { status: response.status, ok: response.ok, data };
    } catch (e) {
        return { status: 0, error: e.message };
    }
}

async function runTests() {
    console.log("=== INTERNSHIP E2E PIPELINE TEST ===");
    
    // 1. Create Application
    console.log("\n1. Customer POSTing new application...");
    const payload = {
        full_name: "John Debug",
        phone: "9998887776",
        email: "john@debug.com",
        college: "Debug University",
        domain: "Cybersecurity",
        message: "Pipeline test record"
    };

    let postRes;
    try {
        const response = await fetch("http://localhost:3000/api/internships", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        postRes = { status: response.status, data: await response.json() };
    } catch (e) {
        postRes = { status: 0, error: e.message };
    }

    console.log(`Customer POST endpoint HTTP status: ${postRes.status}`);
    
    if (!postRes.data || !postRes.data.application_id) {
        console.error("FAIL: Did not receive Application ID from Server.");
        return;
    }

    const appId = postRes.data.application_id;
    console.log(`Database record found: YES (ID: ${appId})`);

    // 2. Fetch list as Admin
    console.log("\n2. Admin GET /api/internships...");
    const getRes = await checkRouteExists("/api/internships");
    let foundInList = false;
    
    if (getRes.data && getRes.data.applications) {
        const match = getRes.data.applications.find(a => a.application_id === appId);
        if (match) foundInList = true;
    }
    console.log(`GET /api/internships contains record: ${foundInList ? 'YES' : 'NO'}`);

    // 3. Fetch by ID
    console.log(`\n3. Admin GET /api/internships?id=${appId}...`);
    const getByIdRes = await checkRouteExists(`/api/internships?id=${appId}`);
    let foundById = false;
    
    if (getByIdRes.data && getByIdRes.data.application && getByIdRes.data.application.application_id === appId) {
        foundById = true;
    }
    console.log(`GET by ID works: ${foundById ? 'YES' : 'NO'}`);
    
    if (foundInList && foundById) {
        console.log(`\nStatus: PASS`);
    } else {
        console.log(`\nStatus: FAIL (Data mismatch)`);
    }
}

runTests();
