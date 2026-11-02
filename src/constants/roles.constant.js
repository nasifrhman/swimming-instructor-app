const ROLES = Object.freeze({
  USER: 'user',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
});

const ALL_ROLES = Object.freeze([ROLES.USER, ROLES.INSTRUCTOR, ROLES.ADMIN]);

module.exports = {
  ROLES,
  ALL_ROLES,
};

