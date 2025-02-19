import { agent, resolveIpfsDID } from './veramo-utils.js';
import { fetchFromIPFS } from './IPFS-utils.js'
import { storeCID, getCID } from "./Ethers-utils.js"
import { CID } from 'multiformats/cid'; // 새롭게 추가한 부분 -> CID로 바꿔줌
import { jwtDecode } from 'jwt-decode';

import bs58 from 'bs58';
import { jwtVerify, importJWK } from 'jose';

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

async function verifyVpSignature(proof, publicKeyStr) {
    try {
        // 공개키 문자열이 헥스 형식인지 판단 (0-9, a-f, A-F 만 포함되어 있으면 헥스라고 가정)
        const isHex = /^[0-9a-fA-F]+$/.test(publicKeyStr);

        // 적절한 디코딩 방식 선택
        const publicKeyBytes = isHex
            ? Buffer.from(publicKeyStr, 'hex')
            : bs58.decode(publicKeyStr);

        // Ed25519 JWK 형식으로 변환 (jose가 요구하는 형식)
        const jwk = {
            kty: "OKP",
            crv: "Ed25519",
            x: Buffer.from(publicKeyBytes).toString('base64url'),
        };

        // JWK를 Key 객체로 가져옴
        const key = await importJWK(jwk, 'EdDSA');

        // JWT 검증 (EdDSA 알고리즘 사용)
        const { payload, protectedHeader } = await jwtVerify(proof.jwt, key, {
            algorithms: ['EdDSA'],
        });

        console.log("✅ JWT 검증 성공:", payload);
        return true;
    } catch (err) {
        console.error("❌ JWT 검증 실패:", err);
        return false;
    }
}

// 사용 예시
async function testVpSignatureVerification(vp, publicKeyBase58) {
    const { proof } = vp;
    if (!proof || !proof.jwt) {
        throw new Error("VP에 유효한 proof.jwt가 없습니다.");
    }
    const isValid = await verifyVpSignature(proof, publicKeyBase58);
    if (!isValid) {
        console.error("VP의 서명 검증에 실패했습니다.");
        return false;
    }
    console.log("VP의 서명이 올바릅니다.");
    return true;
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

    const verify_result = await testVpSignatureVerification(vp, didDoc.verificationMethod[0].publicKeyBase58);
    if (verify_result){
        console.log("검증 완료");
    }
    else {
        console.log("검증 실패");
    }
}

test().then();
//process.exit(0);