'use strict';
require('styles//Sankey.less');


import React from 'react'
import _ from 'lodash'
import SankeyD3Component from './SankeyD3Component'
import colorMap from './../helpers/colormap';

class SankeyComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      xArrange : 'default',
      focusedPaper : {}
    }

  }

  render() {

    let focusDetails;

    let key = _.pairs(colorMap).map(function(c){
      return <li style={{display : 'inline'}}>
        <div style={{backgroundColor : c[1], width: '10px', height : '10px', display : 'inline-block', opacity : .6}}/>
         &nbsp;{c[0]}&nbsp;&nbsp;</li>
    });

    if (!this.props.network ){
            //  return <div className="ui active loader"></div>
          }
    let errorMessage = <div/>;
    if ( this.props.network && this.props.network.nodes.length <=1 ) {
      errorMessage = (<div>
        No network could be generated, try going back
        to your previous query or starting a new one.
      </div>)
    }

    return (
      <div className='sankey-component' style={{maxWidth: '1100px', margin: 'auto'}}>

            <div className='ui grid paper-details'>

              <div className="five wide column">
                <ul style={{listStyle : 'none', margin : '0'}}>{key}</ul>
              </div>

            <div className='five wide column'>
              <div>mouse over a paper node to view node titles</div>
              <div>click on a paper node to redraw the graph.</div>
              <div>
              </div>
            </div>
            <div className='six wide column'>
              <label>
                <input
                  type='radio'
                  onClick={function(){this.setState({xArrange : 'default'})}.bind(this)}
                  checked={this.state.xArrange === 'default' ? true : false}
                  />
                &nbsp;maximize legibility
              </label>
              <br/>
              <label>
                 <input
                   type='radio'
                   onClick={function(){this.setState({xArrange : 'time'})}.bind(this)}
                   checked={this.state.xArrange === 'time' ? true : false}
                   />
                 &nbsp;arrange by year of publication
              </label>
            </div>
          </div>
        <div className='svg-container'>
          {errorMessage}
          <SankeyD3Component
            xArrange={this.state.xArrange}
            data={this.props.network}
            updateHistory={this.props.updateHistory}
            />
        </div>
      </div>
    );
  }


}


SankeyComponent.displaybibcode = 'SankeyComponent';

// Uncomment properties you need
// SankeyComponent.propTypes = {};
// SankeyComponent.defaultProps = {};

export default SankeyComponent;
