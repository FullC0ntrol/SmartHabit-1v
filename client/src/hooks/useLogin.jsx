import { useState } from 'react';

const useLogin = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const login = async (username, password) => {
    setIsLoading(true);
    setError('');  // Resetujemy błąd na początku

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Zapisz token do localStorage
        localStorage.setItem('token', data.token);
        return data.username; // Zwróć nazwę użytkownika, jeśli logowanie było udane
      } else {
        setError(data.error || 'Błąd logowania');
        return null;  // Jeśli logowanie się nie udało, zwróć null
      }
    } catch (err) {
      setError('Błąd serwera. Spróbuj ponownie.');
      console.error(err);
      return null;  // W przypadku błędu serwera, zwróć null
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
};

export default useLogin;
