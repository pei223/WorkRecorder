const Realm = require('realm')
import {
    CREATE_WORK,
    UPDATE_WORK,
    DELETE_WORK,
    FETCH_WORKS,
    ERR_ALREADY_EXIST,
    MEASURE_WORK,
    DONE_MEASURE_WORK,
    RECEIVE_WORK_DELETED, 
    NOT_MEASURING_ID,
    ERR_MEASURING_WORK,
} from '../actions/works'
import { DB_SCHEMA } from '../DB'

realm = new Realm(DB_SCHEMA)


export const workState = (state = {}, action) => {
    console.log(action)
    switch(action.type) {						
        case CREATE_WORK:
            // nameの重複チェック
            if (0 < realm.objects('Work').filtered('name = $0', action.name).length) {
                return Object.assign({}, state, {err: ERR_ALREADY_EXIST})
            }
            let maxId = realm.objects('Work').max('id')
            // データが存在しないならIDを0にする
            if (undefined === maxId || null === maxId) {
                maxId = 0
            }
            maxId++
            realm.write(() => {
                realm.create('Work',
                {
                  id: maxId,
                  name: action.name
                })
            })
            return Object.assign({}, state, {works: _fetchWorks(), err: undefined})

        case UPDATE_WORK:
            // 計測中の作業ならエラーを返す
            if (action.id === state.measuringId) {
                return Object.assign({}, state, {err: ERR_MEASURING_WORK})
            }
            realm.write(() => {
                realm.create('Work',
                {
                    id: action.id,
                    name: action.name
                }, true)
            })
            return Object.assign({}, state, {works: _fetchWorks()})

        case DELETE_WORK:
            // 計測中の作業ならエラーを返す
            if (action.id === state.measuringId) {
                return Object.assign({}, state, {err: ERR_MEASURING_WORK})
            }
            realm.write(() => {
                // 作業とその作業の勉強時間データを削除する
                realm.delete(realm.objects('Work').filtered('id = $0', action.id))
            })
            return Object.assign({}, state, {works: _fetchWorks(), isDeleted: true})

        case FETCH_WORKS:
            return Object.assign({}, state, {works: _fetchWorks()})

        // 作業計測開始
        case MEASURE_WORK:
            return Object.assign({}, state, {measuringId: action.workId})
        // 作業計測終了
        case DONE_MEASURE_WORK:
            return Object.assign({}, state, {measuringId: NOT_MEASURING_ID})
        
        // 作業データが削除されたことを認識する
        case RECEIVE_WORK_DELETED:
            return Object.assign({}, state, {isDeleted: false})

        default:
            return state;
    }
}

function _fetchWorks () {
    return realm.objects('Work').sorted('id')
}