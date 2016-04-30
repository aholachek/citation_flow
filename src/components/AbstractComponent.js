'use strict';

import React from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

class AbstractComponent extends React.Component {
  render() {
    //only render if current query is bibcode
    const m = this.props.query.match(/bibcode:(.{19})/);
    if (!m){
      return <div/>
    }
    const bibcode = m[1];
    const data = _.findWhere(this.props.results, { bibcode : bibcode});
    if (!data) return <div/>
    return (
      <div className='abstract-component' style={{width: "90%", maxWidth: "900px", margin:'auto'}}>
        <a href={'http://ui.adsabs.harvard.edu/#abs/' + bibcode } target='_blank'><h2>{data.title}</h2></a>
        <div>
          <b>{data.pubdate}</b>
        </div>
        <div>
          {data.author.map(function(a){return<span>{a};&nbsp;</span>})}
        </div>
        <p>{data.abstract}</p>
        <div className='ui divider'></div>

      </div>
    );
  }
}

AbstractComponent.displayName = 'AbstractComponent';

// Uncomment properties you need
// AbstractComponent.propTypes = {};
// AbstractComponent.defaultProps = {};


const mapStateToProps = function(state) {
  return {
  data : state.currentQuery.results
  }
}

const AbstractContainer = connect(
  mapStateToProps
)(AbstractComponent)


export default AbstractContainer;
