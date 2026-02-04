async function testQuery(query) {
    try {
        const url = `http://localhost:5000/ai/search?q=${encodeURIComponent(query)}`;
        console.log(`\n🔍 Testing Query: "${query}"`);

        const res = await fetch(url);
        const data = await res.json();

        console.log('AI Response (truncated):', data.response?.substring(0, 150) + '...');
        console.log('Products found:', data.suggestedProducts?.length || 0);

        if (data.response && Array.isArray(data.suggestedProducts)) {
            console.log('\x1b[32m✅ SUCCESS: Response structure is correct\x1b[0m');
        } else {
            console.log('\x1b[31m❌ FAILURE: Missing response or products array\x1b[0m');
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

async function runTests() {
    await testQuery('I have weak bones'); // Should find products
    await testQuery('migraine issue');    // Should NOT find products but SHOULD give advice
    await testQuery('extremely tired and low energy'); // Should found products
}

runTests();
