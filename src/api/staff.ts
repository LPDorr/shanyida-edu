
import {http} from "@/utils/http";

export default {
    get: (data: HttpPayload.Staff) => http<HttpPayload.Staff, { total: number,list: Vm.Staff[] }>({ url: '/staff/list', method: 'post', data }),
    getDic: () => http<null, Vm.dictionary[]>({ url: '/dictionary/all', }),
    setDimission: (id: number) => http<null,null>({ url: '/staff/dimission/' + id, method: 'get' }), // 离职
    setReinstate: (id: number) => http({ url: '/staff/reinstate/' + id, method: 'get' }), // 入职
    add: (data: HttpPayload.StaffEdit) => http<HttpPayload.StaffEdit, null>({ url: '/staff/add', method: 'post', data }),
    update: (data: HttpPayload.StaffEdit) => http<HttpPayload.StaffEdit, null>({ url: '/staff/update', method: 'post', data })
}
