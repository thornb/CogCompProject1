/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var util = require('util');
var requestFactory = require('../lib/requestwrapper');
var BaseService = require('../lib/base_service');
var pick = require('object.pick');

/**
 *
 * @param options
 * @constructor
 */
function DiscoveryV1Experimental(options) {
  BaseService.call(this, options);

  // Check if 'version_date' was provided
  if (typeof this._options.version_date === 'undefined') {
    throw new Error('Argument error: version_date was not specified, use 2016-11-07');
  }
  this._options.qs.version = options.version_date;
}

util.inherits(DiscoveryV1Experimental, BaseService);
DiscoveryV1Experimental.prototype.name = 'discovery';
DiscoveryV1Experimental.prototype.version = 'v1-experimental';
DiscoveryV1Experimental.URL = 'https://gateway.watsonplatform.net/discovery-experimental/api';

/**
 * Return the list of environments
 */
DiscoveryV1Experimental.prototype.getEnvironments = function(params, callback) {
  params = params || {};

  var parameters = {
    options: {
      url: '/v1/environments',
      method: 'GET',
      json: true,
      qs: pick(params, ['name'])
    },
    defaultOptions: this._options
  };
  return requestFactory(parameters, callback);
};

/**
 * Return the list of collections
 */
DiscoveryV1Experimental.prototype.getCollections = function(params, callback) {
  params = params || {};

  var parameters = {
    options: {
      url: '/v1/environments/{environment_id}/collections',
      method: 'GET',
      json: true,
      path: pick(params, ['environment_id']),
      qs: pick(params, ['version'])
      //body: pick(params, ['file'])
    },
    defaultOptions: this._options
  };
  return requestFactory(parameters, callback);
};

/**
 * Queries the Discovery Service
 */
DiscoveryV1Experimental.prototype.query = function(params, callback) {
  params = params || {};

  var queries = [];

  if(params["query"] !== null && typeof params["query"] !== 'undefined') {
    queries.push("query");
  }

  if(params["filter"] !== null && typeof params["filter"] !== 'undefined') {
    queries.push("filter");
  }

  if(params["aggregation"] !== null && typeof params["aggregation"] !== 'undefined') {
    queries.push("aggregation");
  }

  if(params["count"] !== null && typeof params["count"] !== 'undefined') {
    queries.push("count");
  }

  if(params["offset"] !== null && typeof params["offset"] !== 'undefined') {
    queries.push("offset");
  }

  if(params["return"] !== null && typeof params["return"] !== 'undefined') {
    queries.push("return");
  }

  var parameters = {
    options: {
      url: '/v1/environments/{environment_id}/collections/{collection_id}/query',
      method: 'GET',
      json: true,
      path: pick(params, ['environment_id', 'collection_id']),
      qs: pick(params, queries)
    },
    defaultOptions: this._options
  };
  return requestFactory(parameters, callback);
};

module.exports = DiscoveryV1Experimental;