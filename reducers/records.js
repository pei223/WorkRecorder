const Realm = require('realm')
import { 
    CREATE_RECORD, 
    READ_RECORD, 
    DELETE_WORK_RECORDS,
    DAILY_RECORDS, 
    WEEKLY_RECORDS, 
    MONTHLY_RECORDS, 
    SUMMARY_TYPE_DAILY,
    SUMMARY_TYPE_WEEKLY,
    SUMMARY_TYPE_MONTHLY,
 } from '../actions/records'
import { DB_SCHEMA } from '../DB'

realm = new Realm(DB_SCHEMA)

export const recordState = (state = {}, action) => {
    console.log(action)
    switch(action.type) {
        // 作業時間データを登録する
        // 既存のデータがあれば上書きする
        case CREATE_RECORD:
            // 日付データをDB上の形式に沿った形に加工する
            let createDate = _getModifiedDate(action.date)
            // 追加・上書きするデータのIDを設定する
            let oldRecord = realm.objects('Record')
                    .filtered('workId = $0', action.workId)
                    .filtered('date = $0', createDate)
            let id = -1
            // 指定された作業・日付の勉強時間がないならidは新たに生成する
            if (0 === oldRecord.length) {
                id = realm.objects('Record').max('id')
                // データが一件もなければ0にする
                if (undefined === id || null === id) {
                    id = 0
                }
                id++
            } else {
                id = oldRecord[0].id
            }
            // データを登録・上書きする(idが既存のidなら上書きされる)
            realm.write(() => {
                realm.create('Record',
                    {
                        id: id,
                        workId: action.workId,
                        seconds: action.seconds,
                        date: createDate,
                    },
                true)
            })
            return Object.assign({}, state, 
                {records: _fetchRecords(state.summaryType, new Date())})
        
        // 指定条件の作業時間データを検索して作業時間を設定
        case READ_RECORD:
            // 日付データをDB上の形式に沿った形に加工する
            let readDate = _getModifiedDate(action.date)
            // 作業名が登録されていない場合(通常通らない)
            if (0 === realm.objects('Work').filtered('id = $0', action.workId).length) {
                console.error('登録されていない作業')
                return state
            }
            let dayRecord = realm.objects('Record')
                    .filtered('workId = $0', action.workId).filtered('date = $0', readDate)
            // データが存在しなければ作業時間を0秒に設定する
            return 0 === dayRecord.length ? 
                Object.assign(state, {seconds: 0}) : Object.assign(state, {seconds: dayRecord[0].seconds})
        
        // 指定した作業のデータを全て削除する
        case DELETE_WORK_RECORDS:
            realm.write(() => {
                // 作業とその作業の勉強時間データを削除する
                realm.delete(realm.objects('Record').filtered('workId = $0', action.workId))
            })
            return Object.assign({}, state, 
                {records: _fetchRecords(state.summaryType, new Date())})

        // 1日の作業時間の集計
        case DAILY_RECORDS:
            return Object.assign({}, state, 
                {records: _fetchRecords(SUMMARY_TYPE_DAILY, action.date), summaryType: SUMMARY_TYPE_DAILY})
        // 1週間の作業時間の集計
        case WEEKLY_RECORDS:
            return Object.assign({}, state, 
                {records: _fetchRecords(SUMMARY_TYPE_WEEKLY, null), summaryType: SUMMARY_TYPE_WEEKLY})
        // 1ヶ月の作業時間の集計
        case MONTHLY_RECORDS:
            return Object.assign({}, state, 
                {records: _fetchRecords(SUMMARY_TYPE_MONTHLY, null), summaryType: SUMMARY_TYPE_MONTHLY})
        default:
            return state
    }
}

/**
 * DB上で使用する形に沿った日付データに加工して返す
 * @return {Date} 修正した日付
 */
function _getModifiedDate(date){
    // 4時より前なら前の日付とする
    if (4 > date.getHours()) {
        date.setDate(date.getDate() - 1)
    }
    // 年月日以外は0にする
    date.setHours(0)
    date.setMinutes(0)
    date.setSeconds(0)
    date.setMilliseconds(0)
    return date
}

/**
 * 集計タイプに応じて作業時間データを集計して返す
 * @param {String} summaryType actions/recordsのSUMMARY_TYPE~ 
 * @param {Date} date 日付データ。1日集計時に用いる 
 */
function _fetchRecords (summaryType, date) {
    // 一日のデータ
    if (SUMMARY_TYPE_DAILY === summaryType) {
        if (null === date || undefined === date) {
            console.error('1日データ集計はDateを引数に指定する必要がある')
        }
        let dailyDate = _getModifiedDate(date)
        // 勉強時間データの取得
        let dailyRecords = realm.objects('Record').filtered('date = $0', dailyDate).sorted('workId')
        // データがなければ空配列を返す
        return 0 === dailyRecords.length ? [] : _getModifiedRecords(dailyRecords)
    } 
    // 一週間のデータ
    else if (SUMMARY_TYPE_WEEKLY === summaryType) {
        // 日付データをDB上の形式に沿った形に加工、一週間前の日付を取得
        let weeklyFromDate = _getModifiedDate(new Date())
        let dayOfWeek = weeklyFromDate.getDay()
        // 曜日は月曜からスタートにする
        dayOfWeek -= 1
        if (dayOfWeek == -1) dayOfWeek = 6
        weeklyFromDate.setDate(weeklyFromDate.getDate() - dayOfWeek)
        // 勉強時間データの取得
        let weeklyRecords = realm.objects('Record').filtered('date >= $0', weeklyFromDate).sorted('workId')
        // データがなければ空配列を返す
        return 0 === weeklyRecords.length ? [] : _getModifiedRecords(weeklyRecords)
    } 
    // 一ヶ月のデータ
    else if (SUMMARY_TYPE_MONTHLY === summaryType) {
        // 日付データをDB上の形式に沿った形に加工、一ヶ月の日付を取得
        let monthlyFromDate = _getModifiedDate(new Date())
        monthlyFromDate.setDate(monthlyFromDate.getDate() - monthlyFromDate.getDate())
        // 勉強時間データの取得
        let monthlyRecords = realm.objects('Record').filtered('date > $0', monthlyFromDate).sorted('workId')
        // データがなければ空配列を返す
        return 0 === monthlyRecords.length ? [] : _getModifiedRecords(monthlyRecords)
    }
}

/**
 * 作業名ごとに作業時間を集計したリストを返す
 * @param {} records 
 */
function _getModifiedRecords(records) {
    // 集計結果のリスト
    let result = []
    // 結果のリストにその作業が入っているかを示す
    let containsInResult = false
    for (let i=0;i<records.length;i++){
      containsInResult = false
      let workName = realm.objects('Work').filtered('id = $0', records[i].workId)[0].name
      // すでに結果のリストに作業が存在していたら時間を追加する
      for (let j=0;j<result.length;j++){
        if (workName === result[j].name) {
          result[j].seconds += records[i].seconds
          containsInResult = true
          break
        }
      }
      // 結果のリストに作業がなかったら新たに追加する
      if (!containsInResult) {
        result.push({'name': workName, 'seconds': records[i].seconds})
      }
    }
    return result
}