import { getAccessTokenFromLocalStorage } from '@/lib/utils';
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage();
    setIsAuthenticated(Boolean(accessToken));
    setIsReady(true);
  }, []);

  return { isReady, isAuthenticated };
};
