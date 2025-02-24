// file-did-store.js
import fs from 'fs';
import path from 'path';
import os from 'os';
import readlineSync from 'readline-sync';
import {AbstractDIDStore} from './node_modules/@veramo/did-manager/build/abstract-identifier-store.js';

export class FileDIDStore extends AbstractDIDStore {
    constructor(filePath) {
        super();
        this.filePath = filePath;
        this.identifiers = {}; // MemoryDIDStore와 유사한 데이터 구조 사용
        this.load();
    }

    load() {
        if (fs.existsSync(this.filePath)) {
            console.log("파일이 이미 존재합니다. 덮어쓰시겠습니까?");
            const answer = readlineSync.question(`${this.filePath} (Y/n): `);
            if (answer.toLowerCase() === 'y' || answer.trim() === '') {
                // 덮어쓰기를 선택하면 기존 데이터를 초기화
                this.identifiers = {};
                console.log('기존 파일을 덮어쓰고, 데이터를 초기화합니다.');
            } else {
                // 아니면 기존 파일 데이터를 로드
                const fileData = fs.readFileSync(this.filePath, 'utf-8');
                try {
                    this.identifiers = JSON.parse(fileData);
                } catch (error) {
                    console.error('JSON 파싱 오류:', error);
                    this.identifiers = {};
                }
            }
        } else {
            this.identifiers = {};
        }
    }

    save() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.identifiers, null, 2));
    }

    // MemoryDIDStore와 동일한 인터페이스 구현

    async getDID({ did, alias, provider }) {
        if (did && !alias) {
            if (!this.identifiers[did])
                throw new Error(`not_found: IIdentifier not found with did=${did}`);
            return this.identifiers[did];
        } else if (!did && alias) {
            for (const key of Object.keys(this.identifiers)) {
                if (this.identifiers[key].alias === alias) {
                    return this.identifiers[key];
                }
            }
        } else {
            throw new Error('invalid_argument: Get requires did or (alias and provider)');
        }
        throw new Error(`not_found: IIdentifier not found with alias=${alias} provider=${provider}`);
    }

    async deleteDID({ did }) {
        delete this.identifiers[did];
        this.save();
        return true;
    }

    async importDID(args) {
        const identifier = { ...args };
        // 개인키 정보는 제거 (보안상 저장하지 않음)
        for (const key of identifier.keys) {
            if (key.privateKeyHex) {
                delete key.privateKeyHex;
            }
        }
        this.identifiers[args.did] = identifier;
        this.save();
        return true;
    }

    async listDIDs(args) {
        let result = [];
        for (const key of Object.keys(this.identifiers)) {
            result.push(this.identifiers[key]);
        }
        if (args) {
            if (args.alias && !args.provider) {
                result = result.filter((i) => i.alias === args.alias);
            } else if (args.provider && !args.alias) {
                result = result.filter((i) => i.provider === args.provider);
            } else if (args.provider && args.alias) {
                result = result.filter((i) => i.provider === args.provider && i.alias === args.alias);
            }
        }
        return result;
    }
}

// 파일 경로 예시: 사용자의 바탕화면에 'did.json' 파일 생성
const desktopPath = path.join(os.homedir(), 'Desktop', 'did.json');
export const fileDIDStore = new FileDIDStore(desktopPath);
