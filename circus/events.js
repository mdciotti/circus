'use strict'

// Socket Transport Events
module.exports = {
	CONNECT: 'connect',
	DISCONNECT: 'disconnect',
	ERROR: 'error',
	USER_ERROR: 'user_error',
	MESSAGE: {
		SERVER: 'server_message',
		USER: 'user_message',
		CHANNEL: 'channel_message',
		CHAT: 'chat_message'
	},
	DATA: {
		CHANNEL: 'channel_data',
		USER: 'user_data'
	}
}
