
import { createPinia } from "pinia";
import piniaPersist from 'pinia-plugin-persist'
// 统一导入所有pinia仓库
import useDashboardStore from './dashboard';
import useAuthStore from './auth';
import useClassroomStore from './classroom';
import useFuncStore from './func';
import useRoleStore from './role';
import useStaffStore from './staff'
import UseStudentStore from './student';
import UseClassStore from './class';


const pinia = createPinia();

pinia.use(piniaPersist)
// 统一导出所有pinia仓库
export {
    useAuthStore,
    useDashboardStore,
    useClassroomStore,
    useFuncStore,
    useRoleStore,
    useStaffStore,
    UseStudentStore,
    UseClassStore
}
export default pinia

