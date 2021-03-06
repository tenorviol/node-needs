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

exports.ArrayCollection = ArrayCollection;
exports.ObjectCollection = ObjectCollection;

function ArrayCollection() {
  this._data = [];
}

function ObjectCollection() {
  this._data = {};
}

ArrayCollection.prototype =
ObjectCollection.prototype = {
  add : function (key, value) {
    if (this._data[key]) {
      throw new Error('Collection already contains an element, ' + JSON.stringify(key) + '.');
    }
    this._data[key] = value;
  },
  
  'delete' : function (key) {
    delete this._data[key];
  },
  
  get : function (key) {
    var value = this._data[key];
    if (value === undefined) {
      throw new Error('Element ' + JSON.stringify(key) + ' not found.');
    }
    return value;
  }
};
