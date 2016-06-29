# browserify-builder-middleware

Express middleware for browserify-builder

##Usage

```
var express = require('express');
var browserifyBuilderMiddleware = require('browserify-builder-middleware');
var config = require('./builder.config.js');
var app = express();

app.use(browserifyBuilderMiddleware(config, { publicPath: appPath, lazy: true}));
```

##Options

- publicPath
  - The path to append to the relative output path of the bundles
- lazy
  - Only compile app bundles when they are requested
  - Default: `false`