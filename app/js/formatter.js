////////// Inline Markdown Formatter //////////

var inlineRules = [
	{// [Link](url)
		name: 'link',
		pattern: /\[(.+)\]\(((?:[a-z]+:(?:\/\/)?)?(?:.+?@)?\w+\.[a-z]+|(?:\d{1,3}\.){3}\d{1,3})\)/g,
		render: function (match, title, href, index, text) {
			return '<a href="' + href + '">' + title + '</a>';
		}
	},
	// TODO: fix when used in conjunction with formatted links
	// {// URL (bare)
	// 	name: 'url',
	// 	pattern: /((?:[a-z]+:(?:\/\/)?)?)((?:.+?@)?\w+\.[a-z]+|(?:\d{1,3}\.){3}\d{1,3})/g,
	// 	render: function (match, protocol, url, index, text) {
	// 		return '<a href="' + protocol + url + '">' + url + '</a>';
	// 	}
	// },
	{// #channel
		name: 'channel',
		pattern: /\b#(\w+)\b/g,
		render: function (match, channelName, index, text) {
			return '<a href="#' + channelName + '" class="channel">#' + channelName + '</a>';
		}
	},
	{// @user
		name: 'user',
		pattern: /\b@([a-zA-Z_][a-zA-Z_0-9]*)\b/g,
		render: function (match, username, index, text) {
			return '<span class="user">@' + username + '</span>';
		}
	},
	{// **strong text**
		name: 'strong',
		pattern: /\b\*\*([^*<>]+)\*\*\b/g,
		render: function (match, atom, index, text) {
			return '<strong>' + atom + '</strong>';
		}
	},
	{// __emphasized text__
		name: 'em',
		pattern: /\b__([^<>]+)__\b/g,
		render: function (match, atom, index, text) {
			return '<em>' + atom + '</em>';
		}
	}
];


function safe_tags_replace(str) {
	return str.replace(/[&<>]/g, function replaceTag(tag) {
		switch (tag) {
			case '&': return '&amp;'; break;
			case '<': return '&lt;'; break;
			case '>': return '&gt;'; break;
			default: return tag;
		}
	});
}

function formatUsername(text) {
	return '<span class="user">@' + safe_tags_replace(text) + '</span>';
}

function formatMessage(text) {
	if (typeof text === 'string') {
		return inlineRules.reduce(function (str, rule) {
			return str.replace(rule.pattern, rule.render);
		}, safe_tags_replace(text));
	} else {
		console.error('Text must be a string:', text);
	}
}

function formatChat(chat) {
	// TODO: ensure chat adheres to schema
	if (chat.hasOwnProperty('msg') && typeof chat.msg === 'string'
	&& chat.hasOwnProperty('user') && typeof chat.user === 'string'
	&& chat.hasOwnProperty('timestamp') && typeof chat.timestamp === 'number') {
		var datetime = new Date(chat.timestamp);
		var h = datetime.getHours();
		var m = datetime.getMinutes();
		var s = datetime.getSeconds();
		var time = (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
		return time + ' - ' + formatUsername(chat.user) + ' ' + formatMessage(chat.msg);
	} else {
		console.error('Malformed chat object:', chat);
	}
}
