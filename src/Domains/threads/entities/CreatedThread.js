class CreatedThread {
    constructor(payload) {
      const { id, title, body, owner } = payload;
  
      this.id = id;
      this.title = title;
      this.body = body;
      this.owner = owner;
    }
  }
  
  module.exports = CreatedThread;
  