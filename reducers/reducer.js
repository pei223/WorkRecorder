import { combineReducers } from 'redux'
import { workState } from './works'
import { recordState } from './records'

export const reducers = combineReducers({
    workState,
    recordState,
})