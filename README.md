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
  timeout: function () {},
  message: function (message) {},
  response: function (response) {},
  helo: function (origin) {},
  mail: function ({ from, size }) {},
  rcpt: function (email) {},
  dataStart: function () {},
  dataChunk: function (chunk) {},
  data: function (data) {},
};
```

Set of server related event listeners.

**start** - Server is ready to listen to connections.

**stop** - Server is stopped.

**error** - Some unexpected error occured.

Set of client related event listeners. Most of them are interruptable, so make sure you triggered
`this.success()`, `this.failure()` or `this.ok()` inside any
listener that has been added. Or just return `true` to proceed default command execution.
Otherwise client won't get any response.

**connect** - (interruptable) Client connected.

**disconnect** - Client disconnected.

**timeout** - (interruptable) Idle timeout was triggered.

**message** - (interruptable) Any client command (before it's proceeded).

**response** - All server responses being sent to client.

**helo** - (interruptable) Client sent HELO or EHLO command with it's origin (domain).

**mail** - (interruptable) Client sent MAIL command with it's email and optionally expected data size.

**rcpt** - (interruptable) Client sent RCPT command with destination's email.

**dataStart** - (interruptable) Client initialized message transfer.

**dataChunk** - Client sent some data in DATA block.

**data** - (interruptable) Client provided it's message.

Alternatively listeners argument can be set as function instead of object. It will accept two arguments:
type (one of types above as string) and an argument. This function should return `true` if no interruption
intended. Example:

```
const listeners = function (type, param) {
  switch (type) {
    case 'start':
      // Do something on server start
      break;

    case 'data':
      const sessionData = this.data; // `this` is a session instance
      const message = param;
      // Do something
      this.success();
      break;
  }

  return true; // required to proceed default behavior
}
```

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

Trigger success event with default command behavior and proceed communication.
If no message is provided default one will be used.


``
session.ok([message])
``

Trigger success event skipping default command behavior (session.data object is not filled)
and proceed communication. If no message is provided default one will be used.

```
session.failure(code, message)
```

Trigger error event and proceed communication. Send client failure reason.
