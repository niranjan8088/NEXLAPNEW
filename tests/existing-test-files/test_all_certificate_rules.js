async function runTests() {
    console.log("=== COMPREHENSIVE CERTIFICATE SYSTEM E2E TEST ===");

    // Test 1 & 2: Safe API Fetch test
    console.log("\n[Test 1 & 2] Fetching certificates from GET /api/certificates...");
    try {
        const res = await fetch("http://localhost:3000/api/certificates");
        if (res.ok) {
            const list = await res.json();
            console.log("PASS: GET /api/certificates returned successfully without SyntaxError. Count:", list.length);
        } else {
            console.log(`Server response status: ${res.status}`);
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }

    // Test 4: Issue Certificate 1
    console.log("\n[Test 4] Issuing first test certificate via POST /api/certificates...");
    try {
        const res1 = await fetch("http://localhost:3000/api/certificates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentName: "Test Student A",
                courseTitle: "Web Development"
            })
        });
        if (res1.ok) {
            const data1 = await res1.json();
            console.log(`PASS: Created Certificate 1 with Registration ID: ${data1.registrationId}`);
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }

    // Test 5: Issue Certificate 2
    console.log("\n[Test 5] Issuing second test certificate via POST /api/certificates...");
    try {
        const res2 = await fetch("http://localhost:3000/api/certificates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentName: "Test Student B",
                courseTitle: "Cloud Architecture"
            })
        });
        if (res2.ok) {
            const data2 = await res2.json();
            console.log(`PASS: Created Certificate 2 with Registration ID: ${data2.registrationId}`);
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }

    // Test 6: Create from Internship (must NOT copy Enrollment ID)
    console.log("\n[Test 6] Creating Certificate from Internship record with Enrollment ID ENR-2026-000002...");
    try {
        const res3 = await fetch("http://localhost:3000/api/certificates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                studentName: "Internship Student C",
                courseTitle: "IoT Systems",
                enrollment_id: "ENR-2026-000002"
            })
        });
        if (res3.ok) {
            const data3 = await res3.json();
            if (data3.registrationId.startsWith("NBT-TR-") && data3.registrationId !== "ENR-2026-000002") {
                console.log(`PASS: Created Certificate 3 with Registration ID: ${data3.registrationId} (Did NOT copy ENR-2026-000002)`);
            } else {
                console.error(`FAIL: Certificate registration ID incorrectly used Enrollment ID: ${data3.registrationId}`);
            }
        }
    } catch (e) {
        console.error("Fetch error:", e.message);
    }

    console.log("\n=== ALL E2E CERTIFICATE TESTS RUN ===");
}

runTests();
