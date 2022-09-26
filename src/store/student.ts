
import { defineStore } from 'pinia';
import { ref } from 'vue'
import { StudentAPI } from '@/api'
import student from "@/api/student";

export default defineStore(
    'student',
    () => {

        let _isInit = ref<boolean>(false)
        const init = async (model: HttpPayload.Student) => {
            if(_isInit.value) return;

            _isInit.value = true;
        }



        return { init }
    },
    { persist: { enabled: true } }
)
