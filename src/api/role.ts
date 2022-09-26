import {http} from "@/utils/http";


export default {
    getAll: () => http<null, Vm.Role[]>({ url: '/role/all', method: 'get' }),
    getRoleFunc: (id: number) => http<null, Vm.Func[]>({ url: '/role_function/list/' + id, method: 'get' }),
    saveRoleFunc: (data: HttpPayload.RoleFunc) => http<HttpPayload.RoleFunc, null>({ url: '/role_function/config', method: 'post', data }),
    remove: (id: number) => http<null, null>({ url: '/role/remove/' + id, method: 'post', }),
    add: (data: HttpPayload.Role) => http<HttpPayload.Role, number>({ url: '/role/add', method: 'post', data }),
    update: (data: HttpPayload.Role) => http<HttpPayload.Role, Vm.Role>({ url: '/role/update', method: 'post', data }),
}
