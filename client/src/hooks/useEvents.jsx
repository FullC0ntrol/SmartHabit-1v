// hooks/useEvents.jsx
import { useState, useEffect } from 'react';
import useAuth from './useAuth';

const useEvents = (month, year) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isLoggedIn, getToken, loading: authLoading } = useAuth(); // Pobieramy dane z useAuth

  const fetchEvents = async () => {
    if (!isLoggedIn || authLoading) {
      setLoading(false);
      return; // Nie pobieramy wydarzeń, jeśli użytkownik nie jest zalogowany lub autoryzacja trwa
    }

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) throw new Error('Brak tokenu autoryzacji');

      const query = month && year ? `?month=${month}&year=${year}` : '';
      const response = await fetch(`http://localhost:3001/events${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Status odpowiedzi (fetchEvents):', response.status);
      console.log('Nagłówki odpowiedzi (fetchEvents):', response.headers.get('Content-Type'));

      if (!response.ok) {
        const text = await response.text();
        console.log('Surowa odpowiedź (fetchEvents):', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Błąd pobierania wydarzeń');
        } catch (parseErr) {
          throw new Error('Serwer nie zwrócił JSON-a: ' + parseErr);
        }
      }

      const data = await response.json();
      const formattedEvents = data.map((event) => ({
        ...event,
        date: new Date(event.event_date),
        time: event.event_time || '',
        title: event.title,
        description: event.description || '',
      }));
      setEvents(formattedEvents);
    } catch (err) {
      setError(err.message);
      console.error('Błąd pobierania wydarzeń:', err);
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (eventData) => {
    if (!isLoggedIn) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    if (!eventData.title || !eventData.date) {
      throw new Error('Tytuł i data są wymagane');
    }

    try {
      const token = getToken();
      if (!token) throw new Error('Brak tokenu autoryzacji');

      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || '',
          event_date: eventData.date.toISOString().split('T')[0],
          event_time: eventData.time || null,
        }),
      });

      console.log('Status odpowiedzi (addEvent):', response.status);
      console.log('Nagłówki odpowiedzi (addEvent):', response.headers.get('Content-Type'));

      if (!response.ok) {
        const text = await response.text();
        console.log('Surowa odpowiedź (addEvent):', text);
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || 'Błąd dodawania wydarzenia');
        } catch (parseErr) {
          throw new Error('Serwer nie zwrócił JSON-a: ' + parseErr);
        }
      }

      const newEvent = await response.json();
      setEvents([
        ...events,
        {
          ...newEvent,
          date: new Date(newEvent.event_date),
          time: newEvent.event_time || '',
          title: newEvent.title,
          description: newEvent.description || '',
        },
      ]);
    } catch (err) {
      setError(err.message);
      console.error('Błąd dodawania wydarzenia:', err);
      throw err;
    }
  };

  const updateEvent = async (eventId, eventData) => {
    if (!isLoggedIn) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    try {
      const token = getToken();
      if (!token) throw new Error('Brak tokenu autoryzacji');

      const response = await fetch(`http://localhost:3001/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: eventData.title,
          description: eventData.description || '',
          event_date: eventData.date.toISOString().split('T')[0],
          event_time: eventData.time || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd aktualizacji wydarzenia');
      }

      setEvents(
        events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                title: eventData.title,
                description: eventData.description || '',
                date: new Date(eventData.date),
                time: eventData.time || '',
              }
            : event
        )
      );
    } catch (err) {
      setError(err.message);
      console.error('Błąd aktualizacji wydarzenia:', err);
      throw err;
    }
  };

  const deleteEvent = async (eventId) => {
    if (!isLoggedIn) {
      throw new Error('Użytkownik nie jest zalogowany');
    }

    try {
      const token = getToken();
      if (!token) throw new Error('Brak tokenu autoryzacji');

      const response = await fetch(`http://localhost:3001/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd usuwania wydarzenia');
      }

      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(err.message);
      console.error('Błąd usuwania wydarzenia:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (month && year && isLoggedIn && !authLoading) {
      fetchEvents();
    }
  }, [month, year, isLoggedIn, authLoading]);

  return { events, loading, error, addEvent, updateEvent, deleteEvent, fetchEvents };
};

export default useEvents;