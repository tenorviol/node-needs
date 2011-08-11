var data = require('../index').data;

[
  'ArrayCollection',
  'ObjectCollection'
].forEach(function (type) {
  exports['test ' + type] = function (assert) {
    var collection = new data[type];
    
    // add object 1
    var k1 = 1;
    var o1 = { foo: 'bar' };
    collection.add(k1, o1);
    assert.equal(o1, collection.get(k1));

    // adding a duplicate key throws
    try {
      collection.add(k1, 'foo');
      assert.ok(false);
    } catch (e) {
      // pass
    }

    // add object 2
    var k2 = 2;
    var o2 = { foo: 'bar' };
    collection.add(k2, o2);
    assert.equal(o2, collection.get(k2));

    // intermezzo test
    assert.notEqual(collection.get(k1), collection.get(k2));
    assert.deepEqual(collection.get(k1), collection.get(k2));

    // add object 3
    var k3 = 1000000;
    var o3 = { foo: 'fubar' };
    collection.add(k3, o3);
    assert.equal(o3, collection.get(k3));

    // add object 'foo'
    var kfoo = 'foo';
    var ofoo = 'bar';
    collection.add(kfoo, ofoo);
    assert.equal(ofoo, collection.get(kfoo));

    // remove object 3
    collection['delete'](k3);
    
    // getting an invalid key throws
    try {
      collection.get(k3);
      assert.ok(false);
    } catch (e) {
      // pass
    }

    // finale test
    assert.notEqual(collection.get(k1), collection.get(k2));
    assert.deepEqual(collection.get(k1), collection.get(k2));
    assert.equal(ofoo, collection.get(kfoo));

    assert.done();
  };
});
