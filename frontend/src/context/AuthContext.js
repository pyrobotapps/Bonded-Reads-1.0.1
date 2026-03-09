import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';

var AuthContext = createContext(null);

export function useAuth() {
  var context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider(props) {
  var children = props.children;
  var [user, setUser] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    var storedUser = localStorage.getItem('bl_user');
    var storedToken = localStorage.getItem('bl_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      authAPI.getMe()
        .then(function(res) {
          setUser(res.data);
          localStorage.setItem('bl_user', JSON.stringify(res.data));
        })
        .catch(function() {
          logout();
        })
        .finally(function() { setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  function login(email, password) {
    return authAPI.login({ email: email, password: password }).then(function(res) {
      var token = res.data.token;
      var userData = res.data.user;
      localStorage.setItem('bl_token', token);
      localStorage.setItem('bl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    });
  }

  function register(username, email, password) {
    return authAPI.register({ username: username, email: email, password: password }).then(function(res) {
      var token = res.data.token;
      var userData = res.data.user;
      localStorage.setItem('bl_token', token);
      localStorage.setItem('bl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    });
  }

  function staffRegister(username, email, password, staffCode) {
    return authAPI.staffRegister({ username: username, email: email, password: password }, staffCode).then(function(res) {
      var token = res.data.token;
      var userData = res.data.user;
      localStorage.setItem('bl_token', token);
      localStorage.setItem('bl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    });
  }

  function ownerRegister(username, email, password, ownerCode) {
    return authAPI.ownerRegister({ username: username, email: email, password: password }, ownerCode).then(function(res) {
      var token = res.data.token;
      var userData = res.data.user;
      localStorage.setItem('bl_token', token);
      localStorage.setItem('bl_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    });
  }

  function logout() {
    localStorage.removeItem('bl_token');
    localStorage.removeItem('bl_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{
      user: user,
      loading: loading,
      login: login,
      register: register,
      staffRegister: staffRegister,
      ownerRegister: ownerRegister,
      logout: logout,
      isAuthenticated: !!user,
      isStaff: user ? (user.is_staff || user.is_owner) : false,
      isOwner: user ? user.is_owner : false,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
