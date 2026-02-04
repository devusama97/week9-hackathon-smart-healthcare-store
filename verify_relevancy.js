async function testQuery(query) {
    try {
        const url = `http://localhost:5000/ai/search?q=${encodeURIComponent(query)}`;
        console.log(`\n🔍 Testing Query: "${query}"`);

        const res = await fetch(url);
        const data = await res.json();

        console.log('AI Response (truncated):', data.response?.substring(0, 150) + '...');
        console.log('Products found:', data.suggestedProducts?.length || 0);

        const productTitles = data.suggestedProducts?.map(p => p.title) || [];
        console.log('Product Titles:', productTitles);

        if (query === 'migraine issue') {
            const hasJointSupport = productTitles.some(t => t.toLowerCase().includes('joint'));
            if (hasJointSupport) {
                console.log('\x1b[31m❌ FAILURE: Irrelevant product "Joint Support" found for migraine!\x1b[0m');
            } else {
                console.log('\x1b[32m✅ SUCCESS: Irrelevant products excluded for migraine.\x1b[0m');
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

async function runTests() {
    await testQuery('migraine issue');
    await testQuery('I have weak bones');
}

runTests();
