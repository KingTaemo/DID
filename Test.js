import { createAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { IPFSDIDProvider } from './IPFSDIDProvider.js'

async function Test() {
    // 1️⃣ Veramo Agent 초기화
    const agent = createAgent({
        plugins: [
            new DIDManager({
                store: new MemoryDIDStore(),
                defaultProvider: 'ipfs',
                providers: {
                    'ipfs': new IPFSDIDProvider()
                }
            })
        ]
    });

    try {
        console.log('🚀 Creating DID...');
        const identifier = await agent.didManagerCreate({
            provider: 'ipfs',
            kms: 'local',
            alias: 'test-did'
        });
        console.log('✅ Created DID:', identifier.did);

        // 3️⃣ DID 조회 테스트
        console.log('🔍 Resolving DID...');
        const resolvedDid = await agent.resolveDid({ did: identifier.did });
        console.log('✅ Resolved DID:', resolvedDid);

        // 4️⃣ DID 업데이트 테스트
        console.log('✏️ Updating DID...');
        const updateResult = await agent.updateIdentifier({
            did: identifier.did,
            document: {
                ...resolvedDid,
                updated: new Date().toISOString()
            }
        });
        console.log('✅ Updated DID:', updateResult);

        // 5️⃣ DID 삭제 테스트 (실제 IPFS에서는 삭제 불가)
        console.log('🗑️ Deleting DID...');
        const deleteResult = await agent.deleteIdentifier({ did: identifier.did });
        console.log('✅ Delete Attempt Result:', deleteResult);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// 실행
Test().then(() => console.log('🎉 Test Completed!')).catch(console.error);
