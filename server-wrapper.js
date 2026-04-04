/**
 * Graceful-shutdown wrapper for the Next.js standalone server.
 *
 * Hooks into Node's http module to capture the server instance, then
 * adds SIGTERM/SIGINT handling to drain in-flight requests before exit.
 * Used as the Docker entrypoint instead of the auto-generated server.js.
 */

const http = require('http')

const SHUTDOWN_TIMEOUT_MS = 25000 // 25s (Docker default stop timeout is 30s)
let httpServer = null
let isShuttingDown = false

// Capture the HTTP server instance created by Next.js
const originalCreateServer = http.createServer
http.createServer = function (...args) {
  httpServer = originalCreateServer.apply(this, args)
  return httpServer
}

function gracefulShutdown(signal) {
  if (isShuttingDown) return
  isShuttingDown = true
  console.log(`[shutdown] ${signal} received — stopping new connections, draining in-flight requests...`)

  const forceExit = setTimeout(() => {
    console.log('[shutdown] Timeout reached — forcing exit')
    process.exit(0)
  }, SHUTDOWN_TIMEOUT_MS)
  forceExit.unref()

  if (httpServer) {
    // Stop accepting new connections; existing ones finish naturally
    httpServer.close(() => {
      console.log('[shutdown] All connections drained — exiting cleanly')
      process.exit(0)
    })

    // Close idle keep-alive connections immediately so they don't
    // hold the server open
    httpServer.closeIdleConnections()
  } else {
    process.exit(0)
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Now load the original server.js which calls startServer()
require('./server.js')
