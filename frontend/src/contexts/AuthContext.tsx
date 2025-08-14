import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User, AuthTokens } from '../types';
import { authService } from '../services/authService';

interface AuthAction {
  type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'RESTORE_SESSION';
  payload?: any;
}

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
      };
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      };
    
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: action.payload.isAuthenticated,
        isLoading: false,
      };
    
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = () => {
      try {
        const isAuthenticated = authService.isAuthenticated();
        const user = authService.getCurrentUser();
        const tokens = authService.getToken() ? { 
          access_token: authService.getToken()!, 
          token_type: 'bearer' 
        } : null;

        dispatch({
          type: 'RESTORE_SESSION',
          payload: {
            user: isAuthenticated ? user : null,
            tokens: isAuthenticated ? tokens : null,
            isAuthenticated,
          },
        });
      } catch (error) {
        // If there's an error restoring session, treat as not authenticated
        dispatch({
          type: 'RESTORE_SESSION',
          payload: {
            user: null,
            tokens: null,
            isAuthenticated: false,
          },
        });
      }
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const tokens = await authService.login({ username, password });
      const user = authService.getCurrentUser();
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, tokens },
      });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};