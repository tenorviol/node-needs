var data = require('../index').data;

exports.testArrayCollection = function (assert) {
  var c = new data.ArrayCollection();
  
  // add object 1
  var o1 = { foo: 'bar' };
  c.add(1, o1);
  assert.equal(o1, c.get(1));
  
  // add object 2
  var o2 = { foo: 'bar' };
  c.add(2, o2);
  assert.equal(o2, c.get(2));
  
  // intermezzo test
  assert.notEqual(c.get(1), c.get(2));
  assert.deepEqual(c.get(1), c.get(2));
  
  // add object 3
  var o3 = { foo: 'fubar' };
  c.add(1000000, o3);
  assert.equal(o3, c.get(1000000));
  
  // add object 'foo'
  c.add('foo', 'bar');
  assert.equal('bar', c.get('foo'));
  
  // remove object 3
  c['delete'](1000000);
  try {
    c.get(1000000);
    assert.ok(false);
  } catch (e) {
    // pass
  }
  
  // finale test
  assert.notEqual(c.get(1), c.get(2));
  assert.deepEqual(c.get(1), c.get(2));
  assert.equal('bar', c.get('foo'));
  
  assert.done();
};
