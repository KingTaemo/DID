import { createAgent } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManagementSystem } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { MyIpfsDidProvider } from './my-ipfs-did-provider.js';
import {CredentialPlugin} from "@veramo/credential-w3c";

import {fetchFromIPFS} from "./IPFS-utils.js";

const ipfsDidResolver = {
    ipfs: async (did) => {
        console.log("확인 ", did.metadata);

        const cid = did.metadata;

        const didDoc = await fetchFromIPFS(did, cid);

        return didDoc;
    }
}
export function resolveIpfsDID(did) {
    const cid = did.metadata;

    const didDoc = fetchFromIPFS(cid);

    return didDoc;
}
export const agent = createAgent({
    plugins: [
        new KeyManager({
            store: new MemoryKeyStore(),
            kms: {
                local: new KeyManagementSystem(new MemoryPrivateKeyStore()),
            },
        }),
        new DIDManager({
            defaultProvider: 'did:ipfs',
            store: new MemoryDIDStore(),
            providers: {
                'did:ipfs': new MyIpfsDidProvider(),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({
                ...resolveIpfsDID
            })
        }),
        new CredentialPlugin(),
    ]
});
