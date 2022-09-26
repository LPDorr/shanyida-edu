import { http } from '@/utils/http'

export default {
    get: () => http<null, Vm.Classroom[]>({ url: '/classroom/all', method: 'get' }),
    remove:(id: number) => http<null,null>({ url: '/classroom/remove/' + id, method: 'get' }),
    add: (data: HttpPayload.Classroom) => http<HttpPayload.Classroom, number>({ url: '/classroom/add', method: 'post', data }),
    update: (data: HttpPayload.Classroom) => http<HttpPayload.Classroom, null>({ url: '/classroom/update', method: 'post', data }),
}
