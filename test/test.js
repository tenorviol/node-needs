var testCase = require('nodeunit').testCase,
    io = require('../lib/io'),
    connect = require('connect');

exports.request = testCase({
  setUp: function(cb) {
    this.server = connect()
      .use(connect.bodyParser())
      .use(function(req, res, next) {
        var parse = require('url').parse(req.url, true);
        if (parse.pathname === '/echo') {
          var response = {
            url: parse.pathname,
            query: parse.query,
            post: req.body || {}
          };
          res.end(JSON.stringify(response));
        } else {
          res.end('Boo');
        }
      });
    this.port = 3000;
    this.server.listen(this.port, cb);
  },

  tearDown: function(cb) {
    this.server.close();
    cb();
  },

  url: function(assert) {
    io.request('http://localhost:'+this.port, function(err, response) {
      assert.equal(200, response.statusCode);
      assert.equal('Boo', response.body);
      assert.done();
    });
  },

  'options.url': function(assert) {
    var options = {
      url : 'http://localhost:'+this.port
    };
    io.request(options, function(err, response) {
      assert.equal(200, response.statusCode);
      assert.equal('Boo', response.body);
      assert.done();
    });
  },
  
  'get data': function(assert) {
    var options = {
      url  : 'http://localhost:'+this.port+'/echo',
      type : 'GET',
      data : { foo:'bar', answer:42 }
    };
    io.request(options, function(err, response) {
      var result = JSON.parse(response.body);
      assert.deepEqual(options.data, result.query);
      assert.deepEqual({}, result.post);
      assert.done();
    });
  },
  
  post: function(assert) {
    var options = {
      url  : 'http://localhost:'+this.port+'/echo',
      type : 'POST',
      data : { foo:'bar', answer:42 }
    };
    io.request(options, function(err, response) {
      var result = JSON.parse(response.body);
      assert.deepEqual({}, result.query);
      assert.deepEqual(options.data, result.post);
      assert.done();
    });
  }
});

exports['serverTest'] = function(assert) {
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
