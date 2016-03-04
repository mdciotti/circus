'use strict'

let defaults = require('defaults')

class Commands {
	constructor() {
		this.commands = new Map()
		this.commandChar = '/'
	}

	parse(cmdString) {
		if (cmdString[0] !== this.commandChar) return null
		let matches = /^(\w+)\b(?: (.*))?$/.exec(cmdString.slice(1))
		if (matches === null) {
			user.sendError(ERROR.INVALID_COMMAND_SYNTAX)
			return null
		} else {
			let cmd = matches[1].toLowerCase()
			let param = matches[2]

			return {
				command: cmd,
				param: param
			}
		}
	}

	execute(cmdString, user, channel) {
		// console.log(cmd)
		let c = this.parse(cmdString)
		if (c !== null) {
			let cmd = this.commands.get(c.command)
			if (cmd) {
				cmd.execute(c.param, user, channel)
				return true
			} else {
				return false
			}
		} else {
			return false
		}
	}

	register(name, action, opts) {
		opts = defaults(opts, {
			arguments: [],
			helpText: ''
		})

		this.commands.add(name, {
			name: name,
			help: opts.helpText,
			execute: action,
			arguments: []
		})
	}
}

module.exports = Commands
