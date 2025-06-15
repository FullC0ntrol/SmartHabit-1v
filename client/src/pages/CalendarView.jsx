import React, { useState } from "react";
import {
    addMonths,
    subMonths,
    startOfMonth,
    getDaysInMonth,
    getDay,
} from "date-fns";
import CalendarHeader from "../components/calendar/CalendarHeader";
import CalendarGrid from "../components/calendar/CalendarGrid";
import EventForm from "../components/calendar/EventForm";
import EventList from "../components/calendar/EventList";
import useEvents from "../hooks/useEvents";
import useAuth from "../hooks/useAuth";

// Zmieniamy propsy, aby przyjmowały habits i toggleHabitCompletion
const CalendarView = ({ habits, toggleHabitCompletion }) => {
    const { isLoggedIn, loading: authLoading } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const { events, loading, error, addEvent, updateEvent, deleteEvent } =
        useEvents(currentDate.getMonth() + 1, currentDate.getFullYear());

    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventTime, setNewEventTime] = useState("");
    const [newEventDescription, setNewEventDescription] = useState("");
    const [editingEvent, setEditingEvent] = useState(null);

    const monthStart = startOfMonth(currentDate);
    const monthDays = getDaysInMonth(currentDate);
    const firstDay = getDay(monthStart);
    const today = new Date();

    const handlePrevMonth = () => {
        setCurrentDate(subMonths(currentDate, 1));
        setSelectedDay(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(addMonths(currentDate, 1));
        setSelectedDay(null);
    };

    const handleDayClick = (day) => {
        setSelectedDay(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        );
        setEditingEvent(null); // Resetuj edycję wydarzenia przy zmianie dnia
    };

    const handleAddEvent = async () => {
        if (!selectedDay || !newEventTitle) return;
        try {
            await addEvent({
                date: selectedDay,
                time: newEventTime,
                title: newEventTitle,
                description: newEventDescription,
            });
            clearForm();
        } catch (err) {
            alert("Błąd dodawania wydarzenia: " + err.message);
        }
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        setSelectedDay(new Date(event.date)); // Ustaw selectedDay na datę edytowanego wydarzenia
        setNewEventTitle(event.title);
        setNewEventTime(event.time || "");
        setNewEventDescription(event.description || "");
    };

    const handleUpdateEvent = async () => {
        if (!editingEvent || !newEventTitle) return;
        try {
            await updateEvent(editingEvent.id, {
                date: selectedDay, // Użyj selectedDay, które mogło zostać zmienione w formularzu
                time: newEventTime,
                title: newEventTitle,
                description: newEventDescription,
            });
            clearForm();
            setEditingEvent(null);
        } catch (err) {
            alert("Błąd aktualizacji wydarzenia: " + err.message);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (window.confirm("Czy na pewno chcesz usunąć to wydarzenie?")) {
            try {
                await deleteEvent(eventId);
            } catch (err) {
                alert("Błąd usuwania wydarzenia: " + err.message);
            }
        }
    };

    const clearForm = () => {
        // Nie resetuj selectedDay tutaj, jeśli EventForm jest używany jako modal dla wybranego dnia
        // Resetowanie selectedDay spowodowałoby natychmiastowe zniknięcie formularza
        setNewEventTitle("");
        setNewEventTime("");
        setNewEventDescription("");
    };

    const handleCloseForm = () => {
        clearForm();
        setEditingEvent(null);
        setSelectedDay(null); // Tutaj resetujemy selectedDay, aby powrócić do widoku siatki
    };

    if (authLoading) {
        return (
            <p className="text-white text-center text-lg">
                Ładowanie autoryzacji...
            </p>
        );
    }

    if (!isLoggedIn) {
        return (
            <p className="text-white text-center text-lg">
                Proszę się zalogować, aby zobaczyć kalendarz.
            </p>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-6">
            <h1 className="text-3xl font-bold mb-4 text-center">Kalendarz</h1>

            {loading && (
                <p className="text-center text-gray-300">
                    Ładowanie wydarzeń...
                </p>
            )}
            {error && <p className="text-red-400 text-center">Błąd: {error}</p>}

            <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2 bg-gray-800 rounded-xl p-4">
                    <CalendarHeader
                        currentDate={currentDate}
                        onPrev={handlePrevMonth}
                        onNext={handleNextMonth}
                    />
                    {selectedDay ? (
                        <EventForm
                            selectedDay={selectedDay}
                            editingEvent={editingEvent}
                            newEventTitle={newEventTitle}
                            newEventTime={newEventTime}
                            newEventDescription={newEventDescription}
                            setNewEventTitle={setNewEventTitle}
                            setNewEventTime={setNewEventTime}
                            setNewEventDescription={setNewEventDescription}
                            onSave={
                                editingEvent
                                    ? handleUpdateEvent
                                    : handleAddEvent
                            }
                            onCancel={handleCloseForm} // Dodano onCancel do anulowania edycji/dodawania
                            onClose={handleCloseForm} // Używamy onClose do zamykania formularza i powrotu do siatki
                        />
                    ) : (
                        <CalendarGrid
                            currentDate={currentDate}
                            today={today}
                            events={events}
                            selectedDay={selectedDay}
                            firstDay={firstDay}
                            monthDays={monthDays}
                            onDayClick={handleDayClick}
                            habits={habits} // Przekazujemy nawyki do CalendarGrid
                        />
                    )}
                </div>

                <div className="md:w-1/2">
                    <EventList
  habits={habits}
  events={events}
  onToggleHabit={toggleHabitCompletion}
  onEditEvent={handleEditEvent}  // ← Przekazujemy funkcję
  onDeleteEvent={handleDeleteEvent}  // ← Przekazujemy funkcję
                    />
                </div>
            </div>
        </div>
    );
};

export default CalendarView;
