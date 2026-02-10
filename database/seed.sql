-- Seed data for development (Initial admin user)
-- Password: Admin@123 (hashed with bcrypt)

INSERT INTO users (name, email, password_hash, role, department, position)
VALUES 
    ('Admin User', 'admin@example.com', '$2a$10$rGQZH.XxGVQxGd7JQqZRVOqWy0ZqYZ9qHqLqZfP3YxK8vXZqZfP3Y', 'admin', 'Management', 'System Administrator')
ON CONFLICT (email) DO NOTHING;

-- Note: You'll need to update the password_hash with an actual bcrypt hash
-- The hash shown above is a placeholder. Run the application's register endpoint
-- or use a bcrypt tool to generate the proper hash for 'Admin@123'
