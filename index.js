'use strict'

let http = require('http')
let path = require('path')
let express = require('express')
let minimist = require('minimist')
let defaults = require('defaults')
let socketIO = require('socket.io')
let routes = require('./routes')
let routes = require('./circus')

let favicon = require('serve-favicon')
let logger = require('morgan')
let methodOverride = require('method-override')
let session = require('express-session')
let bodyParser = require('body-parser')
let cookieParser = require('cookie-parser')
let csrf = require('csurf')
let errorHandler = require('errorhandler')

// Process command line arguments
let options = defaults(minimist(process.argv.slice(2)), {
	address: '*',
	port: 3000
})

// Print version and exit
if (options.version) {
	console.log(`Circus version ${Circus.VERSION}`)
	process.exit(0)
}

let app = express()

// Serve app
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
// app.use(favicon(__dirname + '/public/favicon.ico'))
app.use(logger('dev'))
app.use(methodOverride())
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'your secret here'
}))
app.use(bodyParser.json())
app.use(bodyParser.urlEncoded({ extended: true }))
app.use(cookieParser())
app.use(csrf({ cookie: true }))
app.use(app.router)
app.use(express.static(path.join(__dirname, 'app')))

// Routes
app.get('/', routes.index)
app.post('/auth', routes.auth(`http://localhost:${options.port}`))
app.get('/logout', routes.logout)

// Error handling
switch(app.get('env')) {
case 'development':
	app.use(errorHandler({ dumpExceptions: true, showStack: true }))
	app.locals.pretty = true
	break
case 'production':
	app.use(errorHandler())
	break
default:
}

let server = http.createServer(app)

// Launch server
server.listen(options.port, options.address, () => {
	let hostname = options.address === null ? '*' : options.address
	console.log(`Circus IM Server listening on ${hostname}:${options.port}`)
})

// Create Circus server
let circusServer = Circus.create(server)
