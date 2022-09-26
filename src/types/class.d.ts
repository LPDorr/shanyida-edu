declare namespace Vm {
    type Class = {
        cls_id: number,
        cls_name: string,
        cls_dic_id_major: number,
        cls_clsr_id: number,
        cls_stf_id_teacher: number,
        cls_stf_id_admin: number,
        cls_stf_id_job: number,
        cls_begin: string,
        cls_end: string | null,
        cls_remark: string,
        // cls_begin: string,
        // cls_clsr_id: number,
        // cls_dic_id_major: number,
        // cls_end: string | null
        // cls_id: number,
        // cls_name: string,
        // cls_remark: string
        // cls_stf_id_admin: number,
        // cls_stf_id_admin_name: string
        // cls_stf_id_job: number
        // cls_stf_id_job_name: string
        // cls_stf_id_teacher: number
        // cls_stf_id_teacher_name: string
    }
}

declare namespace HttpPayload {
    type Class = {
        cls_name: string,
        cls_dic_id_major: number,
        cls_status: number,
        begin: number,
        pageSize: number,
    };
    type ClassEdit = {
        cls_id: number, cls_name: string, cls_dic_id_major: number, cls_clsr_id: any,
        cls_stf_id_teacher: number, cls_stf_id_admin: number, cls_stf_id_job: number,
        cls_begin: any, cls_end: any , cls_remark: string,
    }
    type ClassDis = {
        cls_id: number,
        cls_clsr_id: number
    }
}
