-- CampusX role catalog only.
-- Sample departments, divisions, academic years, programs, courses, subjects,
-- classes, students and faculty have been removed. Add real institutional data
-- through the authorized administration workflows after setup.
insert into public.system_roles (role_key, role_name, description, role_category) values
('SUPER_ADMIN', 'Super Admin / Director', 'Institute Director with oversight, audit visibility and admin approval authority.', 'ADMIN'),
('INSTITUTE_ADMIN', 'Institute Admin', 'Institutional master-data administrator for students, faculty and academics.', 'ADMIN'),
('STUDENT_ADMIN', 'Student Administration', 'Administrative staff role for existing student operations and reports.', 'ADMIN'),
('FACULTY_ADMIN', 'Faculty Administration', 'Administrative staff role for faculty operations and teaching workflows.', 'ADMIN'),
('CR_ADMIN', 'Class Representative Administration', 'Role for class representative coordination.', 'ADMIN'),
('COUNCIL_ADMIN', 'Student Council Administration', 'Role for student council events, activities and initiatives.', 'ADMIN'),
('CRC_ADMIN', 'Corporate Resource Cell', 'Role for industry relations, placements and recruiter coordination.', 'ADMIN'),
('STUDENT_USER', 'Student Portal User', 'Individual student role for Student Portal access to own records.', 'STUDENT')
on conflict (role_key) do update set role_name = excluded.role_name, description = excluded.description, role_category = excluded.role_category;
