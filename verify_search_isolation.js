async function testSearch(query, aiMode = false) {
    try {
        const url = `http://localhost:5000/products?search=${encodeURIComponent(query)}&aiMode=${aiMode}`;
        console.log(`\n🔍 Testing Query: "${query}" | AI Mode: ${aiMode}`);

        const res = await fetch(url);
        const data = await res.json();

        console.log('Match Type:', data.matchType);
        console.log('Products found:', data.products?.length || 0);
        if (data.aiResponse) {
            console.log('AI Response (truncated):', data.aiResponse.substring(0, 100) + '...');
        } else {
            console.log('AI Response: NONE');
        }

        return data;
    } catch (err) {
        console.error('Error:', err.message);
    }
}

async function runTests() {
    console.log('--- STARTING VERIFICATION ---');

    // 1. Exact Match - AI Mode OFF
    console.log('\n[1] Exact Match Test (AI Mode: false)');
    const res1 = await testSearch('Vitamin C', false);
    if (res1.matchType === 'exact' && res1.products.length > 0 && !res1.aiResponse) {
        console.log('\x1b[32m✅ PASS: Exact match found, NO AI response\x1b[0m');
    } else {
        console.log('\x1b[31m❌ FAIL: Exact match logic error\x1b[0m');
    }

    // 2. No Match - AI Mode OFF
    console.log('\n[2] No Match Test (AI Mode: false)');
    const res2 = await testSearch('weak bones', false);
    if (res2.matchType === 'none' && res2.products.length === 0 && !res2.aiResponse) {
        console.log('\x1b[32m✅ PASS: No match found, NO AI response triggered\x1b[0m');
    } else {
        console.log('\x1b[31m❌ FAIL: AI triggered inadvertently or found incorrect match\x1b[0m');
    }

    // 3. AI Intent Search - AI Mode ON
    console.log('\n[3] AI Intent Test (AI Mode: true)');
    const res3 = await testSearch('I have weak bones', true);
    if (res3.matchType === 'semantic' && res3.products.length > 0 && res3.aiResponse) {
        console.log('\x1b[32m✅ PASS: AI suggested products with reasoning\x1b[0m');
    } else {
        console.log('\x1b[31m❌ FAIL: AI failed to suggest or provide reasoning\x1b[0m');
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

runTests();
