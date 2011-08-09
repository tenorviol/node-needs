/*
 * Copyright (C) 2011 by Christopher Johnson
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var http = require('http'),
    _url = require('url'),
    querystring = require('querystring');

// ### net.request(url, options, callback)
//
//      url : 'http://www.google.com/search?q=foo'
//      options : {
//        url : 'http://www.google.com/search',
//        data : { q:'foo' },
//        method : 'GET'
//      }
//      callback : function (err, response)
//
//  At least one of `url` or `options` is required.
//  A successful `callback` response will have the following format:
//
//      response : {
//        statusCode : 200,
//        headers : {},
//        body : '',
//        trailers : {}
//      }
//
var request = exports.request = function (url, options, callback) {
  if (typeof url === 'object') {
    callback = options;
    options = url;
    url = options.url;
  } else if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  // convert url into an http request
  var parse = _url.parse(url);
  var params = {
    host   : parse.hostname,
    port   : parse.port || 80,
    method : options.method ? options.method.toUpperCase() : 'GET',
    path   : parse.pathname
  };
  
  // append the querystring to the url for get requests
  if (params.method === 'GET' && options.data) {
    var query = querystring.stringify(options.data);
    if (query) {
      parse.search = (parse.search ? parse.search + '&' : '?') + query;
    }
  }
  if (parse.search) {
    params.path += parse.search;
  }
  
  // initialize the http request
  var request = http.request(params, function (response) {
    callback && readHttpResponse(response, callback);
  });
  
  // add posted data
  if (options.method !== 'GET' && options.data) {
    var post = querystring.stringify(options.data);
    request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.setHeader('Content-Length', post.length);
    request.write(post);
  }
  
  // commit the request
  request.end();
};

// ### net.get(url, [data], callback)
// ### net.post(url, [data], callback)
// ### net.put(url, [data], callback)
// ### net.delete(url, [data], callback)
//
// Simpler than `net.request`, requires only
// the http method as the function name and
// an optional data argument
//
['get', 'post', 'put', 'delete'].forEach(function (method) {
  exports[method] = function (url, data, callback) {
    if (typeof data === 'function') {
      callback = data;
      data = null;
    }
    request(url, { method: method, data: data }, callback);
  };
});

// ### net.readHttpResponse(res, callback)
//
// Reads all data from an http response,
// compiling the body into a single string.
// See `net.request` for the format of a
// successful response.
//
// TODO: failure
var readHttpResponse = exports.readHttpResponse = function (res, callback) {
  var result = {
    statusCode : res.statusCode,
    headers    : res.headers,
    body       : ''
  };
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    result.body += chunk;
  });
  res.on('end', function () {
    result.trailers = res.trailers;
    callback(null, result);
  });
};
