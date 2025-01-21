/*
Testnet을 Sepolia로 변경
 */
import { ethers } from 'ethers';

export async function storeCIDOnBlockchain(cid) {
    if (typeof cid !== 'string') {
        console.log("CID: " + cid);
        cid = cid.toString();
    }
    const provider = new ethers.JsonRpcProvider()

    const receipt = await tx.wait();
    console.log(receipt.blockNumber);
}

// solidity와 연결

export async function useSolidity(num) {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545")
    const wallet = new ethers.Wallet("0x4407b05326311762dadad43ab34b7acc068f122c9b9ccb98cada3e4221323c67", provider);

    const contractAddress = '0x36CaF29Cf8cCaF0BA38a4b328085CDFA5Ac176f0'; // 배포된 스마트 컨트랙트의 주소
    // 개선 해야함

    const abi = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"uint256","name":"price","type":"uint256"},{"indexed":false,"internalType":"address","name":"seller","type":"address"}],"name":"ItemListed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":false,"internalType":"address","name":"buyer","type":"address"}],"name":"ItemSold","type":"event"},{"inputs":[],"name":"getItems","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address payable","name":"seller","type":"address"},{"internalType":"bool","name":"isSold","type":"bool"}],"internalType":"struct Market.Item[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"itemCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"items","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"price","type":"uint256"},{"internalType":"address payable","name":"seller","type":"address"},{"internalType":"bool","name":"isSold","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint256","name":"_price","type":"uint256"}],"name":"listItem","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"purchaseItem","outputs":[],"stateMutability":"payable","type":"function"}];

    const contract = new ethers.Contract(contractAddress, abi, wallet);

    // listItem으로 상품 등록
    const tx = await contract.listItem("Apple", 200);
    await tx.wait();
    console.log("Apple이 등록됨");

}