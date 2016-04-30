'use strict';

import React from 'react';
import { connect } from 'react-redux'
import { startSearch } from './../actions/actions'
import { push } from 'react-router-redux'
import SortComponent from './SortComponent'


class SearchComponent extends React.Component {

  constructor(props) {
    super(props);
    //computed values, this is messy, but don't want to use state
    this.state = {
      query : null,
      sort : null
    }
  }

  search(e) {
    e.preventDefault();
    let sort = this.state.sort || this.props.sort;
    this.props.onSubmit(this.state.query || this.props.query, sort);
    this.setState({ query : null});
  }

  setSort(val){
    this.setState({sort : val})
  }

  render() {

    return (
      <div className="search-component ui centered grid" style={{marginTop: '20px'}}>
        <div className="eight wide column">
          <form className="ui fluid input" onSubmit={this.search.bind(this)} >
                <input type="text"
                       placeholder='author:"huchra, john"'
                       ref={(ref) => this.searchInput = ref}
                       value={this.state.query ? this.state.query : this.props.query}
                       onChange={function(event){this.setState({query : event.target.value})}.bind(this)}
                       style={{marginRight: '10px'}}
                       />
                     <SortComponent sort={this.state.sort || this.props.sort}
                                    setSort={this.setSort.bind(this)}
                                    />
                <button className="ui purple button">
                  <i className="search icon"></i>
                </button>
              </form>
        </div>

      </div>
    );
  }
}

SearchComponent.displayName = 'SearchComponent';

// Uncomment properties you need
// SearchComponent.propTypes = {};
// SearchComponent.defaultProps = {};

const mapStateToProps = (state) => {
  return {
  query : state.currentQuery.query,
  sort : state.currentQuery.sort
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onSubmit: (query, sort) => {
      //this will only be passed if someone actively changed it in the sort widget
      var url = '/search?q=' + encodeURI(query) + '&sort=' + encodeURI(sort);
      dispatch(push(url));
    }
  }
}

const SearchContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchComponent)


export default SearchContainer;
