declare namespace Vm {
    type Classroom = {
        clsr_id: number,
        clsr_name: string,
        clsr_occupy: 0 | 1,
    }
}

declare namespace HttpPayload {
    type Classroom = {
        clsr_id?: number,
        clsr_name: string,
        clsr_occupy?: 0 | 1
    }
}
