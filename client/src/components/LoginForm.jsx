import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useLogin from '../hooks/useLogin';
import useAuth from '../hooks/useAuth';

export default function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, isLoading } = useLogin();
  const { login: authLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result) {
      const token = localStorage.getItem('token');
      authLogin(result, token);
      onLoginSuccess({ username: result, token });
    }
  };

  useEffect(() => {
    const canvas = document.getElementById('particle-canvas-login');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    const numberOfParticles = 100;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;
      }
      draw() {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const initParticles = () => {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };
    initParticles();

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
        for (let j = i; j < particlesArray.length; j++) {
          const dx = particlesArray[i].x - particlesArray[j].x;
          const dy = particlesArray[i].y - particlesArray[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 100) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[i].x, particlesArray[j].x);
            ctx.lineTo(particlesArray[i].y, particlesArray[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-gray-900 to-blue-900 overflow-hidden">
      <canvas
        id="particle-canvas-login"
        className="absolute inset-0 z-0"
      ></canvas>

      <motion.div
        className="relative z-10 w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto mt-20 p-6 bg-white/10 backdrop-blur-lg rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 text-center">
          Logowanie
        </h2>
        {error && (
          <motion.p
            className="text-red-400 mb-4 text-center"
            initial={{ x: 0 }}
            animate={{ x: [-10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        )}
        <div className="space

-y-4">
          <motion.input
            type="text"
            placeholder="Login"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 bg-gray-800/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300"
            disabled={isLoading}
            aria-label="Nazwa użytkownika"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-800/50 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all duration-300"
            disabled={isLoading}
            aria-label="Hasło"
            whileFocus={{ scale: 1.02 }}
          />
          <motion.button
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full p-3 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center ${
              isLoading
                ? 'bg-blue-600/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]'
            }`}
            whileHover={{ scale: isLoading ? 1 : 1.05 }}
            whileTap={{ scale: isLoading ? 1 : 0.95 }}
            aria-label="Zaloguj się"
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Zaloguj się'
            )}
          </motion.button>
        </div>
        <p className="mt-4 text-center text-gray-400">
          Nie masz konta?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-400 hover:text-blue-300 transition-all duration-300"
            disabled={isLoading}
            aria-label="Przełącz na rejestrację"
          >
            Zarejestruj się
          </button>
        </p>
      </motion.div>
    </div>
  );
}