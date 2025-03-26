'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  token: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setLoggedIn: (status: boolean, token?: string, email?: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const setLoggedIn = (status: boolean, token?: string, email?: string) => {
    if (status && token !== undefined && email) {
      setUser({ token, email });
      if (typeof window !== 'undefined') {
        localStorage.setItem('userToken', token);
        localStorage.setItem('userEmail', email);
      }
    } else {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
      }
    }
  };

  // Load from localStorage on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('userToken') || '';
      const email = localStorage.getItem('userEmail') || '';
      if (email) {
        setUser({ token, email });
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, setLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
