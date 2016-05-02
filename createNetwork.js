'use strict'

var _ = require('lodash');
var jsnx = require('jsnetworkx');

const bibLimit = 25;


function addOrGetNode(bibcode, data, stash ){

  let index;
  data = data || {};

  //it's already in nodes array
  stash.nodes.forEach(function(node, i){
    if (node.bibcode === bibcode ){
      index = i;
    }
  });
  if (index){
    //just augment the data and return
    let combinedNodeCategories = stash.nodes[index].node_category.concat(data.node_category);

    stash.nodes[index] = _.extend(
       stash.nodes[index],
       data,
       {node_category : combinedNodeCategories}
     );
    return index;
  }

  var obj = _.extend({
    bibcode : bibcode
  }, data);
  //not there yet, add and return new index
  index =  stash.nodes.push(obj) - 1;
  return index;
}


function addLink(data, stash){
  if (!data || !data.from || !data.to) throw new Error('need to provide from and to val');

stash.links.push({
    source : data.to,
    target : data.from,
    value : 1
  });

}

function cullNetwork (stash) {

  let g = new jsnx.DiGraph();

  let topConnectedPairs;

  g.addNodesFrom(stash.nodes.map(function(d){return d.bibcode}));
  g.addEdgesFrom(stash.links.map(function(l){return [l.source, l.target]}));

  let betweenness = jsnx.betweennessCentrality(g);

  const countBibs = {};
  //get frequency
  function augmentCount(bib) {
    if (countBibs[bib]){
      countBibs[bib]+=1;
    }
    else {
      countBibs[bib] = 1
    }
  }

  stash.links.forEach(function(l){
    augmentCount(l.source);
    augmentCount(l.target);
  });

  let typeData = {results : {}, references : {}, citations : {}};

  //stash the values onto the nodes and build the object
  _.each(betweenness._stringValues, function(v,k){

  let node =  _.findWhere(stash.nodes, {bibcode : k});
  let type;

  if (node.node_category.indexOf('result') > -1){
    type = 'results'
  }
  else if (node.node_category.indexOf('reference') > -1){
    type='references'
  }
  else if (node.node_category.indexOf('citation') > -1){
    type='citations'
  }

  typeData[type][k] = {bc : v, freq : countBibs[k] || 0};
  //stash on node
  node.betweennessCentrality = v;

  });

  function sortSecondary(obj){
    let arr = _.pairs(obj);
    return  _(arr).chain()
    .sortBy(function(l) {
    return l[1].bc;
  }).sortBy(function(l) {
        return l[1].freq;
    })
    .filter(function(l){
      return l[1].freq > 1;
    })
    .value()
    .reverse()
    .slice(0, bibLimit);
  }

  function sortResults(obj){
    let arr = _.pairs(obj);
    return  _.sortBy(arr, function(l) { return l[1].freq; })
    .filter(function(l){
      return l[1].freq > 1;
    })
    .reverse()
    .slice(0, bibLimit);
  }

  let topResults = sortResults(typeData.results);
  let topReferences = sortSecondary(typeData.references);
  let topCitations= sortSecondary(typeData.citations);

  topConnectedPairs = topResults.concat(topReferences, topCitations);
  let topBibcodes = topConnectedPairs.map(function(p){
    return p[0];
  })

 let links = stash.links.filter(function(l){
        if (topBibcodes.indexOf(l.source) > -1 && topBibcodes.indexOf(l.target) > -1 ){
          return true
        }
  });

  let nodes = stash.nodes.filter(function(node){
      if (topBibcodes.indexOf(node.bibcode) > -1) {
        return true;
      }
  });

  //replace source + target with indexes
  links.forEach(function(l){
    l.source = _.findIndex(nodes, function(n){
      return n.bibcode == l.source
    });
    l.target = _.findIndex(nodes, function(n){
      return n.bibcode == l.target
    });
  });

  stash.nodes = nodes;
  stash.links = links;

  //check for circular references
  //this is rare but d3 crashes when it tries to lay circular references out
  stash.links.forEach(function(l, index){
    if (!l) return;
    stash.links.forEach(function(l2, index2){
      if (!l2) return;
      if (l2.source === l.target && l2.target === l.source){
        //remove the second link
        //the TARGET should be the EARLIER one-- counterintuitive,
        // but citations flow backwards in time
        let node1 = stash.nodes[l.target];
        let node2 = stash.nodes[l.source];
        if (node1.pubdate < node2.pubdate){
          stash.links[index2] = undefined;
        }else {
          stash.links[index] = undefined;
        }
      }
    }, this);
  }, this);

//on the off chance that a circular reference was detected and
//a link was replaced with undefined
  stash.links = stash.links.filter(function(l){
    if (l) return true
  });

  return stash;

}

function createNetworkStructure(options){
  let results = options.results,
      references = options.references,
      citations = options.citations;

  let query = options.query;

  //reset stash
  let stash = {
    nodes: [],
    links: []
  }

  results.forEach(function(doc) {
    doc.node_category = ['result'];
    addOrGetNode(doc.bibcode, doc, stash);
  },this);

  results.forEach(function(doc) {
    doc.reference = doc.reference || [];
    doc.reference.forEach(function(r) {
      //1, result --> result
      //2, result --> reference
      //3 result --> citation
      if ( _.findWhere(stash.nodes, {bibcode: r}) ){
        //ignore for now
        addLink({
          from: doc.bibcode,
          to: r
        }, stash);

      } else if (_.findWhere(references, { bibcode: r })){

        addOrGetNode(r, _.extend(_.findWhere(references, { bibcode: r }), {
          node_category: ['reference']
        }), stash);
        addLink({
          from: doc.bibcode,
          to: r
        }, stash);

      }
      else if (_.findWhere(citations, { bibcode: r })){

        addOrGetNode(r, _.extend(_.findWhere(citations, { bibcode: r }), {
          node_category: ['citation']
        }), stash);
        addLink({
          from: doc.bibcode,
          to: r
        }, stash);

      }

    }, this);

    //do any of the citations cite this record?
    citations.forEach(function(c){
      if (c.reference && c.reference.indexOf(doc.bibcode) > -1){
        addOrGetNode(c.bibcode, _.extend(c, {
          node_category: ['citation']
        }), stash);
        addLink({
          from: c.bibcode,
          to: doc.bibcode
        }, stash);
      }
    }, this);

  }, this);

  // //only add these connections for a bibcode query
  // if (query.match(/^bibcode:.{19}\s*/)){

    //now that all base records are added, check for connections
    //between references or citations
    let secondaryNodes = stash.nodes
                .filter(function(n){return n.node_category.indexOf('result') === -1 });

    let secondaryNodeBibcodes = secondaryNodes.map(function(n){return n.bibcode});

    secondaryNodes.forEach(function(node){

        let type = node.node_category.indexOf('reference') > -1 ? 'reference' : 'citation';

        node.reference = node.reference || [];
        node.reference.forEach(function(refBib){
          if (secondaryNodeBibcodes.indexOf(refBib) < 0) return;

          //don't add a link if it's a reference to reference or citation to citation link
          let refType = _.findWhere(stash.nodes, {bibcode : refBib})
                          .node_category.indexOf('reference') > -1 ? 'reference' : 'citation';

          if ( type !== refType ){
            addLink({
              from: node.bibcode,
              to: refBib
            }, stash);
          }
        }, this);
      }, this);

  // }


  //now dedupe since some links could be added multiple times (e.g. citations)
  stash.links = _.uniq(stash.links, false, function(l) {
    return l.source + ' ' + l.target;
  });

  return cullNetwork(stash);

}

module.exports = createNetworkStructure
