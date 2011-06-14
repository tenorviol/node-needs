var http = require('http'),
    _url = require('url'),
    querystring = require('querystring');

exports.request = function(url, options, callback) {
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
  var parse = _url.parse(url, true);
  var params = {
    host   : parse.hostname,
    port   : parseInt(parse.port, 10) || 80,
    method : options.type || 'GET',
    path   : parse.pathname
  };
  
  // setup the querystring
  if (params.method === 'GET' && options.data) {
    for (var i in options.data) {
      parse.query[i] = options.data[i];
    }
  }
  if (parse.query) {
    params.path += '?' + querystring.stringify(parse.query);
  }
  
  // initialize the request
  var request = http.request(params, function(response) {
    readServerResponse(response, callback);
  });
  
  // add posted data
  if (options.type !== 'GET' && options.data) {
    var post = querystring.stringify(options.data);
    request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.setHeader('Content-Length', post.length);
    request.write(post);
  }
  
  // fire the request
  request.end();
};

exports.serverTest = function(server, options, test) {
  // options is optional
  if (!test && typeof options === 'function') {
    test = options;
    options = {};
  }
  
  // defaults
  var port = 3000;
  options.url = 'http://localhost:'+port+'/';
  
  // open a new instance of the server
  server.listen(port, function() {
    // send a single test request
    exports.request(options, function(err, response) {
      server.close();
      test(response);
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
  res.on('data', function(chunk) {
    result.body += chunk;
  });
  res.on('end', function() {
    result.trailers = res.trailers;
    callback(null, result);
  });
}
