import { agent } from './veramo-utils.js';
import { fetchFromIPFS } from './IPFS-utils.js'
async function createIpfsDID() {
    const identifier = await agent.didManagerCreate({
        alias: 'test',
        provider: 'did:ipfs'
    });

    console.log("생성된 DID:", identifier.did);
    console.log("DID 문서 CID:", identifier.metadata.cid);

    return identifier;
}

async function resolveIpfsDID(did) {
    const cid = did.metadata;
    const didDoc = fetchFromIPFS(cid);

    return didDoc;
}

async function test(){
    const did = await createIpfsDID();
    console.log(did);

    const didDoc = await resolveIpfsDID(did);
    console.log("생성된 DID Document: ", didDoc);
}

test().then();
//process.exit(0);