import {
    createAgent,
    IDIDManager,
    IResolver,
    IDataStore,
    IDataStoreORM,
    IKeyManager,
    ICredentialPlugin,
} from '@veramo/core'

import { DIDManager, MemoryDIDStore } from '@veramo/did-manager'
import { EthrDIDProvider } from "@veramo/did-provider-ethr";
import { DIDResolverPlugin } from "@veramo/did-resolver";
import { Resolver } from "did-resolver";
import {CredentialPlugin} from "@veramo/credential-w3c";
import {getResolver} from "ethr-did-resolver";

const INFURA_PROJECT_ID = "16be73a339af47198391a283fa95f400";

const ethrDidResolver = new DIDResolverPlugin({
    resolver: new Resolver({
        ethr: getResolver( INFURA_PROJECT_ID).ethr,
    })
});

const agent = createAgent<
    IDIDManager & IKeyManager & IDataStore & IDataStoreORM & IResolver & ICredentialPlugin
>({
    plugins: [
        new DIDManager ({
            defaultProvider: 'did:ethr',
            store: new MemoryDIDStore(),
            providers: {
                'did:ethr': new EthrDIDProvider({
                    defaultKms: 'local',
                    networks: 'sepolia',
                    rpcUrl: 'https://sepolia.infura.io/v3/16be73a339af47198391a283fa95f400',
                }),
            }
        }),
        new DIDResolverPlugin({
            resolver: new Resolver({
                ...ethrDidResolver({ infuraProjectId: INFURA_PROJECT_ID}),
            }),
        }),
        new CredentialPlugin(),
    ]
})