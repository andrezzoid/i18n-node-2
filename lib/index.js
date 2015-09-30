/**
 * @author  André Jonas <andre.jonas@gmail.com>
 * @author  John Resig <jeresig@gmail.com>
 * @author  Originally by Marcus Spiegel <marcus.spiegel@gmail.com>
 * @link    https://github.com/jeresig/i18n-node
 * @license http://opensource.org/licenses/MIT
 */


// Declare dependencies

var Hoek = require('hoek');
var I18n = require('./i18n');


// Declare internals

var internals = {};

internals.encapsulateRequest = function (request) {

    var req = {
        headers: {
            host: request.info.host
        },
        query: {},
        session: {}     // For now, make it unable to read session vars
    };

    if (request.query.lang) {
        req.query.lang = request.query.lang;
    }

    return req;
};

internals.registerI18nToRequest = function (options) {

    return function (request, reply) {

        var opts = Hoek.clone(options);
        opts.request = internals.encapsulateRequest(request);
        request.i18n = new I18n(opts);
        reply.continue();
    };
};

internals.registerI18nToViewContext = function (request, reply) {

    var i18n = request.i18n;
    var response = request.response;
    if (response
        && !response.isBoom
        && response.variety === 'view') {

        response.source.context = response.source.context || {};
        I18n.registerMethods(response.source.context, request);
    }
    reply.continue();
};


exports.register = function (server, options, next) {

    // Register onPreAuth because it's the "earliest" extension point after url, params, query and cookie parsing
    server.ext('onPreAuth', internals.registerI18nToRequest(options));
    server.ext('onPostHandler', internals.registerI18nToViewContext);

    next();
};

exports.register.attributes = {
    pkg: require('../package.json')
};
