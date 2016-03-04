'use strict'

let uuid = require('uuid')
let EVENT = require('./events.js')
let ERROR = require('./errors.js')
let getErrorDescFromCode = require('./utilities.js').getErrorDescFromCode

class Channel {
	constructor(sockets, name) {
		this.id = Symbol()
		this.uuid = uuid.v4()
		// if (!Channel.NameValidator.test(name)) {
		// 	throw new Error(getErrorDescFromCode(ERROR.INVALID_CHANNEL_NAME))
		// }
		this.name = name
		this.topic = ''
		this.users = new Set()
		this.sockets = sockets.in(this.uuid)
		// this.sockets = io.to(this.uuid)
	}

	sendMessage(message) {
		this.sockets.emit(EVENT.MESSAGE.CHANNEL, {
			msg: message
		})
	}

	sendChannelData() {
		this.sockets.emit(EVENT.DATA.CHANNEL, {
			name: this.name,
			topic: this.topic,
			users: Array.from(this.users.keys()).map(user => user.name)
		})
	}

	sendChat(chat) {
		// TODO: Check if user is muted
		this.sockets.emit(EVENT.MESSAGE.CHAT, chat)
	}

	setTopic(topic, user) {
		// TODO: ensure user is permitted to change topic
		this.topic = topic
		if (typeof user !== 'undefined') {
			this.sendMessage(`@${user.name} set the topic to "${topic}"`)
		} else {
			this.sendMessage(`The topic was changed to "${topic}"`)
		}
		this.sendChannelData()
	}

	/**
	 * Adds a user to this channel and subscribes them to the channel messages,
	 * and informs the other users in the channel.
	 * @param {User} user The user object to add.
	 */
	addUser(user) {
		this.sendMessage(`@${user.name} connected.`)
		this.users.add(user)
		this.sendChannelData()
		user.channels.add(this)
		user.socket.join(this.uuid)
	}

	/**
	 * Removes a user from this channel and unsubscribes them from the channel
	 * messages, and informs the other users in the channel.
	 * @param {User} user The user object to remove.
	 * @param {String} reason (Optional) A message describing why the user was
	 *                        removed.
	 */
	removeUser(user, reason) {
		let text = `@${user.name} disconnected` +
			((typeof reason !== 'undefined') ? ` (${reason}).` : '.')
		this.sendMessage(text)
		this.users.delete(user)
		this.sendChannelData()
		user.channels.delete(this)
		user.socket.leave(this.uuid)
	}
}

Channel.NameValidator = /^\w{1,32}$/

module.exports = Channel
