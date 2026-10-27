
/* CampusX Student Portal — frontend-only demo workflow.
 * Prompt 13 note: Student Portal registration should use Supabase Auth.
 * The older sessionStorage registration fallback is retained only when Supabase is not configured.
 */
(() => {
  "use strict";

  const REQUEST_KEY = "cmsStudentRegistrationRequests";
  const ACCOUNT_KEY = "cmsApprovedStudentAccounts";
  const CURRENT_STUDENT_KEY = "cmsCurrentStudentAccount";
  const PORTAL_REQUEST_KEY = "cmsStudentPortalRequests";
  const STUDENT_KEY = "campusx-prompt10-students-v2";

  const core = window.CampusXDashboard;
  const page = document.body.dataset.dashboardPage || "dashboard";
  const main = document.querySelector("#main-content");
  const isRegister = document.body.dataset.studentPortalRegister === "true";

  function escapeHtml(value) {
    if (core?.escapeHtml) return core.escapeHtml(value);
    return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function icon(name) {
    return core?.icon ? core.icon(name) : "";
  }

  function toast(message, type = "info") {
    if (core?.showToast) core.showToast(message, type);
  }

  function read(key, fallback) {
    try {
      const raw = window.sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function statusClass(status) {
    return `student-status-pill student-status-${String(status || "").toLowerCase().replace(/\s+/g, "-")}`;
  }

  function fullName(record) {
    return [record.firstName, record.middleName, record.lastName].filter(Boolean).join(" ").trim() || record.name || "Student";
  }

  function registrationRequests() {
    return read(REQUEST_KEY, []);
  }

  function students() {
    const stored = read(STUDENT_KEY, []);
    return Array.isArray(stored) ? stored : [];
  }

  function saveStudents(list) {
    write(STUDENT_KEY, list);
  }

  function currentAccount() {
    return read(CURRENT_STUDENT_KEY, null);
  }

  function currentStudent() {
    const account = currentAccount();
    if (!account) return null;
    const found = students().find(item => item.id === account.studentId || item.admissionNo === account.admissionNo);
    return found || {
      id: account.studentId,
      admissionNo: account.admissionNo,
      name: account.name,
      firstName: account.name?.split(" ")[0] || "Student",
      lastName: account.name?.split(" ").slice(1).join(" ") || "User",
      email: account.email,
      phone: "Not updated",
      alternatePhone: "Not updated",
      program: account.program || "Pending Master Update",
      department: account.department || "Pending Master Update",
      semester: account.semester || "Pending",
      division: account.division || "Pending",
      academicYear: account.academicYear || "Pending",
      admissionDate: "Institute record",
      enrollmentType: "Institute record",
      attendance: 88,
      cgpa: 8.1,
      backlogs: 0,
      status: account.status || "Approved",
      guardian: { name: "Not updated", relationship: "Guardian", phone: "Not updated", email: "Not updated" },
      currentAddress: { line: "Not updated" },
      permanentAddress: { line: "Institute record" },
      documentsStatus: "Pending"
    };
  }

  function pageHeader(title, description, actions = "") {
    return `<div class="page-heading"><div><span class="eyebrow">STUDENT PORTAL · FRONTEND DEMO</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div><div class="page-actions">${actions}</div></div>`;
  }

  function demoNotice(text = "Student Portal is a frontend-only prototype. Supabase Auth, RLS and Edge Functions are the active backend path for authentication and authorization.") {
    return `<div class="dashboard-notice"><span>${icon("info")}</span><div><strong>Demo Mode Notice</strong><p>${escapeHtml(text)}</p></div></div>`;
  }

  function requireStudent() {
    const account = currentAccount();
    const student = currentStudent();
    if (!account || !student) {
      main.innerHTML = pageHeader("Student Portal Access Required", "Register and get Institute Admin approval before using the Student Portal.", `<a class="btn btn-primary" href="register.html">Register</a><a class="btn btn-secondary" href="../login.html">Login</a>`) + demoNotice() + `<section class="card"><h2>No approved demo student account selected</h2><p>Submit a registration request, approve it from Institute Admin → Student Registration Approvals, then login through the Student Portal option.</p></section>`;
      return null;
    }
    return student;
  }

  const subjects = [
    { id: "SUB101", name: "Java", internal: 24, external: 58, total: 82, grade: "A", attendance: 91 },
    { id: "SUB102", name: "Database Management", internal: 22, external: 55, total: 77, grade: "B+", attendance: 88 },
    { id: "SUB103", name: "Web Development", internal: 25, external: 60, total: 85, grade: "A", attendance: 94 },
    { id: "SUB104", name: "Data Structures", internal: 21, external: 52, total: 73, grade: "B+", attendance: 84 },
    { id: "SUB105", name: "Computer Networks", internal: 23, external: 54, total: 77, grade: "B+", attendance: 86 }
  ];

  const documents = ["Admission Form", "ID Proof", "Previous Marksheet", "Transfer Certificate", "Migration Certificate", "Caste Certificate", "Domicile Certificate", "Fee Receipt"].map((name, index) => ({ id: `DOC${index + 1}`, name, status: index < 4 ? "Verified" : index < 6 ? "Submitted" : "Pending", lastUpdated: index < 4 ? "2026-09-10" : "2026-09-14" }));
  const notices = ["Internal examination timetable published", "Document verification window open", "Library orientation scheduled", "Scholarship form submission reminder"];
  const announcements = ["Welcome to the Student Portal prototype", "Campus placement orientation this week", "Academic mentoring schedule released"];
  const notifications = ["Attendance summary updated", "One document is pending", "New notice available", "Request tracking is now visible"];

  function table(columns, rows, empty = "No records found.") {
    return `<div class="table-wrap"><table><thead><tr>${columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join("")}</tr></thead><tbody>${rows.length ? rows.map(row => `<tr>${columns.map(c => `<td>${c.render ? c.render(row) : escapeHtml(row[c.key])}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${columns.length}">${escapeHtml(empty)}</td></tr>`}</tbody></table></div>`;
  }

  function studentRequests() {
    const student = currentStudent();
    const all = read(PORTAL_REQUEST_KEY, []);
    return all.filter(item => item.studentId === student?.id);
  }

  function dashboard() {
    const student = requireStudent();
    if (!student) return;
    const requests = studentRequests();
    main.innerHTML = pageHeader("Student Dashboard", "View your academic information, attendance, documents, notices and student service requests.", `<a class="btn btn-primary" href="submit-request.html">Submit Request</a>`) + demoNotice() +
      `<section class="student-summary-grid">
        ${[["Student Name", fullName(student)], ["Student ID", student.id], ["Program", student.program], ["Semester", student.semester], ["Division", student.division], ["Academic Year", student.academicYear], ["Account Status", student.status || "Approved"]].map(item => `<article class="student-summary-card"><span>${escapeHtml(item[0])}</span><strong>${escapeHtml(item[1])}</strong></article>`).join("")}
      </section><section class="stat-grid">
        ${[["Current CGPA", student.cgpa || "8.1"], ["Attendance Percentage", `${student.attendance || 88}%`], ["Backlogs", student.backlogs || 0], ["Subjects", subjects.length], ["Pending Documents", documents.filter(d => d.status === "Pending").length], ["Open Requests", requests.filter(r => !["Closed", "Rejected"].includes(r.status)).length]].map(item => `<article class="stat-card"><div class="stat-value">${escapeHtml(item[1])}</div><div class="stat-bottom"><strong>${escapeHtml(item[0])}</strong><span>Student Portal</span></div></article>`).join("")}
      </section><section class="dashboard-grid dashboard-grid-two"><article class="card"><div class="section-head"><div><h2>Attendance Overview</h2><p>Subject-wise attendance snapshot.</p></div></div>${table([{key:"name",label:"Subject"},{key:"attendance",label:"Attendance %"},{key:"grade",label:"Current Grade"}], subjects)}</article><article class="card"><div class="section-head"><div><h2>Academic Performance</h2><p>Demo subject marks.</p></div></div>${table([{key:"name",label:"Subject"},{key:"internal",label:"Internal"},{key:"external",label:"External"},{key:"total",label:"Total"},{key:"grade",label:"Grade"}], subjects)}</article></section>
      <section class="dashboard-grid dashboard-grid-two"><article class="card"><h2>Latest Notices</h2>${notices.slice(0,3).map(item => `<div class="notice-item notice-info"><span>${icon("notice")}</span><div><strong>${escapeHtml(item)}</strong><small>Student communication</small></div></div>`).join("")}</article><article class="card"><h2>Documents</h2>${table([{key:"name",label:"Document"},{key:"status",label:"Status",render:r=>`<span class="${statusClass(r.status)}">${escapeHtml(r.status)}</span>`}], documents.slice(0,5))}</article></section>`;
  }

  function profile() {
    const student = requireStudent();
    if (!student) return;
    const guardian = student.guardian || {};
    const currentAddress = typeof student.currentAddress === "object" ? student.currentAddress.line : student.currentAddress;
    main.innerHTML = pageHeader("My Profile", "View institutional profile data and update permitted self-service fields.") + demoNotice("Protected academic and enrollment fields are owned by Institute Administration. Student Portal users can update only limited self-service contact fields in this demo.") +
      `<section class="card"><div class="section-head"><div><h2>Master Record Owner: Institute Administration</h2><p>Student ID, admission number, program, department, semester, division, academic year, admission date and enrollment type are read-only here.</p></div></div><div class="student-portal-grid">
        ${[["Student ID", student.id], ["Admission Number", student.admissionNo], ["Program", student.program], ["Department", student.department], ["Semester", student.semester], ["Division", student.division], ["Academic Year", student.academicYear], ["Admission Date", student.admissionDate || "Institute record"], ["Enrollment Type", student.enrollmentType || "Institute record"]].map(item => `<article class="student-info-card"><span>${escapeHtml(item[0])} <em class="student-readonly-badge">Read Only</em></span><strong>${escapeHtml(item[1])}</strong></article>`).join("")}
      </div></section><section class="card"><h2>Self-Service Contact Update</h2><form id="student-profile-form" class="portal-form-grid"><label>Phone<input name="phone" value="${escapeHtml(student.phone || "")}"></label><label>Alternate Phone<input name="alternatePhone" value="${escapeHtml(student.alternatePhone || "")}"></label><label>Guardian Contact<input name="guardianPhone" value="${escapeHtml(guardian.phone || "")}"></label><label class="full">Current Address<textarea name="currentAddress">${escapeHtml(currentAddress || "")}</textarea></label><div class="student-self-service-actions full"><button class="btn btn-primary" type="submit">Save Demo Update</button></div></form></section>`;
    document.getElementById("student-profile-form")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const list = students();
      const index = list.findIndex(item => item.id === student.id);
      const updated = { ...student, phone: form.get("phone"), alternatePhone: form.get("alternatePhone"), currentAddress: { ...(student.currentAddress || {}), line: form.get("currentAddress") }, guardian: { ...(student.guardian || {}), phone: form.get("guardianPhone") } };
      if (index >= 0) {
        list[index] = { ...list[index], ...updated };
        saveStudents(list);
      }
      toast("Limited student profile fields updated in demo mode.", "success");
      profile();
    });
  }

  function attendance() {
    const student = requireStudent();
    if (!student) return;
    main.innerHTML = pageHeader("Attendance", "View subject-wise attendance summary.") + demoNotice() + `<section class="card">${table([{key:"id",label:"Subject Code"},{key:"name",label:"Subject"},{key:"attendance",label:"Attendance %",render:r=>`${escapeHtml(r.attendance)}%`},{key:"grade",label:"Current Grade"}], subjects)}</section>`;
  }

  function academics() {
    const student = requireStudent();
    if (!student) return;
    main.innerHTML = pageHeader("Academic Performance", "View demo marks, grades and CGPA summary.") + demoNotice() + `<section class="card"><div class="student-summary-grid"><article class="student-summary-card"><span>CGPA</span><strong>${escapeHtml(student.cgpa || "8.1")}</strong></article><article class="student-summary-card"><span>Backlogs</span><strong>${escapeHtml(student.backlogs || 0)}</strong></article><article class="student-summary-card"><span>Result Status</span><strong>Pass</strong></article></div>${table([{key:"id",label:"Subject Code"},{key:"name",label:"Subject"},{key:"internal",label:"Internal"},{key:"external",label:"External"},{key:"total",label:"Total"},{key:"grade",label:"Grade"}], subjects)}</section>`;
  }

  function subjectsPage() {
    requireStudent();
    main.innerHTML = pageHeader("Subjects", "View your assigned subjects for the current academic term.") + demoNotice() + `<section class="card">${table([{key:"id",label:"Subject Code"},{key:"name",label:"Subject"},{key:"grade",label:"Current Grade"},{key:"attendance",label:"Attendance %"}], subjects)}</section>`;
  }

  function documentsPage() {
    requireStudent();
    main.innerHTML = pageHeader("My Documents", "View document submission and verification status.") + demoNotice("Students cannot verify or approve documents. Document verification remains an admin workflow.") + `<section class="card">${table([{key:"name",label:"Document"},{key:"status",label:"Status",render:r=>`<span class="${statusClass(r.status)}">${escapeHtml(r.status)}</span>`},{key:"lastUpdated",label:"Last Updated"}], documents)}</section>`;
  }

  function communicationPage(kind) {
    requireStudent();
    const source = kind === "announcements" ? announcements : kind === "notifications" ? notifications : notices;
    const title = kind.charAt(0).toUpperCase() + kind.slice(1).replace("-", " ");
    main.innerHTML = pageHeader(title, `View ${title.toLowerCase()} relevant to your student account.`) + demoNotice() + `<section class="card">${source.map(item => `<div class="notice-item notice-info"><span>${icon(kind === "notifications" ? "bell" : "notice")}</span><div><strong>${escapeHtml(item)}</strong><small>Student Portal communication</small></div></div>`).join("")}</section>`;
  }

  function renderRequests(showForm = false) {
    const student = requireStudent();
    if (!student) return;
    const rows = studentRequests();
    main.innerHTML = pageHeader(showForm ? "Submit Request" : "My Requests", "Submit and track student service requests in demo mode.", showForm ? `<a class="btn btn-secondary" href="requests.html">View Requests</a>` : `<a class="btn btn-primary" href="submit-request.html">Submit Request</a>`) + demoNotice("Student requests are stored only in this browser session. Student Administration workflow can review these later when connected.") +
      `${showForm ? `<section class="card"><form id="student-request-form" class="student-request-form"><label>Request Type<select name="type" required><option value="">Select Request Type</option><option>Bonafide Certificate Request</option><option>ID Card Issue</option><option>Document Correction Request</option><option>Leave Request</option><option>General Query</option><option>Profile Update Request</option></select></label><label>Description<textarea name="description" required placeholder="Describe your request"></textarea></label><button class="btn btn-primary" type="submit">Submit Request</button></form></section>` : ""}
      <section class="card"><h2>Request History</h2>${table([{key:"id",label:"Request ID"},{key:"type",label:"Request Type"},{key:"description",label:"Description"},{key:"submittedDate",label:"Submitted Date"},{key:"status",label:"Status",render:r=>`<span class="${statusClass(r.status)}">${escapeHtml(r.status)}</span>`},{key:"lastUpdated",label:"Last Updated"}], rows, "No student requests submitted yet.")}</section>`;
    document.getElementById("student-request-form")?.addEventListener("submit", event => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const all = read(PORTAL_REQUEST_KEY, []);
      const next = { id: `REQ${String(all.length + 1).padStart(4, "0")}`, studentId: student.id, type: form.get("type"), description: form.get("description"), submittedDate: new Date().toISOString().slice(0, 10), status: "Submitted", lastUpdated: new Date().toISOString().slice(0, 10) };
      all.unshift(next);
      write(PORTAL_REQUEST_KEY, all);
      toast("Student request submitted in demo mode.", "success");
      renderRequests(false);
    });
  }

  function settings() {
    requireStudent();
    main.innerHTML = pageHeader("Settings", "Student Portal preferences and account information.") + demoNotice() + `<section class="card"><h2>Account Settings</h2><p>This demo page is prepared for future password change, notification preferences and secure session management.</p><p class="master-note">Production settings are controlled through Supabase Auth and RLS policies.</p></section>`;
  }


  async function tryBackendStudentRegistration(form) {
    if (!window.fetch || window.location.protocol === "file:") return { handled: false };
    try {
      const response = await fetch("../backend/student-accounts/register.php", {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
        headers: { "Accept": "application/json" }
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return { handled: false };
      const data = await response.json();
      return { handled: true, ok: Boolean(data.success), message: data.message || (data.success ? "Registration request submitted." : "Registration failed.") };
    } catch (error) {
      return { handled: false };
    }
  }

  function handleRegister() {
    const form = document.getElementById("student-register-form");
    const status = document.getElementById("student-register-status");
    if (!form || !status) return;
    const setStatus = (message, type) => {
      status.hidden = false;
      status.className = `student-register-status ${type}`;
      status.textContent = message;
    };
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const errors = [];
      const required = ["studentId", "admissionNo", "firstName", "lastName", "dob", "gender", "email", "phone", "username", "password", "confirmPassword"];
      required.forEach(key => { if (!String(data[key] || "").trim()) errors.push(`${key} is required.`); });
      if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.push("Valid email required.");
      if (data.username && !/^\S+@\S+\.\S+$/.test(data.username)) errors.push("Valid username/email required.");
      if (data.phone && !/^\d{10}$/.test(String(data.phone).replace(/\D/g, ""))) errors.push("Phone must contain 10 digits.");
      if (data.password !== data.confirmPassword) errors.push("Confirm password must match.");
      if (!form.elements.declaration.checked) errors.push("Declaration checkbox must be checked.");
      const existing = registrationRequests().find(item => [item.studentId, item.admissionNo, item.email, item.username].some(value => String(value || "").toLowerCase() && [data.studentId, data.admissionNo, data.email, data.username].map(x => String(x || "").toLowerCase()).includes(String(value || "").toLowerCase())) && item.status !== "Rejected");
      if (existing) errors.push("A pending or approved registration request already exists for this student/email.");
      if (errors.length) {
        setStatus(errors[0], "error");
        return;
      }
      if (window.CampusXStudentRegistration?.submitStudentRegistration) {
        const supabaseResult = await window.CampusXStudentRegistration.submitStudentRegistration(form);
        if (supabaseResult.handled) {
          setStatus(supabaseResult.message, supabaseResult.ok ? "success" : "error");
          if (supabaseResult.ok) form.reset();
          return;
        }
      }

      const backendResult = await tryBackendStudentRegistration(form);
      if (backendResult.handled) {
        setStatus(backendResult.message, backendResult.ok ? "success" : "error");
        if (backendResult.ok) form.reset();
        return;
      }
      const requests = registrationRequests();
      const request = {
        requestId: `SRQ${String(requests.length + 1).padStart(4, "0")}`,
        studentId: data.studentId.trim().toUpperCase(),
        admissionNo: data.admissionNo.trim().toUpperCase(),
        firstName: data.firstName.trim(),
        middleName: data.middleName.trim(),
        lastName: data.lastName.trim(),
        name: [data.firstName, data.middleName, data.lastName].filter(Boolean).join(" "),
        dob: data.dob,
        gender: data.gender,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        username: data.username.trim().toLowerCase(),
        status: "Pending Approval",
        submittedOn: new Date().toISOString().slice(0, 10),
        lastUpdated: new Date().toISOString().slice(0, 10)
      };
      requests.unshift(request);
      write(REQUEST_KEY, requests);
      form.reset();
      setStatus("Offline preview request submitted. Configure Supabase to create a real Student Portal request.", "success");
    });
  }

  if (isRegister) {
    handleRegister();
    return;
  }

  if (!core || !main || document.body.dataset.role !== "STUDENT_USER") return;
  if (page === "dashboard") dashboard();
  else if (page === "profile") profile();
  else if (page === "attendance") attendance();
  else if (page === "academics") academics();
  else if (page === "subjects") subjectsPage();
  else if (page === "documents") documentsPage();
  else if (["notices", "announcements", "notifications"].includes(page)) communicationPage(page);
  else if (page === "requests") renderRequests(false);
  else if (page === "submit-request") renderRequests(true);
  else if (page === "settings") settings();
  else dashboard();
})();
