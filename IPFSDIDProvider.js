import { uploadToIPFS } from './IPFS-utils.js';

export class IPFSDIDProvider {
    async createIdentifier({ alias }) {
        const didDoc = {
            "@context": "https://www.w3.org/ns/did/v1",
            id: `did:ipfs:${alias}`,
        };

        // IPFS에 DID Document 업로드
        const cid = await uploadToIPFS(didDoc);

        //console.log(`DID Document가 IPFS에 저장되었습니다. CID: ${cid}`);

        const key = {
            kid: `key-${alias}`,
            kms: 'local',
            type: 'Secp256k1',
        };

        return { did: `did:ipfs:${cid}`, keys: [key], services: [] };
    }
}