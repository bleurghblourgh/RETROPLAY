-- RETROPLAY Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    userId INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastLogin TIMESTAMP,
    profilePicture TEXT,
    themePreference TEXT DEFAULT 'synthwave'
);

-- Songs table
CREATE TABLE IF NOT EXISTS songs (
    songId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    filePath TEXT NOT NULL,
    title TEXT,
    artist TEXT,
    album TEXT,
    genre TEXT,
    duration INTEGER,
    bpm INTEGER,
    mood TEXT,
    playCount INTEGER DEFAULT 0,
    lastPlayed TIMESTAMP,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    albumArt TEXT,
    FOREIGN KEY (userId) REFERENCES users(userId)
);

-- Playlists table
CREATE TABLE IF NOT EXISTS playlists (
    playlistId INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    playlistName TEXT NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isAiGenerated BOOLEAN DEFAULT 0,
    coverImage TEXT,
    FOREIGN KEY (userId) REFERENCES users(userId)
);

-- Playlist songs junction table
CREATE TABLE IF NOT EXISTS playlistSongs (
    playlistId INTEGER,
    songId INTEGER,
    position INTEGER,
    addedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (playlistId, songId),
    FOREIGN KEY (playlistId) REFERENCES playlists(playlistId),
    FOREIGN KEY (songId) REFERENCES songs(songId)
);

-- User settings table
CREATE TABLE IF NOT EXISTS userSettings (
    userId INTEGER PRIMARY KEY,
    volumeLevel REAL DEFAULT 0.7,
    visualizerEnabled BOOLEAN DEFAULT 1,
    particleEffects BOOLEAN DEFAULT 1,
    diskAnimationSpeed REAL DEFAULT 1.0,
    autoPlayNext BOOLEAN DEFAULT 1,
    FOREIGN KEY (userId) REFERENCES users(userId)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_userId ON songs(userId);
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_album ON songs(album);
CREATE INDEX IF NOT EXISTS idx_playlists_userId ON playlists(userId);
CREATE INDEX IF NOT EXISTS idx_playlistSongs_playlistId ON playlistSongs(playlistId);
