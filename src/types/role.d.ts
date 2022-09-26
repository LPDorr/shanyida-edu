declare namespace Vm {
    type Role  = {
        role_id: number,
        role_name: string
    }
}

declare namespace HttpPayload {
    type Role  = {
        role_id: number,
        role_name: string
    };
    type RoleFunc = {
        role_id: number,
        role_func_ids: string
    }
}
