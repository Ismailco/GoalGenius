-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    createdAt TEXT,
    updatedAt TEXT
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    timeFrame TEXT NOT NULL,
    status TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
    id TEXT PRIMARY KEY,
    userId TEXT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    createdAt TEXT,
    updatedAt TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
);
