import { phase_1 } from './Phase_1.js'
import { phase_2 } from './phase_2.js';

async function main() {
    try {
        const vp = await phase_1();

        console.log("Phase 1 실행 완료, VP:", vp);

        const resultPhase_2 = await phase_2(vp);
        //console.log(resultPhase_2);

    } catch (error) {
        console.error("에러 발생:" , error);
    }
}
main().then()