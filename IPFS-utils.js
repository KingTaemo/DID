import {createHelia} from 'helia'
import {strings} from '@helia/strings'
import { json } from '@helia/json'
import { CID } from 'multiformats/cid'; // 새롭게 추가한 부분 -> CID로 바꿔줌


let heliaInstance = null;

export async function getHeliaInstance() {
    if (!heliaInstance) {
        heliaInstance = await createHelia();
    }
    return heliaInstance;
}


export async function uploadToIPFS(didDoc) {
    try {
        const helia = await getHeliaInstance();

        const j = strings(helia);

        // DID Document를 문자열로 변환
        const didDocJson = JSON.stringify(didDoc);

        //console.log(didDocJson)
        // IPFS에 업로드
        const cid = await j.add(didDocJson);
        console.log("DID Document가 IPFS에 업로드되었습니다. CID:", cid);

        return cid;
    } catch (error) {
        console.error("IPFS 업로드 실패:", error);
        throw error;
    }
}

export async function fetchFromIPFS(did) {
    const helia = await getHeliaInstance();

    const s = strings(helia);

    try {
        const cidString = did.split(':').pop().trim();
        const cid = CID.parse(cidString);

        // IPFS에서 CID를 통해 데이터 검색
        const data = await s.get(cid);

        // JSON으로 파싱
        return JSON.parse(data);

    } catch (error) {
        console.error("IPFS에서 데이터 가져오기 실패:", error);
        throw error;
    }
}