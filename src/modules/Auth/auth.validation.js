const authValidation = {
  signIn: {
    body: {
      password: { required: true, type: 'string' }
    }
  },
  signUp: {
    body: {
      email: { match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ },
      password: { minLength: 6 },
      role: { enum: ['user', 'instructor', 'admin'] }
    }
  },
  verifyOtp: {
    body: {
      otp: { required: true }
    }
  },
  resendOtp: {
    body: {
      email: { match: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/ }
    }
  },
  resetPassword: {
    body: {
      password: { required: true, minLength: 6 }
    }
  },
  changePassword: {
    body: {
      currentPassword: { required: true },
      newPassword: { required: true, minLength: 6 }
    }
  }
};

module.exports = authValidation;

