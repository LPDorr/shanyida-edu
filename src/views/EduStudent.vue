<script lang="ts" setup>
import {reactive, onMounted, ref, nextTick} from "vue";
  import { useStaffStore, useAuthStore } from '@/store';
  import { Search, Plus, Download, Share,Picture,Edit,Delete } from "@element-plus/icons-vue";
  import {ClassAPI, StudentAPI} from '@/api';
  import { httpBatch } from '@/utils/http';
import {ElMessage, FormInstance, FormRules, ElMessageBox, UploadFile, UploadProps, UploadFiles} from "element-plus";
  import XLXS from "xlsx";
  import FileSaver from "file-saver";

  const useAuth = useAuthStore();
  const useStaff = useStaffStore()
  const classList  = ref<Vm.Class[]>([]); // 班级
  const eduList = ref<Vm.dictionary[]>([]); // 学历
  const studentList = ref<Vm.Student[]>([]); // 学生
  const formRef = ref<FormInstance | null>(null);
  const checkedList = ref<Vm.Student[]>([]);
  const tableRef = ref<any>(null);
  const uploadRef = ref<any>(null);
  const studentModel = reactive<HttpPayload.Student>({ // 学生管理
    stu_name: '',
    stu_cls_id: 0,
    stu_qualification: 0,
    begin: 0,
    pageSize: 5,
  });
  const pagination = reactive({
    currentPage: 1,
    total: 0
  });
  const edit = reactive({
    isEdit: false, // 编辑新增
    isShowDivide: false, // 分配班级
    isShowImage: false, // 图片存档
    model: {
      stu_name: '', stu_avatar: null, stu_cls_id: null,
      stu_sex: 1, stu_phone: '', stu_phone2: '',
      stu_born: '', stu_qualification: 0, stu_school: '', stu_major: '',
      stu_address: '', stu_remark: '', stu_id: 0
    }
  });
  const imageUpload = reactive<HttpPayload.StudentUpload>({ //图片上传
    stu_avatar_new: null,
    stu_avatar_old: null,
    stu_id: 0
  });
  const divideList = reactive<HttpPayload.StudentDivide>({ // 分班
    stu_cls_id: 0,
    stu_id: null,
    stu_ids: []
  })
  const getData = async (fromPage1 = true) => {
    if(fromPage1) pagination.currentPage = 1;
    studentModel.begin = (pagination.currentPage - 1) * studentModel.pageSize;
    await httpBatch([
      () => {
      return new Promise((resolve, reject) => {
        StudentAPI.get(studentModel)
        .then(r => {
          const { list, total } = r
          if(total > 0 && list.length === 0) {
            pagination.currentPage = Math.ceil(total / studentModel.pageSize);
            getData(false);
            return;
          }else {
            resolve(null);
            studentList.value = list;
            pagination.total = total;
          }
        })
        .catch(() => reject())
      })
      },
      () => {
      return new Promise((resolve, reject) =>{
        ClassAPI.getAll()
        .then(r => {
          classList.value = r;
          resolve(null);
        })
        .catch(() => reject())
      })
      },
      () => {
      return new Promise((resolve, reject) => {
        useStaff.getDic()
        .then(() => {
          resolve(null);
        })
        .catch(() => reject())
      })
      }
    ])
  }
  onMounted(async () => {
    try {
      await getData();
      useStaff.dicList.forEach(item => {
        if(item.dic_group_key === 'qualification')
          eduList.value.push(item);
      });
    }catch (e) {}
  });
  const beginAdd = () => {
    formRef.value?.resetFields();
    edit.model.stu_name = '';
    edit.model.stu_sex = 1;
    edit.model.stu_phone = '';
    edit.model.stu_phone2 = '';
    edit.model.stu_born = '';
    edit.model.stu_qualification = 0;
    edit.model.stu_school = '';
    edit.model.stu_major = '';
    edit.model.stu_address = '';
    edit.model.stu_remark = '';
    edit.model.stu_id = 0;
    nextTick(() => edit.isEdit = true);
};
  const beginUpdate = (index: HttpPayload.StudentEdit) => {
    formRef.value?.resetFields();
    edit.model.stu_avatar = index.stu_avatar;
    edit.model.stu_name = index.stu_name;
    edit.model.stu_sex = index.stu_sex;
    edit.model.stu_cls_id = index.stu_cls_id
    edit.model.stu_phone = index.stu_phone;
    edit.model.stu_phone2 = index.stu_phone2;
    edit.model.stu_born = index.stu_born;
    edit.model.stu_qualification = index.stu_qualification;
    edit.model.stu_school = index.stu_school;
    edit.model.stu_major = index.stu_major;
    edit.model.stu_address = index.stu_address;
    edit.model.stu_remark = index.stu_remark;
    edit.model.stu_id = index.stu_id;
    nextTick(() => edit.isEdit = true);
  };
  const save = async () => {
    if (edit.model.stu_id === 0) {
      await formRef.value?.validateField();
      if(studentList.value.find(item => item.stu_phone === edit.model.stu_phone) !== undefined) {
        await ElMessageBox.alert(
            `${edit.model.stu_phone},手机号已存在了喔！`,
            'Warning',
            { type: 'error', confirmButtonText: '确定',showClose: false }
        );
        return;
      }
      if(edit.model.stu_phone === edit.model.stu_phone2) {
        await ElMessageBox.alert(
            `手机号与备用手机号不可以重复喔！`,
            'Warning',
            { type: 'error', confirmButtonText: '确定',showClose: false }
        );
        return;
      }
      await httpBatch([
        () => {
        return new Promise((resolve, reject) => {
          StudentAPI.validPhone(edit.model.stu_phone)
          .then(() => {
            resolve(null);
          })
          .catch(() => reject())
        })
        },
        () => {
          return new Promise((resolve, reject) => {
            StudentAPI.add(edit.model)
            .then(() => {
                resolve(null);
            })
            .catch(() => reject())
          })
        },
        () => {
        return new Promise((resolve, reject) => {
          getData()
          .then(() => {
            resolve(null);
          })
          .catch(() => reject())
        })
        }
      ]);
      ElMessage({ message: `学生：${edit.model.stu_name}添加成功！`, type: 'success' });
      edit.isEdit = false;
      // 下一时间片执行高亮
      await nextTick(() => {
        let i = studentList.value.findIndex(item => item.stu_name === edit.model.stu_name);
        tableRef.value.setCurrentRow(studentList.value[i]);
      });
    } else {
      await httpBatch([ () => StudentAPI.update(edit.model), () => getData(false) ],true);
      // edit.model.stu_cls_id = divideList.stu_cls_id;
      ElMessage({ message: `学生：${edit.model.stu_name}信息编辑成功！`, type: 'success' });
      edit.isEdit = false;
    }
  };
  // 表单验证
  const validatePhone = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('* 手机号不能为空！'))
    }
    else {
      if (edit.model.stu_phone !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const validateBorn = (rule: any, value: any, callback: any) => {
    if (value === '') {
      callback(new Error('* 出生日期不能为空！'))
    } else {
      if (edit.model.stu_born !== '') {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };
  const validateQual = (rule: any, value: any, callback: any) => {
    if (value === 0) {
      callback(new Error('* 学生学历不能为空！'))
    } else {
      if (edit.model.stu_born !== null) {
        if (!formRef.value) return
        formRef.value.validateField('checkPass', () => null)
      }
      callback()
    }
  };

  const rules: FormRules = {
      stu_name: [
        { required: true, message: '* 学生姓名不能为空', trigger: 'blur' },
        { min: 2, max: 5, message: '* 学生姓名应在2-5之间', trigger: 'blur' },
      ],
      stu_phone: [
        { required: true, validator: validatePhone, trigger: 'blur' },
        { min: 11, max: 11, message: '* 手机号格式不正确，应为11位数字', trigger: 'blur' }
      ],
    stu_phone2: [
      { required: true, validator: validatePhone, trigger: 'blur' },
      { min: 11, max: 11, message: '* 手机号格式不正确，应为11位数字', trigger: 'blur' }
    ],
      stu_born: [
        { required: true, validator: validateBorn, trigger: 'change' },
      ],
      stu_qualification: [
        { required: true, validator: validateQual, trigger: 'blur' }
      ],
      stu_address: [
        { required: true, message: '* 家庭住址不能为空', trigger: 'blur' },
        { min: 4, message: '* 家庭住址不得少于4个字', trigger: 'blur' }
      ],
    };
  const divideTotalClass = () => {
    checkedList.value.forEach(item => {
      divideList.stu_ids.push(item.stu_id)
    });
    divideList.stu_id = null;
    divideList.stu_cls_id = 0;
    edit.isShowDivide = true
  }
  const divideSingleClass = (index: HttpPayload.StudentEdit) => {
    divideList.stu_ids.push(index.stu_id);
    divideList.stu_id = index.stu_id;
    divideList.stu_cls_id = index.stu_cls_id;
    nextTick(() => edit.isShowDivide = true);
  };
  const divideSave = async () => {
    if(divideList.stu_id === null ){
        await httpBatch([ () => StudentAPI.divideClass(divideList), () => getData() ])
        divideList.stu_ids.length = 0
    } else {
      await httpBatch([() => StudentAPI.divideClass(divideList), () => getData()]);
    }
    edit.isShowDivide = false;
    ElMessage({ message: `班级分配成功！`, type: 'success' })
  };
  const getChecked = (index: Vm.Student[]) => {
   checkedList.value = index;
  };


// 上传前校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('请上传jpg或png格式的文件！')
    return false
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('图片大小不能超过2MB!')
    return false
  }
  return true
};
// 文件上传成功的回调
  const successHandler = ( response: any, uploadFile: UploadFile, uploadFiles: UploadFiles ) => {
    imageUpload.stu_avatar_new = response.data;
    if(imageUpload.stu_avatar_old === null && uploadFiles.length > 1) uploadFiles.shift();
    if(imageUpload.stu_avatar_old !== null && uploadFiles.length > 2) uploadFiles.splice(1, 1);
    ElMessage.success('图片预上传成功！')
  };
  // 图片上传
  const photoArchive = (row:Vm.Student) => {
    uploadRef.value?.clearFiles();
    imageUpload.stu_avatar_new = null
    imageUpload.stu_id = row.stu_id;
    imageUpload.stu_avatar_old = row.stu_avatar || null;
    nextTick(() => edit.isShowImage = true);
  };
  // 图片存档
  const ImageSave = async () => {
    if(imageUpload.stu_avatar_new === null ){
      await ElMessageBox.alert(
          '请选择上传的图片！',
          'Warning',
          { type: 'error',showClose: false }
      )
      return;
    }
      await httpBatch([ () => StudentAPI.UploadImage(imageUpload), () => getData(false) ])
      ElMessage.success('图片上传成功！');
      edit.isShowImage = false;
  };
// 导出学生信息
  const exportClick = async () => {
    await ElMessageBox.confirm(
        '确定要导出学生的信息吗？',
        'Warning',
        { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消', showClose: false }
    );
    // 导出文件名
    const filename = "学生信息表.xlsx";
    // 导出表格加id,通过id获取要导出的表单
    const wb = XLXS.utils.table_to_book(document.getElementById("table"));
    const wbout = XLXS.write(wb, {
      bookType: "xlsx",
      bookSST: true,
      type: "array",
    });
    try {
      FileSaver.saveAs(
          new Blob([wbout], {
            type: "application/octet-stream",
          }),
          filename
      );
    } catch (e) {
      console.log(e);
    }
    return wbout;
  };
  const getIndex = (rowIndex: number) => {
    return (pagination.currentPage - 1) * studentModel.pageSize + rowIndex + 1;
  }
</script>

<template>
  <el-container>
    <el-header>
      <el-form inline>
        <el-form-item label="学生姓名：" style="margin-right: 10px">
          <el-input :prefix-icon="Search"
                    placeholder="请输入内容"
                    @change="getData()"
                    v-model="studentModel.stu_name"></el-input>
        </el-form-item>
        <el-form-item label="所在班级：" style="margin-right: 10px">
          <el-select v-model="studentModel.stu_cls_id" @change="getData()">
            <el-option :value="0" label="- 请选择 -"></el-option>
            <el-option :value="0" label="- 无教室 -"></el-option>
            <el-option v-for="item in classList"
                       :value="item.cls_id"
                       :label="item.cls_name"
                       :key="item.cls_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="学生学历：" style="margin-right: 10px">
          <el-select v-model="studentModel.stu_qualification">
            <el-option :value="0" label="- 请选择 -"></el-option>
            <el-option v-for="item in eduList"
                       :value="item.dic_id"
                       :label="item.dic_name"
                       :key="item.dic_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin-right: 10px">
          <el-button type="primary" :icon="Plus" @click="beginAdd">新增</el-button>
        </el-form-item>
        <el-form-item style="margin-right: 10px">
          <el-button type="success"
                     :icon="Share"
                     :disabled="checkedList.length === 0"
                     @click="divideTotalClass">批量分班</el-button>
        </el-form-item>
        <el-form-item style="margin-right: 10px">
          <el-button type="danger" :icon="Download" @click="exportClick">导出学生信息</el-button>
        </el-form-item>
      </el-form>
    </el-header>
    <el-main style="overflow-x:hidden">
      <el-table id="table"
                border highlight-current-row
                stripe :data="studentList"

                @selection-change="getChecked" ref="tableRef">
        <el-table-column label="#" type="index" :index="getIndex" align="center"></el-table-column>
        <el-table-column type="selection" ></el-table-column>
        <el-table-column label="学生名称" align="center" prop="stu_name" width="100px"></el-table-column>
        <el-table-column label="班级" align="center" width="120px">
          <template #default="{row}">
            <span v-if="row.stu_cls_id === null" style="color: #CDD0D6">暂无班级</span>
            <span v-else>{{classList.find(item => item.cls_id === row.stu_cls_id)?.cls_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="存档照片" align="center" width="120px">
          <template #default="{row}">
            <el-popover
                placement="right"
                title="预览"
                :width="250"
                trigger="hover"
            >
              <template #reference>
                <el-button type="primary">预览</el-button>
              </template>
              <template #default>
                <el-image :src="'image' + row.stu_avatar"
                          v-if="row.stu_avatar !== null"
                          style="height: 100%;width: 100%"></el-image>
                <span v-else style="color: #CDD0D6">暂无相关照片</span>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="性别" align="center" width="auto">
          <template #default="{row}">
            <span>{{row.stu_sex === 1? '男' : '女'}}</span>
          </template>
        </el-table-column>
        <el-table-column label="联系电话1" align="center" prop="stu_phone" width="120px"></el-table-column>
        <el-table-column label="联系电话2" align="center" prop="stu_phone2" width="120px"></el-table-column>
        <el-table-column label="出生日期" align="center" prop="stu_born" width="150px"></el-table-column>
        <el-table-column label="学历" align="center" width="120px">
          <template #default="{row}">
            <span>{{eduList.find(item => item.dic_id === row.stu_qualification)?.dic_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="毕业院校" align="center" width="160px">
          <template #default="{row}">
            <span v-if="row.stu_school !== '' " v-text="row.stu_school"></span>
            <span v-else style="color: #CDD0D6">该生未填写学校名称</span>
          </template>
        </el-table-column>
        <el-table-column label="院校专业" align="center" prop="" width="170px">
          <template #default="{row}">
            <span v-if="row.stu_major !== '' " v-text="row.stu_major"></span>
            <span v-else style="color: #CDD0D6">该生未填写专业名称</span>
          </template>
        </el-table-column>
        <el-table-column label="家庭住址" align="center" prop="stu_address" width="120px"></el-table-column>
        <el-table-column label="备注" align="center" width="120px">
          <template #default="{row}">
            <span v-if="row.stu_remark === ''" style="color: #CDD0D6">暂无相关备注</span>
            <span>{{row.stu_remark}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="420px" fixed="right">
          <template #default="{row}" >
            <el-button type="success" @click="divideSingleClass(row)" :icon="Share">分班</el-button>
            <el-button type="warning" :icon="Picture" @click="photoArchive(row)">照片存档</el-button>
            <el-button type="primary" @click="beginUpdate(row)" :icon="Edit">编辑</el-button>
            <el-button type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
    <!--   编辑/新增弹窗   -->
    <el-dialog v-model="edit.isEdit"
               width="600px"
               center
               draggable
               :close-on-click-modal="false"
               :show-close="false" >
      <template #header>
        <span>{{edit.model.stu_id === 0? "学生新增" : "学生信息修改"}}</span>
      </template>
      <template #default>
        <el-form label-width="120px" ref="formRef" status-icon :model="edit.model" :rules="rules">
          <el-form-item label="学生姓名：" prop="stu_name">
            <el-input placeholder="请输入学生姓名" v-model="edit.model.stu_name"></el-input>
          </el-form-item>
          <el-form-item label="学生性别：">
            <el-radio-group v-model="edit.model.stu_sex">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="0">女</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="联系电话：" prop="stu_phone">
            <el-input placeholder="请输入手机号"
                      maxlength="11"
                      show-word-limit
                      oninput ="value=value.replace(/[^\d]/g,'')"
                      v-model="edit.model.stu_phone"></el-input>
          </el-form-item>
          <el-form-item label="备用电话：" prop="stu_phone2">
            <el-input placeholder="请输入备用手机号"
                      maxlength="11"
                      show-word-limit
                      oninput ="value=value.replace(/[^\d]/g,'')"
                      v-model="edit.model.stu_phone2"></el-input>
          </el-form-item>
          <el-form-item label="出生日期：" prop="stu_born">
            <el-date-picker type="date"
                            v-model="edit.model.stu_born"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            clearable
                            placeholder="请选择出生日期"></el-date-picker>
          </el-form-item>
          <el-form-item label="学生学历：" prop="stu_qualification">
            <el-select v-model="edit.model.stu_qualification">
              <el-option label="- 请选择 -" :value="0"></el-option>
              <el-option v-for="item in eduList"
                         :value="item.dic_id"
                         :label="item.dic_name"
                         :key="item.dic_id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="在读/毕业院校：">
            <el-input placeholder="请输入在读/毕业院校（选填）" v-model="edit.model.stu_school"></el-input>
          </el-form-item>
          <el-form-item label="在校学习专业：">
            <el-input placeholder="请输入在校学习专业（选填）" v-model="edit.model.stu_major"></el-input>
          </el-form-item>
          <el-form-item label="家庭住址：" prop="stu_address">
            <el-input placeholder="请输入家庭住址" v-model="edit.model.stu_address"></el-input>
          </el-form-item>
          <el-form-item label="学生备注：">
            <el-input placeholder="请输入学生备注" v-model="edit.model.stu_remark"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <div>
          <el-button type="info" size="large" @click="edit.isEdit = false">取消</el-button>
          <el-button type="primary" size="large" @click="save">确定</el-button>
        </div>
      </template>
    </el-dialog>
<!--  班级分配  -->
    <el-dialog v-model="edit.isShowDivide"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               :show-close="false"
               draggable
               width="500px" center>
      <template #header>
        <span>班级分配</span>
      </template>
      <template #default>
        <el-form>
          <el-form-item label="班级：">
            <el-select v-model="divideList.stu_cls_id">
              <el-option :value="0" label="- 请选择 -"></el-option>
<!--              <el-option :value="null" label="无班级"></el-option>-->
              <el-option v-for="item in classList"
                         :value="item.cls_id"
                         :label="item.cls_name"
                         :key="item.cls_id"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button type="info" size="large" @click="edit.isShowDivide = false">取消</el-button>
        <el-button type="primary" size="large" @click="divideSave">分配</el-button>
      </template>
    </el-dialog>
<!--  照片存档  -->
    <el-dialog v-model="edit.isShowImage"
               draggable :show-close="false"
               :close-on-click-modal="false"
               :close-on-press-escape="false"
               center width="900px" >
      <template #header>
        <span>照片存档</span>
      </template>
      <template #default>
        <el-form inline>
          <el-form-item label="个人照片：">
            <div style="width: 200px;height: 250px;border-right: 2px solid #ccc;padding-right: 40px;">
              <div style="height:100%; width: 100%;border: 1px solid #cccccc; display: flex;justify-content: center;align-items: center; color: #cccccc "
                   v-if="imageUpload.stu_avatar_old === null">暂无照片</div>
              <el-image v-else style="width: 100%;height: 100%;"
                        :src=" 'image' +imageUpload.stu_avatar_old">
              </el-image>
            </div>
          </el-form-item>
          <el-form-item>
            <el-upload list-type="picture-card"
                       :before-upload="beforeAvatarUpload"
                       accept=".png,.jpg"
                       name="avatar"
                       ref="uploadRef"
                       :on-success="successHandler"
                       :headers="{ authorization: useAuth.token }"
                       action="/api/student/avatarupload">
              <el-icon class="avatar-uploader-icon" style="color: #409EFF"><Plus /></el-icon>
            </el-upload>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button type="info" @click="edit.isShowImage = false">取消</el-button>
        <el-button type="primary" @click="ImageSave">存档</el-button>
      </template>
    </el-dialog>
    <el-footer>
      <el-pagination background
                     :page-sizes="[5,9,14,18,22]"
                     :total="pagination.total"
                     v-model:page-size="studentModel.pageSize"
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
