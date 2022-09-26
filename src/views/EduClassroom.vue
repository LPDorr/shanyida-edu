<script lang="ts" setup>
  import { useClassroomStore } from '@/store';
  import {FormRules, FormInstance, ElMessageBox, ElMessage} from "element-plus";
  import { ref, onMounted,reactive } from "vue";

  const useClassroom = useClassroomStore();
  const formRef = ref<FormInstance | null>(null)
  const classroomModel = reactive({
    dialogEditShow: false,
    dialogRemoveShow: false,
   model: {
      clsr_name: '', clsr_id: 0, clsr_occupy: 0,
   }
  });
  const validateClassroom = (rule: any, value: any, callback: any) => {
    if (value === useClassroom.list.find(item => item.clsr_name === classroomModel.model.clsr_name)?.clsr_name) {
      callback(new Error(`* 此"${classroomModel.model.clsr_name}",已存在！`))
    } else {
      if (classroomModel.model.clsr_name !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  }
  const rules: FormRules = {
    clsr_name: [
      { required: true, message:'* 教室名称不能为空', trigger: 'blur' },
      { min: 3, max: 20, message: '* 教室名称长度应为3-20之间', trigger: 'blur' },
      { required: true, validator: validateClassroom, trigger: 'blur' }
  ]
  };
  const removeHandler = async (item: Vm.Classroom) => {
    await ElMessageBox.confirm(`确定要删除“${item.clsr_name}”吗？`, 'Warning', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      showClose: false,
    });
    useClassroom.removeHandler(item.clsr_id);
    ElMessage({
      type: 'success',
      message: `删除“${item.clsr_name}”成功!`,
    });
    classroomModel.dialogEditShow = false;
  };
  const beginAdd = () => {
    formRef.value?.resetFields();
    classroomModel.model.clsr_name = '';
    classroomModel.model.clsr_id = 0;
    classroomModel.model.clsr_occupy = 0;

    classroomModel.dialogEditShow = true;
  };
  const beginUpdate = (item: Vm.Classroom)  => {
    formRef.value?.resetFields();
    classroomModel.model.clsr_name = item.clsr_name;
    classroomModel.model.clsr_id = item.clsr_id;
    classroomModel.model.clsr_occupy = item.clsr_occupy;
    classroomModel.dialogEditShow = true;
  };
  const save = async () => {
    await formRef.value?.validate();
    try {
      if(classroomModel.model.clsr_id === 0) {
        await useClassroom.add(classroomModel.model as HttpPayload.Classroom);
      } else {
        await useClassroom.update(classroomModel.model as HttpPayload.Classroom);
      }
      ElMessage({ message: '编辑成功', type: 'success' })
      classroomModel.dialogEditShow = false;
    }catch(e) {}
  }
  onMounted(async () => {
      await useClassroom.init();
  });
</script>

<template>
  <el-container>
    <el-header style="display: flex" height="30px">
      <div class="title">
        <div class="free">
          <i class="free"></i>
          <span class="free">空闲</span>
        </div>
        <div class="occupy">
          <i class="occupy"></i>
          <span class="occupy">使用中</span>
        </div>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="24" class="contains">
        <el-col v-for="item in useClassroom.list" :span="6" class="is-exit" :key="item.clsr_id">
          <el-card v-if="item.clsr_occupy === 0">
            <span style="display: flex;align-items: center">
              <el-icon style="margin-right: 20px; font-size: 25px"><DataLine/></el-icon>
              <span>{{item.clsr_name}}</span>
            </span>
            <div class="free-edit">
              <el-icon style="margin-right: 30px;" @click="beginUpdate(item)"><Edit/></el-icon>
              <el-icon @click="removeHandler(item)"><Delete/></el-icon>
            </div>
          </el-card>
          <el-card v-else class="occupy-content">
            <span style="display: flex;align-items: center">
              <el-icon style="margin-right: 20px; font-size: 25px"><DataLine/></el-icon>
              <span>{{item.clsr_name}}</span>
            </span>
            <div class="occupy-edit">
              <el-icon @click="beginUpdate(item)"><Edit/></el-icon>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6" class="add-new">
          <el-card style="background-color: #fff; color: #409EFF">
            <el-icon @click="beginAdd" style="font-size: 30px; cursor: pointer"><Plus/></el-icon>
          </el-card>
        </el-col>
      </el-row>
<!--   弹出编辑/新增   -->
      <el-dialog v-model="classroomModel.dialogEditShow"
                 width="500px"
                 center
                 draggable
                 :close-on-click-modal="false"
                 :close-on-press-escape="false"
                 :show-close="false"  >
        <template #header>
          <span>新增教室</span>
        </template>
        <el-form ref="formRef" :model="classroomModel.model" :rules="rules" status-icon>
          <el-form-item label="教室名称" prop="clsr_name">
            <el-input v-model.lazy="classroomModel.model.clsr_name"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
      <span class="dialog-footer">
        <el-button @click="classroomModel.dialogEditShow = false" type="info">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </span>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<style scoped lang="stylus">
   .el-container
     padding: 0 50px
     .el-header
       height: 30px
       display: flex
       align-items center
       .title
          padding: 0 30px
          display: flex
          .free,.occupy
            display: flex
            justify-content: center
            align-items: center
            margin-right: 20px
            i.free
              height: 20px
              width: 20px
              background-color: #67C23A
              border-radius: 50%
              margin-right: 10px
            i.occupy
              height: 20px
              width: 20px
              background-color: #F56C6C
              border-radius: 50%
              margin-right: 10px
    .el-main
      .el-row
        .el-card
          height: 100px;
          border-radius: 10px;
          margin-bottom: 20px;
          background-color: #67C23A
          display: flex;
          justify-content: center;
          align-items: center;
          color: #ffffff
          padding: 0
          font-size: 20px
          position: relative
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
              font-size: 30px
              cursor: pointer
        .occupy-content
          background-color: #F56C6C
          &:hover .occupy-edit
            opacity 1
          .occupy-edit
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
              font-size: 30px
              cursor: pointer
          .dialog-header
            border: 1px solid black
</style>
