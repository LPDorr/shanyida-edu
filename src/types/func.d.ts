declare namespace Vm {
    type Func = {
        func_id: number,
        func_name: string,
        func_key: string,
        func_fid: number,
    };
    type TreeDataItem = Func & { children?: TreeDateItem[] };
    type TreeData = TreeDataItem[]
}

declare namespace HttpPayload {
    type Func = {
        func_id: number,
        func_name: string,
        func_key: string,
        func_fid: number,
    };
}
