import { createStore } from 'redux'
import { reducers } from './reducers/reducer'
import { NOT_MEASURING_ID } from './actions/works'
import { SUMMARY_TYPE_DAILY } from './actions/records'

// 作業データ関連
let workState = {
    works: [],                      // 作業データ一覧
    measuringId: NOT_MEASURING_ID,   // 作業時間計測中の作業ID
}
// 作業記録データ関連
let recordState = {
    records: [],                    // 集計して表示中の作業時間データ
    seconds: 0,                     // 作業時間検索結果を格納する
    summaryType: SUMMARY_TYPE_DAILY // 集計方法のタイプを示す
}
// 作業時間計測関連
let measureState = {
    measuringWorkId: NOT_MEASURING_ID,
    seconds: 0,
}
initialState = {workState: workState, recordState: recordState}
// storeを作成
export const store = createStore(reducers, initialState);