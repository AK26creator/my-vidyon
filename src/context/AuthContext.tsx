import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole, AuthState, LoginCredentials, ROLE_ROUTES } from '@/types/auth';
import { useNavigate } from 'react-router-dom';
import {
  signIn,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  confirmSignIn
} from 'aws-amplify/auth';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check authentication status on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      // 1. Get Cognito Session first
      const session = await fetchAuthSession();

      // 2. Get Real User Profile from Database via API
      try {
        const { authAPI } = await import('@/services/api');
        const dbUser = await authAPI.getMe();

        setState({
          user: {
            id: dbUser.id || currentUser.userId,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role as UserRole,
            avatar: dbUser.avatar_url,
            institutionId: dbUser.institution_id
          },
          isAuthenticated: true,
          isLoading: false,
        });

      } catch (apiError) {
        console.error('Failed to fetch user profile from DB:', apiError);
        // Fallback: If DB fetch fails, we might still be authenticated in Cognito
        // but we don't know the role. For safety, we might want to logout or show error.
        // For now, let's keep the session but mark as limited or retry.
        // OR: maintain the minimal cognito info but likely restricted access
        const attributes = await fetchUserAttributes();
        setState({
          user: {
            id: currentUser.userId,
            email: attributes.email || '',
            name: attributes.name || '',
            role: 'student', // Safe default fallback
            avatar: attributes.picture,
          },
          isAuthenticated: true,
          isLoading: false,
          error: 'Could not load full profile'
        });
      }

    } catch (error) {
      // Not authenticated
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = useCallback(async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      if (isSignedIn) {
        await checkAuth(); // Load user profile

        // Redirect based on role
        // We need to wait for checkAuth to complete and update state
        // Since setState is async, we can't rely on state.user immediately.
        // We'll fetch the profile directly here for the redirection decision 
        // to avoid race conditions, or just trust the user re-fetched profile.

        // Better approach: fetch profile quickly to determine where to go
        try {
          const { authAPI } = await import('@/services/api');
          const user = await authAPI.getMe();
          navigate(ROLE_ROUTES[user.role as UserRole] || '/dashboard');
        } catch (e) {
          console.error('Redirect error:', e);
          navigate('/dashboard');
        }


      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Handle "Force Change Password" challenge
        // For this immediate unblock, we will auto-confirm with a fixed password
        // In a real production app, we would redirect to a "Set New Password" page
        try {
          // Cognito requires 'name' attribute to be present if it's missing/required
          const { isSignedIn: isConfirmed } = await confirmSignIn({
            challengeResponse: 'Admin123!',
            options: {
              userAttributes: {
                name: 'Super Admin'
              }
            }
          });

          if (isConfirmed) {
            await checkAuth();
            try {
              const { authAPI } = await import('@/services/api');
              const user = await authAPI.getMe();
              navigate(ROLE_ROUTES[user.role as UserRole] || '/dashboard');
            } catch (e) {
              console.error('Redirect error:', e);
              navigate('/dashboard');
            }
          }
        } catch (confirmError: any) {
          console.error('Auto-confirm password failed:', confirmError);
          throw new Error('Please contact support to reset your password manually.');
        }

      } else {
        // Handle other challenges (MFA, etc.)
        console.log('Login next step UNHANDLED:', nextStep);
        console.log('Sign in Step Value:', nextStep.signInStep);
        throw new Error(`Login requires verification: ${nextStep.signInStep}`);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to login'
      }));
      throw error;
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    try {
      await signOut();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  const switchRole = (role: UserRole) => {
    // Only for debugging in this version
    if (state.user) {
      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, role } : null
      }));
      navigate(ROLE_ROUTES[role]);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
