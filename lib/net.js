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

// net.request(url, options, callback)
//
//    [url] : 'http://www.google.com/search?q=foo'
//    [options] : {
//      url : 'http://www.google.com/search',
//      data : { q:'foo' },
//      method : 'GET'
//    }
//    [callback] : function (err, response)
//
// Format of response object
//
//    response : {
//      statusCode : 200,
//      headers : {},
//      body : '',
//      trailers : {}
//    }
//
// * One of url or options.url is required.
// * Data will be appended to the querystring for GET requests,
//   or sent in the request body for all other request methods.
//
exports.request = function (url, options, callback) {
  if (typeof url === 'object') {
    // without url, options is required
    callback = options;
    options = url;
    url = undefined;
  } else if (!callback && typeof options === 'function') {
    // with url, options are optional
    callback = options;
    options = {};
  }
  
  // turn the url into a request
  url = url || options.url;
  var parse = _url.parse(url);
  var params = {
    host   : parse.hostname,
    port   : parseInt(parse.port, 10) || 80,
    method : options.method ? options.method.toUpperCase() : 'GET',
    path   : parse.pathname
  };
  // setup the querystring
  if (params.method === 'GET' && options.data) {
    parse.search = (parse.search ? parse.search + '&' : '?') + querystring.stringify(options.data);
  }
  if (parse.search) {
    params.path += parse.search;
  }
  
  // initialize the request
  var request = http.request(params, function (response) {
    readServerResponse(response, callback);
  });
  
  // add posted data
  if (options.method !== 'GET' && options.data) {
    var post = querystring.stringify(options.data);
    request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.setHeader('Content-Length', post.length);
    request.write(post);
  }
  
  // fire the request
  request.end();
};

exports.serverTest = function (server, options, test) {
  // options is optional
  if (!test && typeof options === 'function') {
    test = options;
    options = {};
  }
  
  // defaults
  var port = 3000;
  options.url = 'http://localhost:'+port+'/';
  
  // open a new instance of the server
  server.listen(port, function () {
    // send a single test request
    exports.request(options, function (err, response) {
      server.close();
      test(err, response);
    });
  });
};

// TODO: failure
function readServerResponse(res, callback) {
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
}
