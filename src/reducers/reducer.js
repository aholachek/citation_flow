
import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import initialState from './../store/initial-state'

import {
         RECEIVE_RESULTS,
         SET_CURRENT_QUERY,
   } from './../actions/actions'

function currentQuery( state = initialState.currentQuery, action){
  switch (action.type) {
    case RECEIVE_RESULTS:
    return Object.assign(
      {}, state,
      {
        results : action.results,
        references: action.references,
        citations : action.citations,
        network : action.network
      }
    );

    case SET_CURRENT_QUERY:
      return Object.assign(
         {}, state,
         {
          query : action.query,
          sort : action.sort,
          results : undefined,
          citations : undefined,
          references :undefined,
          network: undefined
        });
  }
  return state
}


export default combineReducers({
  currentQuery,
  routing:routerReducer
})
