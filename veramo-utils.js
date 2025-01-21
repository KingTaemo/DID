/*
Testnet인 sepolia 것들을 Ganache로 변경
VC, VP 생성 추가
 */
import { createAgent } from '@veramo/core'
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { EthrDIDProvider } from '@veramo/did-provider-ethr'
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore} from '@veramo/key-manager'
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
                    network: 'ganache',
                    rpcUrl: 'HTTP://127.0.0.1:7545',
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

export async function createDIDDoc(){
    const doc = await agent.resolveDid({ didUrl: id.did })
    return { doc }
}
export async function createDID(){
    const did = id.did
    return { did }
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
