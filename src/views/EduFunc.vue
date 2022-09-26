<script lang="ts" setup>

  import { Paperclip, Edit, Delete, Plus } from '@element-plus/icons-vue';
  import {onMounted, reactive, ref, watch, nextTick } from "vue";
  import appFuncs from './index'
  import {useFuncStore, useDashboardStore} from "@/store";
  import {ElMessageBox, ElMessage, FormInstance, FormRules} from "element-plus";
  import { httpBatch } from "@/utils/http";

  const useFunc = useFuncStore();
  const useDashBoard = useDashboardStore();
  const formRef = ref<FormInstance | null>(null)
  const edit = reactive({
    isEdit: false,
    isLeaf: false,
    model: { func_id: 0, func_name: '', func_key: '',func_fid: -1 }
  })
  watch(() => edit.isLeaf, newValue => {
    if(!newValue) edit.model.func_key = '';
  })
  onMounted(async () => {
    await useFunc.init();
  });
  const removeHandler = async (item: Vm.TreeDataItem) => {
    await ElMessageBox.confirm(`确定要删除“${item.func_name}”吗？`, 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      showClose: false,
    });
    await httpBatch([ () => useFunc.removeHandler(item.func_id), () => httpBatch([ () => useDashBoard.getMenu(), () => useFunc.init() ]) ])

    await ElMessage({
      type: 'success',
      message: `删除“${item.func_name}”成功！请刷新页面~`,
    });
  };
  const beginAdd  = (func: Vm.TreeDataItem) => {

    edit.model = { func_id: 0, func_name: '', func_key: '',func_fid: func.func_id };
    edit.isLeaf = false;
    formRef.value?.resetFields();
    nextTick(() => edit.isEdit = true);
  }
  const beginUpdate = (func: Vm.TreeDataItem) => {
    edit.model = {
      func_id: func.func_id,
      func_name: func.func_name,
      func_key: func.func_key,
      func_fid: func.func_fid,
    }
    edit.isLeaf = func.func_key !== '';
    formRef.value?.resetFields();
    nextTick(() => edit.isEdit = true);

  };
  const save = async () => {
    try{
      if(edit.model.func_id === 0) {
        await formRef.value?.validate();
        await httpBatch([ () => useFunc.add(edit.model), () => httpBatch([ () => useDashBoard.getMenu(), () => useFunc.init() ]) ])
      } else {

        await httpBatch([ () => useFunc.update(edit.model), () => httpBatch([() => useDashBoard.getMenu(), () => useFunc.init() ]) ])
      }
    }catch (e){}
    ElMessage({ message: '编辑成功', type: 'success' })
    edit.isEdit = false;
  };
  // 表单验证
  const rules: FormRules = {
    func_name: [
      {
        validator: (prop: any, value: string, callback: any) => {
          if(value.length === 0 )
            callback(new Error('* 功能名称不能为空!'));
          else if(value.length < 2 || value.length > 50)
            callback(new Error('* 功能名称长度应为2-50之间!'));
          else if(useFunc._allFuncs.some(
              item => item.func_id !== edit.model.func_id &&
              item.func_name === value &&
              item.func_fid === edit.model.func_fid))
            callback(new Error(`* 当前父节点下已存在“${value}”节点!`));
          else callback();
        },trigger: 'blur'
      }
    ],
    func_fid: [
        {
      validator: (prop: any, value: number, callback: any) => {
        if(edit.model.func_fid !== 0) {
          formRef.value?.validateField('func_name', () => null);
        }
        callback();
      },trigger: 'change'
    },
    ],
    func_key: [
        {
      validator: (prop: any, value: string, callback: any) => {
        if(edit.isLeaf && value === '') {
          callback(new Error('* 叶子节点下必须选择功能模块!'))
        }else callback();
      },trigger: 'change'
    }
    ]
  }

</script>

<template>
  <el-tree :data="useFunc.treeData" class="custom-tree" default-expand-all :expand-on-click-node='false'>
    <template #default="{data}">
      <span class="custom-tree-node">
        <span class="left">
          <el-button type="text" :icon="Paperclip" v-if="data.func_key !== ''" style="margin:0 3px 0 5px"></el-button>
          <span style="font-size: 14px;">{{data.func_name}}</span>
        </span>
        <span class="right">
          <el-button type="primary" :icon="Edit" :disabled="[0,1,2].includes(data.func_id)" @click="beginUpdate(data)"></el-button>

          <el-button type="primary" :icon="Plus" :disabled="data.func_key !== '' " @click="beginAdd(data)"></el-button>
          <el-button type="primary"
                     @click="removeHandler(data)"
                     :icon="Delete" :disabled="[0,1,2].includes(data.func_id)"/>
        </span>
      </span>
    </template>
  </el-tree>
<!-- 功能编辑/新增 -->
  <el-dialog :model-value="edit.isEdit"
             width="500px"
             center
             draggable
             :show-close="false"
             :close-on-click-modal="false"
             :close-on-press-escape="false">
    <template #header>
      <span class="dialog-header">功能编辑</span>
    </template>
    <el-form label-width="120px" :model="edit.model" :rules="rules" ref="formRef" status-icon>
      <el-form-item label="功能类型：">
        <el-radio-group v-model="edit.isLeaf" :disabled="edit.model.func_id !== 0">
          <el-radio :label="false">非叶子节点</el-radio>
          <el-radio :label="true">叶子节点</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="父级功能：" prop="func_fid">
        <el-select v-model="edit.model.func_fid"  :disabled="edit.model.func_id === 0" >
          <el-option label="Root" :value="0"></el-option>
          <el-option :label="item.func_name"
                     :value="item.func_id"
                     :disabled="item.func_id === edit.model.func_id"
                     :key="item.func_id"
                     v-for="item in useFunc.noLeafFunc"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="功能名称：" prop="func_name">
        <el-input v-model.lazy.trim="edit.model.func_name">

        </el-input>
      </el-form-item>
      <el-form-item label="功能模块：" v-show="edit.isLeaf" prop="func_key">
        <el-select v-model="edit.model.func_key">
          <el-option value="" label="- 请选择 -"></el-option>
          <el-option :label="v"
                     :value="k"
                     :disabled="useFunc._allFuncs.findIndex(item => item.func_key === k) !== -1"
                     v-for="(v,k) in appFuncs" :key="k"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="edit.isEdit = false">取消</el-button>
      <el-button type="primary" @click="save">确定</el-button>
    </template>
  </el-dialog>

</template>

<style scoped lang="stylus">
  .custom-tree
    width: 700px
    .custom-tree-node
      display: flex
      align-items center
      justify-content space-between
      flex-grow 1
      .left
        flex-grow 1
    .el-form-item
      .el-form-item__content
        .el-input__inner
          font-size: 10px
</style>
