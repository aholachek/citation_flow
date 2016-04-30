'use strict'

var express = require('express');
var Promise = require('bluebird');
var request = require('request');
Promise.promisifyAll(request);

var createNetworkStructure = require('./createNetwork');

var endpoint = 'https://api.adsabs.harvard.edu/v1/search/query';
var ADS_KEY = process.env.ADS_KEY ? process.env.ADS_KEY : require('./ads-dev-key');

var auth = 'Bearer:gAXahb46vayEAL32jnxIkHUlKQwvXKd9mHCINwS6';

const rowLimit = 50;
// totalSecondaryLimit * rowLimit = total rows requested
const totalSecondaryLimit = 4;

function fetchSecondary(field) {

  return function(query, originalQuery) {

    let counter = 0;
    let limit = totalSecondaryLimit;
    let allSecondary = [];
    let promiseResolve;
    let promiseToReturn = new Promise(function(resolve){
      promiseResolve = resolve;
    });

    function fetchData() {

      let start = counter * rowLimit;

      let q = field + '(' + query + ') -' + originalQuery;

      return request.getAsync({
          uri: endpoint,
          qs: {
            q: q,
            fl: 'title,abstract,bibcode,author,keyword,id,' +
              'links_data,property,citation_count,[citations],pub,aff,' +
              'email,volume,pubdate,doi' +
              'citations,reference',
            rows: rowLimit,
            start: start,
            sort: 'citation_count desc',
          },
          headers: {
            Authorization : auth
          }
        })
        .then(function(resp) {
          counter += 1;
          let parsedResponse = JSON.parse(resp.body);
          allSecondary = allSecondary.concat(parsedResponse.response.docs);
          if (counter < limit && allSecondary.length < parsedResponse.response.numFound) {
            fetchData(counter);
          } else {
            promiseResolve(allSecondary)
          }
        })
        .catch(function(error) {
          console.log(error)
        });

      fetchData(counter);

    }

    fetchData();

    return promiseToReturn;

  }
}

function getCitations(query, originalQuery) {
  return fetchSecondary('citations')(query, originalQuery);
}

function getReferences(query, originalQuery) {
  return fetchSecondary('references')(query, originalQuery);
}

function fetchNetwork(req, res) {

  request.getAsync({
      uri: endpoint,
      qs: {
        q: req.query.q,
        fl: 'title,abstract,bibcode,author,keyword,id,' +
          'links_data,property,citation_count,[citations],pub,aff,' +
          'email,volume,pubdate,doi,citations,reference',
        rows: rowLimit,
        sort: req.query.sort || 'citation_count desc'
      },
      headers: {
        Authorization : auth
      }
    })
    .then(function(response) {

      let results = JSON.parse(response.body).response.docs;
      let query = results
        .map(function(d) {
          return d.bibcode
        })
        .join(' OR ');
      query = 'bibcode:(' + query + ')';

      Promise.all([getCitations(query, req.query.q), getReferences(query, req.query.q)])
        .then(function(response) {
          let network = createNetworkStructure({
            results: results,
            citations: response[0],
            references: response[1],
            query : req.query.q
          });
          res.json(network);
        })

    }).catch(function(error) {
      res.status(500).send(error)
    });

};

module.exports = fetchNetwork;
