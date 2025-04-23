class DetailComment {
    constructor(payload) {
      const { id, username, date, content, is_delete } = payload;
  
      this.id = id;
      this.username = username;
      this.date = date;
      this.content = is_delete ? '**komentar telah dihapus**' : content;
    }
  }
  
  module.exports = DetailComment;