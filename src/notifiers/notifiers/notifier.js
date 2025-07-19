class Notifier {
  constructor(name) { this.name = name; }
  /* eslint-disable-next-line no-unused-vars */
  async send(payload) { throw new Error('send() not implemented'); }
}
module.exports = Notifier;
