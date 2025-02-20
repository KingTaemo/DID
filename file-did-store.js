// file-did-store.js
import fs from 'fs';
import path from 'path';
import os from 'os';
import readlineSync from 'readline-sync';

export class FileDIDStore {
    constructor(filePath) {
        this.filePath = filePath;
        this.data = {};
        this.load();
    }

    load() {
        if (fs.existsSync(this.filePath)) {
            // 파일이 이미 존재하면 덮어쓸지 물어봅니다.
            console.log("파일이 이미 존재합니다. 덮어쓰겠습니까?");
            const answer = readlineSync.question(
                `${this.filePath} (Y/n): `
            );
            if (answer.toLowerCase() === 'y' || answer.trim() === '') {
                // 사용자가 덮어쓰기를 선택한 경우, 기존 데이터를 무시하고 빈 객체로 초기화합니다.
                this.data = {};
                console.log('기존 파일을 덮어쓰고, 데이터를 초기화합니다.');
            } else {
                // 사용자가 덮어쓰지 않으면 기존 파일 내용을 로드합니다.
                const fileData = fs.readFileSync(this.filePath, 'utf-8');
                try {
                    this.data = JSON.parse(fileData);
                } catch (error) {
                    console.error('JSON 파싱 오류:', error);
                    this.data = {};
                }
            }
        } else {
            this.data = {};
        }
    }

    save() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    }

    // DIDManager에서 호출하는 메서드 구현
    async getDIDs() {
        return Object.values(this.data);
    }

    async importDID(did) {
        // did 객체에는 최소한 did.did (DID 문자열)가 포함되어야 합니다.
        this.data[did.did] = did;
        this.save();
        return did;
    }

    async deleteDID(did) {
        delete this.data[did.did];
        this.save();
    }
}

// 파일 경로 예시: 사용자의 바탕화면에 'veramo_dids.json' 파일 생성
const desktopPath = path.join(os.homedir(), 'Desktop', 'did.json');
export const fileDIDStore = new FileDIDStore(desktopPath);
