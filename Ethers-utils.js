/*
INFURA 연결
*/
import {ethers} from "ethers";

const INFURA_ID = '16be73a339af47198391a283fa95f400';
const NETWORK = 'sepolia';
const PRIVATE_KEY = '0x8db4367c248edabb38603ce80e784caf3432a0637edf4cbd352a1ef2e8973fd1';
const did_abi = [
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

const cid_abi = [
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
    }
];

export async function storeDID(did) {
    try {
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const contract = new ethers.Contract("0xc280e0ca389b2c7285ec9b38264df043bc5e42d2", did_abi, wallet);

        const tx = await contract.storeDID(did);
        console.log("Transaction Hash 값: ", tx.hash);
        console.log("주소: ", contract.target);
        console.log("Ethereum에 DID가 저장됨");
    } catch (error) {
        console.error("DID 저장 중 ERROR 발생 ", error);
    }
}
export async function getDID() {
    try {
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const contract = new ethers.Contract("0xc280e0ca389b2c7285ec9b38264df043bc5e42d2", did_abi, wallet);

        return await contract.getDID();
    } catch (error) {
        console.error("CID를 가져오는 중 ERROR 발생 ", error);
    }
}

export async function storeCID(cid) {
    try {
        if (typeof cid !== 'string') {
            cid = cid.toString();
        }
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const contract = new ethers.Contract("0x622688b8f9e896f0dcfc6aff8aed3c26b573605a", cid_abi, wallet);

        const tx = await contract.storeCID(cid);
        console.log("Transaction Hash 값: ", tx.hash);
        console.log("주소: ", contract.target);
        console.log("Ethereum에 CID가 저장됨");
    } catch (error) {
        console.error("CID 저장 중 ERROR 발생 ", error);
    }
}
/* CID 비교해서 기다리는 버전 */
// export async function getCID(cid) {
//     try {
//         const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
//         const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
//         const contract = new ethers.Contract("0x622688b8f9e896f0dcfc6aff8aed3c26b573605a", cid_abi, wallet);
//
//         console.log("⏳ 최신 CID 대기 중...");
//
//         while (true) {
//             // 최신 블록 번호 가져오기 (네트워크 동기화)
//             await provider.getBlockNumber();
//
//             // 스마트 컨트랙트에서 최신 CID 조회
//             const latestCID = await contract.getCID({ blockTag: "latest" });
//
//             if (cid === latestCID) {
//                 console.log("✅ 최신 CID 확인 완료:", latestCID);
//                 return latestCID; // CID 일치하면 반환 후 종료
//             }
//
//             console.log("⏳ 대기 중... 60초 후 다시 확인");
//             await new Promise(resolve => setTimeout(resolve, 60000)); // 30초 대기
//         }
//     } catch (error) {
//         console.error("❌ CID를 가져오는 중 오류 발생:", error);
//         throw error; // 오류 발생 시 상위 함수로 전달
//     }
// }
export async function getCID(cid) {
    try {
        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract("0x622688b8f9e896f0dcfc6aff8aed3c26b573605a", cid_abi, wallet);

        console.log("⏳ 최신 CID 대기 중...");

        return cid;
        // while (true) {
        //     // 최신 블록 번호 가져오기 (네트워크 동기화)
        //     await provider.getBlockNumber();
        //
        //     // 스마트 컨트랙트에서 최신 CID 조회
        //     const latestCID = await contract.getCID({ blockTag: "latest" });
        //
        //     if (cid === latestCID) {
        //         console.log("✅ 최신 CID 확인 완료:", latestCID);
        //         return latestCID; // CID 일치하면 반환 후 종료
        //     }
        //
        //     console.log("⏳ 대기 중... 60초 후 다시 확인");
        //     await new Promise(resolve => setTimeout(resolve, 60000)); // 30초 대기
        //}
    } catch (error) {
        console.error("❌ CID를 가져오는 중 오류 발생:", error);
        throw error; // 오류 발생 시 상위 함수로 전달
    }
}
