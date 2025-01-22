import { agent } from './veramo-utils.js';

async function createIpfsDID() {
    const identifier = await agent.didManagerCreate({
        alias: 'test',
        provider: 'did:ipfs'
    });

    console.log("✅ 생성된 DID:", identifier.did);
    console.log("📂 DID 문서 CID:", identifier.metadata.cid);

    return identifier;
}

async function resolveIpfsDID(did) {
    const didDocument = await agent.resolveDid({ didUrl: did });
    console.log("📜 DID 문서:", JSON.stringify(didDocument, null, 2));
}

// 실행
createIpfsDID().then();

const did = "did:ipfs:QmX...";
resolveIpfsDID(did).then();

