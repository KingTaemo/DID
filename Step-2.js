/*
User가 DID를 통해 VC를 발급 받음
기관에 DID를 암호화해서 전송했다고 가정함
 */
import {createVC} from "./veramo-test.js";
import {saveVCToDesktop} from "./vc-store.js";

export async function step2(did){
    const vc = await createVC(did);

    await saveVCToDesktop(vc);
}
