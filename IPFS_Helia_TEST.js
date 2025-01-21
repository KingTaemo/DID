import { createHelia } from 'helia';
import { strings } from '@helia/strings';
import { CID } from 'multiformats/cid';

(async () => {
    const helia = await createHelia();
    const s = strings(helia);

    // 데이터를 추가하고 CID를 반환받습니다.
    const myImmutableAddress = await s.add('hello world');
    console.log("Generated CID:", myImmutableAddress.toString());

    // CID 문자열을 올바르게 정의합니다.
    const cidString = myImmutableAddress.toString(); // 순수한 CID 문자열
    const cidObject = CID.parse(cidString);

    // CID를 사용하여 데이터를 가져옵니다.
    const data = await s.get(cidObject);

    // 데이터 타입 확인 후 디코딩 또는 출력
    if (data instanceof Uint8Array) {
        console.log("Retrieved Data:", new TextDecoder().decode(data));
    } else {
        console.log("Retrieved Data:", data);
    }
})();
