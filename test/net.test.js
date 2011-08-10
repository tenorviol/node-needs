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

var net = require('../index').net,
    connect = require('connect'),
    fs = require('fs'),
    querystring = require('querystring');

var port = 3000;
var server;
var https_port = 3001;
var https_server;

// create a server for all tests to query
exports.setUpHttpServer = function (assert) {
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
};

exports.setUpHttpsServer = function (assert) {
  var options = {
    key: fs.readFileSync(__dirname + '/fixtures/ssl.key'),
    cert: fs.readFileSync(__dirname + '/fixtures/ssl.crt')
  };
  https_server = connect(options)
    .use(connect.bodyParser())
    .use(function (req, res) {
      var parse = require('url').parse(req.url, true);
      var response = {
        https  : true,
        url    : req.url,
        method : req.method,
        query  : parse.query,
        post   : req.body
      };
      res.end(JSON.stringify(response));
    });
  https_server.listen(https_port, function () {
    assert.done();
  });
};

var tests = [  
  {
    url : '/'+Math.random()
  },
  
  {
    url : '/query?' + querystring.stringify({ foo:'bar', answer:42 }),
    expect : {
      query : { foo:'bar', answer:42 }
    }
  },
  
  {
    url : '/query',
    data : { foo:'bar', answer:42 },
    expect : {
      url : '/query?' + querystring.stringify({ foo:'bar', answer:42 }),
      query : { foo:'bar', answer:42 }
    }
  },
  
  {
    url : '/query?foo=foo',
    data: { foo:'bar', answer:42 },
    expect : {
      url : '/query?foo=foo&' + querystring.stringify({ foo:'bar', answer:42 }),
      query : { foo: ['foo', 'bar'], answer:42 }
    }
  },
  
  {
    url  : '/',
    method : 'POST',
    data : { foo:'bar', answer:42 },
    expect : {
      post : { foo:'bar', answer:42 }
    }
  },
  
  {
    url  : '/submit?id=300',
    method : 'POST',
    data : { foo:'bar', answer:42 },
    expect : {
      query : { id:300 },
      post : { foo:'bar', answer:42 }
    }
  },
  
  {
    url : '/photo',
    method : 'PUT',
    data : { foo:'bar', answer:42 },
    expect : {
      post : { foo:'bar', answer:42 }
    }
  },
  
  {
    url : '/photo',
    method : 'DELETE',
    data : { id:42 },
    expect : {
      post : { id:42 }
    }
  }
];

tests.forEach(function (test) {
  // add http:://localhost:port to the url, and store url/method for testing
  var url = 'http://localhost:' + port + test.url;
  var method = test.method || 'GET';
  var data = test.data || {};
  
  // these expectations will be asserted for
  test.expect = test.expect || {};
  test.expect.method = method;
  test.expect.url = test.expect.url || test.url;
  
  // test most explicit request
  var options = { method: method, data: data };
  var name = 'net.request(' + JSON.stringify(url) + ',' + JSON.stringify(options) + ')';
  module.exports[name] = function (assert) {
    net.request(url, options, function (err, response) {
      assertResult(assert, err, response);
    });
  };
  
  // test request without method
  if (method === 'GET') {
    var options = { data: data };
    var name = 'net.request(' + JSON.stringify(url) + ',' + JSON.stringify(options) + ')';
    module.exports[name] = function (assert) {
      net.request(url, options, function (err, response) {
        assertResult(assert, err, response);
      });
    };
  }
  
  // test request with method but no data
  if (!test.data) {
    var options = { method: method };
    var name = 'net.request(' + JSON.stringify(url) + ',' + JSON.stringify(options) + ')';
    module.exports[name] = function (assert) {
      net.request(url, options, function (err, response) {
        assertResult(assert, err, response);
      });
    };
  }
  
  // test named method request
  var fn = method.toLowerCase();
  if (test.data) {
    var name = 'net.'+fn+'(' + JSON.stringify(url) + ',' + JSON.stringify(test.data) + ')';
    module.exports[name] = function (assert) {
      net[fn](url, test.data, function (err, response) {
        assertResult(assert, err, response);
      });
    };
  } else {
    var name = 'net.'+fn+'(' + JSON.stringify(url) + ')';
    module.exports[name] = function (assert) {
      net[fn](url, function (err, response) {
        assertResult(assert, err, response);
      });
    };
  }
  
  // test https
  var url = 'https://localhost:' + https_port + test.url;
  var options = { method: method, data: data };
  var name = 'net.request(' + JSON.stringify(url) + ',' + JSON.stringify(options) + ')';
  module.exports[name] = function (assert) {
    net.request(url, options, function (err, response) {
      assert.ok(response.body.indexOf('"https":true') > -1);
      assertResult(assert, err, response);
    });
  };
  
  function assertResult(assert, err, response) {
    assert.equal(200, response.statusCode);
    
    // the server response writes back testable data (see setUp function above)
    var parse = JSON.parse(response.body);
    for (var i in test.expect) {
      assert.deepEqual(test.expect[i], parse[i]);
    }
    
    assert.done();
  }
});

exports.testNoCallback = function (assert) {
  net.post('http://localhost:'+port+'/', { foo:'bar' });
  setTimeout(function () {
    assert.done();
  }, 100);
};

// shutdown the test server
exports.tearDownHttpServer = function (assert) {
  server.close();
  assert.done();
};

exports.tearDownHttpsServer = function (assert) {
  https_server.close();
  assert.done();
};

exports.testGoogle = function (assert) {
  net.get('http://www.google.com', function (err, response) {
    assert.ok(response.body.indexOf('Google') > -1);
    assert.done();
  });
};

exports.testFacebookHttps = function (assert) {
  net.get('https://graph.facebook.com/4', function (err, response) {
    assert.ok(response.body.indexOf('Zuckerberg') > -1);
    assert.done();
  });
};
