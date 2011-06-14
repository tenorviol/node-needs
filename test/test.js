var io = require('../lib/io'),
    connect = require('connect');

exports['test get'] = function(assert) {
  var server = connect()
    .use(function(req, res, next) {
      console.log('hello');
      res.end('Boo');
    });
  
  server.listen(3000, function() {
    io.get('http://localhost:3000/', function(err, response) {
      server.close();
      assert.equal(200, response.statusCode);
      assert.equal('Boo', response.body);
      assert.done();
    });
  });
};


exports['test serverTest'] = function(assert) {
  var server = connect()
    .use(function(req, res, next) {
      res.end('Boo');
    });
  
  io.serverTest(server, function(result) {
    assert.equal(200, result.statusCode);
    assert.equal('Boo', result.body);
    assert.done();
  });
};
