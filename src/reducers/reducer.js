
import { routerReducer } from 'react-router-redux'
import { combineReducers } from 'redux'
import initialState from './../store/initial-state'

import { RECEIVE_RESULTS, SET_CURRENT_QUERY } from './../actions/actions'
import { RECEIVE_BIBCODE_RESULTS, SET_CURRENT_BIBCODE } from './../actions/actions'


function currentQuery( state = initialState, action){
  switch (action.type) {
    case RECEIVE_RESULTS:
    return Object.assign(
      {}, state,
      {results : action.results}
    );

    case SET_CURRENT_QUERY:
      return Object.assign(
         {}, state,
         {
          query : action.query,
          results : {}
        });
  }
  return state
}

function currentBibcode( state = initialState, action){
  switch (action.type) {
    case RECEIVE_BIBCODE_RESULTS:
    return Object.assign({}, state.currentBibcode,
     {
        results : action.results
    });
    case SET_CURRENT_BIBCODE:
      return Object.assign({}, state.currentBibcode, {
          bibcode : action.bibcode,
          results : {}
      });
  }
  return state
}

export default combineReducers({
  currentQuery,
  currentBibcode,
  routing:routerReducer
})
