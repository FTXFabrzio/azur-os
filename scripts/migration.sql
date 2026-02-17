-- 1. Usuarios (Sin cambios significativos, agregamos avatar para la PWA)
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT CHECK(role IN ('CEO', 'ARCHITECT', 'COMMERCIAL', 'ADMIN')) NOT NULL,
    phone TEXT,
    is_available_early INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Disponibilidad (Agregamos UNIQUE para evitar reglas duplicadas)
CREATE TABLE availability_rules (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    day_of_week INTEGER CHECK(day_of_week BETWEEN 1 AND 7), 
    start_time TEXT NOT NULL, -- "HH:MM"
    end_time TEXT NOT NULL,   -- "HH:MM"
    UNIQUE(user_id, day_of_week, start_time)
);

-- 3. Reuniones
CREATE TABLE meetings (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    address TEXT NOT NULL,
    description TEXT, -- Para poner qué tipo de cocina o detalles
    start_datetime DATETIME NOT NULL,
    end_datetime DATETIME NOT NULL,
    status TEXT CHECK(status IN ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')) DEFAULT 'PENDING',
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Participantes y Confirmaciones (Relación Muchos a Muchos)
-- Aquí registras quiénes DEBEN ir y si ya aceptaron.
CREATE TABLE meeting_participants (
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    status TEXT CHECK(status IN ('WAITING', 'ACCEPTED', 'REJECTED')) DEFAULT 'WAITING',
    notified_at DATETIME, -- Para saber cuándo les llegó la alerta al celular
    PRIMARY KEY (meeting_id, user_id)
);

-- 5. Chat (Agregamos tipo de mensaje por si luego envían fotos)
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    meeting_id TEXT REFERENCES meetings(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text', -- 'text', 'image', 'system'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);