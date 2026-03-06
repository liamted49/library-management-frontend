//UserProvider.jsx

import { useContext, useState, useEffect } from "react";
import { UserContext } from "./UserContext";

export function UserProvider ({children}) {

  const initialUser = {
    isLoggedIn: false,
    name: '',
    email: '',
    role: ''
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/profile`, {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser({
            isLoggedIn: true,
            name: userData.username,
            email: userData.email,
            role: userData.role
          });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser({
          isLoggedIn: true,
          name: data.user.username,
          email: data.user.email,
          role: data.user.role
        });
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/user/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    const newUser = { isLoggedIn: false, name: '', email: '', role: '' };
    setUser(newUser);
  }

  return (
    <UserContext.Provider value={{user, login, logout}}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser () {
  return useContext(UserContext);
}