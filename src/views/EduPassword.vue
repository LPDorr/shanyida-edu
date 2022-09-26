<script lang="ts" setup>
  import { useAuthStore } from '@/store';
  import { reactive, ref } from "vue";
  import {FormRules, FormInstance, ElMessageBox, ElMessage} from "element-plus";
  import {UserAPI} from "@/api";

  const useAuth = useAuthStore();
  const formRef  = ref<FormInstance | null>(null)
  const model = reactive<{ oldPwd: string, newPwd: string }>({
    oldPwd: '',
    newPwd: '',
  });
  const resetPwd = () => {
    model.newPwd = '';
    model.oldPwd = '';
  };
  const orderChange = async () => {
    if(model.newPwd === '' && model.oldPwd == '') {
      await ElMessageBox.alert('请输入原密码和新密码以修改密码！',{ showClose: false })
      return;
    }
    await ElMessageBox.confirm(
        '确定要修改密码吗？',
        'Warning',
        { showClose: false, confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    );
    await UserAPI.changePwd(model);
    ElMessage({ message: '密码修改成功！', type: 'success' })
  };
  const validateNewPwd = (rule: any, value: any, callback: any) => {
    if (value === model.oldPwd) {
      callback(new Error('* 新密码不能与旧密码一致！'))
    } else {
      if (model.newPwd !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  }
  const rules: FormRules = {
    newPwd: [
      { required: true, message: '* 新密码不能为空！', trigger: 'blur' },
      { min: 3, max: 10, message: '* 新密码的长度应为3-10之间', trigger: 'blur' },
      { required: true, validator: validateNewPwd, trigger: 'blur' }
    ],
    oldPwd: [
      { required: true, message: '* 原密码不能为空！', trigger: 'blur' },
      { min: 3, max: 10, message: '* 原密码的长度应为3-10之间', trigger: 'blur' }
    ]
  }

</script>

<template>
  <el-form inline>
    <el-form-item>
      <el-avatar :size="100"
                 style="border: 2px solid #409EFF"
                 src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png">
      </el-avatar>
    </el-form-item>
   <el-form-item>
     <span style="font-size: 20px">用户名：</span>
     <span style="font-size: 20px;color: #409EFF">{{useAuth.userName}}</span>
   </el-form-item>
  </el-form>
  <el-form style="width: 700px;margin-top: 50px" ref="formRef" :model="model" :rules="rules">
    <el-form-item label="原密码：" prop="oldPwd">
      <el-input v-model="model.oldPwd" show-password></el-input>
    </el-form-item>
    <el-form-item label="新密码：" prop="newPwd">
      <el-input v-model="model.newPwd" type="password" show-password ></el-input>
    </el-form-item>
  </el-form>
  <el-form style="width: 700px;display: flex;justify-content: center">
    <el-form-item>
      <el-button @click="resetPwd" type="success" size="large">重置</el-button>
      <el-button @click="orderChange" type="primary" size="large">确定</el-button>
    </el-form-item>
  </el-form>
</template>

<style lang="stylus" scoped>
</style>
