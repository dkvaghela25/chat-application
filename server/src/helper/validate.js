const validationSchema = ({ email, password, phone_no }) => {
  // Validate email if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'Invalid email format' };
    }
  }

  // Validate password if provided
  if (password) {
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()[\]{};:'",.\<>/?\\|`~+=_-]).{8,}$/;

    if (!strongPasswordRegex.test(password)) {
      return {
        success: false,
        message:
          'Password must be at least 8 characters and include 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      };
    }
  }

  // Validate phone number if provided
  if (phone_no) {
    // Check if phone number contains only digits and has 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone_no)) {
      return { success: false, message: 'Phone number must be 10 digits' };
    }
  }

  return { success: true }; // All good!
};

export default validationSchema;