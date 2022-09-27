<script lang="ts" setup>
  import { UseClassStore,useStaffStore, useClassroomStore } from '@/store';
  import {ref, onMounted, reactive, nextTick} from "vue";
  import { Search, Plus, Edit, Checked, Failed } from '@element-plus/icons-vue';
  import {ClassAPI, StaffAPI} from '@/api';
  import { httpBatch } from "@/utils/http";
  import java from '../assets/images/java.png'
  import H5 from '../assets/images/html5.png';
  import ui from '../assets/images/UI.png'
  import {ElMessage, ElMessageBox, FormInstance, FormRules} from "element-plus";

  const useClass = UseClassStore();
  const useStaff = useStaffStore();
  const useClassroom = useClassroomStore();
  const formRef = ref<FormInstance | null>(null)
  const staffList = ref<Vm.Staff[]>([]);
  const majorList = ref<Vm.dictionary[]>([]);  // UI，前端...
  const classList = ref<Vm.Class[]>([]); // 班级
  const dicList = ref<Vm.dictionary[]>([]); // 字典
  const teachList = ref<Vm.Staff[]>([]); // 教学老师列表
  const adminList = ref<Vm.Staff[]>([]); // 教务老师列表
  const jobList = ref<Vm.Staff[]>([]); // 就业
  const tableRef = ref<any>(null);
  const pagination = reactive({
    total: 0,
    currentPage: 1
  });
  const classModel = reactive<HttpPayload.Class>({ // 教室管理
    cls_name: '',
    cls_dic_id_major: 0,
    cls_status: 0,
    begin: 0,
    pageSize: 5,
  });
  const edit = reactive({
    isEdit: false ,
    editClass: false,
    model: {
      cls_id: 0, cls_name: '', cls_dic_id_major: 0, cls_clsr_id: null,
      cls_stf_id_teacher: 0, cls_stf_id_admin: 0, cls_stf_id_job: 0,
      cls_begin: null, cls_end: null , cls_remark: '',
    }
  });
  const classBegin = reactive<HttpPayload.ClassDis>({ // 教室分配
    cls_clsr_id: 0,
    cls_id: 0
  })
  const searchModel = reactive<HttpPayload.Staff>({ // 员工
    stf_id: 0,
    stf_category: 0,
    stf_name: '',
    begin: 0,
    pageSize: 20
  });
  const getData = async (fromPage1 = true) => {

    if(fromPage1) pagination.currentPage = 1;

    classModel.begin = (pagination.currentPage - 1) * classModel.pageSize;
    try {
      await httpBatch([
        () => {
          return new Promise((resolve, reject) => {

            ClassAPI.get(classModel)
                .then( result => {
                  const { total, list } = result;
                  if(total > 0 && list.length === 0) {
                    pagination.currentPage = Math.ceil(total / searchModel.pageSize);
                    getData(false);
                    return;
                  }
                  else {
                    resolve(null);
                    classList.value = list
                    pagination.total = total;
                  }
                } )
                .catch(() => reject())
          })
        },
        () => {
          return new Promise((resolve, reject) => {
            StaffAPI.get(searchModel)
                .then( result => {
                  const { list } = result;
                  staffList.value = list;
                  resolve(null);
                } )
                .catch(() => reject())
          })
        },
        () => {
          return new Promise((resolve, reject) => {
            StaffAPI.getDic()
                .then( result =>{
                  dicList.value = result;
                  resolve(null);
                } )
                .catch(() => reject())
          })
        },
        () => {
          return new Promise((resolve, reject) => {
            useClassroom.init()
                .then (() => {
                  resolve(null);
                }).catch(() => reject())
          })
        }
      ]);
    }catch(e: any) { console.log(e.message) }
  }
  onMounted(async () => {
    console.log('字典', dicList)
    try {
      await getData();
      dicList.value.forEach(item => {
        if(item.dic_group_key === 'class_major')
          majorList.value.push(item);
      });// H5、java...
      staffList.value.forEach(item => {
        if(item.stf_category === 4) {
          teachList.value.push(item)
        }
      });
      staffList.value.forEach(item => {
        if(item.stf_category === 5) {
          adminList.value.push(item)
        }
      });
      staffList.value.forEach(item => {
        if(item.stf_category === 6) {
          jobList.value.push(item)
          console.log(jobList.value)
        }
      });
    }catch(e) {}
  });

  // 结课
  const endClass = async (index: HttpPayload.ClassEdit) => {
    await ElMessageBox.confirm(
        `确定将“${index.cls_name}”班级结课？`,
        'Warning',
        { cancelButtonText: '取消', confirmButtonText: '确定',showClose: false, type: 'warning' }
    );
    await httpBatch([ () => ClassAPI.endClass(index),() => getData() ]);
    // classModel.cls_status = 3;
    ElMessage({ message: `"${index.cls_name}"已结课`, type: 'success' });
  };
  // 开课
  const beginClass = async (index: HttpPayload.ClassEdit) => {
    await ElMessageBox.confirm(
        `确定将“${index.cls_name}”班级开课？`,
        'Warning',
        {
          cancelButtonText: '取消',
          confirmButtonText: '确定',
          showClose: false,
          type: 'warning',
        }
    );
    classBegin.cls_id = index.cls_id;
    edit.editClass = true;
  };
  // 班级分配
  const distributeClsr = async () => {
    await httpBatch([ () => ClassAPI.beginClass(classBegin),() => getData() ]);
    // classModel.cls_status = 1;
    edit.editClass = false;
    ElMessage({ message: `新班级已开课`, type: 'success' });
  };

  const beginUpdate = (index: HttpPayload.ClassEdit) => {
    formRef.value?.resetFields();
    edit.model.cls_id = index.cls_id;
    edit.model.cls_name = index.cls_name;
    edit.model.cls_stf_id_teacher = index.cls_stf_id_teacher;
    edit.model.cls_stf_id_admin = index.cls_stf_id_admin;
    edit.model.cls_stf_id_job = index.cls_stf_id_job;
    edit.model.cls_dic_id_major = index.cls_dic_id_major;
    edit.model.cls_remark = index.cls_remark;
    edit.model.cls_clsr_id = index.cls_clsr_id;
    edit.model.cls_begin = index.cls_begin;
    edit.model.cls_end = index.cls_end

    nextTick(() => edit.isEdit = true);
  };
  const beginAdd = () => {
    formRef.value?.resetFields();
    edit.model.cls_id = 0;
    edit.model.cls_name = '';
    edit.model.cls_clsr_id = null;
    edit.model.cls_stf_id_teacher = 0;
    edit.model.cls_stf_id_admin = 0;
    edit.model.cls_stf_id_job = 0;
    edit.model.cls_dic_id_major = 0;
    edit.model.cls_begin = null;
    edit.model.cls_end = null;
    edit.model.cls_remark = '';
    nextTick(() => edit.isEdit = true);
  };
  const save = async  () => {

    try{
      if(edit.model.cls_id === 0) {
        await formRef.value?.validateField();
        await httpBatch([() => ClassAPI.add(edit.model), () => getData() ])
        ElMessage({ message: `教室“${edit.model.cls_name}”添加成功！`, type: 'success', })
        edit.isEdit = false;
        // 下一时间片执行高亮
        await nextTick(() => {
          let i = classList.value.findIndex(item => item.cls_name === edit.model.cls_name);
          tableRef.value.setCurrentRow(classList.value[i]);
        });
      } else {
        await httpBatch([ () => ClassAPI.update(edit.model), () => getData(false) ])
        ElMessage({ message: `教室“${edit.model.cls_name}”编辑成功！`, type: 'success', })
        edit.isEdit = false
      }
    }catch(e: any) { console.log(e.message) }
  };

  // 表单验证
  const validateClass = (rule: any, value: any, callback: any) => {
    if (value === classList.value.find(item => item.cls_name === edit.model.cls_name)?.cls_name) {
      callback(new Error(`* 此"${edit.model.cls_name}",班级已存在！`))
    } else {
      if (edit.model.cls_dic_id_major !== 0) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const validateMajor = (rule: any, value: any, callback: any) => {
    if (value === 0) {
      callback(new Error('* 请选择班级的专业！'))
    } else {
      if (edit.model.cls_dic_id_major !== 0) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const validateTeach = (rule: any, value: any, callback: any) => {
    if (value === 0) {
      callback(new Error('* 请选择教学老师！'))
    } else {
      if (edit.model.cls_stf_id_teacher !== 0) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const validateAdmin = (rule: any, value: any, callback: any) => {
    if (value === 0) {
      callback(new Error('* 请选择教务老师！'))
    } else {
      if (edit.model.cls_stf_id_admin !== 0) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const validateJob = (rule: any, value: any, callback: any) => {
    if (value === 0) {
      callback(new Error('* 请选择就业老师！'))
    } else {
      if (edit.model.cls_stf_id_job !== 0) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const rules: FormRules = {
    cls_name: [
      { required: true, message: '* 班级名称不能为空！', trigger: 'blur' },
      { min: 2, max: 20, message: '* 班级名称长度应为2-20之间', trigger: 'blur' },
      { required: true, validator: validateClass, trigger: 'blur' }
    ],
    cls_dic_id_major: [{ validator: validateMajor, trigger: 'blur',required: true,  }],
    cls_stf_id_teacher: [{ required: true, validator: validateTeach, trigger: 'blur' }],
    cls_stf_id_admin: [{ required:true, validator: validateAdmin, trigger: 'blur' }],
    cls_stf_id_job: [{ required: true, validator: validateJob, trigger: 'blur'  }]
  };
  const getIndex = (rowIndex: number) => {
    return (pagination.currentPage - 1) * classModel.pageSize + rowIndex + 1;
  }

</script>

<template>
  <el-container>
    <el-header>
      <el-form inline>
        <el-form-item label="班级名称：">
          <el-input placeholder="请输入内容" :prefix-icon="Search" v-model="classModel.cls_name" @change="getData()"></el-input>
        </el-form-item>
        <el-form-item label="班级专业：">
          <el-select v-model="classModel.cls_dic_id_major" @change="getData()">
            <el-option :value="0" label="- 请选择 -"></el-option>
            <el-option v-for="item in majorList" :value="item.dic_id" :label="item.dic_name" :key="item.dic_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="班级状态：">
          <el-select v-model="classModel.cls_status" @change="getData()">
            <el-option :value="0" label="- 所有 -"></el-option>
            <el-option label="开课中" :value="1"></el-option>
            <el-option label="未开课" :value="2"></el-option>
            <el-option label="结课" :value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="color: #ffffff">
          <el-button type="primary" :icon="Plus" style="width: 200px" @click="beginAdd">新增</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main>
      <el-table border :data="classList" stripe highlight-current-row ref="tableRef">
        <el-table-column label="#" type="index" :index="getIndex" align="center" width="auto">
        </el-table-column>
        <el-table-column label="班级名称" align="center" prop="cls_name" width="auto" ></el-table-column>
        <el-table-column label="班级专业"
                         align="center"
                         width="auto">
          <template #default="{row}">
            <div style="display: flex;align-items: center;justify-content: center">
              <el-image :src="java"
                        v-if="row.cls_dic_id_major === 8"
                        style="width: 20px;margin-right: 5px"></el-image>
              <el-image :src="H5"
                        v-else-if="row.cls_dic_id_major === 9"
                        style="width: 20px;margin-right: 5px"></el-image>
              <el-image :src="ui"
                        v-else
                        style="width: 20px;margin-right: 5px"></el-image>
              <span>{{majorList.find(item => item.dic_id === row.cls_dic_id_major)?.dic_name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="教学老师" align="center" width="90px">
          <template #default="{row}">
            <span>{{staffList.find(item => item.stf_id === row.cls_stf_id_teacher)?.stf_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="教务老师" align="center" width="90px">
          <template #default="{row}">
            <span>{{staffList.find(item => item.stf_id === row.cls_stf_id_admin)?.stf_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="就业老师" align="center" width="90px">
          <template #default="{row}">
            <span>{{staffList.find(item => item.stf_id === row.cls_stf_id_job)?.stf_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="教室" align="center">
          <template #default="{row}">
            <div style="display: flex;align-items: center;justify-content: center">
              <el-icon style="margin-right: 5px; color: #409EFF" v-if="row.cls_begin && !row.cls_end"><DataLine/></el-icon>
              <el-icon style="margin-right: 5px; color: #67C23A" v-if="row.cls_begin && row.cls_end"><DataLine/></el-icon>
              <span>{{useClassroom.list.find(item => item.clsr_id === row.cls_clsr_id)?.clsr_name}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="开课时间" prop="cls_begin" align="center" ></el-table-column>
        <el-table-column label="结课时间" prop="cls_end" align="center" ></el-table-column>
        <el-table-column label="班级状态" align="center" >
          <template #default="{row}">
            <span v-if="row.cls_begin && !row.cls_end" style="color: #409EFF">开课中</span>
            <span v-else-if="!row.cls_begin && !row.cls_end" style="color: #E6A23C">未开课</span>
            <span v-if="row.cls_begin && row.cls_end" style="color: #67C23A">结课</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" >
          <template #default="{row}">
            <span v-if="row.cls_remark !== ''">{{row.cls_remark}}</span>
            <span v-else style="color: #CDD0D6">暂无相关备注</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200px">
          <template #default="{row}">
            <el-button type="primary" @click="beginUpdate(row)" :icon="Edit">编辑</el-button>
            <el-button v-if="!row.cls_end && row.cls_begin" type="danger" @click="endClass(row)" :icon="Failed">结课</el-button>
            <el-button  v-if=" !row.cls_begin && !row.cls_end "  type="success" @click="beginClass(row)" :icon="Checked">开课</el-button>
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
          <span>{{edit.model.cls_id === 0? "班级新增" : "班级信息修改"}}</span>
        </template>
        <el-form ref="formRef" :model="edit.model" :rules="rules" status-icon label-width="120px" >
          <el-form-item label="班级名称：" prop="cls_name">
            <el-input placeholder="请输入班级名称"
                      v-model="edit.model.cls_name"></el-input>
          </el-form-item>
          <el-form-item label="班级专业：" prop="cls_dic_id_major">
            <el-select v-model="edit.model.cls_dic_id_major">
              <el-option label="- 请选择 -" :value="0"></el-option>
              <el-option v-for="item in majorList"
                         :key="item.dic_id"
                         :label="item.dic_name"
                         :value="item.dic_id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="教学老师：" prop="cls_stf_id_teacher">
            <el-select v-model="edit.model.cls_stf_id_teacher">
              <el-option label="- 请选择 -" :value="0"></el-option>
              <el-option v-for="item in teachList"
                         :key="item.stf_id"
                         :value="item.stf_id"
                         :label="item.stf_name"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="教务老师：" prop="cls_stf_id_admin">
            <el-select v-model="edit.model.cls_stf_id_admin">
              <el-option label="- 请选择 -" :value="0"></el-option>
              <el-option v-for="item in adminList"
                         :value="item.stf_id"
                         :label="item.stf_name"
                         :key="item.stf_id" ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="就业老师：" prop="cls_stf_id_job">
            <el-select v-model="edit.model.cls_stf_id_job">
              <el-option label="- 请选择 -" :value="0"></el-option>
              <el-option v-for="item in jobList"
                         :label="item.stf_name"
                         :value="item.stf_id"
                         :key="item.stf_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="班级备注：">
            <el-input type="textarea"
                      placeholder="请输入班级的相关备注"
                      v-model="edit.model.cls_remark"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="edit.isEdit = false" type="info">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
        </template>
      </el-dialog>
<!--  教室分配   -->
      <el-dialog :model-value="edit.editClass"
                 width="500px"
                 center
                 draggable
                 :close-on-click-modal="false"
                 :close-on-press-escape="false"
                 :show-close="false">
          <template #header>
            <span>教室分配</span>
          </template>
        <template #default>
          <el-form style="display: flex; justify-content: center">
            <el-form-item label="班级：">
              <el-select v-model="classBegin.cls_clsr_id" size="large" >
                <el-option :value="0" label="- 请选择 -"></el-option>
                <el-option v-for="item in useClassroom.list"
                           :label="item.clsr_name"
                           :disabled="item.clsr_occupy === 1"
                           :value="item.clsr_id"
                           :key="item.clsr_id" ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </template>
        <template #footer>
          <el-button type="info" size="large" @click="edit.editClass = false">取消</el-button>
          <el-button type="primary" size="large" @click="distributeClsr">分配</el-button>
        </template>
      </el-dialog>
    </el-main>
    <el-footer>
      <el-pagination background
                     :page-sizes="[5,9,14,18,22]"
                     :total="pagination.total"
                     v-model:page-size="classModel.pageSize"
                     v-model:current-page="pagination.currentPage"
                     @size-change="getData()"
                     @current-change="getData(false)"
                     layout="pre,pager,next,jumper,->,sizes, total">

      </el-pagination>
    </el-footer>
  </el-container>
</template>

<style lang="stylus" scoped>
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
