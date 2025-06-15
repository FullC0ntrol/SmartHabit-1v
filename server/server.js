const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config(); // obsługa .env

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "tajny_klucz";

// Middleware
app.use(cors());
app.use(express.json());

// Połączenie z bazą danych MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("❌ Błąd połączenia z MySQL:", err);
    process.exit(1);
  }
  console.log("✅ Połączono z bazą MySQL!");
});

// Middleware autoryzacji (JWT)
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Brak tokenu" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Nieprawidłowy token" });
    req.user = user;
    next();
  });
};

// ========== Rejestracja ==========
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Nieprawidłowy login lub hasło" });

  try {
    const [existing] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (existing.length > 0)
      return res.status(409).json({ error: "Użytkownik już istnieje" });

    const hashed = await bcrypt.hash(password, 10);
    await db
      .promise()
      .query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashed]);

    res.status(201).json({ message: "Użytkownik zarejestrowany!" });
  } catch (err) {
    console.error("❌ Błąd rejestracji:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// ========== Logowanie ==========
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    if (users.length === 0)
      return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Zalogowano!", token, username: user.username });
  } catch (err) {
    console.error("❌ Błąd logowania:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// ========== Weryfikacja tokenu ==========
app.get("/verify-token", authenticateToken, (req, res) => {
  res.json({ valid: true, username: req.user.username });
});
// ========== CRUD: Nawyki ==========

// POST /habits - Dodaj nowy nawyk
app.post("/habits", authenticateToken, async (req, res) => {
  const { title, description, start_date, frequency, is_completed } = req.body;
  const userId = req.user.id;

  if (!title || !start_date) {
    return res.status(400).json({ error: "Tytuł i data rozpoczęcia są wymagane." });
  }

  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO habits (user_id, title, description, start_date, frequency, is_completed) VALUES (?, ?, ?, ?, ?, ?)",
        [
          userId,
          title,
          description || null, // description może być NULL
          start_date, // Oczekuje formatu 'YYYY-MM-DD'
          frequency || 'daily', // Domyślnie 'daily'
          is_completed !== undefined ? is_completed : false, // Domyślnie false
        ]
      );

    const [newHabit] = await db
      .promise()
      .query("SELECT id, title, description, start_date, frequency, is_completed FROM habits WHERE id = ?", [result.insertId]);

    res.status(201).json(newHabit[0]);
  } catch (err) {
    console.error("❌ Błąd dodawania nawyku:", err);
    res.status(500).json({ error: "Błąd serwera podczas dodawania nawyku." });
  }
});

// GET /habits - Pobierz wszystkie nawyki dla użytkownika
app.get("/habits", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [habits] = await db.promise().query(
      `SELECT h.id, h.title, h.description, h.start_date, h.frequency, h.is_completed, h.created_at,
       GROUP_CONCAT(hc.completion_date) AS completed_dates
       FROM habits h
       LEFT JOIN habit_completions hc ON h.id = hc.habit_id
       WHERE h.user_id = ?
       GROUP BY h.id
       ORDER BY h.created_at DESC`,
      [userId]
    );
    
    // Formatowanie wyników
    const formattedHabits = habits.map(habit => ({
      ...habit,
      completed_dates: habit.completed_dates ? habit.completed_dates.split(',') : []
    }));
    
    res.json(formattedHabits);
  } catch (err) {
    console.error("❌ Błąd pobierania nawyków:", err);
    res.status(500).json({ error: "Błąd serwera podczas pobierania nawyków." });
  }
});
// PUT /habits/:id - Zaktualizuj nawyk
app.put("/habits/:id", authenticateToken, async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;
  const { title, description, start_date, frequency, is_completed } = req.body;

  if (!title || !start_date) {
    return res.status(400).json({ error: "Tytuł i data rozpoczęcia są wymagane." });
  }

  try {
    const [check] = await db
      .promise()
      .query("SELECT * FROM habits WHERE id = ? AND user_id = ?", [
        habitId,
        userId,
      ]);

    if (check.length === 0) {
      return res.status(404).json({ error: "Nawyk nie znaleziony lub nie masz uprawnień." });
    }

    await db
      .promise()
      .query(
        "UPDATE habits SET title = ?, description = ?, start_date = ?, frequency = ?, is_completed = ? WHERE id = ?",
        [
          title,
          description || null,
          start_date, // Oczekuje formatu 'YYYY-MM-DD'
          frequency || 'daily',
          is_completed !== undefined ? is_completed : check[0].is_completed, // Zachowaj istniejącą wartość, jeśli nie podano
          habitId,
        ]
      );

    // Możesz zwrócić zaktualizowany nawyk, jeśli chcesz, zamiast tylko wiadomości
    const [updatedHabit] = await db.promise().query("SELECT id, title, description, start_date, frequency, is_completed FROM habits WHERE id = ?", [habitId]);
    res.json(updatedHabit[0]);
  } catch (err) {
    console.error("❌ Błąd aktualizacji nawyku:", err);
    res.status(500).json({ error: "Błąd serwera podczas aktualizacji nawyku." });
  }
});

// DELETE /habits/:id - Usuń nawyk
app.delete("/habits/:id", authenticateToken, async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;

  try {
    const [check] = await db
      .promise()
      .query("SELECT * FROM habits WHERE id = ? AND user_id = ?", [
        habitId,
        userId,
      ]);

    if (check.length === 0) {
      return res.status(404).json({ error: "Nawyk nie znaleziony lub nie masz uprawnień." });
    }

    await db.promise().query("DELETE FROM habits WHERE id = ?", [habitId]);
    res.json({ message: "Nawyk usunięty pomyślnie." });
  } catch (err) {
    console.error("❌ Błąd usuwania nawyku:", err);
    res.status(500).json({ error: "Błąd serwera podczas usuwania nawyku." });
  }
});
// POST /habits/:id/toggle - Zmień status wykonania nawyku w danym dniu
app.post("/habits/:id/toggle", authenticateToken, async (req, res) => {
  const habitId = req.params.id;
  const userId = req.user.id;
  const { date } = req.body;

  try {
    // 1. Sprawdź czy nawyk istnieje i należy do użytkownika
    const [habit] = await db.promise().query(
      "SELECT * FROM habits WHERE id = ? AND user_id = ?", 
      [habitId, userId]
    );
    
    if (!habit.length) {
      return res.status(404).json({ error: "Nawyk nie znaleziony" });
    }

    // 2. Ustal datę (dzisiejsza jeśli nie podano)
    const completionDate = date || new Date().toISOString().split('T')[0];

    // 3. Sprawdź czy istnieje już wpis dla tej daty
    const [existing] = await db.promise().query(
      "SELECT * FROM habit_completions WHERE habit_id = ? AND completion_date = ?",
      [habitId, completionDate]
    );

    // 4. Toggle - usuń jeśli istnieje, dodaj jeśli nie
    if (existing.length > 0) {
      await db.promise().query(
        "DELETE FROM habit_completions WHERE habit_id = ? AND completion_date = ?",
        [habitId, completionDate]
      );
    } else {
      await db.promise().query(
        "INSERT INTO habit_completions (habit_id, completion_date) VALUES (?, ?)",
        [habitId, completionDate]
      );
    }

    // 5. Pobierz zaktualizowaną listę dat wykonania
    const [completions] = await db.promise().query(
      "SELECT completion_date FROM habit_completions WHERE habit_id = ?",
      [habitId]
    );

    res.json({
      success: true,
      completed_dates: completions.map(c => c.completion_date),
      is_completed: existing.length === 0 // Nowy status
    });
  } catch (err) {
    console.error("❌ Błąd zmiany statusu nawyku:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});
// ========== CRUD: Wydarzenia ==========
app.post("/events", authenticateToken, async (req, res) => {
  const { title, description, event_date, event_time } = req.body;
  const userId = req.user.id;

  if (!title || !event_date)
    return res.status(400).json({ error: "Tytuł i data są wymagane" });

  try {
    const [result] = await db
      .promise()
      .query(
        "INSERT INTO events (user_id, title, description, event_date, event_time) VALUES (?, ?, ?, ?, ?)",
        [userId, title, description || null, event_date, event_time || null]
      );

    const [newEvent] = await db
      .promise()
      .query("SELECT * FROM events WHERE id = ?", [result.insertId]);

    res.status(201).json(newEvent[0]);
  } catch (err) {
    console.error("❌ Błąd dodawania wydarzenia:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.get("/events", authenticateToken, async (req, res) => {
  const { month, year } = req.query;
  const userId = req.user.id;

  try {
    let query = "SELECT * FROM events WHERE user_id = ?";
    const params = [userId];

    if (month && year) {
      query += " AND MONTH(event_date) = ? AND YEAR(event_date) = ?";
      params.push(month, year);
    }

    query += " ORDER BY event_date, event_time";

    const [events] = await db.promise().query(query, params);
    res.json(events);
  } catch (err) {
    console.error("❌ Błąd pobierania wydarzeń:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.put("/events/:id", authenticateToken, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;
  const { title, description, event_date, event_time } = req.body;

  try {
    const [check] = await db
      .promise()
      .query("SELECT * FROM events WHERE id = ? AND user_id = ?", [
        eventId,
        userId,
      ]);

    if (check.length === 0)
      return res.status(404).json({ error: "Wydarzenie nie znalezione" });

    await db
      .promise()
      .query(
        "UPDATE events SET title = ?, description = ?, event_date = ?, event_time = ? WHERE id = ?",
        [title, description, event_date, event_time, eventId]
      );

    res.json({ message: "Wydarzenie zaktualizowane" });
  } catch (err) {
    console.error("❌ Błąd aktualizacji wydarzenia:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

app.delete("/events/:id", authenticateToken, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.user.id;

  try {
    const [check] = await db
      .promise()
      .query("SELECT * FROM events WHERE id = ? AND user_id = ?", [
        eventId,
        userId,
      ]);

    if (check.length === 0)
      return res.status(404).json({ error: "Wydarzenie nie znalezione" });

    await db.promise().query("DELETE FROM events WHERE id = ?", [eventId]);
    res.json({ message: "Wydarzenie usunięte" });
  } catch (err) {
    console.error("❌ Błąd usuwania wydarzenia:", err);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// ========== Start serwera ==========
app.listen(PORT, () => {
  console.log(`✅ Backend działa na http://localhost:${PORT}`);
});
