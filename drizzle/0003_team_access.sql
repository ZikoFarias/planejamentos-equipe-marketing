INSERT INTO marketing_members (email, role, persona) VALUES
  ('marketingluke09@gmail.com', 'editor', 'lucio'),
  ('marketingluke06@gmail.com', 'editor', 'farias'),
  ('marketingluke02@gmail.com', 'editor', 'luiz'),
  ('marketingluke24@gmail.com', 'editor', 'mateus')
ON CONFLICT(email) DO UPDATE SET
  role = CASE WHEN marketing_members.role = 'administrador' THEN 'administrador' ELSE excluded.role END,
  persona = excluded.persona;
