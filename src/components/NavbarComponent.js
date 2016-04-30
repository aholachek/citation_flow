'use strict';

import React from 'react'
import colorMap from './../helpers/colormap'
import {Link} from 'react-router'

class NavbarComponent extends React.Component {
  render() {
    return (
      <div className="ui inverted menu">
        <Link to="/">
          <div className="logo">
            <i style={{color : colorMap.reference}} className="big icon file text outline"></i>
            <i className="icon angle left big" style={{color: 'lightgray'}}></i>
            <i style={{color : colorMap.result}} className="big icon file text outline"></i>
              <i className="icon angle left big" style={{color: 'lightgray'}}></i>
            <i style={{color : colorMap.citation}} className="big icon file text outline"></i>
          </div>
          <h1 className="header-link">Citation Flow</h1>
        </Link>

      </div>
    );
  }
}

NavbarComponent.displayName = 'NavbarComponent';

// Uncomment properties you need
// NavbarComponent.propTypes = {};
// NavbarComponent.defaultProps = {};

export default NavbarComponent;
