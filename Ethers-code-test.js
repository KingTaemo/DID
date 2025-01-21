/*
INFURA 연결
*/
import { ethers } from "ethers";

const INFURA_ID = '16be73a339af47198391a283fa95f400';
const NETWORK = 'sepolia';
const PRIVATE_KEY = '0x8db4367c248edabb38603ce80e784caf3432a0637edf4cbd352a1ef2e8973fd1';

export async function storeCIDOnBlockchain(cid){
    /*
    testnet에 cid를 저장
     */
    try {
        if (typeof cid !== 'string') {
            cid = cid.toString();
        }

        const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);

        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

        const abi = [
            {
                "inputs": [],
                "name": "getStoredCID",
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
                "inputs": [],
                "name": "storedCID",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ];

        const contract = new ethers.Contract("0x58Df22D542487393569C76cC24e660052B74ea7B", abi, wallet);


        const tx = await contract.storeCID(cid);
        console.log('Transaction Hash 값:', tx.hash);
        console.log('주소: ', contract.target);
        console.log('Ethereum에 CID가 저장됨');

    } catch (error) {
        console.error("ERROR: ", error);
    }
}

export async function useSolidity(num){
    const provider = new ethers.InfuraProvider(NETWORK, INFURA_ID);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    const abi = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_value",
                    "type": "string"
                }
            ],
            "name": "setValue",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getValue",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    const contractAddress = '0x51532e26af7eaa8ccbceef9c49c7438eda3a14c3';

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    const tx = await contract.setValue(num);
    await tx.wait();
    console.log(`${num} 저장됨`);

    const get = await contract.getValue();

    console.log("get: ", get);

}

storeCIDOnBlockchain("Hello World").then()
