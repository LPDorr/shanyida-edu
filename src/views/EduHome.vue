<script setup lang="ts">
  import EduMenu from './EduMenu.vue';
  import EduTab from './EduTab.vue'
  import { useDashboardStore, useAuthStore } from '../store';
  import {nextTick, onMounted, watch, onBeforeMount, ref } from 'vue';
  import { useRouter } from "vue-router";
  import {ElMessage, ElMessageBox} from "element-plus";

  const router = useRouter();
  const useAhtu = useAuthStore();
  const useDashboard = useDashboardStore();
  watch(() => useDashboard.activeFuncKey, (newFuncKey: string) => {
    router.replace('/home/' + newFuncKey);
  },{ flush: 'post' })
  // 获取菜单栏数据
  onMounted(async () => {
    // 在顶层组件去try
    try{
      useDashboard.getMenu();
    }catch (e: any) {}


  });

  const logout = async () => {
     await ElMessageBox.confirm(
         '确定要退出登录吗？',
         'Warning',
         { showClose: false,confirmButtonText: '确定',cancelButtonText: '取消',type: 'warning' }
     )
     useAhtu.logout();
     ElMessage({ type: 'success', message: '退出登录成功！' })
     setTimeout(()=>router.replace('/login'),500)
  };

</script>

<template>
  <el-container>

    <el-container>
      <el-aside>
        <el-menu
            text-color="#fff"
            background-color="#409EFF"
            active-text-color="#409EFF"
            unique-opened
            @select="useDashboard.openFunc"
            :default-active="useDashboard.activeFuncKey"
        >

          <EduMenu :list="useDashboard.menuTree"></EduMenu>
          <div id="he-plugin-simple" ></div>

        </el-menu>
      </el-aside>
      <el-container  ref="containerRef">
        <el-header height="80px">

          <div class="logo">

            <!--        <img src="../assets/images/logo.jpg" alt="">-->
            <h1>山一大教学管理系统</h1>
          </div>
          <div class="personal-center">
            <el-dropdown>
              <el-avatar :size="55"
                         src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png">
              </el-avatar>
              <template #dropdown>
                <el-dropdown-menu style="display: flex;align-items: center; flex-direction: column;">
                  <el-dropdown-item>
                    <span style="color: #409EFF">{{useAhtu.userName}}</span>
                  </el-dropdown-item>
                  <el-dropdown-item style="padding: 2px 0 2px 0">
                    <el-button  type="primary" size="small" @click="logout">退出登录</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>

            </el-dropdown>
          </div>
        </el-header>
        <el-main>
          <EduTab v-if="useDashboard.showHome"></EduTab>
          <div v-else style=" height:99%;width: 100%;position: relative">
            <img src="../assets/images/background.jpg" alt="" style="height: 100%;width: 100%">
            <span style="position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);font-size: 35px;color: #ffffff" >
              欢迎使用山东第一医科大学教学管理系统</span>
          </div>
        </el-main>
        <el-footer height="30px" style="font-weight: bolder;color:  #409EFF;display: flex;justify-content: center">
          <span>&copy;</span>2022 山东第一医科大学（山东省医学科学院） 版权所有:202206H5
        </el-footer>
      </el-container>
    </el-container>
  </el-container>

</template>

<style scoped lang="stylus">
.el-container

  display: flex
  justify-content center
  .el-aside
    background-color: #409EFF
    transition: all 0.5s
    display: flex
    flex-direction: column
    box-shadow: 7px 0 2px rgba(0, 0, 0, 0.3)
    border-radius: 0 25px 25px 0
    margin: 5px 20px 5px 0
    .el-menu
      border: none
      width: 100%
      margin-top: 20px
      height: 100%
  .el-container
    display: flex

    .el-header
      display: flex
      align-items: center
      justify-content space-between
      //background-image url("../assets/images/background.jpg")
      border-radius 10px
      margin: 5px 20px 5px 0
      box-shadow: 0 7px 2px rgba(0, 0, 0, 0.3)
      background-color #409EFF
      .logo
        h1
          //color: #409EFF
          color: #ffffff
          font-size: 30px
          font-family: "Meiryo UI"
      .personal-center
        display: flex
        align-items: center
        margin-right: 50px
        .el-dropdown
          color: red
          .el-avatar
            border: 2px solid #409EFF
            cursor: pointer
            //border: 2px solid #ffffff
    .el-main
      //border: 1px solid black
      padding: 5px 20px 0 0
        //box-shadow: 7px 10px rgba(0, 0, 0, 0.3)
</style>
