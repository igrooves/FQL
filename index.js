module.exports = function(token) {

	"use strict";

	var self = this,
		https = require('https');

	this.token = token ? token : null;

	this.defaultHost = 'graph.facebook.com';

	this.get = {
		host: self.defaultHost,
		port: 443,
		method: 'GET'
	};

	this.upgradeToken = function(token) {
		this.token = token;
		console.log('FQL TOKEN UPGRADED', token);
	};

	this.makePath = function(query) {
		return ['/fql?q=', encodeURIComponent(query), '&access_token=', self.token].join('');
	};

	this.onError = null;

	this.getToken = function() {
		return this.token;
	};

	this.query = function(query, success, error) {

		this.get.path = this.makePath(query);

		console.log('sending...', query);

		if (typeof(query) !== 'string') {
			throw 'ERROR : FQL.query : no query defined';
		}

		if (typeof(success) !== 'function') {
			throw 'ERROR : FQL.query : no callback given';
		}

		https.request(self.get, function(res) {

			res.setEncoding('utf8');

			var chunks = [];

			res.on('data', function(chunk) {
				chunks.push(chunk);
			});

			res.on('end', function() {

				try {

					var data = JSON.parse(chunks.join(''));

					if (data) {

						if ('error' in data) {

							if (typeof(error) === 'function') {
								error.call(self, data);
							} else {
								console.error(data);
							}

						} else {

							success.call(self, data);

						}

					} else {

						if (typeof(error) === 'function') {
							error.call(self, 'No data recieved');
						}

					}

				} catch (e) {

					console.error(e);
					if (typeof(error) === 'function') {
						error.call(self, e);
					}
				}


			});

		}).end();

	}

};