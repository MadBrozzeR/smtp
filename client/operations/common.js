module.exports = {
  data: function (response) {
    if (response.isError) {
      this.queue.trigger('error', new Error(response.message));
    } else {
      this.queue.trigger('success', response.message);
    }
  },

  error: function (error) {
    const {session, callback} = this.params;

    if (session.listeners.error instanceof Function) {
      session.listeners.error.call(this.params, error);
    }

    if (callback instanceof Function) {
      callback.call(this.params, error);
    }

    this.queue.next();
  },

  success: function (message) {
    const {session, callback} = this.params;

    if (session.listeners.success instanceof Function) {
      session.listeners.success.call(this.params, message);
    }

    if (callback instanceof Function) {
      callback.call(this.params, null, message);
    }

    this.queue.next();
  }
};
