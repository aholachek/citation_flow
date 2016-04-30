
import React from 'react'
import ResultsItemComponent from './ResultsItemComponent'
import colorMap from './../helpers/colormap'
import { Link, browserHistory } from 'react-router'
import SankeyComponent from './SankeyComponent'
import AbstractComponent from './AbstractComponent'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'


class ResultsComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
       active: 'chart',
       mouseOverPaper : undefined
     };
  }

  setTab(arg){
    this.setState({ active : arg });
    console.log(this.state)
  }

  renderList(listName) {

    if (!this.props[listName]) return <div/>;

    return this.props[listName]
    .filter(function(d){
      if (!this.state.mouseOverPaper) return true;
      let mouseOverData = _.findWhere(this.props.network.nodes, {bibcode : this.state.mouseOverPaper.bibcode});
      mouseOverData.reference = mouseOverData.reference || [];

      switch(this.state.mouseOverPaper.type){
        case 'references':
            if (listName === 'references') return true;
            d.reference = d.reference || [];
            return d.reference.indexOf(mouseOverData.bibcode) > -1
        break;
        case 'citations':
          if (listName === 'citations') return true;
          return mouseOverData.reference.indexOf(d.bibcode) > -1
        break;
        case 'results':
          if (listName === 'references'){
            return mouseOverData.reference.indexOf(d.bibcode) > -1
          }
          else if (listName === 'results'){
            return true;
          }
          else if (listName === 'citations'){
            d.reference = d.reference || [];
            return d.reference.indexOf(mouseOverData.bibcode) > -1
          }
        break;

      }

      if (listName=== 'references'){
        return mouseOverData.reference.indexOf(d.bibcode) > -1
      }
      else if (listName=== 'citations'){
        return d.reference.indexOf(mouseOverData.bibcode) > -1
      }
      else if (listName === 'results'){
        if (this.state.mouseOverPaper.type === 'results') return true;
        else if (this.state.mouseOverPaper.type === 'references'){
          return d.reference.indexOf(mouseOverData.bibcode) > -1
        }
        else if (this.state.mouseOverPaper.type === 'citations'){
         return d.reference.indexOf(mouseOverData.bibcode) > -1
        }
      }
    }, this)
    .map(function(d){

        const mouseEnter = function(){
          this.setState({mouseOverPaper : {
            bibcode : d.bibcode, type : listName}
          })
      }.bind(this);

      const mouseLeave = function(){
        this.setState({mouseOverPaper : null})
    }.bind(this);

      return <ResultsItemComponent
        data={d}
        key={d.bibcode}
        onMouseEnter={mouseEnter}
        onMouseLeave={mouseLeave}/>
  }, this);

  }

  render() {

    let listView;

    if (!this.props.results){
      return (<div className="ui loader active"></div>)
    }
    else {
      listView = (
        <div className="ui grid">
          <div className='five wide column'>
          <h3 className='results-list__header' style={{color : colorMap.reference}}>
          Common References</h3>
        <ol>
          {this.renderList('references')}
        </ol>
      </div>
      <div className='five wide column'>
        <h3 className='results-list__header' style={{color : colorMap.result}}>
          Results</h3>
        <ol>
          {this.renderList('results')}
        </ol>
      </div>
      <div className='five wide column'>
        <h3 className='results-list__header' style={{color: colorMap.citation}}>
          Common Citations</h3>
        <ol>
          {this.renderList('citations')}
        </ol>
      </div>
    </div>
      )
    }

    return (
    <div>
      <div className='ui pointing secondary menu' style={{margin:'1rem auto', width: '340px'}}>
          <a className={this.state.active === 'resultsList' ? 'active item' : 'item' }
             onClick={this.setTab.bind(this, 'resultsList')}
            ><h2><i className='icon ordered list'> </i>List View </h2></a>
          <a className={this.state.active === 'chart' ? 'active item' : 'item' }
             onClick={this.setTab.bind(this, 'chart')}
            ><h2><i className='icon area chart'></i> Flow View</h2></a>
        </div>

        <div className={this.state.active === 'resultsList' ? 'ui tab active' : 'ui tab' } >
          <div className='ui grid results-list__container' style={{paddingLeft: '2%'}}>
            <p style={{textAlign : 'center', width: '100%'}}>mouse over a column to automatically filter</p>
              {listView}
            </div>
      </div>

        <div className={this.state.active === 'chart' ? 'ui tab active' : 'ui tab' }>
          <AbstractComponent query={this.props.query} results={this.props.results}/>
          <SankeyComponent network={this.props.network}
                           query={this.props.query}
                           updateHistory={function(path){
                             this.props.historyPush(path)}.bind(this)}
           />
        </div>

      </div>
    )

  }
}


ResultsComponent.displayName = 'ResultsComponent';

// Uncomment properties you need
// ResultsComponent.propTypes = {};
// ResultsComponent.defaultProps = {};
const mapStateToProps = function(state) {
  return {
    results : state.currentQuery.results,
    citations : state.currentQuery.citations,
    references : state.currentQuery.references,
    query : state.currentQuery.query,
    network : state.currentQuery.network
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    historyPush: (path) => {
      dispatch(push(path));
    }
  }
}

const ResultsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(ResultsComponent)


export default ResultsContainer;
