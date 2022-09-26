<script lang="ts" setup>
  import { Search, Edit,User, Plus } from "@element-plus/icons-vue";
  import {ref, onMounted, reactive, nextTick} from "vue";
  import { useStaffStore } from '@/store'
  import {StaffAPI, UserAPI} from '@/api'
  import {ElMessageBox, ElMessage, FormInstance, FormRules} from "element-plus";
  import { httpBatch } from "@/utils/http";


  const useStaff = useStaffStore();
  const staffList = ref<Vm.Staff[]>([]);
  const dicList = ref<Vm.dictionary[]>([]);
  const dic_category = reactive<Vm.dictionary[]>([]);
  const formRef = ref<FormInstance | null>(null);
  const tableRef = ref<any>(null);
  const pagination = reactive({
    total: 0,
    currentPage: 1
  });
  const edit = reactive({
    isEdit: false,
    editType: 0,
    model: {
      stf_id: 0,
      stf_name: '',
      stf_category: 0,
      stf_remark: ''
    }
  });
  const searchModel = reactive<HttpPayload.Staff>({
    stf_id: 0,
    stf_category: 0,
    stf_name: '',
    begin: 0,
    pageSize: 5
  })
  const getData = async (fromPage1 = true) => {
    if(fromPage1) pagination.currentPage = 1;
    searchModel.begin = (pagination.currentPage - 1) * searchModel.pageSize;
    await httpBatch([
      () => {
      return new Promise((resolve, reject) => {
        StaffAPI.get(searchModel)
        .then(r => {
          const { total, list } = r
          if(total > 0 && list.length === 0) {
            pagination.currentPage = Math.ceil(total / searchModel.pageSize);
            getData(false);
            return;
          }
          staffList.value = list;
          pagination.total = total;
          resolve(null);
        })
        .catch(() => reject())
      })
      },
      () => {
      return new Promise((resolve, reject) => {
        StaffAPI.getDic()
        .then( r => {
          dicList.value = r;
          resolve(null);
        } )
        .catch(() => reject())
      })
      }
    ])
  }
  onMounted(async () => {
    console.log(staffList)
    try {
      await getData();
      dicList.value.forEach(item => {
        if(item.dic_group_key === 'staff_category')
          dic_category.push(item);
      })
    }catch (e) {}
  });
  // 离职
  const setDimission  = async (staff: HttpPayload.Staff) => {
      try {
        await ElMessageBox.confirm(
            `确定将“${staff.stf_name}”的员工状态改为离职？`,
            'Warning',
            { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
        );
        await httpBatch([() => StaffAPI.setDimission(staff.stf_id), () => getData()], true)
        ElMessage({
          type: 'success',
          message: `"${staff.stf_name}"的员工状态已更改为离职！`
        })
      } catch (e) {}
  };
  // 入职
  const setReinstate = async (staff: HttpPayload.Staff) => {
    try {
      await ElMessageBox.confirm(
          `确定将“${staff.stf_name}”的员工状态改为在职？`,
          'Warning',
          { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
      );
      await httpBatch([ () => StaffAPI.setReinstate(staff.stf_id), () => getData() ], true)
      ElMessage({
        type: 'success',
        message: `"${staff.stf_name}"的员工状态已更改为在职！`
      })
    }catch(e) {}
  };
  // 新增
  const beginAdd = async () => {
    // edit.editType = 1;
    edit.model.stf_id = 0
    edit.model.stf_name = '';
    edit.model.stf_category = 0;
    edit.model.stf_remark = '';
    await nextTick(() => edit.isEdit = true );
  };
  const beginUpdate = async (staff: HttpPayload.StaffEdit) => {
    // edit.editType = 2;
    edit.model.stf_id = staff.stf_id;
    edit.model.stf_name = staff.stf_name;
    edit.model.stf_category = staff.stf_category;
    edit.model.stf_remark = staff.stf_remark;
    await nextTick(() => edit.isEdit = true );
  };
  const save = async () => {
      if(edit.model.stf_id === 0) {
        await formRef.value?.validateField();
        await httpBatch([ () => StaffAPI.add(edit.model), () => getData() ], true);
        // await StaffAPI.add(edit.model);
        // staffList.value.push({ ...edit.model, stf_invalid: 1, })
        ElMessage({
          message: `用户"${edit.model.stf_name}"添加成功！`,
          type: 'success'
        });
        edit.isEdit = false;
        // 下一时间片执行高亮
        await nextTick(() => {
          let i = staffList.value.findIndex(item => item.stf_name === edit.model.stf_name);
          tableRef.value.setCurrentRow(staffList.value[i]);
        });
      } else {
        await httpBatch([ () => StaffAPI.update(edit.model), () => getData(false) ], true);
        ElMessage({
          message: `用户"${edit.model.stf_name}"修改成功！`,
          type: 'success'
        });
        edit.isEdit = false;
      }
  };
  const validatePass = (rule: any, value: any, callback: any) => {
    if (value === 0) {
      callback(new Error('* 请选择员工类型！'))
    } else {
      if (edit.model.stf_category !== null) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };

  const rules: FormRules = {
    stf_name: [
      { required: true, message: '* 员工姓名不能为空！', trigger: 'blur' },
      { min: 2, max: 20, message: '* 员工姓名应为2-20之间！', trigger: 'blur' }
    ],
    stf_category: [{ required: true, validator: validatePass, trigger: 'blur' }]
  };
  const getIndex = (rowIndex: number) => {
    return (pagination.currentPage - 1) * searchModel.pageSize + rowIndex + 1;
  }
</script>

<template>
  <el-container>
    <el-header>
      <el-form inline>
        <el-form-item label="员工名称:">
          <el-input :prefix-icon="Search"
                    v-model="searchModel.stf_name"
                    placeholder="请输入员工姓名"
                    @change="getData()"></el-input>
        </el-form-item>
        <el-form-item label="员工类型:">
          <el-select v-model="searchModel.stf_category" @change="getData()">
            <el-option :value="0" label="- 请选择 -"></el-option>
            <el-option :value="item.dic_id" :label="item.dic_name" v-for="item in dic_category" :key="item.dic_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="color: #ffffff">
          <el-button type="primary" :icon="Plus" style="width: 200px" @click="beginAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <el-table :data="staffList"
                border
                stripe
                highlight-current-row
                ref="tableRef">
        <el-table-column label="#" :index="getIndex" prop="#" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" align="center" prop="stf_name"></el-table-column>
        <el-table-column label="职务类型" align="center">
          <template #default="{row}">
            <span>{{ dic_category.find(item => item.dic_id === row.stf_category)?.dic_name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center">
          <template #default="{row}">
            <span v-if="row.stf_remark !== ''">{{row.stf_remark}}</span>
            <span v-else style="color: #CDD0D6">暂无相关备注</span>
          </template>
        </el-table-column>
        <el-table-column label="员工状态" align="center">
          <template #default="{row}">
            <span v-if="row.stf_invalid === 1" style="color: #409EFF">在职</span>
            <span v-else style="color: #F56C6C">离职</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="{row}">
            <el-button type="primary" :icon="Edit" @click="beginUpdate(row)">编辑</el-button>
            <el-button type="success" :icon="User" v-if="row.stf_invalid === 0" @click="setReinstate(row)">入职</el-button>
            <el-button type="danger" :icon="User" v-else @click="setDimission(row)">离职</el-button>
          </template>
        </el-table-column>
      </el-table>
<!--   编辑/新增弹窗   -->
      <el-dialog v-model="edit.isEdit"
                 width="500px"
                 center
                 draggable
                 :close-on-click-modal="false"
                 :close-on-press-escape="false"
                 :show-close="false" >
        <template #header>
          <span>{{edit.model.stf_id === 0? "员工新增" : "员工信息编辑"}}</span>
        </template>
        <el-form ref="formRef" :model="edit.model" status-icon :rules="rules" label-width="120px">
          <el-form-item label="员工姓名：" prop="stf_name">
            <el-input placeholder="请输入内容"
                      v-model="edit.model.stf_name"></el-input>
          </el-form-item>
          <el-form-item label="员工类型：" prop="stf_category">
            <el-select v-model="edit.model.stf_category">
              <el-option label="- 无角色 -" :value="0"></el-option>
              <el-option v-for="item in dic_category"
                         :key="item.dic_id"
                         :label="item.dic_name"
                         :value="item.dic_id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="员工备注：">
            <el-input type="textarea" placeholder="请输入相关备注" v-model="edit.model.stf_remark"></el-input>
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
    <el-footer>
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
