//import {createDID, createVC, createVP, createDIDDoc, verifyVP} from './veramo-utils_DID_create_modify.js'
import {verifyVP} from './veramo-test.js'
import { getDID, getCID } from './Ethers-utils.js'
/*
검증 진행
cid를 가져오는 작업 수행
 */
export async function phase_2(vp){
    try {
        const cid = await getCID();
        const did = await getDID();

        await verifyVP(vp);


    } catch (error){
        console.log(error);
    }
}
