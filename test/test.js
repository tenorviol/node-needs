var serverTest = require('../lib/serverTest'),
    connect = require('connect');

exports['test serverTest'] = function(assert) {
  var server = connect()
    .use(function(req, res, next) {
      res.end('Boo');
    });
  
  serverTest(server, function(result) {
    assert.equal(200, result.statusCode);
    assert.equal('Boo', result.body);
    assert.done();
  });
};
