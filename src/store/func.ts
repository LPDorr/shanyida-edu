import { defineStore } from "pinia";
import { ref, computed } from 'vue'
import { FuncAPI,UserAPI } from '@/api';

export default defineStore('func', () => {
    const _isInit = ref<boolean>(false)
    const _allFuncs = ref<Vm.Func[]>([])
    const treeData = computed<Vm.TreeData>(() => {
        function _updateNode(node: Vm.TreeDataItem) {

            let children: Array<Vm.TreeDataItem> = [];
            _allFuncs.value.forEach(item => {
                if(item.func_fid === node.func_id) children.push({...item});
            });
            if(children.length === 0) return;
            else {
                node.children = children;
                node.children.forEach(item => _updateNode(item));
            }
        }
        // 写js代码数组转树
        let root: Vm.TreeDataItem = { func_id: 0, func_name:'Root', func_key: '', func_fid: -1 }
        _updateNode(root);
        return [root];
    });
    const init = async () => {
        if (_isInit.value) return;
        _allFuncs.value = await FuncAPI.getAll();
        _isInit.value = true;
    };
    const removeHandler = async (id: number) => {
        try {
            await FuncAPI.remove(id);
            let i: number = _allFuncs.value.findIndex(item => item.func_fid === id);
            _allFuncs.value.splice(i, 1);
        }catch (e) {}
    };
    const add = async (func: HttpPayload.Func) => {
        let func_id: number = await FuncAPI.add(func);
        _allFuncs.value.push({ ...func, func_id })
    };
    const update = async (func: HttpPayload.Func) => {
        await FuncAPI.update(func);
        let i = _allFuncs.value.findIndex(item => item.func_fid === func.func_id);
        _allFuncs.value.splice(i, 1, { ...func })
    };
    const noLeafFunc = computed<Vm.Func[]>(() => {
        return _allFuncs.value.filter(item => item.func_key === '');
    });

    return { _allFuncs, treeData, init, removeHandler, add, update, noLeafFunc }
}, { persist: { enabled: true } } )
