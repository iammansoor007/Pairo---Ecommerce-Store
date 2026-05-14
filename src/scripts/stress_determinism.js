const ConflictResolver = require('../lib/promotionEngine/ConflictResolver.js').default;

function testDeterminism() {
    console.log("--- TESTING CONFLICT RESOLVER DETERMINISM ---");

    const promoA = { _id: 'A', title: 'Promo A', priority: 10, exclusive: false, stackable: true };
    const promoB = { _id: 'B', title: 'Promo B', priority: 10, exclusive: false, stackable: true };

    const eligible = [
        { promotion: promoA, execution: { discountAmount: 10 }, evaluation: { explanation: '...' } },
        { promotion: promoB, execution: { discountAmount: 10 }, evaluation: { explanation: '...' } }
    ];

    // Run 100 times to see if order changes (though Array.sort is usually stable in modern V8)
    const results = [];
    for (let i = 0; i < 100; i++) {
        const resolved = ConflictResolver.resolve(eligible);
        results.push(resolved[0].promotion._id);
    }

    const uniqueResults = new Set(results);
    console.log("Unique First Results:", Array.from(uniqueResults));
    
    if (uniqueResults.size > 1) {
        console.log("❌ NON-DETERMINISTIC BEHAVIOR DETECTED!");
    } else {
        console.log("✅ ORDER STABLE (but potentially arbitrary)");
    }
}

testDeterminism();
