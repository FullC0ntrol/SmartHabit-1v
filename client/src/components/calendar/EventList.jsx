import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import { Check, X, Clock, Flame, Edit } from "lucide-react";

const TodayTasksList = ({ 
  habits = [], 
  events = [], 
  onToggleHabit, 
  onDeleteEvent,
  onEditEvent
}) => {
  const today = new Date();
  const [loadingHabitId, setLoadingHabitId] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Filtrowanie dzisiejszych nawyków
  const todayHabits = habits.filter(habit => {
    const habitDate = new Date(habit.start_date);
    return isSameDay(habitDate, today);
  });

  // Filtrowanie dzisiejszych wydarzeń
  const todayEvents = events.filter(event => 
    isSameDay(new Date(event.date), today)
  );

  const handleToggle = async (habitId) => {
    setLoadingHabitId(habitId);
    setError(null);
    try {
      await onToggleHabit(habitId, today);
    } catch (err) {
      setError('Nie udało się zaktualizować nawyku');
      console.error(err);
    } finally {
      setLoadingHabitId(null);
    }
  };

  // Funkcja renderująca nawyki
  const renderHabits = () => {
    if (todayHabits.length === 0) {
      return (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-sm italic"
        >
          Brak nawyków na dziś
        </motion.p>
      );
    }

    return todayHabits.map((habit) => {
      const isCompleted = habit.completed_dates?.some(date => 
        isSameDay(new Date(date), today)
      );

      return (
        <motion.div
          key={habit.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={`bg-gray-800 hover:bg-gray-750 rounded-lg p-3 transition-colors ${
            isCompleted ? 'border-l-4 border-green-500' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggle(habit.id)}
              disabled={loadingHabitId === habit.id}
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                isCompleted
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'border-2 border-gray-500 hover:border-blue-400'
              } ${loadingHabitId === habit.id ? 'opacity-50' : ''}`}
            >
              {loadingHabitId === habit.id ? (
                <span className="animate-spin">↻</span>
              ) : isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : null}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`truncate ${
                isCompleted ? 'line-through text-gray-400' : 'text-white'
              }`}>
                {habit.title}
              </p>
              {habit.description && (
                <p className="text-xs text-gray-400 truncate">
                  {habit.description}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      );
    });
  };

  // Funkcja renderująca wydarzenia
  const renderEvents = () => {
    if (todayEvents.length === 0) {
      return (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-500 text-sm italic"
        >
          Brak wydarzeń na dziś
        </motion.p>
      );
    }

    return todayEvents.map((event) => (
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800 hover:bg-gray-750 rounded-lg p-3 transition-colors group"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {event.time && (
                <span className="text-sm font-medium text-blue-300">
                  {event.time}
                </span>
              )}
              <p className="truncate font-medium">{event.title}</p>
            </div>
            {event.description && (
              <p className="text-xs text-gray-400 mt-1">
                {event.description}
              </p>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditEvent(event)}
              className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded transition-colors"
              title="Edytuj"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteEvent(event.id)}
              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
              title="Usuń"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-blue-300 mb-2">
        Zadania na dziś - {format(today, "d LLLL yyyy", { locale: pl })}
      </h3>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm p-2 bg-red-900/20 rounded"
        >
          {error}
        </motion.div>
      )}

      {/* Sekcja nawyków */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Nawyki
        </h4>
        <AnimatePresence>
          {renderHabits()}
        </AnimatePresence>
      </div>

      {/* Sekcja wydarzeń */}
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Wydarzenia
        </h4>
        <AnimatePresence>
          {renderEvents()}
        </AnimatePresence>
      </div>

      {/* Podsumowanie */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="pt-4 border-t border-gray-700 mt-4"
      >
        <div className="flex justify-between text-sm text-gray-400">
          <span>Łącznie zadań:</span>
          <span className="font-medium text-white">
            {todayHabits.length + todayEvents.length}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-400">
          <span>Ukończone nawyki:</span>
          <span className="font-medium text-green-400">
            {todayHabits.filter(habit => 
              habit.completed_dates?.some(date => 
                isSameDay(new Date(date), today)
            )).length}/{todayHabits.length}
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default TodayTasksList;