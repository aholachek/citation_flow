'use strict';

import React from 'react';
import SankeyD3Component from './SankeyD3Component'
import sampleNetwork from './../helpers/sampleNetwork.js'
import colorMap from './../helpers/colorMap'

class LandingComponent extends React.Component {

  render() {

    let key = _.pairs(colorMap).map(function(c){
      return <li style={{display : 'inline'}}>
        <div style={{backgroundColor : c[1], width: '10px', height : '10px', display : 'inline-block', opacity: .6}}/>
         &nbsp;{c[0]}&nbsp;&nbsp;</li>
    });

    return (
      <div className="landing-component">
        <div style={{width: '600px', margin : '60px auto'}}>
          <p>
            This tool shows <b>relationships between papers</b> in your search results set, including <b>papers that could
            not have been returned by your query term</b> but which are <b>referenced (pink) or cited (blue) heavily</b> by your search result set.
          </p>
          <p>
            The results are then visualized in an interactive flow diagram. An auto-filtering list of your results is also provided.
          </p>
          <p>
            Make a search above to get started.
          </p>
        </div>
        <div style={{marginLeft: '10%'}}>
          <h3 style={{marginBottom: '30px'}}>Example Flow Diagram</h3>
          <ul>{key}</ul>
          <SankeyD3Component width={1060} height={250} data={sampleNetwork} autoplay={true}/>
        </div>
      </div>
    );
  }
}

LandingComponent.displayName = 'LandingComponent';

// Uncomment properties you need
// LandingComponent.propTypes = {};
// LandingComponent.defaultProps = {};

export default LandingComponent;
