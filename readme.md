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
        
    });

#### options

    {
      url : url
      method : 'GET' | 'POST' | 'PUT' | 'DELETE'
      data : {}
    }

#### TODO options

    timeout  // max time to wait
    username // http simple auth
    password // http simple auth
