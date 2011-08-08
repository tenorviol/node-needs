var data = require('../index').data;

exports.testCollection = function (assert) {
  var c = new data.ArrayCollection();
  
  var o1 = { _id:1, foo: 'bar' };
  c.add(o1);
  assert.equal(o1, c.get(o1._id));
  
  var o2 = { _id:2, foo: 'bar' };
  c.add(o2);
  assert.equal(o2, c.get(o2._id));
  
  assert.notEqual(c.get(1), c.get(2));
  assert.equal(c.get(1).foo, c.get(2).foo);
  
  var o3 = { _id:1000000, foo: 'fubar' };
  c.add(o3);
  assert.equal(o3, c.get(o3._id));
  
  c.remove(o1._id);
  try {
    c.get(o1._id);
    assert.ok(false);
  } catch (e) {
    // pass
  }
  
  assert.done();
};
