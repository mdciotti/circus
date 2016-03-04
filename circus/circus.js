'use strict'

let socketIO = require('socket.io')

let User = require('./user.js')
let Channel = require('./channel.js')
let EVENT = require('./events.js')
let ERROR = require('./errors.js')
let Commands = require('./commands.js')

let Circus = {}

Circus.VERSION = '0.1.0'

Circus.create = function (server) {

	let io = socketIO(server)

	// Regular Expression Table
	const regex = {
		command: /^\/(\w+)(?: (.*))?$/,
		nick: /^\w{1,32}$/,
		channel: /^\w{1,32}$/
	}

	// In-memory "database"
	let users = new Map()
	let channels = new Map()

	// Message of the day
	let motd = 'Welcome to Circus!'

	io.on(EVENT.CONNECT, function (socket) {

		console.log(`Incoming connection from ${socket.handshake.address} (${socket.conn.transport.name})`)

		// TODO: handle registered users
		let user = new User(io.sockets, socket)

		// Add user to user collection
		users.set(user.id, user)

		// Add user to 'user' channel
		// user.channels.add('user')

		user.sendUserData()

		// Send channel info
		user.sendChannelData(user.static_channel)
		
		// Send message of the day
		user.sendMessage(motd)

		socket.on(EVENT.DISCONNECT, (message) => {
			let reason
			switch (message) {
				case 'transport close': reason = 'disconnected'; break
				case 'ping timeout': reason = 'ping timeout'; break
				default: reason = message
			}
			user.disconnect(reason)
			// TODO: should the user data be persisted?
			users.delete(user.id)
		})

		socket.on(EVENT.ERROR, (e) => {
			console.log(e)
			// socket.emit(EVENT.ERROR, e)
		})

		socket.on(EVENT.MESSAGE.CHAT, (data, fn) => {
			// TODO: Filter data.msg

			// Update the last_active_at field for the user
			user.activate()

			if (data.msg.length <= 0) return

			let channel

			// Parse message
			if (data.msg.charAt(0) === '/') {
				// This is a command
				// Commands.execute(data.msg)
				// if no commands:
				// user.sendMessage('Commands unavailable')

				let matches = regex.command.exec(data.msg)
				if (matches === null) {
					user.sendError(ERROR.INVALID_COMMAND_SYNTAX)
				} else {
					let cmd = matches[1].toLowerCase()
					let param = matches[2]

					switch (cmd) {
					case 'help':
						user.sendMessage('You may use the following commands:')
						user.sendMessage('/help - displays information about commands')
						user.sendMessage('/say <message> - issues a system-wide notification')
						user.sendMessage('/nick <name> - sets your username')
						user.sendMessage('/leave - leaves the current channel')
						user.sendMessage('/join <channel> - join a channel')
						user.sendMessage('/createchannel <channel> - create a channel')
						user.sendMessage('/topic <message> - set the current channel topic')
						fn({ received: true })
						break
					case 'say':
						// TODO: command permissions
						// TODO: should this be server-wide?
						// TODO: check for user channel?
						channel = channels.get(data.channel)
						if (typeof param !== 'undefined') {
							channel.sendMessage(param)
						}
						fn({ received: true })
						break
					case 'channels':
						// TODO: filter channels
						let channelList = []
						channels.forEach(function (channel) {
							channelList.push(`#${channel.name}`)
						})
						if (channelList.length > 0) {
							user.sendMessage('You can join the following channels:')
							user.sendMessage(channelList.join(', '))
						} else {
							user.sendMessage('There are no channels you can join.')
						}
						fn({ received: true })
						break
					case 'username':
					case 'nick':
						if (regex.nick.test(param)) {
							user.setName(param)
							fn({ received: true })
						} else {
							user.sendError(ERROR.INVALID_USERNAME)
							fn({ received: true })
						}
						break
					case 'leave':
						// Set argument to message origin channel if nonexistent
						if (typeof param === 'undefined') param = data.channel

						if (typeof param !== 'undefined' && regex.channel.test(param)) {
							if (!channels.has(param)) {
								user.sendError(ERROR.NO_SUCH_CHANNEL)
								fn({ received: true })
							} else {
								user.leave(channels.get(param))
								fn({ received: true })
							}
						} else {
							user.sendError(ERROR.INVALID_CHANNEL_NAME)
							fn({ received: true })
						}
						break
					case 'join':
						if (typeof param !== 'undefined' && regex.channel.test(param)) {
							if (!channels.has(param)) {
								user.sendError(ERROR.NO_SUCH_CHANNEL)
								// TODO: Is this a possible injection threat?
								// user.sendMessage(`Channel #${param} does not exist.`)
								// user.sendMessage(`Use \`/createchannel ${param}\` to create it.`)
								fn({ received: true })
							} else {
								console.log('received valid join request')
								user.join(channels.get(param))
								fn({ received: true })
							}
						} else {
							user.sendError(ERROR.INVALID_CHANNEL_NAME)
							fn({ received: true })
						}
						break
					case 'topic':
						channel = channels.get(data.channel)
						if (typeof param === 'undefined') param = ''
						if (user.channels.has(channel)) {
							channel.setTopic(param, user)
							fn({ received: true })
						} else {
							fn({ received: true })
						}
						break
					case 'newchannel':
						if (typeof param !== 'undefined' && regex.channel.test(param)) {
							// if (this.createChannel(param)) {
							if (channels.has(param)) {
								// user.sendMessage(`Channel #${param} already exists.`)
								user.sendError(ERROR.DUPLICATE_CHANNEL)
								fn({ received: true })
							// TODO: should we check against static channels?
							// } else if (channels.get(param).id === user.static_channel.id) {
							// 	user.sendError(ERROR.STATIC_CHANNEL)
							// 	fn({ received: true })
							} else {
								channel = new Channel(io.sockets, param)
								channels.set(param, channel)
								// user.join(channel)
								// user.sendMessage(`Created and joined channel #${param}`)
								fn({ received: true })
							}
						} else {
							user.sendError(ERROR.INVALID_CHANNEL_NAME)
							fn({ received: true })
						}
						break
					default:
						// user.sendMessage(`Unknown command "${cmd}"`)
						user.sendError(ERROR.UNKNOWN_COMMAND)
						fn({ received: true })
					}
				}
			} else {
				// This is a normal chat message

				if (!channels.has(data.channel)) {
					user.sendError(ERROR.NO_SUCH_CHANNEL)
					fn({ received: true })
				} else {
					channel = channels.get(data.channel)

					let sent = user.sendChat(channel, {
						timestamp: Date.now(),
						user: user.name,
						msg: data.msg
					})

					if (sent) fn({ received: true, replaced: true })
					else fn({ received: true, replaced: false })
				}
			}
		})
	})
}

module.exports = Circus
