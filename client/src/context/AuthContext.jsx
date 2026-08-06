import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const darkMode = true;

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/profile');
          setUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(res.data.data));
        } catch (err) {
          console.error('Failed to sync profile', err);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (e) {
      // Ignore logout API failure
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // RBAC Permission Helpers
  const isStateAdmin = user?.role === 'STATE_ADMIN';
  const isDistrictUser = user?.role === 'DISTRICT_USER';
  const isViewer = user?.role === 'VIEWER';

  const canCreateMeeting = isStateAdmin || isDistrictUser;
  const canEditMeeting = (meetingStatus) => {
    if (isStateAdmin) return true;
    if (isDistrictUser) return meetingStatus === 'DRAFT';
    return false;
  };
  const canSubmitMeeting = (meetingStatus) => {
    if (isViewer) return false;
    return meetingStatus === 'DRAFT';
  };
  const canCloseMeeting = isStateAdmin;
  const canDeleteMeeting = isStateAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        darkMode,
        login,
        logout,
        isStateAdmin,
        isDistrictUser,
        isViewer,
        canCreateMeeting,
        canEditMeeting,
        canSubmitMeeting,
        canCloseMeeting,
        canDeleteMeeting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
