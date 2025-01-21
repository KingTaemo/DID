const fs = require('fs').promises;
const { SolidityCompiler } = require('ethers');

async function main() {
    // 계약 소스 코드 로드
    const sourceCode = await fs.readFile('Demo.sol', 'utf8');

    // 소스 코드를 컴파일하고 ABI와 바이트코드 추출
    const { abi, bytecode } = compile(sourceCode, 'Demo');

    // ABI와 바이트코드를 JSON 파일에 저장
    const artifact = JSON.stringify({ abi, bytecode }, null, 2);
    await fs.writeFile('Demo.json', artifact);
}

function compile(sourceCode, contractName) {
    // Solidity 컴파일러 입력 및 출력 JSON 생성
    const input = {
        language: 'Solidity',
        sources: { 'Demo.sol': { content: sourceCode } },
        settings: { outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } } },
    };

    // Solidity 컴파일러 인스턴스 생성
    const compiler = new SolidityCompiler();

    // Solidity 코드 컴파일
    const output = compiler.compile(input);

    // 컴파일러 출력을 파싱하여 ABI와 바이트코드 추출
    const artifact = JSON.parse(output).contracts['Demo.sol'][contractName];
    return {
        abi: artifact.abi,
        bytecode: artifact.evm.bytecode.object,
    };
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
