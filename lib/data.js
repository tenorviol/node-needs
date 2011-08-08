exports.ArrayCollection = ArrayCollection;

function ArrayCollection() {
  this._data = [];
}

ArrayCollection.prototype = {
  add : function (o) {
    this._data[o._id] = o;
  },
  
  remove : function (id) {
    delete this._data[id];
  },
  
  get : function (id) {
    var o = this._data[id];
    if (o === undefined) {
      throw new Error('Object, ' + id + ', not found');
    }
    return o;
  }
};
