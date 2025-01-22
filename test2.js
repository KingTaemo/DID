import { agent } from './src/veramo/setup.ts';  // 🚀 setup.js에서 `agent` 불러오기

async function testVeramo() {
    try {
        console.log("🚀 Starting Veramo Tests...");

        // 1️⃣ DID 생성 테스트
        console.log("🆕 Creating a new DID...");
        const identifier = await agent.didManagerCreate({
            provider: 'did:ethr',
            kms: 'local'
        });
        console.log("✅ Created DID:", identifier.did);

        // 2️⃣ DID 조회 테스트
        console.log("🔍 Resolving DID...");
        const resolvedDid = await agent.resolveDid({ did: identifier.did });
        console.log("✅ Resolved DID:", JSON.stringify(resolvedDid, null, 2));

        // 3️⃣ DID 검증 테스트 (Public Key 확인)
        console.log("🔑 Checking DID keys...");
        const didKeys = await agent.didManagerGet({ did: identifier.did });
        console.log("✅ DID Keys:", JSON.stringify(didKeys, null, 2));

        // 4️⃣ Credential 생성 테스트
        console.log("📝 Issuing a Verifiable Credential...");
        const credential = await agent.createVerifiableCredential({
            credential: {
                issuer: identifier.did,
                credentialSubject: {
                    id: identifier.did,
                    name: "Alice",
                    age: 25
                }
            },
            proofFormat: "jwt"
        });
        console.log("✅ Issued Credential:", JSON.stringify(credential, null, 2));

        // 5️⃣ Credential 검증 테스트
        console.log("🔍 Verifying the Credential...");
        const verification = await agent.verifyCredential({ credential });
        console.log("✅ Credential Verification:", verification);

        console.log("🎉 All Tests Completed Successfully!");
    } catch (error) {
        console.error("❌ Error during testing:", error);
    }
}

// 실행
testVeramo().then();
