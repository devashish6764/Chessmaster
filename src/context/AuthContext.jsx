import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('chessUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const register = async (email, username, password) => {
    try {
      // Validate inputs
      if (!email || !username || !password) {
        throw new Error('All fields are required');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
      if (users.find(u => u.email === email)) {
        throw new Error('Email already registered');
      }
      if (users.find(u => u.username === username)) {
        throw new Error('Username already taken');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email,
        username,
        password, // In production, this would be hashed
        profilePictureUrl: 'https://images.unsplash.com/photo-1668997922927-73bdaf449c1e?w=200',
        rating: 400,
        createdAt: new Date().toISOString(),
        stats: {
          totalGames: 0,
          wins: 0,
          losses: 0,
          draws: 0
        }
      };

      users.push(newUser);
      localStorage.setItem('chessUsers', JSON.stringify(users));
      localStorage.setItem('chessUser', JSON.stringify(newUser));
      setUser(newUser);

      toast({
        title: 'Registration successful',
        description: 'Welcome to Chess Master!'
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
      const foundUser = users.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      localStorage.setItem('chessUser', JSON.stringify(foundUser));
      setUser(foundUser);

      toast({
        title: 'Login successful',
        description: `Welcome back, ${foundUser.username}!`
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('chessUser');
    setUser(null);
    toast({
      title: 'Logged out',
      description: 'See you next time!'
    });
  };

  const updateProfile = async (updates) => {
    try {
      const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);

      if (userIndex === -1) {
        throw new Error('User not found');
      }

      // Check if username is taken by another user
      if (updates.username && updates.username !== user.username) {
        if (users.find(u => u.username === updates.username && u.id !== user.id)) {
          throw new Error('Username already taken');
        }
      }

      const updatedUser = { ...users[userIndex], ...updates, updatedAt: new Date().toISOString() };
      users[userIndex] = updatedUser;

      localStorage.setItem('chessUsers', JSON.stringify(users));
      localStorage.setItem('chessUser', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully'
      });

      return { success: true };
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive'
      });
      return { success: false, error: error.message };
    }
  };

  const updateRating = (ratingChange) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
      const newRating = Math.max(0, users[userIndex].rating + ratingChange);
      users[userIndex].rating = newRating;
      
      localStorage.setItem('chessUsers', JSON.stringify(users));
      localStorage.setItem('chessUser', JSON.stringify(users[userIndex]));
      setUser(users[userIndex]);
    }
  };

  const updateStats = (result) => {
    if (!user) return;

    const users = JSON.parse(localStorage.getItem('chessUsers') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);

    if (userIndex !== -1) {
      users[userIndex].stats.totalGames++;
      if (result === 'win') users[userIndex].stats.wins++;
      else if (result === 'loss') users[userIndex].stats.losses++;
      else if (result === 'draw') users[userIndex].stats.draws++;
      
      localStorage.setItem('chessUsers', JSON.stringify(users));
      localStorage.setItem('chessUser', JSON.stringify(users[userIndex]));
      setUser(users[userIndex]);
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
    updateRating,
    updateStats
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};