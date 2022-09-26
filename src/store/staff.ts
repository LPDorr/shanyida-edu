

import { defineStore } from "pinia";
import { ref } from 'vue';
import { StaffAPI } from '@/api'
import staff from "@/api/staff";

export default defineStore(
    'staff',
    () => {
        const dicList = ref<Vm.dictionary[]>([]);

        const getDic = async () =>  {
            dicList.value = await StaffAPI.getDic()
        }

        return { getDic,dicList }
    },
    { persist: { enabled: true } }
)
