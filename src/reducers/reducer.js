
import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import initialState from './../store/initial-state'

function currentQuery( state = initialState, action){
  return state
}

function currentBibcode( state = initialState, action){
  return state
}

export default combineReducers({
  currentQuery,
  currentBibcode,
  routing:routerReducer
})
