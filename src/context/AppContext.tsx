import React, {createContext, useContext, useState, ReactNode, useEffect} from 'react';
import api, {saveToken, removeToken} from '../services/api';

export interface Dog {
  id: string;
  name: string;
  ownerId: string;
  imageUri?: string;
  heartRate?: number;
  temperature?: number;
  isDeceased?: boolean;
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
  isPolling: boolean; // NEW: Indicates if polling is active
  setOwner: (owner: Owner | null) => void;
  addDog: (dog: Dog) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUpOwner: (email: string, password: string, name?: string) => Promise<boolean>;
  fetchDogs: () => Promise<void>;
  refreshDogs: () => Promise<void>; // NEW: Manual refresh function
  deleteDog: (dogId: string) => Promise<boolean>;
  markDogDeceased: (dogId: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({children}: {children: ReactNode}) => {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  // Check if user is already logged in (from stored token)
  useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        try {
          // Try to fetch dogs to verify token is still valid
          await api.get('/dogs');
          // If successful, user is authenticated
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

  // Start polling when logged in (auto-refresh every 5 seconds)
  useEffect(() => {
    if (!isLoggedIn || !owner) {
      // Stop polling if logged out
      setIsPolling(false);
      return;
    }

    // Start polling every 5 seconds
    const interval = setInterval(() => {
      fetchDogs();
    }, 5000); // 5000ms = 5 seconds

    setIsPolling(true);

    // Cleanup on unmount or when dependencies change
    return () => {
      clearInterval(interval);
      setIsPolling(false);
    };
  }, [isLoggedIn, owner]);

  const fetchDogs = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/dogs');
      setDogs(response.data);
    } catch (error: any) {
      console.error('Error fetching dogs:', error);
      
      // Specific error handling
      if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
        setError('Network error. Please check your connection.');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout(); // Auto-logout on auth error
      } else {
        setError(error.response?.data?.error || 'Failed to fetch dogs');
      }
      
      setDogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function (can be called by user)
  const refreshDogs = async (): Promise<void> => {
    await fetchDogs();
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

  const addDog = async (dog: Dog): Promise<boolean> => {
    if (!owner) {
      setError('Must be logged in to add a dog');
      return false;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Extract data without id and ownerId (backend will generate these)
      const dogData = {
        name: dog.name,
        imageUri: dog.imageUri,
        heartRate: dog.heartRate,
        temperature: dog.temperature,
      };
      
      const response = await api.post('/dogs', dogData);
      
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

  const deleteDog = async (dogId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      await api.delete(`/dogs/${dogId}`);
      
      // Remove dog from local state
      setDogs(dogs.filter(dog => dog.id !== dogId));
      
      return true;
    } catch (error: any) {
      console.error('Delete dog error:', error);
      setError(error.response?.data?.error || 'Failed to delete dog');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const markDogDeceased = async (dogId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.patch(`/dogs/${dogId}/deceased`);
      
      // Update dog in local state
      setDogs(dogs.map(dog => 
        dog.id === dogId 
          ? { ...dog, isDeceased: true }
          : dog
      ));
      
      return true;
    } catch (error: any) {
      console.error('Mark deceased error:', error);
      setError(error.response?.data?.error || 'Failed to mark dog as deceased');
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
        isPolling,
        setOwner: updateOwner,
        addDog,
        login,
        logout,
        signUpOwner,
        fetchDogs,
        refreshDogs,
        deleteDog,
        markDogDeceased,
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
