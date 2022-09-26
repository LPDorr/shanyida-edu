<script lang="ts" setup>
import {nextTick, onMounted, reactive, ref} from 'vue';
import {useFuncStore, useRoleStore} from '@/store';
import {httpBatch} from "@/utils/http";
import {RoleAPI} from '@/api'
import {ElMessage, ElMessageBox, FormInstance, FormRules} from "element-plus";

  const useRole = useRoleStore();
  const useFunc = useFuncStore();
  const treeRef = ref<any>(null);
  const formRef = ref<FormInstance | null>(null)
  const roleFunc = reactive<{
    isSetting: boolean,currentFuncs: Vm.Func[], model: HttpPayload.RoleFunc
  }>({
    isSetting: false,
    currentFuncs: [],
    model: { role_id: 0, role_func_ids: '' }
  });
  const edit = reactive<{ isEdit: boolean, editModel: HttpPayload.Role }>({
    isEdit: false,
    editModel: { role_id: 0, role_name: ''}
  })
  const echoFunc = () => {
    treeRef.value.setCheckedKeys( roleFunc.currentFuncs.reduce((result: number[], item: Vm.Func) => {
      if (item.func_key !== '') {
        result.push(item.func_id)
      }
      return result
    }, []) )
  }
  const beginRoleFunc = async (role_id: number) => {
    roleFunc.model.role_id = role_id;
    roleFunc.currentFuncs = await RoleAPI.getRoleFunc(role_id);
    await nextTick(() => {
      roleFunc.isSetting = true;
      nextTick(() => { echoFunc() })
    });
  };
  const saveRoleFunc = async () => {
    const checkedKey = [...treeRef.value.getHalfCheckedKeys(), ...treeRef.value.getCheckedKeys()];
    if(checkedKey.length > 1) checkedKey.shift();
    roleFunc.model.role_func_ids = checkedKey.join(',');
    await RoleAPI.saveRoleFunc(roleFunc.model)
    roleFunc.isSetting = false;
    ElMessage({ message: '角色功能设置成功！', customClass: 'messageIndex',type: 'success' })
  }
  onMounted(async () => {
    try {
      await httpBatch([ () => useRole.init(), () => useFunc.init() ])
    }catch (e) {}
  })
  const removeHandler = async (role: Vm.Role) => {
    await ElMessageBox.confirm(
        `确定要删除"${role.role_name}"角色吗？`,
        'Warning',
        { showClose: false, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    await RoleAPI.remove(role.role_id);
    let i = useRole.roleList.findIndex(item => item.role_id === role.role_id);
    useRole.roleList.splice(i, 1);
    ElMessage({ message: `"${role.role_name}"角色已删除！`, type: 'success' })
  };
  const beginAdd = () => {
    formRef.value?.resetFields();
    edit.editModel.role_id = 0;
    edit.editModel.role_name = '';
    nextTick(() => edit.isEdit = true);
  };
  const beginUpdate = (role: HttpPayload.Role) => {
    formRef.value?.resetFields();
    edit.editModel.role_id = role.role_id;
    edit.editModel.role_name = role.role_name;
    nextTick(() => edit.isEdit = true);
  }
  const save = async () => {
    if(edit.editModel.role_id === 0) {
      await formRef.value?.validateField();
      await RoleAPI.add(edit.editModel);
      useRole.roleList.push({ ...edit.editModel })
      edit.isEdit = false
      ElMessage({
        message: `"${edit.editModel.role_name}"添加成功！`,
        type: 'success'
      });
    } else {
      await RoleAPI.update(edit.editModel);
      let i = useRole.roleList.findIndex(item => item.role_id === edit.editModel.role_id);
      useRole.roleList.splice(i, 1, { ...edit.editModel });
      edit.isEdit = false;
      ElMessage({
        message: `"${edit.editModel.role_name}"添加成功！`,
        type: 'success'
      });
    }
  };
  const validateRole = (rule: any, value: any, callback: any) => {
    if (value === useRole.roleList.find(item => item.role_name === edit.editModel.role_name)?.role_name) {
      callback(new Error(`* 此"${edit.editModel.role_name}",角色已存在！`))
    } else {
      if (edit.editModel.role_name !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const rules: FormRules = {
    role_name: [
      { required: true, message: '* 请输入角色名称', trigger: 'blur' },
      { required: true, validator: validateRole,  trigger: 'blur' },
      { min: 2, max: 20, message: '* 角色名称应在2-20之间', trigger: 'blur'},
    ]
  }
</script>

<template>
  <el-row :gutter="24" style="padding: 0 50px">
    <el-col :span="6" v-for="item in useRole.roleList" :key="item.role_id" style="margin-top: 10px;">
      <el-card>
        <span style="display: flex;align-items: center">
          <el-icon style="font-size: 20px; margin-right: 10px"><User/></el-icon>
          <span>{{item.role_name}}</span>
        </span>
        <div class="free-edit">
          <el-icon @click="beginUpdate(item)"><Edit/></el-icon>
          <div class="setting" @click="beginRoleFunc(item.role_id)">
            <el-icon><Setting/></el-icon>
            <span>功能分配</span>
          </div>
          <el-icon @click="removeHandler(item)"><Delete/></el-icon>
        </div>
      </el-card>
    </el-col>
    <el-col :span="6" class="add-new">
      <el-card style="color: #409EFF; background-color: #ffffff">
        <el-icon style="font-size: 30px; cursor: pointer" @click="beginAdd"><Plus/></el-icon>
      </el-card>
    </el-col>
  </el-row>
<!-- 编辑/新增 -->
  <el-dialog v-model="edit.isEdit"
             width="500px"
             center
             draggable
             :close-on-click-modal="false"
             :close-on-press-escape="false"
             :show-close="false"  >
    <template #header>
      <span>新增角色</span>
    </template>
    <el-form ref="formRef" :model="edit.editModel" :rules="rules" status-icon>
      <el-form-item label="角色名称：" prop="role_name">
        <el-input v-model="edit.editModel.role_name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="edit.isEdit = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
    </template>
  </el-dialog>
<!-- 展开抽屉 -->
  <el-drawer v-model="roleFunc.isSetting"
             :close-on-click-modal="false"
             :close-on-press-escape="false"
              size="35%"
             :with-header="false"
             :show-close="false">
    <el-container>
      <el-header height="40px">
        <span>角色功能分配</span>
      </el-header>
      <el-main>
        <el-tree :data="useFunc.treeData"
                 :props="{ label: 'func_name' }"
                 default-expand-all
                 node-key="func_id"
                 ref="treeRef"
                 class="custom-tree" show-checkbox>

        </el-tree>
      </el-main>
      <el-footer>
        <el-button type="primary" @click="saveRoleFunc">确定</el-button>
        <el-button type="success" @click="echoFunc">重置</el-button>
        <el-button @click="roleFunc.isSetting = false" type="info">取消</el-button>
      </el-footer>
    </el-container>
  </el-drawer>
</template>

<style lang="stylus" scoped>
  .el-row
    display flex
    .el-col
      .el-card
        height: 100px;
        border-radius: 10px;
        margin-bottom: 20px;
        background-color: #409EFF
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ffffff
        padding: 0
        position relative
        span
          font-size: 20px
        &:hover .free-edit
          opacity 1
        .free-edit
          opacity 0
          position: absolute
          top: 0
          left: 0
          height: 100%
          width: 100%
          background-color: rgba(0,0,0,0.5)
          display: flex
          justify-content  center
          align-items center
          .el-icon
            font-size: 25px
            cursor: pointer
          .setting
            display: flex
            justify-content center
            align-items center
            margin: 0 20px
            &:hover
              font-size 18px
              color: #E6A23C
            span
              font-size: 15px
              margin-left: 5px
              cursor: pointer
              &:hover
                font-size: 18px

  .el-container
    display: flex
    flex-direction column
    .el-header
      flex-shrink: 0
      display: flex
      height: 40px
      justify-content center
      span
        font-size: 25px
        color: #409EFF
        font-weight bold
    .el-main
      flex-grow: 1
      height: 100%
      .el-tree
        height: 100%
    .el-footer
      flex-shrink: 0
      display: flex
      justify-content space-between
      .el-button
        width: 150px
</style>
