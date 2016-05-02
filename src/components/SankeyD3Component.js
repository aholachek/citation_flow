'use strict';
require('styles//SankeyD3.less');

import React from 'react'
import ReactDOM from 'react-dom'
import d3 from 'd3'
import colorMap from './../helpers/colormap'
import './../helpers/d3-sankey-override'



class SankeyD3Component extends React.Component {

  render() {
  return <svg className = 'sankey-svg' >svg < /svg>
}

  renderGraph(props) {
    //props are supplied only on update

    let showAllConnections = props ? props.showAllConnections : this.props.showAllConnections;
    let data = props ? props.data : this.props.data;
    let xArrange = props ? props.xArrange : this.props.xArrange;

    let filteredLinks;

    if (showAllConnections === false){
      //remove those links
      filteredLinks = data.links.filter(function(l){
        let source = data.nodes[l.source];
        let target = data.nodes[l.target];
        if (
            (
            source.node_category.indexOf('reference') > -1
            && source.node_category.indexOf('result') === -1
            && target.node_category.indexOf('result') > -1
          )
            ||
            (
              source.node_category.indexOf('result') > -1
              && target.node_category.indexOf('result') === -1
              && target.node_category.indexOf('reference') === -1
              && target.node_category.indexOf('citation') > -1
            )
        ){
          return true;
        }
      });
    }
    else {
      filteredLinks = data.links;
    }

     const height = this.props.height || 900;
     const width = this.props.width || 1100;
     const that = this;

    let svg = d3.select(ReactDOM.findDOMNode(this))
      .attr('width', width)
      .attr('height', height);

    //graph has not been initialized
    if (!svg.select('g')[0][0]) {
      svg = svg.append('g')
        .attr('transform', 'translate(' + 50 + ',' + 0 + ')');

      //initialize links and node groups
      svg.append('g').classed('link-container', true);
      svg.append('g').classed('node-container', true);

      _.forEach(colorMap, function(v1,k1){
        _.forEach(colorMap, function(v2,k2){

          //append a gradient
          var gradient = svg.append('defs')
            .append('linearGradient')
              .attr('id', k1 + '-to-' + k2)
              .attr('x1', '0%')
              .attr('y1', '0%')
              .attr('x2', '100%')
              .attr('y2', '0%')
              .attr('spreadMethod', 'pad')
              .attr('gradientUnits', 'userSpaceOnUse');

          gradient.append('stop')
              .attr('offset', '0%')
              .attr('stop-color', v1 )
              .attr('stop-opacity', 1);

          gradient.append('stop')
              .attr('offset', '100%')
              .attr('stop-color', v2)
              .attr('stop-opacity', 1);

        });

      });

    }

    function chooseColor(categoryList) {
      if (categoryList.indexOf('result') > -1) return colorMap.result;
      else if (categoryList.indexOf('reference') > -1) return colorMap.reference;
      else if (categoryList.indexOf('citation') > -1) return colorMap.citation;
    }

    function chooseName (categoryList){
      if (categoryList.indexOf('result') > -1) return 'result';
      else if (categoryList.indexOf('reference') > -1) return 'reference';
      else if (categoryList.indexOf('citation') > -1) return 'citation';
    }

    let sankey = d3.sankey()
      .nodeWidth(8)
      .nodePadding(5)
      //extra space for labels
      .size([width - 150, height - 150])
      .nodes(_.cloneDeep(data.nodes))
      .links(_.cloneDeep(filteredLinks))
      .layout(80, {
        xPos: xArrange,
        width: width
      });

      let link = svg.select('.link-container');
      let node = svg.select('.node-container');

      let nodeSelection = node.selectAll('.node')
        .data(sankey.nodes().filter(function(n) {
          if (n.sourceLinks.length || n.targetLinks.length) return true;
          return false;
        }), function(d) {
          return d.bibcode
        });

      let linkSelection = link.selectAll('.link')
      .data(sankey.links(), function(d) {
        return d.source.bibcode + d.target.bibcode
      });

      endAllAnimations();

    linkSelection
      .enter()
      .append('path')
      .attr('class', 'link')
      .style('stroke', function(d){
        let source = chooseName(d.source.node_category);
        let target = chooseName(d.target.node_category);
        return 'url(#' + source + '-to-' + target + ')';
      })
      .append('title')
      .text(function(d) {
        if (d.circular) {
          return d.target.bibcode + ' cited ' + d.source.bibcode +
            '  &  ' + d.source.bibcode + ' cited ' + d.target.bibcode
        }
        return d.target.bibcode + ' cited ' + d.source.bibcode
      });

    linkSelection
      .sort(function(a, b) {
        return b.dy - a.dy;
      })
      .classed('time-arrange', function(){return xArrange === 'time'})
      .style('stroke-width', function(d) {
        return Math.max(1, d.dy);
      })
      .transition()
      .attr('d', sankey.link());

      nodeSelection
      .select('rect')
      .attr('height', function(d) {
             return d.dy;
       })
      .transition()
       .style('fill', function(d) {
         return chooseColor(d.node_category);
       });

       nodeSelection
       .transition()
       .attr('transform', function(d) {
         return 'translate(' + d.x + ',' + d.y + ')';
       });

    nodeSelection.exit().remove();
    linkSelection.exit().remove();

    // CODE FOR LINE ANIMATIONS
    function startAnimation(node){

       let d = node.__data__;

        d3.select(node).classed('focused-primary', true);

        let focusedNodeData = _.pluck(d.sourceLinks, 'target').concat(_.pluck(d.targetLinks, 'source'));
        focusedNodeData.push(d);

        let otherNodes = svg.selectAll('.node').filter(function(n) {
          if (focusedNodeData.indexOf(n) > -1) return false;
          return true;
        });

        let focusedNodes = svg.selectAll('.node').filter(function(n) {
        if (focusedNodeData.indexOf(n) > -1) return  true;
        }).classed('focused', true);

        otherNodes.style('opacity', .05);

        let otherLinks = svg.selectAll('.link')
          .filter(function(l) {
            if (!l) return true;
            if (d.targetLinks.indexOf(l) > -1 || d.sourceLinks.indexOf(l) > -1) return false;
            //also preserve interconnections
            // if (focusedNodeData.indexOf(l.source) > -1 && focusedNodeData.indexOf(l.target) > -1) return false;
            return true;
          });

        otherLinks.classed("link-deemphasize", true)

      let focusedLinks =  svg.selectAll('.link')
        .filter(function(l) {
          if (d.targetLinks.indexOf(l) > -1 || d.sourceLinks.indexOf(l) > -1) return true;
        });

       let interval = 400;
       //should there be a next loop?
       if (that.props.autoplay && !that.unmounted){
         let index;
         nodeSelection.each(function(n, i){ if (d === n) index = i });
         index = index < nodeSelection[0].length -1 ? index+=1 : 0;
         setTimeout(function(){
           endAllAnimations();
           setTimeout(function(){
             startAnimation(nodeSelection[0][index]);
           }, interval * 2)
        }, interval * focusedLinks[0].length + interval * 2)
       }

      focusedLinks.each(function(l, i){
        let d3this = d3.select(this);
        var totalLength = d3this.node().getTotalLength();

      d3this
         .style('stroke-opacity', .3)
         .attr('stroke-dasharray', totalLength + ' ' + totalLength)
         .attr('stroke-dashoffset', totalLength)
         .transition()
         .delay(i * interval)
         .duration(interval)
         .ease('linear')
         .attr('stroke-dashoffset', 0)
         .each('start', function(){
          //  let nodeHighlight =  (l.source.bibcode === d.bibcode) ? l.target : l.source;
          //  nodeHighlight = focusedNodes.filter(function(d){return d.bibcode == nodeHighlight.bibcode});
          //  nodeHighlight.classed('focused', true);
         });

       });
    }

    function endAllAnimations(){
      nodeSelection
      .style('opacity', null)
      .classed('focused', false)
      .classed('focused-primary', false);
      //cancel animation
      linkSelection.transition();

      linkSelection.classed("link-deemphasize", false)
      .style('stroke-opacity', null)
      .attr('stroke-dashoffset', 0)
      .attr('stroke-dasharray', null)
    }

    let enteredNodes = nodeSelection
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });


    enteredNodes.append('rect')
      .attr('width', sankey.nodeWidth())
      .attr('height', function(d) {
             return d.dy;
           })
       .style('fill', function(d) {
         return chooseColor(d.node_category);
       });

    enteredNodes.append('text')
      .attr('x', -6)
      .attr('y', function(d) {
        return d.dy / 2 - 10;
      })
      .attr('dy', '.35em')
      .attr('text-anchor', function(d){
        if (d.x < width/5 ) return 'start';
        else if (d.x > width/5 * 4) return 'end';
        else return 'middle';
      })
      .each(function(d) {
        let t = d.bibcode.slice(0, 9);
        t = t.replace(/\./g, '');
        t = d.title ? d.title[0] : t;
        t = t.split(/\s+/);
        let counter = 0;
        while (true) {
          counter++;
          let text = t.splice(0, 6).join(' ');
          if (counter > 1 && t.length) text += '...'
          d3.select(this).append('tspan')
            .text(text)
            .attr('x', '0')
            .attr('dy', '11px');
          if (!t.length) return
          if (counter > 1) return
        }
      });

      if (that.props.autoplay){
        setTimeout(function(){
          startAnimation(nodeSelection[0][0])
        }, 2000)
      }

    //finally, apply fresh event listeners
    nodeSelection.on('click', function(d) {
      that.props.updateHistory('/search/?q=bibcode:' + encodeURIComponent(d.bibcode));
    })
    .on('mouseenter', function() {
      if (!that.props.autoplay) startAnimation(this);
    })
    .on('mouseleave', function(d) {
      if (!that.props.autoplay) endAllAnimations();
    });

  }

  componentWillUnmount (){
    this.unmounted = true;
    d3.select(ReactDOM.findDOMNode(this)).selectAll("*").remove();
  }

  componentDidMount() {
    if (this.props.data && this.props.data.nodes){
      this.renderGraph();
      }
    }

    //prevent react from destroying our svg and its contents by returning false!
    shouldComponentUpdate(props, state) {
      if (props.data && props.data.nodes){
        this.renderGraph(props);
      }
      return false
    }

  }


SankeyD3Component.displayName = 'SankeyD3Component';

// Uncomment properties you need
// SankeyD3Component.propTypes = {};
// SankeyD3Component.defaultProps = {};

export default SankeyD3Component;
