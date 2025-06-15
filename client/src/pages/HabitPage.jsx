// src/components/HabitPage.jsx (lub gdziekolwiek go używasz)
import React from 'react';
import useHabits from '../hooks/useHabits'; // Upewnij się, że ścieżka do useHabits jest poprawna
import useAuth from '../hooks/useAuth'; // Potrzebne do sprawdzenia statusu zalogowania

const HabitPage = () => {
  const { habits, loading, error } = useHabits();
  const { isLoggedIn, loading: authLoading } = useAuth();

  if (authLoading || loading) {
    return <div style={{ color: 'white', textAlign: 'center', padding: '20px' }}>Ładowanie nawyków...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Błąd: {error}</div>;
  }

  if (!isLoggedIn) {
    return <div style={{ color: 'yellow', textAlign: 'center', padding: '20px' }}>Proszę się zalogować, aby zobaczyć nawyki.</div>;
  }

  return (
    <div style={{ color: 'white', padding: '20px', maxWidth: '600px', margin: 'auto', backgroundColor: '#333', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Twoje Nawyki</h2>
      {habits.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#ccc' }}>Brak nawyków do wyświetlenia.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {habits.map((habit) => (
            <li key={habit.id} style={{
              backgroundColor: '#444',
              margin: '10px 0',
              padding: '15px',
              borderRadius: '5px',
              borderLeft: `5px solid ${habit.is_completed ? 'green' : 'orange'}`
            }}>
              <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1em' }}>{habit.title}</h3>
              {habit.description && <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#bbb' }}>{habit.description}</p>}
              <p style={{ margin: 0, fontSize: '0.8em', color: '#999' }}>
                Rozpoczęto: {habit.start_date.toLocaleDateString()} | Częstotliwość: {habit.frequency} | Ukończono: {habit.is_completed ? 'Tak' : 'Nie'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HabitPage;