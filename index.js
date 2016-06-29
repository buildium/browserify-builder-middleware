'use strict';

var watchify = require('watchify-middleware');
var createBuilder = require('browserify-builder');
var merge = require('lodash/fp/merge');

module.exports = function createMiddleware(config, middlewareConfig) {
    var builder = createBuilder(merge(config, {parallel: false, options: {cache: {}, packageCache: {}}}));

    var bundles = builder.getBundles();

    var sharedBundles = bundles.filter(function(bundle) {
        return bundle.type === 'shared';
    }).reduce(function(bundleMap, bundle) {
        var emitter = watchify.emitter(bundle.bundle, config.watchOptions);
        bundleMap[(middlewareConfig.publicPath + bundle.path.replace('\\', '/')).toLowerCase()] = emitter.middleware;
        console.log(bundle.path);
        return bundleMap;
    }, {});

    var entryBundles = bundles.filter(function(bundle) {
        return bundle.type !== 'shared';
    }).reduce(function(bundleMap, bundle) {
        var emitter,
            middleware;

        if (middlewareConfig.lazy) {
            middleware = function middlewareMemoize(req, res, next) {
                if (!emitter) {
                    emitter = watchify.emitter(bundle.bundle, config.watchOptions);
                    emitter.emit('pending');
                }
                return emitter.middleware(req, res, next);
            };
            bundleMap[(middlewareConfig.publicPath + bundle.path.replace('\\', '/')).toLowerCase()] = middleware;
        } else {
            emitter = watchify.emitter(bundle.bundle, config.watchOptions);
            bundleMap[(middlewareConfig.publicPath + bundle.path.replace('\\', '/')).toLowerCase()] = emitter.middleware;
        }

        return bundleMap;
    }, sharedBundles);

    return function middlewareFn(req, res, next) {
        var middleware = entryBundles[req.path.toLowerCase()];
        if (middleware) {
            middleware(req, res, next);
        } else {
            next();
        }
    };
};
