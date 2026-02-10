// Sample data seeder for testing dashboard charts
// Run this in your development database to populate chart data

INSERT INTO users (id, name, email, role, department, position, password, created_at, updated_at) VALUES
('test-admin-1', 'Test Admin', 'admin@test.com', 'admin', 'Management', 'Director', '$2b$10$hash', NOW(), NOW()),
('test-manager-1', 'Test Manager', 'manager@test.com', 'manager', 'Engineering', 'Team Lead', '$2b$10$hash', NOW(), NOW()),
('test-emp-1', 'John Employee', 'john@test.com', 'employee', 'Engineering', 'Developer', '$2b$10$hash', NOW(), NOW()),
('test-emp-2', 'Jane Employee', 'jane@test.com', 'employee', 'Marketing', 'Designer', '$2b$10$hash', NOW(), NOW());

INSERT INTO appraisal_template (id, title, description, period, status, goals, created_by, created_at, updated_at) VALUES
('tmpl-1', 'Q1 2024 Performance Review', 'Quarterly review for first quarter', '2024-Q1', 'published', 
 '[{"id":"g1","title":"Code Quality","description":"Improve code quality metrics","weight":30},
   {"id":"g2","title":"Team Collaboration","description":"Enhance team collaboration","weight":25},
   {"id":"g3","title":"Project Delivery","description":"Meet project deadlines","weight":45}]', 'test-admin-1', NOW(), NOW()),
('tmpl-2', 'Q2 2024 Performance Review', 'Quarterly review for second quarter', '2024-Q2', 'published',
 '[{"id":"g1","title":"Innovation","description":"Implement new ideas","weight":40},
   {"id":"g2","title":"Leadership","description":"Show leadership qualities","weight":35},
   {"id":"g3","title":"Results","description":"Achieve business results","weight":25}]', 'test-manager-1', NOW(), NOW());

INSERT INTO appraisal_submission (id, template_id, employee_id, employee_name, employee_email, status, goals_responses, overall_comment, submitted_at, created_at, updated_at) VALUES
('sub-1', 'tmpl-1', 'test-emp-1', 'John Employee', 'john@test.com', 'reviewed',
 '[{"goalId":"g1","response":"Implemented ESLint and improved test coverage","score":85},
   {"goalId":"g2","response":"Led sprint planning and code reviews","score":78},
   {"goalId":"g3","response":"Delivered all Q1 features on time","score":92}]',
 'Strong performance across all goals', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW()),
('sub-2', 'tmpl-1', 'test-emp-2', 'Jane Employee', 'jane@test.com', 'submitted',
 '[{"goalId":"g1","response":"Created comprehensive design system","score":88},
   {"goalId":"g2","response":"Collaborated with engineering on UX","score":82},
   {"goalId":"g3","response":"Delivered marketing campaigns on schedule","score":89}]',
 'Excellent work on design initiatives', NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 days', NOW());

INSERT INTO appraisal_review (id, submission_id, reviewer_id, reviewer_email, overall_score, goal_scores, feedback, status, reviewed_at, created_at, updated_at) VALUES
('rev-1', 'sub-1', 'test-manager-1', 'manager@test.com', 85,
 '[{"goalId":"g1","score":85,"feedback":"Good progress on code quality"},
   {"goalId":"g2","score":78,"feedback":"Strong collaboration skills"},
   {"goalId":"g3","score":92,"feedback":"Excellent delivery record"}]',
 'Outstanding performance this quarter. Keep up the great work!', 'completed',
 NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW());