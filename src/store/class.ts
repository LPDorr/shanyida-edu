
import { defineStore } from 'pinia';
import { ref } from 'vue';
import {ClassAPI} from "@/api";

export default defineStore(
    'class',
    () => {
        const classList = ref<Vm.Class[]>([]);
        const init = async (model: HttpPayload.Class) => {
          classList.value = await ClassAPI.getAll();
        }
        return { init, classList }
    },
    { persist: { enabled: true } }
)
