Node Needs...
=============

net
---

### get, post, put, delete

    net.get(url, data, onResponse);
    net.post(url, data, onResponse);
    net.put(url, data, onResponse);
    net.delete(url, data, onResponse);

    function onResponse (err, response) {
      console.log(response);
    }

### request

    net.request(url, options, function (err, response) {
      console.log(response);
    });

#### options

    {
      url : url
      method : 'GET' | 'POST' | 'PUT' | 'DELETE'
      data : {}
    }

#### TODO options

    timeout  // max time to wait (default?)
    username // http simple auth
    password // http simple auth
    content type // e.g. json
    agent    // handling concurrency
