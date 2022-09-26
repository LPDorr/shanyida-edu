<script setup lang="ts">
  import { reactive, ref } from "vue";
  import { FormRules, FormInstance, ElMessage  } from "element-plus";
  import { UserAPI } from '@/api';
  import {  useRouter, useRoute } from 'vue-router';
  import { useAuthStore } from '@/store';
  import { User, Lock } from "@element-plus/icons-vue";

  const router = useRouter();
  const route = useRoute();
  const formRef  = ref<FormInstance | null>(null);
  const model = reactive<HttpPayload.Login>({
    user_name: '',
    user_pwd: '',
  })
  const rules: FormRules = {
    user_name: [
      { required: true, message:'用户名不能为空', trigger: 'blur' },
      { min: 3, max: 20, message: '用户名长度应为3-20之间', trigger: 'blur' },
    ],
    user_pwd: [
      { required: true, message:'密码不能为空', trigger: 'blur' },
      { min: 3, max: 20, message: '密码长度应为3-20之间', trigger: 'blur' },
    ]
  };
  const login = async () => {
    try {
      // 表单验证
      await formRef.value?.validate()
      // 发送Ajax
      const token = await UserAPI.login(model);
      // 将name、token存入pina
      const useAuth = useAuthStore();
      useAuth.login(model.user_name, token);
      // 登录提示
      ElMessage({
        showClose: true,
        message: `用户：“${model.user_name}”,登录成功`,
        type: 'success',
        customClass: 'messageIndex'
      })
      // 页面跳转
      router.replace('/home');

    }catch(e) {  }
  }

</script>

<template>
 <div class="contains">
   <el-form :model="model" :rules="rules" status-icon ref="formRef">
     <el-form-item class="title">
<!--       <h1>山一大教学管理系统</h1>-->
       <img src="../assets/images/logo.jpg" alt="">
     </el-form-item>
     <el-form-item prop="user_name" class="item" >

       <el-input v-model.trim="model.user_name" clearable :suffix-icon="User" size="large">
         <template #prepend>
           <span>账号:</span>
         </template>
       </el-input>
     </el-form-item>
     <el-form-item prop="user_pwd" class="item">
       <el-input v-model="model.user_pwd"
                 clearable
                 size="large"
                 type="password"
                 :suffix-icon="Lock">
         <template #prepend>
           <span>密码:</span>
         </template>
       </el-input>
     </el-form-item>
     <el-form-item>
       <el-button type="primary" @click="login">登录</el-button>
     </el-form-item>
   </el-form>
    <div class="footer">
      <span>&copy;</span>2022 山东第一医科大学（山东省医学科学院） 版权所有:202206H5
    </div>
 </div>

</template>

<style lang="stylus" scoped >
.contains
  background-image: url("../assets/images/home-background.jpg")
  background-size: 100% 100%
  height: 100%
  width: 100%
  .el-form
      position: fixed
      left: 50%
      top: 50%
      transform: translate(-50%, -50%)
      border: 1px solid #b0b0b0
      padding: 50px 30px
      width: 400px
      box-sizing: border-box
      //box-shadow: 0 0 10px 1px #909399
      border-radius: 5px
      background-color #fff
      //background-color: rgba(255,255,255,0.9)
      box-shadow: 0 0 25px #909399
      .el-form-item.title
        img
          width:100%
        h1
          height: 60px
          line-height: 60px
          margin: 0 auto
          color: #409EFF
          font-family "宋体"

      label.el-form-item__label
        width: 70px
        color: #666
      .el-button
        margin: 0 auto
        width: 200px
  .footer
    color: #ffffff
    position: absolute
    bottom: 0
    left: 50%
    transform: translateX(-50%)
</style>
