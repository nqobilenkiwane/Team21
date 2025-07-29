// Authentication utilities
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const getUserInfo = () => {
  const userId = localStorage.getItem('user');
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName');
  
  return {
    id: userId,
    firstName,
    lastName,
    fullName: firstName && lastName ? `${firstName} ${lastName}` : null
  };
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('firstName');
  localStorage.removeItem('lastName');
  window.location.href = '/login';
};

// Check if token is expired (basic implementation)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const redirectToLogin = () => {
  window.location.href = '/login';
};
