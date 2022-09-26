import {http} from "@/utils/http";


export default {
    login: (data: HttpPayload.Login) => http<HttpPayload.Login, string>({ url: '/user/login', method: 'post', data }),
    getMenu: () => http<null,Array<Vm.Func>>({ url: '/user/getmenu', method: 'post' }),
    get: (data: HttpPayload.UserSearch) => http<HttpPayload.UserSearch, {total: number,list: Vm.User[]}>({ url: '/user/list', method: 'post', data }),
    remove: (user_name: string) => http<null,null>({ url: '/user/remove/' + user_name, method: 'post' }),
    resetpwd: (user_name: string) =>http<null,null>({ url: '/user/resetpwd/' + user_name, method: 'post' }),
    add: (user_name: string) => http<null,null>({ url: '/user/add/' + user_name, method: 'post' }),
    configRole: (data: HttpPayload.ConfigRole) => http<HttpPayload.ConfigRole, null>({ url: '/user/config_role', method: 'post', data }),
    validateName: (user_name: string) => http<null, 0 | 1>({ url: '/user/valid_name/' + user_name, method: 'post' }),
    changePwd: (data: { oldPwd: string, newPwd: string }) => http<{  oldPwd: string, newPwd: string }, null>({ url: '/user/pwdchange', method: 'post', data })
}
