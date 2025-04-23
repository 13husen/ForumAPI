/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn("comments", {
    is_delete: {
      type: "BOOLEAN",
      default: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn("comments", "is_delete");
};
