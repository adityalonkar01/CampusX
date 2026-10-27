-- CampusX College Management System
-- Clean seed: creates only standard roles and permissions.
-- No default users, passwords, sample students, faculty, classes, or academic records are inserted.

USE college_management_system;

INSERT INTO roles (role_key, role_name, description) VALUES
('SUPER_ADMIN', 'Super Admin / Institute Director', 'Director-level institutional governance, monitoring, reports and audit visibility.'),
('INSTITUTE_ADMIN', 'Institute Admin', 'Institutional master-record authority for students, faculty and academic structure.'),
('FACULTY_ADMIN', 'Faculty Administration', 'Operational management of faculty, lectures, timetable and faculty services.'),
('CR_ADMIN', 'Class Representative Admin', 'Class representative coordination portal.'),
('COUNCIL_ADMIN', 'Student Council Admin', 'Student council events, activities and engagement portal.'),
('CRC_ADMIN', 'Corporate Resource Cell', 'Placement, recruiter outreach and campus drive coordination portal.'),
('STUDENT_USER', 'Student Portal User', 'Approved student self-service portal account.')
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name), description = VALUES(description), updated_at = NOW();

INSERT INTO permissions (permission_key, description) VALUES
('student.create', 'Create student master records.'),
('student.read', 'Read student records.'),
('student.operational_update', 'Update permitted operational student fields.'),
('student.document_review', 'Review student document workflow state.'),
('student.request_manage', 'Manage student operational requests.'),
('faculty.create', 'Create faculty master records.'),
('faculty.read', 'Read faculty records.'),
('faculty.operational_update', 'Update permitted operational faculty fields.'),
('faculty.schedule_manage', 'Manage timetable and lecture information.'),
('faculty.resource_manage', 'Manage faculty teaching resources.'),
('course.create', 'Create course master records.'),
('program.create', 'Create program master records.'),
('department.create', 'Create department master records.'),
('subject.create', 'Create subject master records.'),
('class.create', 'Create class and division structure.'),
('audit.view', 'View activity and audit logs.')
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = NOW();
