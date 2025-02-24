import {createAgent} from '@veramo/core';
import {DIDManager} from '@veramo/did-manager';
import {KeyManager, MemoryKeyStore, MemoryPrivateKeyStore} from '@veramo/key-manager';
import {DIDResolverPlugin} from '@veramo/did-resolver';
import {KeyManagementSystem} from '@veramo/kms-local';
import {Resolver} from 'did-resolver';
import {MyIpfsDidProvider} from './my-ipfs-did-provider.js';
import {CredentialPlugin} from "@veramo/credential-w3c";
import {fileDIDStore} from "./file-did-store_ver2.js";
import {JwtMessageHandler} from '@veramo/did-jwt';
import {fetchFromIPFS} from "./IPFS-utils.js";


const didResolver = new Resolver({
    'ipfs': resolveIpfsDID
});

export function resolveIpfsDID(did) {
    //const cid = CID.parse(did.metadata.cid);
    const cid = did.metadata;

    return fetchFromIPFS(cid);
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
            //store: new MemoryDIDStore(),
            store: fileDIDStore,
            providers: {
                'did:ipfs': new MyIpfsDidProvider(),
            },
        }),
        new DIDResolverPlugin({
            resolver: didResolver
        }),
        new CredentialPlugin(),
        new JwtMessageHandler(),
    ]
});
