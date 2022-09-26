declare namespace Vm {
    type User = {
        user_name: string,
        user_pwd: string,
        role_id: number | null
    }
}

declare namespace HttpPayload {
    type UserSearch = {
        user_name: string,
        role_id: number,
        begin: number,
        pageSize: number,
    }
    type ConfigRole = {
        user_name: string,
        role_id: number,
    }
}
