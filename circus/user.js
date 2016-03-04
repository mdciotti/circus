'use strict'

let uuid = require('uuid')
let Channel = require('./channel.js')
let EVENT = require('./events.js')
let ERROR = require('./errors.js')
let getErrorDescFromCode = require('./utilities.js').getErrorDescFromCode
let NameGenerator = require('./name-gen.js')

// import EVENT from './events.js'
// import ERROR from './errors.js'
// import { getErrorDescFromCode } from './utilities.js'

let names = NameGenerator()

class User {
	constructor(sockets, socket) {
		this.id = Symbol()
		// this.name = 'anonymous'
		this.name = names.next()

		// A collection of Channel objects this user belongs to
		this.channels = new Set()
		this.socket = socket

		this.connected_at = Date.now()
		this.last_active_at = Date.now()
		// TODO: should we set a timer to expire after inactivity?

		this.uuid = uuid.v4()
		this.static_channel = new Channel(sockets, this.name)
	}

	/**
	 * Amount of time since last user activity
	 * @return {Int} time in milliseconds
	 */
	get idle_duration() {
		return Date.now() - this.last_active_at
	}

	/**
	 * Gives the idle status of the user
	 * @return {Boolean} whether or not the user is idle
	 */
	get idle() {
		return this.idle_duration >= User.IDLE_TIMEOUT
	}

	activate() {
		this.last_active_at = Date.now()
	}

	setName(name) {
		// TODO: unique usernames
		// let unique = Array.from(this.channels).reduce((exists, channel) => {
		// 	return Array.from(channel.users).reduce((hasUser))
		// }, false)

		let unique = true

		if (unique) {
			let text = `@${this.name} changed their name to @${name}`
			this.name = name
			this.channels.forEach(channel => channel.sendMessage(text))
			// this.sendMessage(`Set username to @${this.name}`)
			this.sendUserData()
			return true
		} else {
			this.sendError(ERROR.DUPLICATE_USERNAME)
			return false
		}
	}

	// Sends a message to only this user
	sendMessage(message) {
		this.socket.emit(EVENT.MESSAGE.USER, {
			msg: message
		})
	}

	sendError(code) {
		// TODO: this is not being sent to the client
		let desc = getErrorDescFromCode(code)
		// this.socket.emit(EVENT.ERROR, {
		this.socket.emit(EVENT.MESSAGE.USER, {
			code: code,
			// description: desc
			msg: desc
		})
	}

	sendUserData() {
		this.socket.emit(EVENT.DATA.USER, {
			name: this.name,
			channels: Array.from(this.channels.keys()).map(channel => channel.name)
		})
	}

	sendChannelData(channel) {
		this.socket.emit(EVENT.DATA.CHANNEL, {
			name: channel.name,
			topic: channel.topic,
			users: Array.from(channel.users.keys())
		})
	}

	sendChat(channel, chat) {
		if (!this.channels.has(channel)) {
			// User is not in the channel
			this.sendError(ERROR.NOT_IN_CHANNEL)
			return false
		} else if (channel.id === this.static_channel.id) {
			// Send to static channel, do not broadcast
			this.socket.emit(EVENT.MESSAGE.CHAT, chat)
			return true
		} else {
			// Send the chat!
			channel.sendChat(chat)
			return true
		}
	}

	/**
	 * Adds the user to a channel
	 * @param  {Channel} channel A reference to the channel object that the user
	 *                           should join.
	 * @return {Boolean}         Whether the user successfully joined the
	 *                           channel or not.
	 */
	join(channel) {
		// Check if user is already in this channel
		if (this.channels.has(channel)) {
			this.sendMessage(`You are already in #${channel.name}`)
			return false
		} else if (channel.id === this.static_channel.id) {
			this.sendError(ERROR.STATIC_CHANNEL)
			return false
		} else {
			console.log(`user ${this.name} is joining #${channel.name}`)
			// this.sendMessage(`Joining #${channel.name}`)
			channel.addUser(this)
			this.sendUserData()
			return true
		}
	}

	/**
	 * Removes the user from a channel
	 * @param  {Channel} channel A reference to the channel object that the user
	 *                           should leave.
	 * @return {Boolean}         Whether the user successfully left the
	 *                           channel or not.
	 */
	leave(channel) {
		// Check if user is in the channel to leave
		if (!this.channels.has(channel)) {
			this.sendError(ERROR.NOT_IN_CHANNEL)
			return false
		} else if (channel.id === this.static_channel.id) {
			this.sendError(ERROR.STATIC_CHANNEL)
			return false
		} else {
			// TODO: make sure client leaves channel view
			// channel.sendMessage(`@${this.name} left the channel.`)
			channel.removeUser(this)
			this.sendUserData()
			return true
		}
	}

	connect() {
		this.static_channel.addUser(this)
		// TODO: make sure this works properly
		// Channel#addUser() adds itself to the user's channels,
		// which might cause an issue with the following loop
		this.channels.forEach(channel => channel.addUser(this))
	}

	/**
	 * Remove the user from all of his or her channels
	 * @param  {String} reason (Optional) A description for why the user
	 *                         disconnected.
	 * @return {Boolean}       Always returns true.
	 */
	disconnect(reason) {
		// this.static_channel.removeUser(this)
		// TODO: make sure this works properly
		// Channel#removeUser() removes itself from the user's channels,
		// which might cause an issue with the following loop
		this.channels.forEach(channel => channel.removeUser(this, reason))
		return true
	}
}

// Time since last user activity until system considers the user idle
User.IDLE_TIMEOUT = 900

module.exports = User
