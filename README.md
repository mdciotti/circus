Circus
======

Circus is a chat engine built on Node.js and WebSockets.


Client-Server Communication
---------------------------

The client attempts to connect to the server through WebSockets. If this connection cannot be established, a fallback of using long-polling is used to create a real-time connection. This communication is handled via the [Socket.io]() library. 

Data is transferred via a JSON schema. Data may include: chat messages, channel actions, user profile edits, etc. All interactions between the client and server must be made via HTTPS or SOCKS to ensure secure communication.

TODO: encrypt all messages and other data transferred between the client and server.


Channels
--------

A channel is a named group between which multiple clients can communicate. Clients can join a channel by its name, and are from then forward subscribed to updates from that channel. Channels can be created by clients with permission as determined by the server. Channel names are unique for a given server or network. Channels can have a topic message, which can be set by a client. Messages sent through a channel are broadcast to all clients connected to the channel, and if chat history is enabled, stored on the server. Clients can request messages between two timestamps in order to browse the channel history. A channel keeps track of its clients and each of their permissions. Channels can have custom permissions defined. Channels can be set to public or private, where public channels are joinable by all clients and private channels are restricted to either join-by-invite or an authentication scheme.


Commands
--------

Channels may employ commands for common actions. These commands are accessible via the text interface of the form `/command <argument-list>`, or accessible via a graphical interface if the client supports it. Commands are parsed by the client and only sent to the server if loosely valid. The server will check the authenticity of the request and execute the command if it is deemed valid. Some commands may be executed wholly by the client, with no server request necessary. Common commands include:

* /to, /msg [user] [message] - Sends an inline private message to the specified user.
* /shortcuts - Open keyboard shortcut help screen
* /help, /? - Displays a list of command descriptions and usages.
* /goto [user] - Opens the profile of the specified user in a new tab.
* /mute - Mutes the audio of the caller.
* /unmute - Unmutes the audio of the caller.
* /users - Displays a list of participants in the room.

Additionally, channels may employ custom commands defined by scripts. This feature is under consideration and will be formally defined.


Status Codes
------------

- 1xx -- Informational
- 2xx -- Success
- 3xx -- Redirection
- 4xx -- Client Error
- 5xx -- Server Error

### 1xx Informational

- **100 Continue**

### 2xx Success

- **200 OK**

