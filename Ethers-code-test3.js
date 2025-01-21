/*
INFURA 연결
*/
import { ethers } from "ethers";

const INFURA_ID = '16be73a339af47198391a283fa95f400';
const NETWORK = 'sepolia';
const PRIVATE_KEY = '0x8db4367c248edabb38603ce80e784caf3432a0637edf4cbd352a1ef2e8973fd1';
const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "cid",
                "type": "string"
            }
        ],
        "name": "CIDStored",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "did",
                "type": "string"
            }
        ],
        "name": "DIDStored",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "getCID",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getDID",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_cid",
                "type": "string"
            }
        ],
        "name": "storeCID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_did",
                "type": "string"
            }
        ],
        "name": "storeDID",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export async function storeDIDandCIDOnBlockchain(cid, did){
    /*
    testnet에 cid를 저장
     */
    try {
        if (typeof cid !== 'string') {
            cid = cid.toString();
            console.log(cid);
        }


        // if (typeof did !== 'string') {
        //     did = did.toString();
        //
        //     console.log(did);
        // }

        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log(await provider.getTransactionCount(wallet.address, "latest"));


        const contract = new ethers.Contract("0xbb8c5f31f2be2e510b7a6125154d7910ccb6d28e", abi, wallet);


        // 트랜잭션 병렬 실행
        const [tx1, tx2] = await Promise.all([
            contract.storeDID(did),
            contract.storeCID(cid)
        ]);

        console.log('1번 트랜잭션 Hash:', tx1.hash);
        console.log('2번 트랜잭션 Hash:', tx2.hash);

        // 트랜잭션 결과 대기
        const [receipt1, receipt2] = await Promise.all([tx1.wait(), tx2.wait()]);

        console.log('1번 트랜잭션 성공:', receipt1.status === 1);
        console.log('2번 트랜잭션 성공:', receipt2.status === 1);
        console.log('스마트 컨트랙트 주소: ', contract.target);

    } catch (error) {
        console.error("ERROR: ", error);
    }
}
export async function getDIDandCIDOnBlockchain() {
    try {
        const provider = new ethers.JsonRpcProvider(`https://${NETWORK}.infura.io/v3/${INFURA_ID}`);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);


        const contractAddress = "0xbb8c5f31f2be2e510b7a6125154d7910ccb6d28e";
        const contract = new ethers.Contract(contractAddress, abi, wallet);

        // 상태 읽기 함수 호출
        const cid = await contract.getCID();
        const did = await contract.getDID();


        return { did, cid };
    } catch (error) {
        console.error("ERROR:", error);
        throw error;
    }
}

export async function storeVP(vp){
    try {
        if (typeof vp !== 'string') {
            vp = vp.toString();
        }
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract("0xbb8c5f31f2be2e510b7a6125154d7910ccb6d28e", abi, wallet);

        const tx = await contract.storeVP(vp);
        console.log(tx.hash);

        const receipt = await tx.wait();
        console.log("VP 저장 완료");

    } catch (error) {
        console.error("ERROR: ", error);
    }
}
export async function getVP(){
    try {
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract("0xbb8c5f31f2be2e510b7a6125154d7910ccb6d28e", abi, wallet);

        const storedVP = await contract.getVP();

        const vpObject = JSON.parse(storedVP);
        console.log(vpObject);

        return vpObject
    } catch (error) {
        console.error("ERROR: ", error);
    }
}


