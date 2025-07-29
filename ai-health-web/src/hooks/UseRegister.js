import { useState } from "react";
import { authAPI } from "../services/api";

function UseRegister() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authAPI.register(userData);
      
      // Store user data if registration includes auto-login
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', response.user.id);
        localStorage.setItem('firstName', response.user.first_name);
        localStorage.setItem('lastName', response.user.last_name);
      }
      
      setSuccess(true);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.response && error.response.status === 409) {
        setError('Email already exists. Please use a different email.');
      } else {
        setError('Registration failed. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
    success
  };
}

export default UseRegister;
