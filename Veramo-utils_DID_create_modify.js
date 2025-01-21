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

// DID Resolver 설정
const didResolver = new DIDResolverPlugin({
    resolver: new Resolver({
        ethr: getResolver({ infuraProjectId: '16be73a339af47198391a283fa95f400' }).ethr,
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
            },
            defaultProvider: 'did:ethr',
            store: new MemoryDIDStore(),
        }),

        new DIDResolverPlugin({
            resolver: new Resolver({
                ...keyDidResolver
            }),
        }),
        new CredentialPlugin(),
        new DataStore(),
        new DataStoreORM(),
        didResolver,
    ],
})
// DID 생성
const id = await agent.didManagerCreate({ alias: 'my-did' })

// public key 확인
const didDetails = await agent.didManagerGet({ did: id.did });
console.log("keys[0]: ", didDetails);
const keyId = didDetails.keys[0].kid;
await getKey(keyId);



export async function getKey(kid){
    try {
        const key = await agent.keyManagerGet({ kid }); // 키 ID를 통해 키를 불러오기
        console.log('메모리에 저장된 키:', key);
        return key;
    } catch (error) {
        console.error('키를 가져오는 중 오류 발생:', error);
        throw error;
    }
}
export async function createDIDDoc(){
    const doc = await agent.resolveDid({ didUrl: id.did })
    return { doc }
}
export async function createDID(){
    const did = id.did
    return { did }
}

// export async function verifyVP(verifiablePresentation) {
//     try {
//         const result = await agent.verifyPresentation({
//             presentation: verifiablePresentation, // 검증할 VP 객체
//             policies: { proofOfPossession: true }, // proofOfPossession 정책 적용
//         });
//         console.log('VP 검증 결과:', result);
//         return result;
//     } catch (error) {
//         console.error('VP 검증 중 오류 발생:', error);
//         throw error;
//     }
// }

export async function verifyVP(verifiablePresentation) {
    try {
        // VP에서 DID 추출
        const did = verifiablePresentation.holder;
        console.log('VP에서 추출된 DID:', did);

        // DID Document 가져오기
        const didDocument = await agent.resolveDid({ didUrl: did });
        console.log('DID Document:', didDocument);

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
export async function createVP(vc, cid){
    console.log(vc.issuer.id);
    const did = vc.issuer.id;
    console.log(cid);
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

