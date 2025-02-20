import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * 주어진 VC 객체를 사용자의 바탕화면에 'verifiable_credential.json' 파일로 저장합니다.
 * @param {Object} vc - 저장할 Verifiable Credential 객체
 */
export async function saveVCToDesktop(vc) {
    // 사용자의 바탕화면 경로를 생성합니다.
    const desktopPath = path.join(os.homedir(), 'Desktop', 'verifiable_credential.json');

    // VC 객체를 JSON 문자열로 변환 (보기 좋게 포맷팅)
    const vcString = JSON.stringify(vc, null, 2);

    // 파일을 동기적으로 저장합니다.
    fs.writeFileSync(desktopPath, vcString, 'utf-8');

    console.log(`VC가 성공적으로 저장되었습니다: ${desktopPath}`);
}

