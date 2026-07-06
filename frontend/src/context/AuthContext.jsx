import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://towncouncil-t570.onrender.com/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate session on load
  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const resData = await response.json();
        if (response.ok && resData.status === 'success') {
          // Keep token, attach full details
          const userData = resData.data;
          setUser({ ...userData, token });
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setUser(null);
        }
      } catch (err) {
        console.error('Session validation error:', err);
        // Do not remove token on network failure, just hold user as offline
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  // Login handler
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Login failed');
      }

      const userData = resData.data;
      localStorage.setItem('token', userData.token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Register handler
  const register = async (username, email, password, role = 'citizen') => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, role })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Registration failed');
      }

      const userData = resData.data;
      localStorage.setItem('token', userData.token);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const updateUser = (newData) => {
    setUser((prev) => (prev ? { ...prev, ...newData } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUser, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
