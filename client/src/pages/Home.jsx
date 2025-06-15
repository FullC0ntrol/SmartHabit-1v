import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Dumbbell, HeartHandshake, Menu, Plus, LogOut, X } from "lucide-react";
import CalendarView from "./CalendarView";
import HabitPage from "./HabitPage";
import HabitForm from "../components/habits/HabitForm";
import useHabits from "../hooks/useHabits";
import useAuth from "../hooks/useAuth";

const views = [
  { id: "calendar", label: "Kalendarz", icon: Calendar },
  { id: "habits", label: "Nawyki", icon: HeartHandshake },
  { id: "training", label: "Treningi", icon: Dumbbell },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false);
  const [isHabitPageOpen, setIsHabitPageOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);

  // Zaktualizuj destrukturyzację, aby pasowała do tego, co zwraca useHabits
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    saveHabit, // Używamy saveHabit zamiast addHabit/updateHabit
    deleteHabit,
    toggleHabitCompletion,
    fetchHabits,
  } = useHabits();

  const { logout } = useAuth();

  // Trigger fetchHabits when isHabitPageOpen becomes true (lub gdy komponent się załaduje)
  // Dobrze, że masz ten useEffect, ale fetchHabits jest już wywoływane w useHabits
  // Wartościową zmianą może być upewnienie się, że HabitPage odświeża się,
  // gdy jest otwarty, lub po prostu zawsze pozwolenie useHabits na zarządzanie pobieraniem.
  // Zostawmy to tak jak jest, bo to nie jest główny problem.
  useEffect(() => {
    if (isHabitPageOpen) {
      console.log("HabitPage opened, triggering fetchHabits");
      fetchHabits();
    }
    // Możesz też chcieć, aby nawyki były odświeżane po zamknięciu formularza dodawania/edycji,
    // ale saveHabit już to robi w useHabits.
  }, [isHabitPageOpen, fetchHabits]);


  const toggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  // Użyj saveHabit z useHabits, które już obsługuje zarówno dodawanie, jak i edycję
  const handleAddOrUpdateHabit = useCallback(
    async (habitData) => {
      try {
        // habitData z HabitForm już zawiera ID, jeśli to edycja
        // a daty są już konwertowane w HabitForm i w useHabits
        await saveHabit(habitData);
        setIsHabitFormOpen(false);
        setEditingHabit(null);
      } catch (err) {
        console.error("Error saving habit:", err);
        // HabitForm już obsługuje własne błędy, ale możemy tu dodać logowanie lub ogólny alert
        alert("Wystąpił błąd podczas zapisywania nawyku: " + err.message);
      }
    },
    [saveHabit] // Zależność od saveHabit
  );

  const handleOpenHabitFormForAdd = useCallback(() => {
    setEditingHabit(null); // Ustaw na null dla nowego nawyku
    setIsHabitFormOpen(true);
    setMenuOpen(false);
  }, []);

  const handleOpenHabitFormForEdit = useCallback((habit) => {
    setEditingHabit(habit); // Ustaw nawyk do edycji
    setIsHabitFormOpen(true);
    setMenuOpen(false);
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-hidden">
      <div className="p-6 pt-20 max-w-8xl mx-auto">
        <CalendarView 
            habits={habits}
            toggleHabitCompletion={toggleHabitCompletion}
        />
      </div>

      {/* Radial Menu */}
      <div className="fixed bottom-10 right-10 z-50">
        <motion.button
          onClick={toggleMenu}
          className="bg-blue-600 hover:bg-blue-700 w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6 text-white" />
        </motion.button>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 right-1 flex flex-col items-end gap-4"
            >
              {views.map((view, index) => (
                <motion.button
                  key={view.id}
                  onClick={() => {
                    if (view.id === "habits") {
                      setIsHabitPageOpen(true);
                    } else if (view.id === "training") {
                      alert("Treningi w budowie");
                    }
                    setMenuOpen(false);
                  }}
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: 20, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-blue-700 px-4 py-2 rounded-full shadow-md"
                >
                  <view.icon className="w-4 h-4 text-white" />
                  <span className="text-sm">{view.label}</span>
                </motion.button>
              ))}
              <motion.button
                onClick={handleOpenHabitFormForAdd} // Otwiera formularz do dodawania
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 20 }}
                transition={{ delay: views.length * 0.05 }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-full shadow-md"
              >
                <Plus className="w-4 h-4 text-white" />
                <span className="text-sm">Dodaj Nawyki</span>
              </motion.button>
              <motion.button
                onClick={logout}
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                exit={{ opacity: 0, x: 20, y: 20 }}
                transition={{ delay: (views.length + 1) * 0.05 }}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full shadow-md"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span className="text-sm">Wyloguj</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Habit Page Pop-up */}
      <AnimatePresence>
        {isHabitPageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex justify-center items-center z-40 p-4"
            // Upewnij się, że kliknięcie na overlay zamyka
            onClick={() => setIsHabitPageOpen(false)}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-gray-800 rounded-xl shadow-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto relative" // Dodano overflow-y-auto
              onClick={(e) => e.stopPropagation()} // Zapobiega zamykaniu po kliknięciu wewnątrz
            >
              {/* Dodaj przycisk zamknięcia w prawym górnym rogu */}
              <button
                onClick={() => setIsHabitPageOpen(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
                aria-label="Zamknij stronę nawyków"
              >
                <X className="w-6 h-6" />
              </button>
              <HabitPage
                habits={habits}
                loading={habitsLoading}
                error={habitsError}
                toggleHabitCompletion={toggleHabitCompletion}
                deleteHabit={deleteHabit}
                onEditHabit={handleOpenHabitFormForEdit}
                // onClose jest teraz obsługiwane przez nadrzędny div lub przycisk X
                onClose={() => setIsHabitPageOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Form Modal */}
      <AnimatePresence>
        {isHabitFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4"
            // Kliknięcie na overlay zamyka formularz i resetuje editingHabit
            onClick={() => {
              setIsHabitFormOpen(false);
              setEditingHabit(null);
            }}
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-gray-800 rounded-xl shadow-2xl p-6 w-full max-w-md relative" // Dodano relative
              onClick={(e) => e.stopPropagation()} // Zapobiega zamykaniu po kliknięciu wewnątrz
            >
              {/* Przycisk zamknięcia dla HabitForm */}
              <button
                onClick={() => {
                  setIsHabitFormOpen(false);
                  setEditingHabit(null);
                }}
                className="absolute top-3 right-3 text-gray-400 hover:text-white"
                aria-label="Zamknij formularz nawyku"
              >
                <X className="w-6 h-6" />
              </button>
              <HabitForm
                editingHabit={editingHabit}
                onSave={handleAddOrUpdateHabit} // Nadal używaj tej samej funkcji
                onClose={() => {
                  setIsHabitFormOpen(false);
                  setEditingHabit(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;