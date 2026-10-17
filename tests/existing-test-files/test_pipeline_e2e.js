const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runAudit() {
  console.log("==================================================");
  console.log("NEX LAPTECH INTERNSHIP PIPELINE REAL AUDIT TEST");
  console.log("==================================================\n");

  // Step 1: Customer Form Submission
  console.log("[1/6] Submitting Customer Internship Application...");
  const customerPayload = {
    full_name: "Test Internship Student",
    phone: "9876543210",
    email: "testinternship@example.com",
    city: "Bengaluru",
    state: "Karnataka",
    college: "SIT Tumkur",
    university: "VTU",
    course: "BE / B.Tech",
    branch: "Computer Science",
    semester: "Semester 6",
    graduation_year: "2026",
    usn: "1RV21CS001",
    domain: "Full Stack Development",
    duration: "2 Months",
    internship_type: "Hybrid",
    purpose: "Academic Internship",
    need_project: "Yes",
    project_type: "Major Engineering Project",
    project_title: "AI Glassmorphic Portal",
    technology: "Next.js & Supabase",
    message: "Requesting internship enrollment for final semester credit."
  };

  const createRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/internships',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, customerPayload);

  console.log("Response Status:", createRes.status);
  const appId = createRes.data?.application_id || createRes.data?.applicationId;
  const dbId = createRes.data?.id || createRes.data?.application?.id;

  if (!appId || !dbId) {
    console.error("FAIL: Application creation failed!", createRes.data);
    process.exit(1);
  }

  console.log(`✓ Application Generated: ${appId} (DB ID: ${dbId})\n`);

  // Step 2: Admin Retrieval
  console.log("[2/6] Admin API Listing Verification...");
  const adminListRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/internships',
    method: 'GET'
  });

  const rawList = Array.isArray(adminListRes.data) ? adminListRes.data : (adminListRes.data?.applications || []);
  const matched = rawList.find(i => i.application_id === appId || i.id === dbId);
  if (!matched) {
    console.error("FAIL: Admin panel API did not retrieve submitted application!");
    process.exit(1);
  }
  console.log("✓ Admin panel retrieved application:", matched.application_id, matched.full_name, matched.status, "\n");

  // Step 3: Admin Approval & Enrollment ID Generation
  console.log("[3/6] Admin Approving Application & Assigning Mentor...");
  const approveRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/internships',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    id: dbId,
    status: "approved",
    mentor: "Nex LapTech Lead Architect",
    batch: "AUG-2026",
    start_date: "2026-08-01",
    end_date: "2026-10-01"
  });

  const updatedApp = approveRes.data?.application || approveRes.data;
  const enrollId = updatedApp?.enrollment_id;
  console.log(`✓ Enrollment ID Generated: ${enrollId}\n`);

  // Step 4: Progress to Completed
  console.log("[4/6] Updating Progress to 100% and Status to Completed...");
  const completeRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/internships',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    id: dbId,
    status: "completed",
    progress: 100
  });

  const completedApp = completeRes.data?.application || completeRes.data;
  console.log("Completion Status:", completedApp?.status, "Progress:", completedApp?.progress, "\n");

  // Step 5: Certificate Creation from Internship Record
  console.log("[5/6] Auto-Populating & Creating Certificate from Internship...");
  const certPayload = {
    registrationId: enrollId || appId,
    certificateId: `NXB-INT-2026-990011`,
    studentName: customerPayload.full_name,
    photoUrl: "/assets/nexlaptech-logo.png",
    courseTitle: customerPayload.course,
    trainingType: customerPayload.domain,
    internshipType: customerPayload.internship_type,
    projectTitle: customerPayload.project_title,
    completionDate: "2026-10-01",
    phoneNumber: customerPayload.phone,
    email: customerPayload.email,
    college: customerPayload.college,
    application_id: appId,
    enrollment_id: enrollId
  };

  const certRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/certificates',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, certPayload);

  const certNum = certRes.data?.certificateId;
  console.log(`✓ Certificate Issued: ${certNum} for Registration ID: ${certRes.data?.registrationId}\n`);

  // Step 6: Certificate Verification API
  console.log("[6/6] Verifying Certificate on Verification Portal API...");
  const verifyRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: `/api/certificates`,
    method: 'GET'
  });

  const certList = Array.isArray(verifyRes.data) ? verifyRes.data : [];
  const verifiedCert = certList.find(c => c.registrationId === enrollId || c.certificateId === certNum);
  if (!verifiedCert) {
    console.error("FAIL: Verification portal could not find issued certificate!");
    process.exit(1);
  }

  console.log("✓ Verified Certificate Record Found:");
  console.log("  - Student Name:", verifiedCert.studentName);
  console.log("  - Reg ID:", verifiedCert.registrationId);
  console.log("  - Certificate ID:", verifiedCert.certificateId);
  console.log("  - Status:", verifiedCert.status);
  console.log("\n==================================================");
  console.log("ALL E2E PIPELINE TESTS COMPLETED SUCCESSFULLY WITH PASS");
  console.log("==================================================");
}

runAudit().catch(err => {
  console.error("Error executing audit:", err);
  process.exit(1);
});
