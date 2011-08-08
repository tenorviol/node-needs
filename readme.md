Node Needs...
=============

net
---

### get

    net.get(url, data, function (err, response) {
      console.log(response);
    });

### post

    net.post(url, data, function (err, response) {
      console.log(response);
    });

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
