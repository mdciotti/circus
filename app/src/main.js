// Marked options
marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: false,
  tables: false,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: false,
  smartypants: false
})

var channelData = {
	name: 'Channel Name',
	topic: 'Channel topic',
	messages: [
		{ id: 'a', timestamp: new Date(2015,9,23,2,39,0).getTime(), user: 'mdciotti', msg: 'Hello world' },
		{ id: 'b', timestamp: new Date(2015,9,23,2,40,0).getTime(), user: 'mdciotti', msg: 'Another message' },
		{ id: 'c', timestamp: new Date(2015,9,23,2,41,0).getTime(), user: 'mdciotti', msg: 'Yet another message' }
	]
}

var Message = React.createClass({
	rawMarkup: function () {
		var raw = marked(this.props.msg.toString())
		return { __html: raw }
	},
	render: function () {
		return (
			<li className="message">
				<time>{this.props.time}</time>
				<span className="user">{this.props.user}</span>
				<span className="message" dangerouslySetInnerHTML={this.rawMarkup()} />
			</li>
		)
	}
})

var MessageList = React.createClass({
	render: function () {
		var messageNodes = this.props.messages.map(message => {
			return (<Message key={message.id} time={message.time} user={message.user} msg={message.msg} />)
		})
		return (
			<ul className="message-list flex-item">
				{messageNodes}
			</ul>
		)
	}
})

var Channel = React.createClass({
	handleSubmit: function (e) {
		e.preventDefault()
		var message = this.refs.message.value.trim()
		if (!message) return
		this.props.onMessageSubmit(message)
		this.refs.message.value = ''
		return
	},
	render: function () {
		return (
			<div className="channel-view flex-item flex-vertical">
				<div className="channel-infobar flex-item-fixed">
					<h2 className="channel-name">{this.props.name}</h2>
					<p className="channel-topic">{this.props.topic}</p>
				</div>
				<MessageList messages={this.props.messages} />
				<form className="chatbox flex-item-fixed flex-horizontal" onSubmit={this.handleSubmit}>
					<input className="flex-item" autoComplete="off" ref="message" />
					<button className="flex-item-fixed" title="Send">
						<i className="ion-ios-paperplane-outline"></i>
					</button>
				</form>
			</div>
		)
	}
})

var CircusApp = React.createClass({
	handleMessageSubmit: function (message) {
		var messages = this.state.channel.messages
		var newMessages = messages.concat([{
			id: Math.floor(Math.random() * 16e8).toString(16),
			time: new Date().toString(),
			user: this.state.user.name,
			msg: message
		}])
		this.setState({
			user: this.state.user,
			channel: {
				name: this.state.channel.name,
				topic: this.state.channel.topic,
				messages: newMessages
			}
		})
		// TODO: submit to the server and update state when response received

	},
	getInitialState: function () {
		return {
			user: {
				name: '',
				channels: []
			},
			channel: {
				name: '',
				topic: '',
				messages: []
			}
		}
	},
	componentDidMount: function () {

	},
	render: function () {
		return (
			<div className="app flex-vertical">
				<header className="header flex-horizontal">
					<h1 className="brand flex-item-fixed">Circus</h1>
					<ul className="actions flex-item-fixed">
						<li className="current-user">{this.state.user.name}</li>
					</ul>
				</header>
				<div className="flex-item flex-horizontal">
					<nav className="sidebar flex-item-fixed">
						<h2>Channels</h2>
						<h2>Users</h2>
					</nav>
					<Channel name={this.state.channel.name} topic={this.state.channel.topic} messages={this.state.channel.messages} onMessageSubmit={this.handleMessageSubmit} />
				</div>
			</div>
		)
	}
})

ReactDOM.render(<CircusApp channel={channelData} />, document.getElementById('CircusApp'))
