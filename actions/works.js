// 作業データのアクションタイプ
export const CREATE_WORK            = 'CREATE_WORK'
export const UPDATE_WORK            = 'UPDATE_WORK'
export const DELETE_WORK            = 'DELETE_WORK'
export const FETCH_WORKS            = 'FETCH_WORKS'
export const MEASURE_WORK           = 'MEASURE_WORK'
export const DONE_MEASURE_WORK      = 'DONE_MEASURE_WORK'
export const RECEIVE_WORK_DELETED   = 'RECEIVE_WORK_DELETED'
// エラーメッセージ
export const ERR_ALREADY_EXIST  = 'ERR_ALREADY_EXIST'
export const ERR_MEASURING_WORK = 'ERR_MEASURING_WORK'
// その他のパラメータ
export const NOT_MEASURING_ID   = -1

// 作業データ関連
export const createWork = (name) => ({
    type: CREATE_WORK,
    name: name,
})
export const updateWork = (id, name) => ({
    type: UPDATE_WORK,
    id: id,
    name: name,
})
export const deleteWork = (id) => ({
    type: DELETE_WORK,
    id: id,
})
export const fetchWorks = () => ({
    type: FETCH_WORKS,
})

export const startMeasuring = (workId) => ({
    type: MEASURE_WORK,
    workId: workId,
})
export const doneMeasuring = () => ({
    type: DONE_MEASURE_WORK,
})

export const receiveWorkDeleted = () => ({
    type: RECEIVE_WORK_DELETED,
})