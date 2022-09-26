
import { http } from "@/utils/http";

export default {
    get: (data: HttpPayload.Class) => http<HttpPayload.Class,{ total: number,list: Vm.Class[] }>({ url: '/class/list', method: 'post', data }),
    getAll: () => http({ url: '/class/all', }),
    beginClass: (data: HttpPayload.ClassDis) => http<HttpPayload.ClassDis, null>({ url: '/class/begin', method: 'post', data }),
    endClass: (data: HttpPayload.ClassEdit) => http<HttpPayload.ClassEdit,null>({ url:'/class/end', method: 'post', data }),
    add: (data: HttpPayload.ClassEdit) => http<HttpPayload.ClassEdit, any>({ url: '/class/add', method: 'post', data }),
    update: (data: HttpPayload.ClassEdit) => http<HttpPayload.ClassEdit,null>({ url: '/class/update', method: 'post', data }),
    validName: (cls_name: string) => http<string, null>({ url: '/class/valid_name', method: 'post', data: cls_name })
}
