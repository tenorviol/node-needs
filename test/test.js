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

var io = require('../lib/io'),
    connect = require('connect'),
    querystring = require('querystring');

var port = 3000;
var server;

module.exports = {
  
  // create a server for all tests to query
  setUp: function (assert) {
    server = connect()
      .use(connect.bodyParser())
      .use(function (req, res) {
        var parse = require('url').parse(req.url, true);
        var response = {
          url    : req.url,
          method : req.method,
          query  : parse.query,
          post   : req.body
        };
        res.end(JSON.stringify(response));
      });
    server.listen(port, function () {
      assert.done();
    });
  },
  
  // each of the following test objects will get
  // rewritten into a nodeunit test function below
  
  url : {
    args : [ '/'+Math.random() ]
  },
  
  'url w/querystring' : {
    args : [ '/query?' + querystring.stringify({ foo:'bar', answer:42 }) ],
    expect : {
      query : { foo:'bar', answer:42 }
    }
  },
  
  'options.url' : {
    args : [ { url : '/needs/of/the/many' } ]
  },
  
  'url w/data' : {
    args : [
      '/query',
      { data: { foo:'bar', answer:42 } }
    ],
    expect : {
      url : '/query?' + querystring.stringify({ foo:'bar', answer:42 }),
      query : { foo:'bar', answer:42 }
    }
  },
  
  'options.url get w/data': {
    args : [
      {
        url  : '/query',
        method : 'GET',
        data : { foo:'bar', answer:42 }
      }
    ],
    expect : {
      url : '/query?' + querystring.stringify({ foo:'bar', answer:42 }),
      query : { foo:'bar', answer:42 }
    }
  },
  
  'url get w/querystring and options.data' : {
    args : [
      '/query?foo=foo',
      { data: { foo:'bar', answer:42 } }
    ],
    expect : {
      url : '/query?foo=foo&' + querystring.stringify({ foo:'bar', answer:42 }),
      query : { foo: ['foo', 'bar'], answer:42 }
    }
  },
  
  post: {
    args : [ {
        url  : '/',
        method : 'POST',
        data : { foo:'bar', answer:42 }
      }
    ],
    expect : {
      post : { foo:'bar', answer:42 }
    }
  },
  
  'post w/querystring': {
    args : [ {
        url  : '/submit?id=300',
        method : 'POST',
        data : { foo:'bar', answer:42 }
      }
    ],
    expect : {
      query : { id:300 },
      post : { foo:'bar', answer:42 }
    }
  },
  
  // shutdown the test server
  tearDown: function (assert) {
    server.close();
    assert.done();
  }
};


//
// rewrite each { args, expect } test into a nodeunit test function
//
for (var key in module.exports) (function () {
  var test = module.exports[key];
  if (typeof test !== 'object') {
    return;  // not an object, no rewrite
  }
  
  // add http:://localhost:port to the url, and store url/method for testing
  var method = 'GET';
  var url = '/';
  for (var i in test.args) {
    if (typeof test.args[i] === 'string') {
      url = test.args[i];
      test.args[i] = 'http://localhost:'+port + url;
    } else if (typeof test.args[i] === 'object') {
      method = test.args[i].method || method;
      if (test.args[i].url) {
        url = test.args[i].url;
        test.args[i].url = 'http://localhost:'+port + url;
      }
    }
  }
  
  // these expectations will be asserted for
  test.expect = test.expect || {};
  test.expect.method = method;
  test.expect.url = test.expect.url || url;
  
  // nodeunit test function
  module.exports[key] = function (assert) {
    // append an io request callback test function
    test.args.push(function (err, response) {
      assert.equal(200, response.statusCode);
      
      // the server response writes back testable data (see setUp function above)
      var parse = JSON.parse(response.body);
      for (var i in test.expect) {
        assert.deepEqual(test.expect[i], parse[i]);
      }
      
      assert.done();
    });
    
    // a request invokes the above test
    io.request.apply({}, test.args);
  };
})();

module.exports.serverTest = function (assert) {
  var server = connect()
    .use(function(req, res, next) {
      res.end('Boo');
    });
  
  io.serverTest(server, function(err, result) {
    assert.equal(200, result.statusCode);
    assert.equal('Boo', result.body);
    assert.done();
  });
};
