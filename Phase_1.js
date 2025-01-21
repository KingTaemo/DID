//import { createDID, createVC, createVP, createDIDDoc } from './veramo-utils_v2.js'
import { createDID, createVC, createVP } from './veramo-test.js'
import { uploadToIPFS, fetchFromIPFS } from "./IPFS-utils.js";
import { storeDID, storeCID } from "./Ethers-utils.js";

import { CID } from 'multiformats/cid'; // 새롭게 추가한 부분 -> CID로 바꿔줌

/*
사전에 진행되는 것들
DID, DID Document 생성
VC 발행
DID Document를 IPFS에 저장 후 CID 추출
CID를 Ethereum에 저장
VP 반환
 */
export async function phase_1(){
    try {
        const { did } = await createDID();
        console.log("DID 생성됨\n", did);
        console.log("CID \n", did.cid);

        const didDoc = fetchFromIPFS(did);


        const vc = await createVC(did);

        const vp = await createVP(vc);
        console.log('VP 생성 완료', vp);


        console.log("사전 작업 끝")

        return vp;

    } catch (error) {
        console.log(error);
    }
}

