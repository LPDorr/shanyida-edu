
import { http } from '@/utils/http';

export default {
    get: (data: HttpPayload.Student) => http<HttpPayload.Student, { total: number, list: Vm.Student[] }>({ url: '/student/list', method: 'post', data }),
    add: (data: HttpPayload.StudentEdit) => http<HttpPayload.StudentEdit, null>({ url: '/student/add', method: 'post', data }),
    update: (data: HttpPayload.StudentEdit) => http<HttpPayload.StudentEdit, null>({ url: '/student/update', method: 'post', data }),
    validPhone: (data: string) => http<string, number>({ url: '/student/valid_phone', method: 'post', data }),
    divideClass: (data: HttpPayload.StudentDivide) => http<HttpPayload.StudentDivide, null>({ url: '/student/assignclass', method:'post', data }),
    UploadImage: (data: HttpPayload.StudentUpload) => http<HttpPayload.StudentUpload, string>({ url: '/student/avatarupdate', method: 'post', data })

}
