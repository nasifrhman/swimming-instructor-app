const userValidation = {
  updateProfile: {
    body: {
      fullName: { type: 'string', minLength: 2 },
      email: { type: 'string', match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
    }
  },
  userIdParam: {
    params: {
      id: { required: true, match: /^[0-9a-fA-F]{24}$/ }
    }
  },
  suspendUser: {
    params: {
      id: { required: true, match: /^[0-9a-fA-F]{24}$/ }
    },
    body: {
      reason: { type: 'string' }
    }
  }
};

module.exports = userValidation;

