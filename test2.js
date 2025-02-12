import { agent, resolveIpfsDID } from './veramo-utils.js';
import {fetchFromIPFS } from './IPFS-utils.js'
import { storeCID, getCID } from "./Ethers-utils.js"
import { CID } from 'multiformats/cid'; // 새롭게 추가한 부분 -> CID로 바꿔줌

async function createIpfsDID() {
    const identifier = await agent.didManagerCreate({
        alias: 'test',
        provider: 'did:ipfs'
    });

    //console.log("생성된 DID:", identifier.did);
    const cid = identifier.metadata.cid

    return identifier;
}

async function createVC(did){
    const didKeys = await agent.didManagerGet({did: did.did });
    console.log("didKeys: ", didKeys);

    return await agent.createVerifiableCredential({
        credential: {
            issuer: {id: did.did},
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: did.did, // VC의 주체 DID
                key: did.keys,
                name: did.alias,
                cid: did.metadata.cid,
            },
        },
        proofFormat: 'jwt',
    });
}

async function createVP(vc){
    const did = vc.issuer.id;
    const cid = vc.credentialSubject.cid;

    console.log("VP 발급");
    const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
            holder: did,
            verifiableCredential: [vc], // VC를 포함
            cid: cid,
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiablePresentation'],
        },
        proofFormat: 'jwt',
    })

    console.log("VP 발급 완료");

    return verifiablePresentation
}

async function verifyVP(vp, vp_cid){
    const origin_cid = await getCID(vp_cid);
    console.log("origin_cid: ", origin_cid);

    const cid = CID.parse(origin_cid);

    const result = await agent.verifyPresentation({
        presentation: vp,
        policies: { proofOfPossession: true
        },
    });

    return result;
}

async function test(){
    const did = await createIpfsDID();
    //console.log();

    const didDoc = await resolveIpfsDID(did);
    console.log("생성된 DID Document: ", didDoc);

    await storeCID(did.metadata.cid);
    //console.log("Ethereum에 CID 저장");

    const vc = await createVC(did);
    console.log("생성된 VC", vc);

    const vp = await createVP(vc);
    console.log("생성된 VP: ", vp);

    const verify_result = await verifyVP(vp, vp.cid);
    console.log(verify_result);
}

test().then();
//process.exit(0);