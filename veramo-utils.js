import { createAgent } from '@veramo/core';
import { DIDManager, MemoryDIDStore } from '@veramo/did-manager';
import { KeyManager, MemoryKeyStore, MemoryPrivateKeyStore } from '@veramo/key-manager';
import { DIDResolverPlugin } from '@veramo/did-resolver';
import { KeyManagementSystem } from '@veramo/kms-local';
import { Resolver } from 'did-resolver';
import { MyIpfsDidProvider } from './my-ipfs-did-provider.js';
import { getIpfsDidResolver } from './my-ipfs-did-resolver.js';


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
                'did:ipfs': new MyIpfsDidProvider({ ipfsUrl: 'https://ipfs.infura.io:5001/api/v0' }),
            },
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({})
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({
                ...getIpfsDidResolver('https://ipfs.infura.io:5001/api/v0')
            })
        }),
    ]
});
