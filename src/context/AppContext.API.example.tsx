/**
 * EXAMPLE: Updated AppContext using MongoDB API
 * 
 * This is an example of how to update your AppContext.tsx to use the API.
 * Replace your current AppContext.tsx with this version after setting up the backend.
 * 
 * IMPORTANT: Make sure to:
 * 1. Install axios: npm install axios
 * 2. Update API_BASE_URL in src/services/api.ts
 * 3. Start your backend server
 */

import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import api, {saveToken, removeToken} from '../services/api';

export interface Dog {
  id: string;
  name: string;
  ownerId: string;
  imageUri?: string;
  heartRate?: number;
  temperature?: number;
  vitalRecords?: Array<{
    heartRate: number;
    temperature: number;
    status: string;
    time: string;
  }>;
}

export interface Owner {
  id: string;
  email: string;
  name?: string;
}

interface AppContextType {
  owner: Owner | null;
  dogs: Dog[];
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  setOwner: (owner: Owner | null) => void;
  addDog: (dog: Omit<Dog, 'id' | 'ownerId'>) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUpOwner: (email: string, password: string, name?: string) => Promise<boolean>;
  fetchDogs: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({children}: {children: ReactNode}) => {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in (from stored token)
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          // Try to fetch dogs to verify token is still valid
          const response = await api.get('/dogs');
          // If successful, user is authenticated
          // You might want to also fetch owner info here
          setIsLoggedIn(true);
        } catch (error) {
          // Token is invalid, remove it
          removeToken();
        }
      }
    };
    checkAuth();
  }, []);

  // Fetch dogs when logged in
  useEffect(() => {
    if (isLoggedIn && owner) {
      fetchDogs();
    }
  }, [isLoggedIn, owner]);

  const fetchDogs = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dogs');
      setDogs(response.data);
    } catch (error: any) {
      console.error('Error fetching dogs:', error);
      setError(error.response?.data?.error || 'Failed to fetch dogs');
      setDogs([]);
    } finally {
      setLoading(false);
    }
  };

  const signUpOwner = async (
    email: string,
    password: string,
    name?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/signup', {
        email,
        password,
        name,
      });

      // Save token
      saveToken(response.data.token);
      
      // Set owner and login state
      setOwner(response.data.owner);
      setIsLoggedIn(true);
      
      return true;
    } catch (error: any) {
      console.error('Signup error:', error);
      setError(error.response?.data?.error || 'Signup failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      // Save token
      saveToken(response.data.token);
      
      // Set owner and login state
      setOwner(response.data.owner);
      setIsLoggedIn(true);
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.response?.data?.error || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setOwner(null);
    setIsLoggedIn(false);
    setDogs([]);
    setError(null);
  };

  const addDog = async (dog: Omit<Dog, 'id' | 'ownerId'>): Promise<boolean> => {
    if (!owner) {
      setError('Must be logged in to add a dog');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/dogs', dog);
      
      // Add the new dog to the local state
      setDogs([...dogs, response.data]);
      
      return true;
    } catch (error: any) {
      console.error('Add dog error:', error);
      setError(error.response?.data?.error || 'Failed to add dog');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateOwner = (newOwner: Owner | null) => {
    setOwner(newOwner);
    if (newOwner) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      setDogs([]);
      removeToken();
    }
  };

  return (
    <AppContext.Provider
      value={{
        owner,
        dogs,
        isLoggedIn,
        loading,
        error,
        setOwner: updateOwner,
        addDog,
        login,
        logout,
        signUpOwner,
        fetchDogs,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};





