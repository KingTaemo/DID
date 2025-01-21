import { createHelia } from 'helia';
import { strings } from '@helia/strings';
import { createAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager'
import { KeyManagementSystem } from '@veramo/kms-local'
import { DIDResolverPlugin } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { getResolver as keyDidResolver } from "key-did-resolver";
import { DataStore, DataStoreORM } from "@veramo/data-store";

import { v4 as uuid } from 'uuid';

import { CID } from 'multiformats/cid'; // 새롭게 추가한 부분 -> CID로 바꿔줌

import {fetchFromIPFS, uploadToIPFS} from "./IPFS-utils.js";

// Helia 기반 DID Resolver 추가
class HeliaDIDResolver {
    constructor(heliaInstance) {
        this.helia = heliaInstance;
        this.strings = strings(heliaInstance);
    }

    async resolve(didUrl) {
        try {
            const cidString = didUrl.split(':').pop();
            const data = await this.strings.get(cidString);
            const didDocument = JSON.parse(new TextDecoder().decode(data));

            return { didDocument };
        } catch (error) {
            console.error('Helia DID Resolver 실패:', error);
            return {
                didDocument: null,
                didResolutionMetadata: {
                    error: 'unsupportedDidMethod',
                    message: error.message,
                },
                didDocumentMetadata: {},
            };
        }
    }
}

const helia = await createHelia();

class IPFSDIDProvider {
    async createIdentifier({ alias }) {

        const did = `did:ipfs:${uuid()}`;
        console.log("생성된 DID: ", did);

        const didDoc = {
            "@context": "https://www.w3.org/ns/did/v1",
            id: did,
            verificationMethod: [
                {
                    id: `${did}#keys-1`,
                    type: 'Secp256k1VerificationKey2018',
                    controller: did,
                    publickeyHex: publicKeyHex,
                }
            ],
            authentication: [
                `${did}#keys-1`,
            ],
        };

        // IPFS에 DID Document 업로드
        const cid = await uploadToIPFS(didDoc);
        console.log("나 여기있소", cid);
        //console.log(`DID Document가 IPFS에 저장되었습니다. CID: ${cid}`);

        const key = await agent.keyManagerCreate({
            kid: `key-${alias}`,
            kms: 'local',
            type: 'Secp256k1',
        });

        return { did: did, keys: [key], services: [], cid: cid };
    }
}
// DID Resolver 설정
const didResolver = new DIDResolverPlugin({
    resolver: new Resolver({
        ethr: getResolver({ infuraProjectId: '16be73a339af47198391a283fa95f400' }).ethr,
        ipfs: new HeliaDIDResolver(helia),
    }),
})

const agent = createAgent({
    plugins: [
        new KeyManager({
            store: new MemoryKeyStore(),
            kms: {
                local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
            },
        }),
        new DIDManager({
            providers: {
                'did:ethr': new EthrDIDProvider({
                    defaultKms: 'local',
                    network: 'sepolia',
                    rpcUrl: 'https://sepolia.infura.io/v3/16be73a339af47198391a283fa95f400',
                }),
                'did:ipfs': new IPFSDIDProvider(), // IPFS
            },
            defaultProvider: 'did:ethr',
            store: new MemoryDIDStore(),
        }),

        new DIDResolverPlugin({
            resolver: new Resolver({
                ...keyDidResolver,
                ipfs: new HeliaDIDResolver(),
            }),
        }),
        new CredentialPlugin(),
        new DataStore(),
        new DataStoreORM(),
        didResolver,
    ],
})

const key = await agent.keyManagerCreate({
    kms: 'local',
    type: 'Secp256k1',
});

//console.log('생성된 키: ', key);
const publicKeyHex = key.publicKeyHex; // 공개 키
//console.log("공개 키:", publicKeyHex);

// DID 생성
const id = await agent.didManagerCreate({
    alias: 'my-did', // 이거 사용자 마다 다르게 받아오는게 좋아보임
    provider: 'did:ipfs',
    options: {
        keys: [key],
    },
});

// public key 확인
const didDetails = await agent.didManagerGet({ did: id.did });
if (!didDetails.keys || didDetails.keys.length === 0) {
    throw new Error('DID에 연결된 키가 없습니다.');
}
const keyId = didDetails.keys[0].kid;
//console.log('Key ID:', keyId);


export async function createDID(){
    const did = id.did

    return { did };
}

export async function createDIDDoc(did){
    const didDoc = {
        "@context": "https://www.w3.org/ns/did/v1",
        id: did,
        authentication: [],
        assertionMethod: [],
    };

    const cid = await uploadToIPFS(didDoc);
    console.log("CID: ", cid);

    return { cid }
}

export async function verifyVP(verifiablePresentation) {
    try {
        console.log("VP 검증 시작");
        console.log(verifiablePresentation);
        // VP에서 DID 추출
        const did = verifiablePresentation.holder;
        console.log(did);



        const cidString = did.split(':').pop().trim();
        const cid = CID.parse(cidString);

        const resolvedDID = await agent.resolveDid({ cid });
        console.log("resolvedDID: ", resolvedDID);

        // DID Document 가져오기
        //const didDocument = await agent.resolveDid({ didUrl: did });

        // VP 검증
        const result = await agent.verifyPresentation({
            presentation: verifiablePresentation,
            policies: { proofOfPossession: true }, // proofOfPossession 정책 적용
        });

        console.log('VP 검증 결과:', result);
        return result;
    } catch (error) {
        console.error('VP 검증 중 오류 발생:', error);
        throw error;
    }
}


// vc 생성
export async function createVC(){
    const verifiableCredential = await agent.createVerifiableCredential({
        credential: {
            issuer: { id: id.did },
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiableCredential'],
            issuanceDate: new Date().toISOString(),
            credentialSubject: {
                id: id.did, // VC의 주체 DID
                name: 'taemo',
                age: 23,
                key: keyId
            },
        },
        proofFormat: 'jwt',
    })

    console.log("VC 생성: ", verifiableCredential)

    return verifiableCredential
}

// VP 생성
export async function createVP(vc){
    const did = vc.issuer.id;

    const verifiablePresentation = await agent.createVerifiablePresentation({
        presentation: {
            holder: did,
            verifiableCredential: [vc], // VC를 포함
            '@context': ['https://www.w3.org/2018/credentials/v1'],
            type: ['VerifiablePresentation'],
        },
        proofFormat: 'jwt',
    })
    console.log("VP 생성: ", verifiablePresentation)

    return verifiablePresentation
}



