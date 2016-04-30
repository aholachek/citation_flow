
require('styles/App.less');


import React from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import App from './App';
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux'

import thunkMiddleware from 'redux-thunk'
import createLogger from 'redux-logger'

import { createStore, applyMiddleware } from 'redux'

import Landing from './LandingComponent'
import Results from './ResultsComponent'
import Abstract from './AbstractComponent'

import appReducer from './../reducers/reducer'

import  { startSearch } from './../actions/actions'

const loggerMiddleware = createLogger()
const historyMiddleware = routerMiddleware(browserHistory)


const store = createStore(
  appReducer,
  applyMiddleware(
   thunkMiddleware, // lets us dispatch() functions
   loggerMiddleware, // neat middleware that logs actions
   historyMiddleware
 )
)

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

history.listen(location => {
  if (location.pathname.replace(/\//g, "") !== 'search') return
  if (!location.query.q) return
    store.dispatch(startSearch(location.query.q, location.query.sort ))
});

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
       <IndexRoute component={Landing}></IndexRoute>
        <Route path="search" component={Results}/>
        <Route path="abstract/:bibcode" component={Abstract}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)
