declare namespace Vm {
    type Student = {
        stu_id: number,
        stu_name: string,
        stu_avatar?: any,
        stu_cls_id?: number,
        stu_sex: number,
        stu_phone: string,
        stu_phone2: string,
        stu_born: string,
        stu_qualification: number,
        stu_school?: string,
        stu_major?: string,
        stu_address: string,
        stu_remark?: string

    }
}

declare namespace HttpPayload {
    type Student = {
        stu_name: string,
        stu_cls_id: number,
        stu_qualification: number,
        begin: number,
        pageSize: number,
    }
    type StudentEdit = {
        stu_name: string, stu_avatar: any, stu_cls_id: any,
        stu_sex: number, stu_phone: string, stu_phone2: string,
        stu_born: string, stu_qualification: number, stu_school: string, stu_major: string,
        stu_address: string, stu_remark: string, stu_id: number
    };
    type StudentDivide = {
        stu_id: any,
        stu_ids: any,
        stu_cls_id: any
    };
    type StudentUpload = {
        stu_id: number,
        stu_avatar_old: null,
        stu_avatar_new: string | null
    }
}
