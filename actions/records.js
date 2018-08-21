// 作業記録データのアクションタイプ
export const CREATE_RECORD          = 'CREATE_RECORD'
export const READ_RECORD            = 'READ_RECORD'
export const DELETE_WORK_RECORDS    = 'DELETE_WORK_RECORDS'
export const DAILY_RECORDS          = 'DAILY_RECORDS'
export const WEEKLY_RECORDS         = 'WEEKLY_RECORDS'
export const MONTHLY_RECORDS        = 'MONTHLY_RECORDS' 
// 作業記録データ集計のタイプ
export const SUMMARY_TYPE_DAILY     = 'SUMMARY_TYPE_DAILY'
export const SUMMARY_TYPE_WEEKLY    = 'SUMMARY_TYPE_WEEKLY'
export const SUMMARY_TYPE_MONTHLY   = 'SUMMARY_TYPE_MONTHLY'

// 作業記録データ関連
// 作業記録追加は更新機能もできるようにする
export const createRecord = (workId, date, seconds) => ({
    type: CREATE_RECORD,
    workId: workId,
    date: date,
    seconds: seconds,
})
export const readRecord = (workId, date) => ({
    type: READ_RECORD,
    workId: workId,
    date: date,
})
export const deleteWorkRecords = (workId) => ({
    type: DELETE_WORK_RECORDS,
    workId: workId,
})
export const dailyRecords = (date) => ({
    type: DAILY_RECORDS,
    date: date,
})
export const weeklyRecords = (startDate) => ({
    type: WEEKLY_RECORDS,
    startDate: startDate,
})
export const monthlyRecords = (monthDate) => ({
    type: MONTHLY_RECORDS,
    monthDate: monthDate,
})