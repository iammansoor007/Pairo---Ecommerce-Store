import V from '../../lib/promotionEngine/Validator.js';
const Validator = V;

async function runASTHardeningTest() {
    console.log("\n🚀 [STRESS:SECURITY] Starting AST Hardening Verification...");

    // 1. DEPTH STRESS (Limit: 5)
    console.log("[SIM] Testing Max Depth (Limit: 5)...");
    const nestedAST = { operator: 'AND', rules: [] };
    let current = nestedAST;
    for (let i = 0; i < 10; i++) {
        const next = { operator: 'AND', rules: [] };
        current.rules.push(next);
        current = next;
    }
    const depthRes = Validator.validate({ conditions: nestedAST, actions: [{ type: 'percentage_discount', value: 10 }] });
    console.log(`  - Result: ${depthRes.isValid ? '❌ ALLOWED' : '✅ BLOCKED'} (${depthRes.errors[0]?.message})`);

    // 2. NODE COUNT STRESS (Limit: 50)
    console.log("[SIM] Testing Max Node Count (Limit: 50)...");
    const wideAST = { operator: 'OR', rules: [] };
    for (let i = 0; i < 100; i++) {
        wideAST.rules.push({ field: 'subtotal', op: '>', value: i });
    }
    const nodeRes = Validator.validate({ conditions: wideAST, actions: [{ type: 'percentage_discount', value: 10 }] });
    console.log(`  - Result: ${nodeRes.isValid ? '❌ ALLOWED' : '✅ BLOCKED'} (${nodeRes.errors[0]?.message})`);

    // 3. PAYLOAD SIZE STRESS (Limit: 50KB)
    console.log("[SIM] Testing Max Payload Size (Limit: 50KB)...");
    const largeAST = { operator: 'AND', rules: [] };
    largeAST.metadata = "A".repeat(100 * 1024); // 100KB string
    const sizeRes = Validator.validate({ conditions: largeAST, actions: [{ type: 'percentage_discount', value: 10 }] });
    console.log(`  - Result: ${sizeRes.isValid ? '❌ ALLOWED' : '✅ BLOCKED'} (${sizeRes.errors[0]?.message})`);

    // 4. RESULTS
    const allPassed = !depthRes.isValid && !nodeRes.isValid && !sizeRes.isValid;

    console.log("\n📊 [STRESS:RESULTS]");
    if (allPassed) {
        console.log("\n✅ [STATUS] AST HARDENING VERIFIED: ALL SECURITY LIMITS ENFORCED.");
    } else {
        console.log("\n❌ [STATUS] AST HARDENING FAILURE: SECURITY GAPS DETECTED!");
    }

    process.exit(0);
}

runASTHardeningTest();
