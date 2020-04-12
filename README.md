# mbr-smtp
SMTP (Simple Mail Transfer Protocol) client and server implementation.

## Server

```
const server = new Server(params = {}, listeners = {});
```
Create new SMTP server instance.

**params** - Server parameters.
**listeners** - Optional. Set of event listeners.

### params

```
const params = {
  name: 'example.domain',
  port: 25,
  host: '0.0.0.0',
  size: 30 * 1024 * 1024,
  timeout: 0
}
```

Set of SMTP server parameters.

**name** - Server domain name.
**port** - Optional. Server port to listen to. Default: 25.
**host** - Optional. Host to listen connections from. Default: '0.0.0.0' (accept all).
**size** - Optional. Maximum message size to accept. Set 0 to disable limit. Default: 31457280 (30 Mb).
**timeout** - Optional. Connection timeout before socked is being closed. Set 0 to disable. Default: 0.

### listeners
```
const listeners = {
  // Server events. Receives SMTP server instance as `this`.
  start: function () {},
  stop: function () {},
  error: function (error) {},

  // Client events. Receives Session instance as `this`.
  connect: function (socket) {},
  disconnect: function (socket) {},
  message: function (message) {},
  helo: function (origin) {},
  mail: function (email, messageSize) {},
  rcpt: function (email) {},
  data: function (data) {}
};
```

Set of server related event listeners.

**start** - Server is ready to listen to connections.
**stop** - Server is stopped.
**error** - Some unexpected error occured.

Set of client related event listeners. Make sure that you trigger this.success() or this.failure() inside any
listener (except for disconnect) that has been added. Otherwise client won't get any response.

**connect** - Client connected.
**disconnect** - Client disconnected.
**message** - Any client command (before it's proceeded).
**helo** - Client sent HELO or EHLO command with it's origin (domain).
**mail** - Client sent MAIL command with it's email and optionally expected data size.
**rcpt** - Client sent RCPT command with destination's email.
**data** - Client provided it's message.

### Server instance methods

```
server.on(listeners);
```

Attach listeners to events. You can attach them either here, or in Server constructor.

```
server.start();
```

Start server to listen to connections.

```
server.stop();
```

Stop server from listening to connections.

### Session instance

Client session collecting all required data during current connection. It's being passed to all client listeners.

```
session.id
```
Random generated session ID.

```
session.socket
```

Session client socket

```
session.smtp
```

Link to SMTP server instance.

```
session.queue
```

NetQueue instance with current operations.

```
session.send(code, message)
```

Send custom server response.

```
session.success([message])
```

Trigger success event and proceed communication. If no message is provided default one will be used.

```
session.failure(code, message)
```

Trigger error event and proceed communication. Send client failure reason.
