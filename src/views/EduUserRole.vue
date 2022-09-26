<script lang="ts" setup>
  import { Search, Plus, Setting, Avatar, Delete } from "@element-plus/icons-vue";
  import { useRoleStore } from '@/store';
  import {onMounted, reactive,ref,nextTick } from "vue";
  import { UserAPI } from '@/api'
  import {ElMessageBox, ElMessage, FormRules, FormInstance} from "element-plus";
  import { httpBatch } from "@/utils/http";

  const useRole = useRoleStore();
  const formRef = ref<FormInstance | null>(null);
  const tableRef = ref<any>(null);
  const searchModel = reactive<HttpPayload.UserSearch>({
    user_name: '',
    role_id: -1,
    begin: 0,
    pageSize: 5
  });
  const edit = reactive<{ isEdit: boolean, editType: 1 |2, model: HttpPayload.ConfigRole  }>({
    isEdit: false,
    editType: 1, // 0表示默认，1表示新增，2表示角色分配
    model:{ user_name: '',role_id: 0 }
  })
  const pagination = reactive({
    total: 0, currentPage: 1,
  });
  const userList = ref<Vm.User[]>([])
  const getData = async (fromPage1 = true) => {
    if(fromPage1) pagination.currentPage = 1;
    searchModel.begin = (pagination.currentPage - 1) * searchModel.pageSize;
    try {
      const {total, list} = await UserAPI.get(searchModel);
      if(total > 0 && list.length === 0) {
        pagination.currentPage = Math.ceil(total / searchModel.pageSize);
        await getData(false);
        return;
      }
      pagination.total = total
      userList.value = list;
    }catch (e) {}
  }
  onMounted(async () => {
    try{
      // await ;
      // await;
      await httpBatch([() => useRole.init(), () => getData() ])
    }catch (e) {}
  });
  const getIndex = (rowIndex: number) => {
    return (pagination.currentPage - 1) * searchModel.pageSize + rowIndex + 1;
  }
  const removeHandler = async(user: Vm.User) => {
    try {
      await ElMessageBox.confirm(
          `确定要删除用户“${user.user_name}”吗`,
          'Warning',
          { showClose: false, type: 'warning',confirmButtonText: '确定', cancelButtonText: '取消' }
      );
      // 更新页面
      await httpBatch([() => UserAPI.remove(user.user_name), () => getData(false)], true);
      ElMessage({ message: `用户“${user.user_name}”删除成功！`,type: 'success' });
    }catch (e) {}
  };
  // 密码重置
  const resetPwd = async (user: Vm.User) => {
    await ElMessageBox.confirm(
        `确定要重置用户“${user.user_name}”的密码吗？`,
        'Warning',
        { showClose: false, type: 'warning',confirmButtonText: '确定', cancelButtonText: '取消', }
    );
    await UserAPI.resetpwd(user.user_name);
    ElMessage({ message: `用户“${user.user_name}”的密码重置成功！`,type: 'success' });
  };
  const beginAdd = () => {
    edit.editType = 1;
    formRef.value?.resetFields();
    edit.model.user_name = '';
    nextTick(() => edit.isEdit = true );
  };
  const beginConfigRole = (user: HttpPayload.ConfigRole) => {
    edit.editType = 2;
    formRef.value?.resetFields();
    edit.model.user_name = user.user_name;
    edit.model.role_id = user.role_id || 0;
    nextTick(() => edit.isEdit = true );
  };
  // 表单验证
  const validateUser = (rule: any, value: any, callback: any) => {
    if (value === userList.value.find(item => item.user_name === edit.model.user_name)?.user_name) {
      callback(new Error(`* 此"${edit.model.user_name}"用户已存在！`))
    } else {
      if (edit.model.user_name !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const rules: FormRules = {
    user_name: [
      { required: true, message: '* 用户名称不能为空', trigger: 'blur', },
      { required: true, validator: validateUser, trigger: 'blur' },
      { min: 2, max: 20, message: '用户名称应为2-20之间', trigger: 'blur' },
    ],
  };
  const save = async () => {
   try {
     if(edit.editType === 1) {
       await formRef.value?.validate();
       await httpBatch([() => UserAPI.add(edit.model.user_name), () => getData()], true)
       ElMessage({
         message: `用户"${edit.model.user_name}"添加成功！`,type: 'success'
       });
        edit.isEdit = false;
        // 下一时间片执行高亮
       await nextTick(() => {
         let i = userList.value.findIndex(item => item.user_name === edit.model.user_name);
          tableRef.value.setCurrentRow(userList.value[i]);
        });
     }else {
      await UserAPI.configRole(edit.model);
      const i = userList.value.findIndex(item => item.user_name === edit.model.user_name);
      userList.value[i].role_id = edit.model.role_id === 0? null : edit.model.role_id;
      edit.isEdit = false;
       ElMessage({
         message: `用户"${edit.model.user_name}"的角色分配成功！`,type: 'success'
       });

     }
   }catch(w) {}
  }
</script>

<template>
  <el-container>
    <el-header height="50px">
      <el-form inline>
        <el-form-item label="用户姓名：">
          <el-input :prefix-icon="Search"
                    placeholder="请输入内容"
                    @change="getData()"
                    v-model="searchModel.user_name"></el-input>
        </el-form-item>
        <el-form-item label="用户角色">
          <el-select v-model="searchModel.role_id" @change="getData()">
            <el-option label="- 全部 - " :value="-1"></el-option>
            <el-option label="- 无角色 -" :value="0"></el-option>
            <el-option v-for="item in useRole.roleList"
                       :key="item.role_id"
                       :label="item.role_name"
                       :value="item.role_id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Plus" @click="beginAdd" style="width: 200px">新增</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
    <el-table :data="userList"  border stripe highlight-current-row ref="tableRef">
      <el-table-column type="index" :index="getIndex" label="#" align="center"></el-table-column>
      <el-table-column prop="user_name" label="用户名" align="center"></el-table-column>
      <el-table-column prop="role_id" label="角色" align="center">
        <template #default="{row}">
          <span v-if="row.role_id" style="color: #67C23A">{{useRole.roleList.find(item => item.role_id === row.role_id)?.role_name}}</span>
          <span v-else style="color: #CDD0D6">- 暂无无角色 -</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template #default = {row}>
          <el-button type="primary" @click="resetPwd(row)" :icon="Setting">重置密码</el-button>
          <el-button type="success" @click="beginConfigRole(row)" :icon="Avatar">角色分配</el-button>
          <el-button type="danger" @click="removeHandler(row)" :icon="Delete">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
<!--  角色分配    -->
      <el-dialog v-model="edit.isEdit"
                 width="500px"
                 center
                 draggable
                 :close-on-click-modal="false"
                 :close-on-press-escape="false"
                 :show-close="false" >
        <template #header>
          <span>{{edit.editType === 1? "用户新增" : "用户角色分配"}}</span>
        </template>
        <el-form ref="formRef" :model="edit.model" :rules="rules" status-icon  label-width="120px">
          <el-form-item label="用户姓名：" prop="user_name">
            <el-input placeholder="请输入内容"
                      :disabled="edit.editType === 2"
                      v-model="edit.model.user_name"></el-input>
          </el-form-item>
          <el-form-item label="用户角色：" v-show="edit.editType === 2">
            <el-select v-model="edit.model.role_id">
              <el-option label="- 无角色 -" :value="0"></el-option>
              <el-option v-for="item in useRole.roleList"
                         :key="item.role_id"
                         :label="item.role_name"
                         :value="item.role_id"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="edit.isEdit = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
        </template>
      </el-dialog>
    </el-main>
    <el-footer height="36px">
      <el-pagination
          background
          layout="pre,pager,next,jumper,->,sizes, total"
          :page-sizes="[5,9,14,18,22]"
          :total="pagination.total"
          v-model:page-size="searchModel.pageSize"
          v-model:current-page="pagination.currentPage"
          @size-change="getData()"
          @current-change="getData(false)"
      />
    </el-footer>
  </el-container>
</template>

<style scoped lang="stylus">
  .el-container
    display: flex
    height 100%
    .el-header
      flex-shrink: 0
    .el-main
      flex-grow: 1
    el-footer
      flex-shrink: 0




</style>
