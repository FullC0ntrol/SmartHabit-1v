import { useState } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import useAuth from './hooks/useAuth';
import Home from './pages/Home.jsx';

function App() {
  const [showRegister, setShowRegister] = useState(false);
  const { isLoggedIn, login, loading: authLoading } = useAuth();

  if (authLoading) {
    return <p>Ładowanie autoryzacji...</p>; // Informacja o ładowaniu auth
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-500 h-screen w-screen">
      {!isLoggedIn ? (
        showRegister ? (
          <RegisterForm onRegisterSuccess={() => setShowRegister(false)} />
        ) : (
          <LoginForm
            onLoginSuccess={({ username, token }) => login(username, token)}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )
      ) : (
        <div className="w-full">
          <Home />
        </div>
      )}
    </div>
  );
}

export default App;
