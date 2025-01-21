import { createDID, createVC, createVP, createDIDDoc } from './veramo-utils.js'
import { uploadToIPFS } from './IPFS-utils.js'
import { storeCIDOnBlockchain, useSolidity } from './Ethers-utils.js'

async function main() {
    try {
        const did = await createDID();
        //console.log("DID 생성됨\n", did);
        const didDoc = await createDIDDoc();
        //console.log("DID Document 생성됨\n", didDoc);

        const vc = await createVC()

        const cid = await uploadToIPFS(didDoc);
        console.log("IPFS에 DID Document 업로드됨: ", cid)

        await storeCIDOnBlockchain(cid)
        console.log('이더리움에 CID 저장 성공')

        console.log("---------\n")

        const vp = await createVP(vc, cid)

        await useSolidity(2);

    } catch (error){
        console.log(error)
    }
}

main().then()