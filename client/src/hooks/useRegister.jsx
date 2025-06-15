import { useState } from 'react';

const useRegister = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const register = async (username, password) => {
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Błąd rejestracji');
      }

      return res.ok;
    } catch (err) {
      setError('Błąd serwera. Spróbuj ponownie.', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    error,
    isLoading,
  };
};

export default useRegister;
