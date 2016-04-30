'use strict';

import React from 'react';
import { Link } from 'react-router'

class ResultsItemComponent extends React.Component {
  render() {
    const href = 'search/?q=bibcode:' + encodeURIComponent(this.props.data.bibcode);
    return (
      <li className="results-list__item" {...this.props}>
      <h4><Link to={href}> {this.props.data.title} </Link></h4>
      </li>
    );
  }
}

ResultsItemComponent.displayName = 'ResultsItemComponent';

// Uncomment properties you need
// ResultsItemComponent.propTypes = {};
// ResultsItemComponent.defaultProps = {};

export default ResultsItemComponent;
