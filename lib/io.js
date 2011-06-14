var http = require('http'),
    url = require('url');

exports.get = function(options, callback) {
  if (typeof options === 'string') {
    var parse = url.parse(options);
    options = {
      host   : parse.hostname,
      port   : parseInt(parse.port, 10) || 80,
      method : 'GET',
      path   : parse.pathname
    };
  }
  var request = http.request(options, function(response) {
    readServerResponse(response, callback);
  });
  request.end();
};

exports.serverTest = function(server, options, test) {
  // options is optional
  if (!test && typeof options === 'function') {
    test = options;
    options = {};
  }
  
  // defaults
  options.host = 'localhost';
  options.port = options.port || 3000;
  options.method = options.method || (options.post ? 'POST' : 'GET');
  options.path = options.path || '/';
  
  // open a new instance of the server
  server.listen(options.port, function() {
    
    // send a single test request
    var request = http.request(options, function(res) {
      readServerResponse(res, function(err, response) {
        server.close();
        test(response);
      });
    });
    
    if (options.post) {
      request.removeHeader('post');
      var post = querystring.stringify(options.post);
      request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
      request.setHeader('Content-Length', post.length);
      request.write(post);
    }
    
    request.end();
  });
};

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
