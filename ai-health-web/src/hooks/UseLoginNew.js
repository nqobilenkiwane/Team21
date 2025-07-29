import { useState } from "react";
import { authAPI } from "../services/api";

function UseLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await authAPI.login({ email, password });
      
      // Store user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', response.user.id);
      localStorage.setItem('firstName', response.user.first_name);
      localStorage.setItem('lastName', response.user.last_name);
      
      setSuccess(true);
      console.log('Login successful:', response);
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else if (error.response && error.response.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Login failed. Please try again.');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
    success
  };
}

export default UseLogin;
