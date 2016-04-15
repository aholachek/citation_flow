
import React from 'react';
import ReactDOM from 'react-dom';
import App from './Main';
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory, IndexRoute } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'

import Landing from './LandingComponent'
import Results from './ResultsComponent'
import Abstract from './AbstractComponent'


import appReducer from './../reducers/reducer';

// Add the reducer to your store on the `routing` key
const store = createStore(
  appReducer
)

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
       <IndexRoute component={Landing}></IndexRoute>
        <Route path="search" component={Results}/>
        <Route path="abstract" component={Abstract}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
)
