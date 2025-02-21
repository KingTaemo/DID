/*
DID, DID Doc.을 만드는 단계
IPFS에 업로드도 진행함
 */
import {createInterface} from 'readline';
import {agent, resolveIpfsDID} from "./veramo-utils.js";
import {storeCID} from "./Ethers-utils.js";

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function createIpfsDID(alias) {
    //console.log("생성된 DID:", identifier.did);
    //const cid = identifier.metadata.cid

    return await agent.didManagerCreate({
        alias: alias,
        provider: 'did:ipfs'
    });
}

const question = (query) => new Promise(resolve => rl.question(query, resolve));

export async function step1(){
    const alice = await question("Alias를 입력하세요: ");
    console.log(`입력하신 값: ${alice}`);
    rl.close();

    const did = await createIpfsDID(alice);
    console.log(did.metadata);

    const didDoc = await resolveIpfsDID(did);
    console.log("생성된 DID Document: ", didDoc);

    await storeCID(did.metadata.cid);
    console.log("DID Document가 저장됨");
}

step1().then();
