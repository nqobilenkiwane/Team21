import { useEffect } from "react";
import axios from "axios";
import { login as loginUser } from "../services/api"; // Adjust the import path as necessary

async function UseLogin(email, password) {
  // This hook will handle user login logic
  const credentials = { email, password };
  useEffect(() => {
    const login = async () => {
      try {
        const response = await loginUser(credentials);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.parse(response.data.user.id));
        localStorage.setItem('firstName', JSON.parse(response.data.user.first_name));
        localStorage.setItem('lastName', JSON.parse(response.data.user.last_name));
        console.log('Login successful:', response.data);
      } catch (error) {
        console.error('Login failed:', error);
      }
    };
    return login();
  }, [email, password]);
}   

export default UseLogin;