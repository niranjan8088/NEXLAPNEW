const fs = require('fs');
const path = require('path');

// Simulate the logic in dbHelper
let certificates = [
    { registrationId: 'NBT-TR-2026-001', studentName: 'Test 1' },
    { registrationId: 'NBT-TR-2026-002', studentName: 'Test 2' }
];

let sequenceStore = {
    "2026": 2
};

function getNextRegistrationId(issueYear) {
    let maxExisting = 0;
    const prefix = `NBT-TR-${issueYear}-`;
    
    // Find max sequence from existing records
    certificates.forEach(cert => {
        if (cert.registrationId && cert.registrationId.startsWith(prefix)) {
            const numPart = cert.registrationId.substring(prefix.length);
            const num = parseInt(numPart, 10);
            if (!isNaN(num) && num > maxExisting) {
                maxExisting = num;
            }
        }
    });

    // Find max sequence from sequence store
    const storedLast = sequenceStore[issueYear] || 0;

    // Use the absolute maximum
    let nextNum = Math.max(storedLast, maxExisting) + 1;

    // Persist new last number
    sequenceStore[issueYear] = nextNum;

    // Format ID with at least 3 digits
    const paddedNum = String(nextNum).padStart(3, "0");
    return `${prefix}${paddedNum}`;
}

async function runTests() {
    console.log("=== REGISTRATION ID TEST AUDIT ===");
    
    console.log(`\nExisting IDs detected: ${certificates.map(c => c.registrationId).join(', ')}`);
    console.log(`Highest existing number: ${sequenceStore["2026"]}`);

    const nextId1 = getNextRegistrationId(2026);
    certificates.push({ registrationId: nextId1, studentName: 'Test 3' });
    console.log(`Created new record with Registration ID: ${nextId1}`);
    
    console.log(`\nDeleting record: NBT-TR-2026-002`);
    certificates = certificates.filter(c => c.registrationId !== 'NBT-TR-2026-002');
    
    console.log(`Existing IDs after deletion: ${certificates.map(c => c.registrationId).join(', ')}`);
    
    const nextId2 = getNextRegistrationId(2026);
    certificates.push({ registrationId: nextId2, studentName: 'Test 4' });
    console.log(`\nDelete + create test. Next Registration ID: ${nextId2}`);
    
    if (nextId2 === 'NBT-TR-2026-004') {
        console.log(`\nFinal status: PASS`);
    } else {
        console.log(`\nFinal status: FAIL`);
    }
}

runTests();
