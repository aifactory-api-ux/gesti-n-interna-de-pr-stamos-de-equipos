import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PublicClientApplication, InteractionStatus } from '@azure/msal-browser';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { AuthUser } from '../types';
import { authApi } from '../api/endpoints';

const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_AD_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_AD_TENANT_ID || ''}`,
    redirectUri: import.meta.env.VITE_AZURE_AD_REDIRECT_URI || 'http://localhost:5173',
    postLogoutRedirectUri: import.meta.env.VITE_AZURE_AD_POST_LOGOUT_REDIRECT_URI || 'http://localhost:5173/login',
  },
  cache: {
    cacheLocation: 'localStorage' as const,
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const { instance, inProgress, accounts } = useMsal();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await instance.initialize();
        const response = await instance.handleRedirectPromise();
        
        if (response) {
          const account = response.account;
          if (account) {
            instance.setActiveAccount(account);
          }
        }

        const activeAccount = instance.getActiveAccount();
        if (activeAccount) {
          await fetchUserProfile();
        } else if (accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
          await fetchUserProfile();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error initializing auth');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [instance, accounts]);

  const fetchUserProfile = async () => {
    try {
      const userProfile = await authApi.me();
      setUser(userProfile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching user profile');
    }
  };

  const login = useCallback(() => {
    instance.loginRedirect({
      scopes: ['User.Read', 'email', 'profile', 'openid'],
    });
  }, [instance]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
      instance.logoutRedirect();
      setUser(null);
    } catch (err) {
      instance.logoutRedirect();
      setUser(null);
    }
  }, [instance]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading: inProgress !== InteractionStatus.None || isLoading,
    login,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthProviderInner>{children}</AuthProviderInner>
    </MsalProvider>
  );
}

export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
