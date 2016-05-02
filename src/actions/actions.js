
import qwest from 'qwest';

let searchEndpoint = '/build-network';
//comment out this line when running dist
// searchEndpoint = 'http://localhost:4000/build-network';

//action creators

export const RECEIVE_RESULTS  = 'RECEIVE_RESULTS';

export function receiveResults(data){
  return {
    type : RECEIVE_RESULTS,
    results : data.results,
    citations : data.citations,
    references : data.references,
    network : data.network
  }
}

export const SET_CURRENT_QUERY = 'SET_CURRENT_QUERY';

export function setCurrentQuery(query, sort){
  return {
    type : SET_CURRENT_QUERY,
    query : query,
    sort : sort ? sort : 'citation_count desc'
  }
}


export function startSearch(query, sort){

  return function(dispatch, getState){

    if (getState().currentQuery.query === query &&
     Object.keys(getState().currentQuery.results).length &&
     getState().currentQuery.sort === sort
    ){
      //data's already cached
      return;
    }

    dispatch(setCurrentQuery(query, sort));

    qwest.get(searchEndpoint, {
      q: query,
      sort:sort,
      //otherwise it adds a cache-control heading
      cache: true
    })
    .then(function(xhr, response){
      let results = response.nodes.filter(function(d){return d.node_category.indexOf('result') > -1});
      let references = response.nodes.filter(function(d){return d.node_category.indexOf('reference') > -1});
      references = _.without(references, results);
      let citations = response.nodes.filter(function(d){return d.node_category.indexOf('citation') > -1});
      citations = _.without(citations, references, results);
      //just the array
      dispatch(receiveResults({
        results : results,
        references : references,
        citations : citations,
        network : response
      }));
    })
    .catch(function(err, xhr){
      debugger
    })

  }
}
