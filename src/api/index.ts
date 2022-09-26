// 将api文件夹下所有api文件统一导入在统一导出，方便外面组件使用；

import UserAPI from './user'
import ClassroomAPI from './classroom';
import FuncAPI from './func';
import RoleAPI from './role';
import StaffAPI from './staff';
import StudentAPI from './student';
import ClassAPI from './class'

export {
    UserAPI,
    ClassroomAPI,
    FuncAPI,
    RoleAPI,
    StaffAPI,
    StudentAPI,
    ClassAPI
}
