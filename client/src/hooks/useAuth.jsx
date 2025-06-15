import { useState, useEffect, useCallback } from 'react';

const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('token');
      console.log('Weryfikowanie tokenu:', storedToken ? 'Token istnieje' : 'Brak tokenu');
      if (storedToken) {
        try {
          const res = await fetch('http://localhost:3001/verify-token', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          const data = await res.json();
          console.log('Odpowiedź /verify-token:', data);
          if (res.ok && data.valid) {
            setIsLoggedIn(true);
            setUsername(data.username);
            setToken(storedToken);
          } else {
            console.log('Token niepoprawny lub wygasł');
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Błąd weryfikacji tokenu:', err);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = useCallback((username, newToken) => {
    setIsLoggedIn(true);
    setUsername(username);
    setToken(newToken);
    localStorage.setItem('token', newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUsername('');
    setToken(null);
    window.location.reload();
  }, []);

  const getToken = useCallback(() => token, [token]);

  return { isLoggedIn, username, login, logout, loading, getToken };
};

export default useAuth;