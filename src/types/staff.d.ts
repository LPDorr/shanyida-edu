
declare namespace Vm {
    type Staff = {
        stf_id: number,
        stf_name: string,
        stf_category: number,
        stf_remark: string,
        stf_invalid: number,
    };
    type StaffEdit = {
        stf_name: string,
        stf_category: number,
        stf_remark: string,
    }
}

declare namespace HttpPayload {
    type Staff = {
        stf_id: number,
        stf_name: string,
        stf_category: number,
        begin: number,
        pageSize: number,
    };
    type StaffEdit = {
        stf_id: number,
        stf_name: string,
        stf_category: number,
        stf_remark: string,
    }
}
