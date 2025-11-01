import React, {createContext, useContext, useState, ReactNode} from 'react';

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
  setOwner: (owner: Owner | null) => void;
  addDog: (dog: Dog) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  signUpOwner: (email: string, password: string, name?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({children}: {children: ReactNode}) => {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Simple in-memory storage (in production, this would use AsyncStorage or a backend)
  const [owners, setOwners] = useState<Array<{email: string; password: string; owner: Owner}>>([]);
  // Store dogs per owner
  const [allDogs, setAllDogs] = useState<Array<{ownerId: string; dogs: Dog[]}>>([]);

  const signUpOwner = (email: string, password: string, name?: string): boolean => {
    // Check if owner already exists
    if (owners.find(o => o.email === email)) {
      return false;
    }
    
    const newOwner: Owner = {
      id: Date.now().toString(),
      email,
      name: name || email.split('@')[0],
    };
    
    setOwners([...owners, {email, password, owner: newOwner}]);
    // Initialize empty dogs array for new owner
    setAllDogs([...allDogs, {ownerId: newOwner.id, dogs: []}]);
    return true;
  };

  const login = (email: string, password: string): boolean => {
    const foundOwner = owners.find(o => o.email === email && o.password === password);
    if (foundOwner) {
      setOwner(foundOwner.owner);
      setIsLoggedIn(true);
      // Load dogs for this owner
      const ownerDogData = allDogs.find(d => d.ownerId === foundOwner.owner.id);
      setDogs(ownerDogData?.dogs || []);
      return true;
    }
    return false;
  };

  const logout = () => {
    setOwner(null);
    setIsLoggedIn(false);
    setDogs([]);
  };

  const addDog = (dog: Dog) => {
    if (!owner) return;
    
    // Add dog to global dogs array for this owner
    const ownerDogData = allDogs.find(d => d.ownerId === owner.id);
    if (ownerDogData) {
      const updatedDogs = [...ownerDogData.dogs, dog];
      setAllDogs(allDogs.map(d => d.ownerId === owner.id ? {ownerId: owner.id, dogs: updatedDogs} : d));
      setDogs(updatedDogs);
    } else {
      // First dog for this owner
      setAllDogs([...allDogs, {ownerId: owner.id, dogs: [dog]}]);
      setDogs([dog]);
    }
  };

  const updateOwner = (newOwner: Owner | null) => {
    setOwner(newOwner);
    if (newOwner) {
      setIsLoggedIn(true);
      // Load dogs for this owner
      const ownerDogData = allDogs.find(d => d.ownerId === newOwner.id);
      setDogs(ownerDogData?.dogs || []);
    } else {
      setIsLoggedIn(false);
      setDogs([]);
    }
  };
///ntoe
  return (
    <AppContext.Provider
      value={{
        owner,
        dogs,
        isLoggedIn,
        setOwner: updateOwner,
        addDog,
        login,
        logout,
        signUpOwner,
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

