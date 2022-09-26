import { defineStore } from "pinia";
import {  ClassroomAPI } from '@/api';
import { ref, markRaw, onMounted,reactive, nextTick } from 'vue';
import { ElMessageBox,ElMessage } from 'element-plus'


export default defineStore("classroom", () => {
    const list = ref<Vm.Classroom[]>([]);
    const _isInit = ref<boolean>(false)
    const init = async () => {
        if(_isInit.value) return;
        list.value = await ClassroomAPI.get();
        _isInit.value = true;
    };

    const removeHandler = async (id: number) => {
        try {
            await ClassroomAPI.remove(id);
            let i = list.value.findIndex(item => item.clsr_id === id);
            list.value.splice(i, 1);
        }catch(e) {}
    };
    const add = async (clsr: HttpPayload.Classroom) => {
        console.log(clsr)
        let clsr_id: number =  await ClassroomAPI.add(clsr);
        list.value.push({ ...clsr, clsr_id, clsr_occupy: 0 })
    }
    const update = async (clsr: HttpPayload.Classroom) => {
        await ClassroomAPI.update(clsr);
        let i = list.value.findIndex(item => item.clsr_id === clsr.clsr_id);
        list.value.splice(i, 1, {clsr_id: clsr.clsr_id as number, clsr_name: clsr.clsr_name, clsr_occupy: 0,});
    }

    return {
        list,init,add,update,removeHandler,  // 方法
    }
}, { persist: { enabled: true } })

