'use strict'

let https = require('https')
let browserid = require('browserid-verify')

let verify = browserid()

/*
 * GET home page.
 */

exports.index = function (req, res) {
	res.render('index', { title: 'Express', user: req.session.email, csrf: req.session._csrf })
}

exports.auth = function (audience) {
	return function (req, res) {
		console.info('Verifying with Persona...')

		var assertion = req.body.assertion

		verify(assertion, audience, function (err, email, data) {
			if (err) {
				// Return JSON with a 500 saying something went wrong
				console.warn('request to verifier failed : ' + err)
				return res.send(500, { status : 'failure', reason : '' + err })
			}

			// Got a result, check if it was okay or not
			if (email) {
				console.info('browserid auth successful, setting req.session.email')
				req.session.email = email
				return res.redirect('/')
			}

			// Request worked, but verfication didn't, return JSON
			console.error(data.reason)
			res.send(403, data)
		})
	}
}

exports.logout = function (req, res) {
	req.session.destroy()
	res.redirect('/')
}
