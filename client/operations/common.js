module.exports = {
  data: function (response) {
    if (!this.data) {
      this.data = { message: response.message };
    } else if (!this.data.message) {
      this.data.message = response.message;
    } else {
      this.data.message += '\r\n' + response.message;
    }

    if (!response.isComplete) {
      return;
    }

    if (response.isError) {
      this.queue.trigger('error', new Error(this.data.message));
    } else {
      this.queue.trigger('success', this.data.message);
    }
  },

  error: function (error) {
    const {session, reject} = this.params;

    reject(error);
    session.emit(this.params, 'error', error);

    this.queue.next();
  },

  success: function (message) {
    const {session, resolve} = this.params;

    session.emit(this.params, 'success', message);

    this.queue.next();

    resolve(message);
  }
};
