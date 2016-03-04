'use strict';

var socket = io();
var currentChannel;
var currentUser;
// var cmd_history = [];

// Socket Transport Events
var EVENT = {
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
};

$(function () {

	var $chatbox = $('.chatbox');
	var $input = $('.chatbox input');
	var $messageList = $('.message-list');
	var $signin = $('.sign-in');
	var $signout = $('.sign-out');

	// var currentUser = LocalStorage

	$signin.click(function () {
		navigator.id.request();
	});

	$signout.click(function () {
		navigator.id.logout();
	});

	navigator.id.watch({
		loggedInUser: currentUser,
		onlogin: function (assertion) {
			// A user has logged in! Here you need to:
			// 1. Send the assertion to your backend for verification and to create a session.
			// 2. Update your UI.
			$.ajax({
				type: 'POST',
				url: '/auth/login', // This is a URL on your website.
				data: { assertion: assertion },
				success: function (res, status, xhr) { window.location.reload(); },
				error: function (xhr, status, err) {
					navigator.id.logout();
					console.warn("Login failure: " + err);
				}
			});
		},
		onlogout: function() {
			// A user has logged out! Here you need to:
			// Tear down the user's session by redirecting the user or making a call to your backend.
			// Also, make sure loggedInUser will get set to null on the next page load.
			// (That's a literal JavaScript null. Not false, 0, or undefined. null.)
			$.ajax({
			type: 'POST',
			url: '/auth/logout', // This is a URL on your website.
				success: function (res, status, xhr) { window.location.reload(); },
				error: function (xhr, status, err) { console.warn("Logout failure: " + err); }
			});
		}
	});

	$chatbox.submit(function (e) {
		var msg = $input.val();
		e.preventDefault();

		if (msg.length > 0) {
			var $msg = $('<li>')
				.addClass('message')
				.addClass('unsent')
				.html(formatChat({
					timestamp: Date.now(),
					user: currentUser,
					msg: msg
				}));
			var data = { channel: currentChannel, msg: msg };
			socket.emit(EVENT.MESSAGE.CHAT, data, function (e) {
				if (e.received) {
					$msg.removeClass('unsent');
				}
				if (e.replaced) {
					$msg.remove();
					// $msg.text(e.msg);
				}
			});
			$messageList.append($msg);
			$input.val('');
		}
		return false;
	});

	function addMessage(data) {
		$messageList.append($('<li>')
			.addClass('message')
			.addClass('system')
			.html(formatMessage(data.msg)));
	}

	socket.on(EVENT.CONNECTION, function (arg) {
		console.log(arg);
	});

	socket.on(EVENT.ERROR, function (e) {
		console.log(e);
	});

	socket.on(EVENT.USER_ERROR, function (e) {
		console.log(e);
	});

	socket.on('reconnect', function (n) {
		console.log('Successfully reconnected after %d tries.', n);
	});

	socket.on('disconnect', function () {
		console.log('Disconnected.');
	});

	socket.on('reconnecting', function (n) {
		console.log('Reconnecting... (%d)', n);
	});

	socket.on('reconnect_error', function (e) {
		console.log('Error while reconnecting.', e);
	});

	socket.on('reconnect_failure', function () {
		console.log('Failed to reconnect.');
	});

	socket.on(EVENT.MESSAGE.CHAT, function (data) {
		// console.log('chat', data);
		$messageList.append($('<li>')
			.addClass('message')
			.html(formatChat(data)));
	});

	socket.on(EVENT.MESSAGE.USER, addMessage);
	socket.on(EVENT.MESSAGE.CHANNEL, addMessage);
	socket.on(EVENT.MESSAGE.SERVER, addMessage);

	socket.on(EVENT.DATA.USER, function (user) {
		console.log('user data', user);
		currentUser = user.name;
		$('.current-user').text(user.name);
		$('.channel-list .channel').remove();
		user.channels.forEach(function (channel) {
			var link = document.createElement('a');
			link.href = '#' + channel;
			link.textContent = channel;
			$('.channel-list').append($('<li>')
				.addClass('channel')
				.append(link));
		});
	});

	socket.on(EVENT.DATA.CHANNEL, function (channel) {
		console.log('channel data', channel);
		$('.channel-name').text(channel.name);
		$('.channel-topic').text(channel.topic);
		currentChannel = channel.name;
		document.title = '#' + channel.name + ' - Circus';
	});
});
