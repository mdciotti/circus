'use strict'

let ERROR = require('./errors.js')

// Utility Functions
// import ERROR from './errors.js'

module.exports = {}

module.exports.getErrorDescFromCode = function (code) {
	// TODO: localization
	let desc
	switch (code) {
		case ERROR.NONE: desc = ''; break
		case ERROR.NOT_IN_CHANNEL: desc = 'You are not a member of the channel.'; break
		case ERROR.NO_SUCH_CHANNEL: desc = 'The channel does not exist.'; break
		case ERROR.STATIC_CHANNEL: desc = 'You cannot leave this channel.'; break
		case ERROR.DUPLICATE_CHANNEL: desc = 'That channel already exists.'; break
		case ERROR.INVALID_CHANNEL_NAME: desc = 'Invalid channel name.'; break
		case ERROR.INVALID_COMMAND_SYNTAX: desc = 'Invalid command syntax.'; break
		case ERROR.UNKNOWN_COMMAND: desc = 'Unknown command.'; break
		case ERROR.INVALID_USERNAME: desc = 'Invalid username.'; break
		case ERROR.DUPLICATE_USERNAME: desc = 'That username is already in use.'; break
		default: desc = 'Unknown error.'
	}
	return desc
}
