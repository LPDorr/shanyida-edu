<script setup lang="ts">
  type menuTreeItem = Vm.Func & { children?: menuTreeItem[] };
  interface propsType {
    list: menuTreeItem[],
  }
  const props = defineProps<propsType>()

</script>

<template>


  <template v-for="(item) in props.list">
<!--  非叶子节点  -->
    <el-sub-menu v-if="item.func_key === ''"
                 :index="item.func_id.toString()"
                 :key="item.func_id"
    >
      <template #title>
        <el-icon style="color: #fff"><Setting/></el-icon>
        <span v-text="item.func_name" style="font-size: 18px"></span>
      </template>
<!--   递归   -->
    <eduMenu v-if="item.children" :list="item.children"></eduMenu>
    </el-sub-menu>
<!--  叶子节点  -->
      <el-menu-item v-else :index="item.func_key" :key="item.func_id">
        <el-icon style="color: #fff"><Operation/></el-icon>
        <span>{{item.func_name}}</span>
      </el-menu-item>
  </template>
</template>

<style lang="stylus" scoped>
    .el-menu-item
      font-size: 18px
    .el-menu-item.is-active
      background-color: #ffffff
      //border-radius: 10px
      &.is-active .el-icon
        color: #409EFF !important
        font-weight bolder !important

      font-weight: 550
    .el-menu-item:hover
      background-color: #ffffff
      color: #409EFF
      //border-radius: 20px
      &:hover .el-icon
        color: #409EFF !important
        font-weight bolder !important
</style>
