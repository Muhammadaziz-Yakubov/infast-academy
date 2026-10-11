import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthStorage } from '../services/storage';
import { apiRequest } from '../services/api';

interface StudentProfile {
  id: string;
  studentCode?: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
  bio?: string;
  course?: any;
  group?: any;
  branch?: any;
}

interface AuthContextType {
  token: string | null;
  student: StudentProfile | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  student: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      const savedToken = await AuthStorage.getToken();
      const savedProfile = await AuthStorage.getProfile();

      if (savedToken && savedProfile) {
        setToken(savedToken);
        setStudent(savedProfile);
        // Verify token with backend silently
        try {
          const res = await apiRequest('/api/student/dashboard');
          if (res.student) {
            setStudent(res.student);
            await AuthStorage.saveProfile(res.student);
          }
        } catch (e) {
          // Token might be expired or server unreachable
        }
      }
    } catch (e) {
      console.warn('Session check failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (phone: string, pass: string) => {
    const res = await apiRequest('/api/auth/student-login', {
      method: 'POST',
      body: { phone, password: pass },
    });

    if (res.success && res.token && res.student) {
      await AuthStorage.saveToken(res.token);
      await AuthStorage.saveProfile(res.student);
      setToken(res.token);
      setStudent(res.student);
    } else {
      throw new Error(res.error || 'Kirish muvaffaqiyatsiz');
    }
  };

  const logout = async () => {
    await AuthStorage.clear();
    setToken(null);
    setStudent(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await apiRequest('/api/student/dashboard');
      if (res.student) {
        setStudent(res.student);
        await AuthStorage.saveProfile(res.student);
      }
    } catch (e) {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider value={{ token, student, loading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
