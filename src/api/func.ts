import {http} from "@/utils/http";

export default {
    getAll: () => http<null, Vm.Func[]>({ url: '/function/all', method: 'get' }),
    remove: (id: number) => http<null,null>({ url: '/function/remove/' + id, method: 'post' }),
    add: (data: HttpPayload.Func) => http<HttpPayload.Func, number>({ url: '/function/add', method: 'post', data }),
    update: (data: HttpPayload.Func) => http<HttpPayload.Func, null>({ url: '/function/update', method: 'post', data })
}
