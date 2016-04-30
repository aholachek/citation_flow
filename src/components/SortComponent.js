'use strict';

import React from 'react'
import _ from 'lodash'

class SortComponent extends React.Component {

  handleChange (e) {
    this.props.setSort(e.target.value);
  }

  render() {

    let items = [];

    let sortOptions = {
        'publication date' : 'date',
        'citation' : 'citation_count',
        'read count' : 'read_count',
        'relevancy' : 'classic_factor'
      };

    _.each(sortOptions, function(v,k){
      items.push({
        name : k + ' desc',
        value : v + ' desc'
      });
      items.push({
        name : k + ' asc',
        value : v + ' asc'
      });
    });

    items = items.map(function(item){
        return (
          <option value={item.value}>
              {item.name}
          </option>
        )
      }, this);

    _.sortBy(items, function(item){
      if (item.value === this.props.sort){
        return 0
      }
      else {
        return 1;
      }
    }, this)

    return (
      <div style={{ marginRight: '10px'}}>

          <select style={{height: '44px'}}
            className="ui dropdown"
            onChange={this.handleChange.bind(this)}
            value={this.props.sort}>
              {items}
           </select>
       </div>
    );
  }
}

SortComponent.displayName = 'SortComponent';

// Uncomment properties you need
// SortComponent.propTypes = {};
// SortComponent.defaultProps = {};

export default SortComponent;
