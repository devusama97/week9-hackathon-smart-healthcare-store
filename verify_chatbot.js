async function testChat(message) {
    try {
        const url = `http://localhost:5000/ai/chat`;
        console.log(`\n💬 Testing Chat: "${message}"`);

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await res.json();

        console.log('AI Response:', data.response);
        console.log('Products found:', data.suggestedProducts?.length || 0);

        const productTitles = data.suggestedProducts?.map(p => p.title) || [];
        console.log('Product Titles:', productTitles);

        if (message.includes('hair fall')) {
            const hasBiotin = productTitles.some(t => t.toLowerCase().includes('biotin') || t.toLowerCase().includes('collagen'));
            if (hasBiotin || data.suggestedProducts.length > 0) {
                console.log('\x1b[32m✅ SUCCESS: Chatbot suggested products for hair fall.\x1b[0m');
            } else {
                console.log('\x1b[31m❌ FAILURE: No products suggested for hair fall.\x1b[0m');
            }
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testChat('Suggest vitamins for hair fall');
