exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"comments"',
      onDelete: 'CASCADE',
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE',
    },
    created_at: {
      type: 'TIMESTAMP',
      default: pgm.func('current_timestamp'),
    },
  });

  // Tambahkan constraint unik supaya 1 user hanya bisa like 1x untuk 1 comment
  pgm.addConstraint('comment_likes', 'unique_comment_id_and_user_id', {
    unique: ['comment_id', 'user_id'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('comment_likes');
};
