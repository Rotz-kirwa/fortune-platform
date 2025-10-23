-- Create test user for login
INSERT INTO users (name, email, password) VALUES 
('Test User', 'test@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi') 
ON CONFLICT (email) DO NOTHING;

-- Verify user was created
SELECT id, name, email FROM users WHERE email = 'test@example.com';