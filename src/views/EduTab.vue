<script lang="ts" setup>
  import { useDashboardStore } from '@/store'

  const useDashboard = useDashboardStore();
</script>

<template>

  <el-tabs type="card"
           closable @tab-remove="useDashboard.closeFunc"
           v-model="useDashboard.activeFuncKey">
    <el-tab-pane
        v-for="item in useDashboard.openFuncs"
        :key="item.func_id"
        :label="item.func_name"
        :name="item.func_key">
      <router-view :name="item.func_key" v-slot="{ Component }">
          <keep-alive>
            <component :is="Component"></component>
          </keep-alive>
      </router-view>
    </el-tab-pane>
  </el-tabs>

</template>

<style lang="stylus" scoped>
.el-tabs
  .el-tabs__item
    border-radius 10px
</style>
