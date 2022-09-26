
import { defineStore } from 'pinia'
import {computed, markRaw, ref, reactive, nextTick} from 'vue'
import {UserAPI} from "@/api";
import { TabPanelName } from "element-plus";


export default defineStore('dashboard', () => {

    // 控制menu的展开与否
    const collapse = ref<boolean>(false); // 标识菜单是否是收缩状态
    const collapseToggle = () => collapse.value = !collapse.value;
    const showHome = ref<boolean>(false)
    // 获取menu列表
    const userMenu  = ref<Array<Vm.Func>>(markRaw([]))
    type menuTreeItem = Vm.Func & { children?: menuTreeItem[] };
    const menuTree = computed<Array<menuTreeItem>>(() => {
        function _updateNode(node: menuTreeItem) {

            let children: Array<menuTreeItem> = [];
            userMenu.value.forEach(item => {
                if(item.func_fid === node.func_id) children.push({...item});
            });
            if(children.length === 0) return;
            else {
                node.children = children;
                node.children.forEach(item => _updateNode(item));
            }
        }
        // 写js代码数组转树
        let result: Array<menuTreeItem> = [];
        userMenu.value.forEach(item => {
            if(item.func_fid === 0) result.push({...item});
        })
        result.forEach(item => _updateNode(item));
        return result;
    })
    const getMenu = async () => {
        const list: menuTreeItem[] = await UserAPI.getMenu();
        userMenu.value = markRaw(list);
    };

    // 左右关联
    const openFuncs = reactive<Vm.Func[]>([]);
    const activeFuncKey = ref<string>(''); // 标识当前激活的功能func_key
    const openFunc = (func_key: string) => {
        console.log(func_key)
           if(openFuncs.findIndex(item => item.func_key === func_key) === -1) {
               let target  = userMenu.value.find(item => item.func_key === func_key) as Vm.Func;
               openFuncs.push({...target});
           }
           activeFuncKey.value = func_key;
        showHome.value = true;
    };
    const closeFunc = (func_key: TabPanelName) => {
        const i = openFuncs.findIndex(item => item.func_key === func_key);
        if ( func_key !== activeFuncKey.value ) {}
        else if(openFuncs.length === 1)
            activeFuncKey.value = '';
        else if(i === openFuncs.length - 1)
            activeFuncKey.value = openFuncs[i - 1].func_key;
        else
            activeFuncKey.value = openFuncs[i + 1].func_key;
        openFuncs.splice(i, 1);
        if(openFuncs.length === 0) showHome.value = false
    }

    return {
        collapse, collapseToggle,
        menuTree, getMenu, userMenu,
        openFuncs, openFunc, closeFunc,activeFuncKey,showHome
    }
}, {
    persist: {enabled: true, }
})
