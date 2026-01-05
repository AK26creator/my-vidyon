-- =====================================================
-- My-Vidyon ERP Sample/Demo Data
-- PostgreSQL 16+
-- Run this AFTER init-schema.sql
-- =====================================================

-- =====================================================
-- 1. CREATE DEMO INSTITUTION
-- =====================================================
INSERT INTO institutions (id, name, type, status, address, city, state, contact_email, contact_phone, academic_year, subscription_status)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 'Demo High School', 'CBSE', 'Active', '123 Education Street', 'Mumbai', 'Maharashtra', 'admin@demohighschool.edu', '+91-9876543210', '2025-2026', 'active');

-- =====================================================
-- 2. CREATE DEPARTMENTS/GROUPS
-- =====================================================
INSERT INTO departments (id, institution_id, name, description)
VALUES
    ('223e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Grade 10', 'Secondary level - Grade 10'),
    ('223e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', 'Grade 9', 'Secondary level - Grade 9');

-- =====================================================
-- 3. CREATE CLASSES
-- =====================================================
INSERT INTO classes (id, institution_id, department_id, name, section, academic_year)
VALUES
    ('323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', 'Class 10-A', 'A', '2025-2026'),
    ('323e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174002', 'Class 9-A', 'A', '2025-2026');

-- =====================================================
-- 4. CREATE DEMO USERS (Cognito IDs will be updated when real users sign up)
-- =====================================================

-- Super Admin
INSERT INTO users (id, cognito_user_id, email, name, role, is_active)
VALUES ('423e4567-e89b-12d3-a456-426614174000', 'cognito-admin-001', 'admin@myvidyon.com', 'System Administrator', 'admin', TRUE);

-- Institution Admin
INSERT INTO users (id, cognito_user_id, email, name, role, institution_id, is_active)
VALUES ('423e4567-e89b-12d3-a456-426614174001', 'cognito-inst-001', 'admin@demohighschool.edu', 'Prof. Michael Chen', 'institution', '123e4567-e89b-12d3-a456-426614174000', TRUE);

-- Faculty Member 1
INSERT INTO users (id, cognito_user_id, email, name, role, institution_id, department_id, phone_number, gender, is_active)
VALUES ('423e4567-e89b-12d3-a456-426614174002', 'cognito-faculty-001', 'faculty@demo.edu', 'Pradeep Kumar', 'faculty', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', '+91-9876543211', 'Male', TRUE);

-- Student 1
INSERT INTO users (id, cognito_user_id, email, name, role, institution_id, department_id, date_of_birth, gender, address, is_active)
VALUES ('423e4567-e89b-12d3-a456-426614174003', 'cognito-student-001', 'student@demo.edu', 'Gopal Krishna', 'student', '123e4567-e89b-12d3-a456-426614174000', '223e4567-e89b-12d3-a456-426614174001', '2008-05-15', 'Male', 'Mumbai, Maharashtra', TRUE);

-- Parent 1
INSERT INTO users (id, cognito_user_id, email, name, role, institution_id, phone_number, gender, is_active)
VALUES ('423e4567-e89b-12d3-a456-426614174004', 'cognito-parent-001', 'parent@gmail.com', 'Mr. Krishnamoorthy', 'parent', '123e4567-e89b-12d3-a456-426614174000', '+91-9876543212', 'Male', TRUE);

-- =====================================================
-- 5. LINK PARENT TO STUDENT
-- =====================================================
INSERT INTO parent_student_relations (parent_id, student_id, relation)
VALUES ('423e4567-e89b-12d3-a456-426614174004', '423e4567-e89b-12d3-a456-426614174003', 'Father');

-- =====================================================
-- 6. CREATE SUBJECTS
-- =====================================================
INSERT INTO subjects (id, institution_id, class_id, name, code, description, credits)
VALUES
    ('523e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174001', 'Mathematics', 'MATH10A', 'Advanced Mathematics for Grade 10', 5),
    ('523e4567-e89b-12d3-a456-426614174002', '123e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174001', 'Chemistry', 'CHEM10A', 'Chemistry for Grade 10', 5),
    ('523e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', '323e4567-e89b-12d3-a456-426614174001', 'English', 'ENG10A', 'English Literature', 4);

-- =====================================================
-- 7. ENROLL STUDENT IN SUBJECTS
-- =====================================================
INSERT INTO enrollments (student_id, subject_id, class_id, institution_id, status)
VALUES
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'active'),
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174002', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'active'),
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174003', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'active');

-- =====================================================
-- 8. ASSIGN FACULTY TO SUBJECTS
-- =====================================================
INSERT INTO faculty_assignments (faculty_id, subject_id, class_id, institution_id, academic_year)
VALUES
    ('423e4567-e89b-12d3-a456-426614174002', '523e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', '2025-2026'),
    ('423e4567-e89b-12d3-a456-426614174002', '523e4567-e89b-12d3-a456-426614174002', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', '2025-2026');

-- =====================================================
-- 9. CREATE SAMPLE ATTENDANCE RECORDS
-- =====================================================
INSERT INTO attendance (student_id, subject_id, class_id, institution_id, attendance_date, status, marked_by)
VALUES
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE - INTERVAL '1 day', 'present', '423e4567-e89b-12d3-a456-426614174002'),
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174002', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE - INTERVAL '1 day', 'present', '423e4567-e89b-12d3-a456-426614174002'),
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE - INTERVAL '2 days', 'present', '423e4567-e89b-12d3-a456-426614174002');

-- =====================================================
-- 10. CREATE SAMPLE ASSIGNMENT
-- =====================================================
INSERT INTO assignments (id, subject_id, class_id, institution_id, faculty_id, title, description, due_date, total_marks)
VALUES 
    ('623e4567-e89b-12d3-a456-426614174001', '523e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174002', 'Algebra Homework', 'Complete exercises 1-10 from Chapter 5', CURRENT_TIMESTAMP + INTERVAL '7 days', 100);

-- =====================================================
-- 11. CREATE SAMPLE GRADES
-- =====================================================
INSERT INTO grades (student_id, subject_id, class_id, institution_id, exam_type, exam_date, marks_obtained, total_marks, percentage, grade)
VALUES
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174001', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Unit Test', CURRENT_DATE - INTERVAL '15 days', 85, 100, 85.00, 'A'),
    ('423e4567-e89b-12d3-a456-426614174003', '523e4567-e89b-12d3-a456-426614174002', '323e4567-e89b-12d3-a456-426614174001', '123e4567-e89b-12d3-a456-426614174000', 'Quiz', CURRENT_DATE - INTERVAL '10 days', 18, 20, 90.00, 'A+');

-- =====================================================
-- 12. CREATE SAMPLE ANNOUNCEMENT
-- =====================================================
INSERT INTO announcements (institution_id, posted_by, title, content, target_audience, priority, is_active)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', '423e4567-e89b-12d3-a456-426614174001', 'Welcome to Academic Year 2025-26', 'We are excited to begin the new academic year. All students must complete registration by January 15th.', 'all', 'high', TRUE);

-- =====================================================
-- 13. CREATE SAMPLE NOTIFICATION
-- =====================================================
INSERT INTO notifications (user_id, institution_id, title, message, type, is_read)
VALUES 
    ('423e4567-e89b-12d3-a456-426614174003', '123e4567-e89b-12d3-a456-426614174000', 'Assignment Graded', 'Your Shakespeare Essay has been graded. You scored 95/100.', 'success', FALSE);

-- =====================================================
-- Success message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Demo data seeded successfully!';
    RAISE NOTICE 'You can now login with these demo accounts:';
    RAISE NOTICE '  Admin: admin@myvidyon.com';
    RAISE NOTICE '  Institution: admin@demohighschool.edu';
    RAISE NOTICE '  Faculty: faculty@demo.edu';
    RAISE NOTICE '  Student: student@demo.edu';
    RAISE NOTICE '  Parent: parent@gmail.com';
END $$;
