import { AbstractIdentifierProvider } from '@veramo/did-manager'
import { create } from 'ipfs-http-client'
import { uploadToIPFS } from "./IPFS-utils.js";

export class IPFSDIDProvider extends AbstractIdentifierProvider {
    constructor() {
        super();
        this.ipfs = create({ host: 'localhost', port: '5001', protocol: 'http' });
    }

    async createIdentifier(args, context) {
        const { kms, alias } = args;
        const didDocument = {
            '@context': 'https://www.w3.org/ns/did/v1',
            id: `did:ipfs:${alias || new Date().getTime()}`,
            verificationMethod: [],
            authentication: [],
            assertionMethod: [],
            service: []
        };

        const cid = await uploadToIPFS(didDocument);


        return {
            did: `did:ipfs:${cid.toString()}`,
            controllerKeyId: `did:ipfs:${cid.toString()}`,
            keys: [],
            services: []
        };
    }

    async resolveDid(args, context) {
        const cid = args.did.replace('did:ipfs:', '');
        const stream = this.ipfs.cat(cid);
        let didDocument = '';

        for await (const chunk of stream) {
            didDocument += chunk.toString();
        }

        return JSON.parse(didDocument);
    }

    async updateIdentifier(args, context) {
        const { cid } = await this.ipfs.add(JSON.stringify(args.document));
        console.log(`Updated DID: did:ipfs:${cid.toString()}`);
        return true;
    }

    async deleteIdentifier(args, context) {
        console.warn(`IPFS에서는 DID 삭제를 지원하지 않습니다: ${args.did}`);
        return false;
    }
}
