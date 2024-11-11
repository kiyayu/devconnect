// auth.jsx

// Save the token to localStorage
export const saveToken = (token) => {
  localStorage.setItem('authToken', token);
};

// Retrieve the token from localStorage
export const getToken = () => {
  return localStorage.getItem('authToken');
};

// Clear the token from localStorage
export const clearToken = () => {
  localStorage.removeItem('authToken');
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};
