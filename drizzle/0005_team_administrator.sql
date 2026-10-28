INSERT INTO marketing_members(email,role,persona) VALUES('ezequiel2303f@gmail.com','administrador','farias') ON CONFLICT(email) DO UPDATE SET role=excluded.role,persona=excluded.persona;
