import { createAgent } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManagementSystem } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { MyIpfsDidProvider } from './my-ipfs-did-provider.js';
import {CredentialPlugin} from "@veramo/credential-w3c";
import { CID } from 'multiformats/cid';

import {fetchFromIPFS} from "./IPFS-utils.js";

const didResolver = new Resolver({
    ipfs: resolveIpfsDID
});

export function resolveIpfsDID(did, ee) {
    console.log("나 호출됨");
    console.log(ee);
    console.log(typeof(did));
    //const cid = CID.parse(did.metadata.cid);

    const cid = did.metadata;

    console.log("did: ", did);

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
            resolver: didResolver
        }),
        new CredentialPlugin(),
    ]
});
