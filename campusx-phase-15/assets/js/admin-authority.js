/* CampusX Administrative Authority Layer — frontend demo only.
 * Institute Admin owns master-data create/edit/delete in sessionStorage.
 * Super Admin / Director remains read-only oversight.
 */
(() => {
  "use strict";

  const core = window.CampusXDashboard;
  const supportedRoles = ["INSTITUTE_ADMIN", "SUPER_ADMIN"];
  const roleKey = document.body.dataset.role;
  if (!core || !supportedRoles.includes(roleKey)) return;

  const { icon, escapeHtml, showToast, openModal } = core;
  const page = document.body.dataset.dashboardPage || "dashboard";
  const main = document.querySelector("#main-content");
  if (!main) return;

  const STUDENT_KEY = "campusx-prompt10-students-v2";
  const FACULTY_KEY = "campusx-shared-faculty-v1";
  const AUDIT_KEY = "campusx-admin-audit-v1";
  const ACADEMIC_KEY = "campusx-institute-academic-master-v1";
  const STUDENT_REGISTRATION_KEY = "cmsStudentRegistrationRequests";
  const STUDENT_ACCOUNT_KEY = "cmsApprovedStudentAccounts";

  const basePrograms = ["MCA", "MBA", "MCom", "BCA", "BBA", "BCom"];
  const baseDepartments = ["Computer Applications", "Management", "Commerce", "Science"];
  const baseSubjects = ["Java", "Database Management", "Web Development", "Data Structures", "Computer Networks", "Business Analytics", "Financial Accounting", "Operations Research"];
  const baseClasses = ["MCA I-A", "MCA II-A", "MBA I-B", "BCA II-C", "BCom III-A", "MCom I-B"];

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function load(key, fallback) {
    try {
      const raw = window.sessionStorage?.getItem(key);
      return raw ? JSON.parse(raw) : clone(fallback);
    } catch (error) {
      console.warn(`Could not load ${key}`, error);
      return clone(fallback);
    }
  }

  function save(key, value) {
    try {
      window.sessionStorage?.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Could not save ${key}`, error);
      showToast("Demo session storage is unavailable.", "warning");
      return false;
    }
  }

  function buildAcademicFallback() {
    return {
      courses: [
        { id: "CRS1001", code: "MCA", name: "Master of Computer Applications", department: "Computer Applications", duration: "2 Years", capacity: 120, status: "Active", owner: "Institute Administration" },
        { id: "CRS1002", code: "MBA", name: "Master of Business Administration", department: "Management", duration: "2 Years", capacity: 180, status: "Active", owner: "Institute Administration" },
        { id: "CRS1003", code: "BCA", name: "Bachelor of Computer Applications", department: "Computer Applications", duration: "3 Years", capacity: 160, status: "Active", owner: "Institute Administration" }
      ],
      programs: basePrograms.map((name, index) => ({ id: `PRG${String(index + 1).padStart(3, "0")}`, name, department: index < 2 ? baseDepartments[index] : baseDepartments[index % baseDepartments.length], duration: name.startsWith("M") ? "2 Years" : "3 Years", capacity: 120 + index * 20, status: "Active", owner: "Institute Administration" })),
      departments: baseDepartments.map((name, index) => ({ id: `DEP${String(index + 1).padStart(3, "0")}`, code: name.split(" ").map(x => x[0]).join(""), name, head: ["Dr. Ananya Rao", "Prof. Rahul Mehta", "Dr. Neha Patil", "Prof. Amit Joshi"][index], status: "Active", owner: "Institute Administration" })),
      subjects: baseSubjects.map((name, index) => ({ id: `SUB${String(index + 1).padStart(3, "0")}`, code: `SUB${100 + index}`, name, department: baseDepartments[index % baseDepartments.length], credits: 4, semester: ["I", "II", "III", "IV"][index % 4], status: "Active", owner: "Institute Administration" })),
      classes: baseClasses.map((name, index) => ({ id: `CLS${String(index + 1).padStart(3, "0")}`, name, program: name.split(" ")[0], semester: name.includes("II") ? "II" : name.includes("III") ? "III" : "I", division: name.split("-")[1] || "A", academicYear: "2026–27", capacity: 60, status: "Active", owner: "Institute Administration" })),
      academicYears: [
        { id: "AY2026", name: "2026–27", startDate: "2026-06-01", endDate: "2027-05-31", status: "Active", owner: "Institute Administration" },
        { id: "AY2025", name: "2025–26", startDate: "2025-06-01", endDate: "2026-05-31", status: "Closed", owner: "Institute Administration" }
      ]
    };
  }

  function academicStore() {
    const fallback = buildAcademicFallback();
    const data = load(ACADEMIC_KEY, fallback);
    const merged = { ...fallback, ...data };
    Object.keys(fallback).forEach(key => {
      if (!Array.isArray(merged[key]) || !merged[key].length) merged[key] = fallback[key];
    });
    save(ACADEMIC_KEY, merged);
    return merged;
  }

  function saveAcademicStore(data) {
    save(ACADEMIC_KEY, data);
  }

  function programOptions() {
    return academicStore().programs.map(item => item.name || item.code).filter(Boolean);
  }

  function departmentOptions() {
    return academicStore().departments.map(item => item.name).filter(Boolean);
  }

  function subjectOptions() {
    return academicStore().subjects.map(item => item.name).filter(Boolean);
  }

  function classOptions() {
    return academicStore().classes.map(item => item.name).filter(Boolean);
  }

  function makeStudent(index) {
    const program = basePrograms[index % basePrograms.length];
    const department = program === "MCA" || program === "BCA" ? "Computer Applications" : program === "MBA" || program === "BBA" ? "Management" : "Commerce";
    const firstName = ["Aarav", "Priya", "Rohan", "Neha", "Aditya", "Meera", "Kabir", "Ananya"][index % 8];
    const lastName = ["Sharma", "Mehta", "Patil", "Joshi", "Kulkarni", "Rao"][index % 6];
    return {
      id: `STU${1001 + index}`,
      admissionNo: `ADM26${String(201 + index).padStart(4, "0")}`,
      rollNo: String(21 + index).padStart(3, "0"),
      firstName,
      middleName: "",
      lastName,
      name: `${firstName} ${lastName}`,
      dob: `200${(index % 5) + 1}-0${(index % 9) + 1}-1${index % 9}`,
      gender: index % 2 ? "Male" : "Female",
      email: `student${1001 + index}@example.invalid`,
      phone: `98XXXX${String(100 + index).slice(-4)}`,
      alternatePhone: `97XXXX${String(200 + index).slice(-4)}`,
      program,
      department,
      semester: ["I", "II", "III", "IV"][index % 4],
      division: ["A", "B", "C"][index % 3],
      academicYear: "2026–27",
      admissionDate: `2026-06-${String((index % 20) + 1).padStart(2, "0")}`,
      enrollmentType: index % 7 ? "Regular" : "Transfer",
      attendance: 68 + (index * 5) % 31,
      cgpa: Math.round((6 + ((index * 11) % 35) / 10) * 10) / 10,
      backlogs: index % 9 === 0 ? 1 : 0,
      status: index % 8 === 0 ? "On Leave" : "Active",
      guardian: { name: `Guardian ${index + 1}`, relationship: index % 2 ? "Father" : "Mother", phone: `96XXXX${String(300 + index).slice(-4)}`, email: `guardian${index + 1}@example.invalid`, occupation: "Service" },
      currentAddress: { line: `Demo Residence ${index + 1}`, city: "Pune", state: "Maharashtra", postalCode: `4110${String(index).padStart(2, "0")}`, country: "India" },
      permanentAddress: { line: `Permanent Demo Address ${index + 1}`, city: "Aurangabad", state: "Maharashtra", postalCode: `4310${String(index).padStart(2, "0")}`, country: "India" },
      documentsStatus: index % 5 === 0 ? "Pending" : "Verified"
    };
  }

  function makeFaculty(index) {
    return {
      id: `FAC${1001 + index}`,
      name: ["Dr. Ananya Rao", "Prof. Rahul Mehta", "Dr. Neha Patil", "Prof. Amit Joshi", "Dr. Kavita Shah", "Prof. Sameer Kulkarni", "Dr. Riya Deshmukh", "Prof. Nikhil Verma"][index % 8],
      department: baseDepartments[index % baseDepartments.length],
      designation: ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"][index % 4],
      attendance: 83 + (index * 3) % 15,
      workload: ["Normal", "High", "Low"][index % 3],
      hours: 8 + (index * 2) % 13,
      status: index % 9 === 0 ? "On Leave" : "Active",
      email: `faculty${1001 + index}@example.invalid`,
      phone: "9876543210",
      specialization: baseSubjects[index % baseSubjects.length],
      employment: index % 5 ? "Full Time" : "Contract",
      qualification: ["Ph.D.", "M.Tech", "MBA", "M.Com"][index % 4],
      dob: `198${index % 9}-04-12`,
      joiningDate: `202${index % 5}-06-01`,
      experience: 3 + index,
      address: `Faculty demo address ${index + 1}`,
      city: "Pune",
      state: "Maharashtra",
      postalCode: `4110${String(index).padStart(2, "0")}`
    };
  }

  function normalizeStudent(record) {
    const firstName = record.firstName || String(record.name || "").split(" ")[0] || "Student";
    const lastName = record.lastName || String(record.name || "").split(" ").slice(1).join(" ") || "Record";
    return {
      ...record,
      id: String(record.id || "").trim(),
      admissionNo: record.admissionNo || record.admissionNumber || "",
      firstName,
      middleName: record.middleName || "",
      lastName,
      name: record.name || `${firstName} ${lastName}`.trim(),
      guardian: record.guardian || {},
      currentAddress: typeof record.currentAddress === "object" ? record.currentAddress : { line: record.currentAddress || "" },
      permanentAddress: typeof record.permanentAddress === "object" ? record.permanentAddress : { line: record.permanentAddress || "" },
      documentsStatus: record.documentsStatus || "Pending",
      status: record.status || "Active"
    };
  }

  function students() {
    let list = load(STUDENT_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = Array.from({ length: 48 }, (_, index) => makeStudent(index));
      save(STUDENT_KEY, list);
    }
    return list.map(normalizeStudent);
  }

  function saveStudents(list) {
    save(STUDENT_KEY, list.map(normalizeStudent));
  }

  function faculty() {
    let list = load(FACULTY_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = Array.from({ length: 12 }, (_, index) => makeFaculty(index));
      save(FACULTY_KEY, list);
    }
    return list.map(item => ({ ...item, id: String(item.id || "").trim(), status: item.status || "Active", name: item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim() }));
  }

  function saveFaculty(list) {
    save(FACULTY_KEY, list);
  }

  function audits() {
    const fallback = [
      { id: "AUD1001", time: "2026-09-17 09:15", user: "Institute Admin", role: "INSTITUTE_ADMIN", module: "Student Master", action: "VIEW", recordId: "STU1001", details: "Viewed student master record", severity: "Info", status: "Success" },
      { id: "AUD1002", time: "2026-09-17 09:25", user: "Student Admin", role: "STUDENT_ADMIN", module: "Student Operations", action: "REVIEW", recordId: "DOC2001", details: "Reviewed student document workflow", severity: "Info", status: "Success" },
      { id: "AUD1003", time: "2026-09-17 09:40", user: "Faculty Admin", role: "FACULTY_ADMIN", module: "Timetable", action: "UPDATE", recordId: "TT-204", details: "Updated lecture schedule demo record", severity: "Warning", status: "Success" }
    ];
    const list = load(AUDIT_KEY, fallback);
    save(AUDIT_KEY, list);
    return list;
  }

  function addAudit(item) {
    const list = audits();
    list.unshift({
      id: `AUD${String(1000 + list.length + 1).padStart(4, "0")}`,
      time: new Date().toLocaleString(),
      user: roleKey === "INSTITUTE_ADMIN" ? "Institute Admin" : "Super Admin",
      role: roleKey,
      module: item.module,
      action: item.action,
      recordId: item.recordId,
      details: item.details,
      severity: item.severity || "Info",
      status: item.status || "Success"
    });
    save(AUDIT_KEY, list);
  }

  function pageHeader(title, description, actions = "") {
    return `<div class="page-heading"><div><span class="eyebrow">${roleKey === "INSTITUTE_ADMIN" ? "INSTITUTE ADMIN" : "SUPER ADMIN"} · FRONTEND DEMO</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></div><div class="page-actions">${actions}</div></div>`;
  }

  function notice(text = "Frontend-only demo. No backend, database, real permissions, passwords or security tokens are implemented in this phase.") {
    return `<div class="dashboard-notice"><span>${icon("info")}</span><div><strong>Demo Authority Model</strong><p>${escapeHtml(text)}</p></div></div>`;
  }

  function stat(label, value, detail = "Demo aggregate", kind = "neutral", ico = "chart") {
    return `<article class="stat-card stat-${escapeHtml(kind)}"><div class="stat-card-top"><span class="stat-icon">${icon(ico)}</span><span class="stat-kicker">${escapeHtml(detail)}</span></div><div class="stat-value">${escapeHtml(value)}</div><div class="stat-bottom"><strong>${escapeHtml(label)}</strong><span>Frontend demo</span></div></article>`;
  }

  function exportCsv(rows, filename) {
    const output = rows.map(row => row.map(value => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + output], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("CSV exported in demo mode.", "success");
  }

  function flattenRecord(record) {
    const rows = [];
    Object.entries(record).forEach(([key, value]) => {
      if (typeof value === "function") return;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        Object.entries(value).forEach(([childKey, childValue]) => rows.push([`${key}.${childKey}`, childValue]));
      } else {
        rows.push([key, value]);
      }
    });
    return rows;
  }

  function customModal(title, body, footer = "") {
    const root = document.querySelector("#dashboard-modal-root");
    if (!root) return null;
    root.innerHTML = `<div class="modal-backdrop" data-admin-modal-backdrop><section class="dashboard-modal admin-edit-modal" role="dialog" aria-modal="true" aria-labelledby="admin-modal-title"><button class="icon-button modal-close" type="button" aria-label="Close dialog" data-admin-modal-close>${icon("close")}</button><h2 id="admin-modal-title">${escapeHtml(title)}</h2>${body}${footer}</section></div>`;
    const close = () => { root.innerHTML = ""; };
    root.querySelectorAll("[data-admin-modal-close]").forEach(button => button.addEventListener("click", close));
    root.querySelector("[data-admin-modal-backdrop]")?.addEventListener("click", event => { if (event.target === event.currentTarget) close(); });
    return { root, close };
  }

  function showRecord(record, title = "Master Record") {
    const rows = flattenRecord(record).map(([key, value]) => `<tr><th>${escapeHtml(key)}</th><td>${escapeHtml(value ?? "")}</td></tr>`).join("");
    customModal(title, `<div class="table-wrap"><table class="record-detail-table"><tbody>${rows}</tbody></table></div>`, `<div class="modal-actions"><button class="btn btn-primary" type="button" data-admin-modal-close>Close</button></div>`);
  }

  function tableMarkup({ id, columns, filters = [], allowCrud = false }) {
    const actionLabel = allowCrud ? "Actions" : "Action";
    return `<section class="card"><div class="admin-table-tools"><input id="${escapeHtml(id)}-search" type="search" placeholder="Search records..." aria-label="Search records"><select id="${escapeHtml(id)}-filter"><option value="">All</option>${filters.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join("")}</select><button class="btn btn-secondary" id="${escapeHtml(id)}-csv" type="button">${icon("download")} Export CSV</button></div><div class="table-wrap"><table id="${escapeHtml(id)}-table"><thead><tr>${columns.map(column => `<th><button class="text-button" type="button" data-sort="${escapeHtml(column.key)}">${escapeHtml(column.label)}</button></th>`).join("")}<th class="align-right">${actionLabel}</th></tr></thead><tbody></tbody></table></div><div class="student-table-footer" id="${escapeHtml(id)}-summary"></div></section>`;
  }

  function bindTable({ id, columns, getRows, filterField, csvName, allowCrud = false, onView, onEdit, onDelete }) {
    const table = document.getElementById(`${id}-table`);
    const tbody = table?.querySelector("tbody");
    const summary = document.getElementById(`${id}-summary`);
    const search = document.getElementById(`${id}-search`);
    const filter = document.getElementById(`${id}-filter`);
    const csvButton = document.getElementById(`${id}-csv`);
    if (!tbody || !summary || !table) return;

    const state = { query: "", filter: "", sort: columns[0]?.key || "id", dir: 1, page: 1, size: 10 };

    function cellValue(record, column) {
      const value = record[column.key];
      return column.render ? column.render(record) : escapeHtml(value ?? "");
    }

    function filteredRows() {
      let rows = [...getRows()];
      if (state.query) {
        const q = state.query.toLowerCase();
        rows = rows.filter(record => JSON.stringify(record).toLowerCase().includes(q));
      }
      if (state.filter && filterField) {
        rows = rows.filter(record => String(record[filterField] ?? "") === state.filter);
      }
      rows.sort((a, b) => String(a[state.sort] ?? "").localeCompare(String(b[state.sort] ?? ""), undefined, { numeric: true }) * state.dir);
      return rows;
    }

    function render() {
      const rows = filteredRows();
      const pageCount = Math.max(1, Math.ceil(rows.length / state.size));
      state.page = Math.min(Math.max(1, state.page), pageCount);
      const start = (state.page - 1) * state.size;
      const pageRows = rows.slice(start, start + state.size);
      tbody.innerHTML = pageRows.length ? pageRows.map(record => {
        const recordId = record.id || record.recordId || record.code || record.name || "";
        const actions = allowCrud
          ? `<div class="admin-row-actions"><button class="table-action" data-action="view" data-id="${escapeHtml(recordId)}" type="button">View</button><button class="table-action" data-action="edit" data-id="${escapeHtml(recordId)}" type="button">Edit</button><button class="table-action danger" data-action="delete" data-id="${escapeHtml(recordId)}" type="button">Delete</button></div>`
          : `<button class="table-action" data-action="view" data-id="${escapeHtml(recordId)}" type="button">View</button>`;
        return `<tr>${columns.map(column => `<td>${cellValue(record, column)}</td>`).join("")}<td class="align-right">${actions}</td></tr>`;
      }).join("") : `<tr><td colspan="${columns.length + 1}"><div class="empty-state"><span>${icon("document")}</span><strong>No records found.</strong><p>Adjust search or filters.</p></div></td></tr>`;
      summary.innerHTML = `<span>Showing ${pageRows.length} of ${rows.length} records</span><span><button class="table-action" type="button" data-page="prev" ${state.page <= 1 ? "disabled" : ""}>Prev</button> Page ${state.page} of ${pageCount} <button class="table-action" type="button" data-page="next" ${state.page >= pageCount ? "disabled" : ""}>Next</button></span>`;
    }

    function findRecord(idValue) {
      return getRows().find(record => String(record.id || record.recordId || record.code || record.name) === String(idValue));
    }

    search?.addEventListener("input", event => {
      state.query = event.target.value;
      state.page = 1;
      render();
    });
    filter?.addEventListener("change", event => {
      state.filter = event.target.value;
      state.page = 1;
      render();
    });
    table.addEventListener("click", event => {
      const sortButton = event.target.closest("[data-sort]");
      if (sortButton) {
        const nextSort = sortButton.dataset.sort;
        state.dir = state.sort === nextSort ? state.dir * -1 : 1;
        state.sort = nextSort;
        render();
        return;
      }
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton) return;
      const record = findRecord(actionButton.dataset.id);
      if (!record) {
        showToast("Record not found in demo data.", "error");
        return;
      }
      const action = actionButton.dataset.action;
      if (action === "view") (onView || showRecord)(record);
      if (action === "edit" && allowCrud) onEdit?.(record, render);
      if (action === "delete" && allowCrud) onDelete?.(record, render);
    });
    summary.addEventListener("click", event => {
      const pageButton = event.target.closest("[data-page]");
      if (!pageButton) return;
      if (pageButton.dataset.page === "prev") state.page -= 1;
      if (pageButton.dataset.page === "next") state.page += 1;
      render();
    });
    csvButton?.addEventListener("click", () => {
      const rows = filteredRows();
      exportCsv([columns.map(column => column.label), ...rows.map(record => columns.map(column => record[column.key]))], csvName || `${id}.csv`);
    });
    render();
  }

  const studentColumns = [
    { key: "id", label: "Student ID", render: record => `<strong>${escapeHtml(record.id)}</strong><br><span class="authority-badge">Institute-owned</span>` },
    { key: "name", label: "Student Name" },
    { key: "program", label: "Program" },
    { key: "semester", label: "Semester" },
    { key: "division", label: "Division" },
    { key: "admissionNo", label: "Admission No." },
    { key: "status", label: "Status" },
    { key: "documentsStatus", label: "Documents" }
  ];

  const facultyColumns = [
    { key: "id", label: "Faculty ID", render: record => `<strong>${escapeHtml(record.id)}</strong><br><span class="authority-badge">Institute-owned</span>` },
    { key: "name", label: "Faculty Name" },
    { key: "department", label: "Department" },
    { key: "designation", label: "Designation" },
    { key: "employment", label: "Employment" },
    { key: "status", label: "Status" },
    { key: "specialization", label: "Specialization" }
  ];

  function input(id, label, type = "text", required = true, value = "") {
    return `<label class="form-field"><span>${escapeHtml(label)}${required ? " *" : ""}</span><input class="form-control" id="${escapeHtml(id)}" name="${escapeHtml(id)}" type="${escapeHtml(type)}" value="${escapeHtml(value ?? "")}" ${required ? "required" : ""}><span class="field-error" data-error-for="${escapeHtml(id)}"></span></label>`;
  }

  function textarea(id, label, required = true, value = "") {
    return `<label class="form-field full"><span>${escapeHtml(label)}${required ? " *" : ""}</span><textarea class="form-textarea" id="${escapeHtml(id)}" name="${escapeHtml(id)}" ${required ? "required" : ""}>${escapeHtml(value ?? "")}</textarea><span class="field-error" data-error-for="${escapeHtml(id)}"></span></label>`;
  }

  function select(id, label, options, value = "", required = true) {
    return `<label class="form-field"><span>${escapeHtml(label)}${required ? " *" : ""}</span><select class="form-control" id="${escapeHtml(id)}" name="${escapeHtml(id)}" ${required ? "required" : ""}><option value="">Select ${escapeHtml(label)}</option>${options.map(option => `<option value="${escapeHtml(option)}" ${String(option) === String(value) ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}</select><span class="field-error" data-error-for="${escapeHtml(id)}"></span></label>`;
  }

  function hasTenDigits(value) {
    return /^\d{10}$/.test(String(value || "").replace(/\D/g, ""));
  }

  function isEmail(value) {
    return /^\S+@\S+\.\S+$/.test(String(value || ""));
  }

  function isFutureDate(value) {
    return value && new Date(value) > new Date();
  }

  function instituteDashboard() {
    const s = students();
    const f = faculty();
    const academic = academicStore();
    const access = studentAccessStats();
    const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const metric = (label, value, ico, modifier = "") => `
      <article class="director-metric ${modifier}">
        <span class="director-metric-icon">${icon(ico)}</span>
        <span class="director-metric-label">${escapeHtml(label)}</span>
        <strong class="director-metric-value">${escapeHtml(value)}</strong>
      </article>`;
    main.innerHTML = `<div class="institute-dashboard">${pageHeader(
      "Institute Administration",
      "Manage institutional master records including students, faculty members, academic programs and academic structure.",
      `<span class="institute-current-date">${escapeHtml(today)}</span><a class="btn btn-primary" href="add-student.html">${icon("plus")} Add Student</a><a class="btn btn-secondary" href="add-faculty.html">${icon("plus")} Add Faculty</a>`
    )}${notice()}<section class="director-section" aria-labelledby="institute-overview-title">
      <div class="director-section-heading"><div><span class="eyebrow">INSTITUTION</span><h2 id="institute-overview-title">Institutional Overview</h2></div></div>
      <div class="director-metric-grid">
        ${metric("Total Students", s.length, "student")}
        ${metric("Total Faculty", f.length, "faculty")}
        ${metric("Programs", academic.programs.length, "book")}
        ${metric("Departments", academic.departments.length, "building")}
      </div>
    </section>
    <section class="director-section director-panel" aria-labelledby="institute-academic-title">
      <div class="director-section-heading"><div><span class="eyebrow">ACADEMIC MASTER DATA</span><h2 id="institute-academic-title">Academic Structure</h2></div></div>
      <div class="director-metric-grid">
        ${metric("Courses", academic.courses.length, "book")}
        ${metric("Subjects", academic.subjects.length, "document")}
        ${metric("Classes", academic.classes.length, "classes")}
        ${metric("Academic Years", academic.academicYears.length, "calendar")}
      </div>
    </section>
    <section class="director-section director-panel" aria-labelledby="institute-quality-title">
      <div class="director-section-heading"><div><span class="eyebrow">RECORD HEALTH</span><h2 id="institute-quality-title">Data Quality &amp; Documents</h2></div></div>
      <div class="director-metric-grid">
        ${metric("Incomplete Student Records", s.filter(x => !x.email || !x.phone).length, "student")}
        ${metric("Incomplete Faculty Records", f.filter(x => !x.email || !x.phone).length, "faculty")}
        ${metric("Pending Student Documents", s.filter(x => x.documentsStatus === "Pending").length, "document", "is-pending")}
        ${metric("Pending Faculty Documents", f.filter(x => x.documentsStatus === "Pending").length || 3, "document", "is-pending")}
      </div>
    </section>
    <section class="director-section director-panel" aria-labelledby="institute-access-title">
      <div class="director-section-heading"><div><span class="eyebrow">STUDENT PORTAL</span><h2 id="institute-access-title">Student Account Access</h2></div></div>
      <div class="director-access-grid">
        ${metric("Pending Student Login Requests", access.pending, "message", "is-pending")}
        ${metric("Approved Student Accounts", access.approved, "check")}
      </div>
    </section>
    <section class="director-section director-panel" aria-labelledby="institute-actions-title">
      <div class="director-section-heading"><div><span class="eyebrow">WORKSPACE</span><h2 id="institute-actions-title">Quick Actions</h2></div></div>
      <div class="quick-action-grid">
      ${[
        ["Add Student", "add-student.html", "student"],
        ["Add Faculty", "add-faculty.html", "faculty"],
        ["Add Course", "courses.html", "book"],
        ["Add Program", "programs.html", "book"],
        ["Add Department", "departments.html", "building"],
        ["Add Subject", "subjects.html", "book"],
        ["Create Class", "classes.html", "classes"],
        ["Manage Academic Year", "academic-years.html", "calendar"],
        ["Review Student Logins", "student-approvals.html", "check"]
      ].map(item => `<a class="quick-action" href="${item[1]}"><span>${icon(item[2])}</span><span><strong>${item[0]}</strong><small>Create, edit and delete master records</small></span>${icon("chevron")}</a>`).join("")}
      </div>
    </section>
    <p class="master-note"><strong>Master Record Owner:</strong> Institute Administration. Operational portals consume these records after creation.</p></div>`;
  }

  function adminStudents() {
    main.innerHTML = pageHeader("Student Master Records", "Create, edit, delete and maintain institutional student master records.", `<a class="btn btn-primary" href="add-student.html">Add Student</a>`) +
      notice("Institute Admin may create, edit and delete demo Student Master records. Student Administration only manages operational student workflows.") +
      tableMarkup({ id: "admin-students", columns: studentColumns, filters: programOptions(), allowCrud: true });
    bindTable({
      id: "admin-students",
      columns: studentColumns,
      getRows: students,
      filterField: "program",
      csvName: "student-master-records.csv",
      allowCrud: true,
      onView: record => showRecord(record, `Student ${record.id}`),
      onEdit: editStudentRecord,
      onDelete: deleteStudentRecord
    });
  }

  function adminFaculty() {
    main.innerHTML = pageHeader("Faculty Master Records", "Create, edit, delete and maintain institutional faculty master records.", `<a class="btn btn-primary" href="add-faculty.html">Add Faculty</a>`) +
      notice("Institute Admin may create, edit and delete demo Faculty Master records. Faculty Administration only manages operational faculty workflows.") +
      tableMarkup({ id: "admin-faculty", columns: facultyColumns, filters: departmentOptions(), allowCrud: true });
    bindTable({
      id: "admin-faculty",
      columns: facultyColumns,
      getRows: faculty,
      filterField: "department",
      csvName: "faculty-master-records.csv",
      allowCrud: true,
      onView: record => showRecord(record, `Faculty ${record.id}`),
      onEdit: editFacultyRecord,
      onDelete: deleteFacultyRecord
    });
  }

  function addStudent() {
    main.innerHTML = pageHeader("Add Student", "Create an institutional student master record in frontend demo mode.", `<a class="btn btn-secondary" href="students.html">Back to Students</a>`) +
      notice("Successful submissions are saved only in browser sessionStorage for cross-portal demo visibility.") +
      `<form class="student-form" id="student-master-form" novalidate>
        <section class="form-section"><h2>Personal</h2><div class="admin-form-grid">
          ${input("studentId", "Student ID")}${input("admissionNo", "Admission Number")}${input("firstName", "First Name")}${input("middleName", "Middle Name", "text", false)}${input("lastName", "Last Name")}${input("dob", "Date of Birth", "date")}${select("gender", "Gender", ["Female", "Male", "Other / Not Specified"])}${input("email", "Email", "email")}${input("phone", "Phone", "tel")}${input("alternatePhone", "Alternate Phone", "tel", false)}
        </div></section>
        <section class="form-section"><h2>Academic</h2><div class="admin-form-grid">
          ${select("program", "Program", programOptions())}${select("department", "Department", departmentOptions())}${select("semester", "Semester", ["I", "II", "III", "IV"])}${select("division", "Division", ["A", "B", "C"])}${input("rollNo", "Roll Number")}${input("academicYear", "Academic Year", "text", true, "2026–27")}${input("admissionDate", "Admission Date", "date")}${select("enrollmentType", "Enrollment Type", ["Regular", "Transfer", "Lateral Entry"])}${input("cgpa", "CGPA", "number")}${input("backlogs", "Backlogs", "number", true, "0")}
        </div></section>
        <section class="form-section"><h2>Guardian</h2><div class="admin-form-grid">
          ${input("guardianName", "Guardian Name")}${select("guardianRelationship", "Relationship", ["Mother", "Father", "Guardian"])}${input("guardianPhone", "Guardian Phone", "tel")}${input("guardianEmail", "Guardian Email", "email", false)}${input("guardianOccupation", "Occupation", "text", false)}
        </div></section>
        <section class="form-section"><h2>Address</h2><div class="admin-form-grid">${textarea("currentAddress", "Current Address")}${textarea("permanentAddress", "Permanent Address")}</div></section>
        <section class="form-section"><h2>Documents</h2><p>Demo interface only. Files are not uploaded.</p></section>
        <div class="form-actions"><button class="btn btn-secondary" type="reset">Reset</button><button class="btn btn-primary" type="submit">Create Student Master Record</button></div>
      </form>`;
    bindStudentForm();
  }

  function validateStudentPayload(payload, originalId = null, originalAdmissionNo = null) {
    const list = students();
    const errors = [];
    if (!/^STU\d{4}$/.test(payload.id)) errors.push("Student ID must use STU1234 format.");
    if (list.some(student => student.id === payload.id && student.id !== originalId)) errors.push("Student ID must be unique in demo data.");
    if (!payload.admissionNo) errors.push("Admission Number is required.");
    if (list.some(student => student.admissionNo === payload.admissionNo && student.admissionNo !== originalAdmissionNo)) errors.push("Admission Number must be unique.");
    if (!isEmail(payload.email)) errors.push("Email must be valid.");
    if (!hasTenDigits(payload.phone)) errors.push("Phone must contain 10 digits.");
    if (payload.guardian?.phone && !hasTenDigits(payload.guardian.phone)) errors.push("Guardian phone must contain 10 digits.");
    if (isFutureDate(payload.dob)) errors.push("DOB cannot be in the future.");
    if (isFutureDate(payload.admissionDate)) errors.push("Admission date cannot be in the future.");
    if (payload.dob && payload.admissionDate && new Date(payload.admissionDate) < new Date(payload.dob)) errors.push("Admission date must be after DOB.");
    if (payload.cgpa < 0 || payload.cgpa > 10 || Number.isNaN(payload.cgpa)) errors.push("CGPA must be between 0 and 10.");
    if (payload.backlogs < 0 || Number.isNaN(payload.backlogs)) errors.push("Backlogs must be zero or higher.");
    return errors;
  }

  function studentFromFormData(fd) {
    const firstName = String(fd.get("firstName") || "").trim();
    const middleName = String(fd.get("middleName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    return {
      id: String(fd.get("studentId") || "").trim(),
      admissionNo: String(fd.get("admissionNo") || "").trim(),
      firstName,
      middleName,
      lastName,
      name: [firstName, middleName, lastName].filter(Boolean).join(" "),
      dob: fd.get("dob"),
      gender: fd.get("gender"),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      alternatePhone: String(fd.get("alternatePhone") || "").trim(),
      program: fd.get("program"),
      department: fd.get("department"),
      semester: fd.get("semester"),
      division: fd.get("division"),
      rollNo: String(fd.get("rollNo") || "").trim(),
      academicYear: String(fd.get("academicYear") || "").trim(),
      admissionDate: fd.get("admissionDate"),
      enrollmentType: fd.get("enrollmentType"),
      cgpa: Number(fd.get("cgpa")),
      backlogs: Number(fd.get("backlogs")),
      status: fd.get("status") || "Active",
      attendance: Number(fd.get("attendance")) || 0,
      documentsStatus: fd.get("documentsStatus") || "Pending",
      guardian: { name: fd.get("guardianName"), relationship: fd.get("guardianRelationship"), phone: fd.get("guardianPhone"), email: fd.get("guardianEmail"), occupation: fd.get("guardianOccupation") },
      currentAddress: { line: fd.get("currentAddress"), city: "", state: "", postalCode: "", country: "India" },
      permanentAddress: { line: fd.get("permanentAddress"), city: "", state: "", postalCode: "", country: "India" }
    };
  }

  function bindStudentForm() {
    const form = document.querySelector("#student-master-form");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      const payload = studentFromFormData(new FormData(form));
      const errors = validateStudentPayload(payload);
      if (!form.checkValidity()) errors.push("Required fields must be completed.");
      if (errors.length) {
        showToast(errors[0], "error");
        return;
      }
      const list = students();
      list.push(payload);
      saveStudents(list);
      addAudit({ action: "CREATE", module: "Student Master", recordId: payload.id, details: `Institute Admin created student master record ${payload.id}` });
      form.reset();
      showToast("Student master record created in demo mode.", "success");
    });
  }

  function editStudentRecord(record, rerender) {
    const current = normalizeStudent(record);
    const body = `<form id="edit-student-master-form" class="student-form admin-modal-form" novalidate><div class="admin-form-grid">
      ${input("studentId", "Student ID", "text", true, current.id)}${input("admissionNo", "Admission Number", "text", true, current.admissionNo)}${input("firstName", "First Name", "text", true, current.firstName)}${input("middleName", "Middle Name", "text", false, current.middleName)}${input("lastName", "Last Name", "text", true, current.lastName)}${input("dob", "Date of Birth", "date", true, current.dob)}${select("gender", "Gender", ["Female", "Male", "Other / Not Specified"], current.gender)}${input("email", "Email", "email", true, current.email)}${input("phone", "Phone", "tel", true, current.phone)}${input("alternatePhone", "Alternate Phone", "tel", false, current.alternatePhone)}
      ${select("program", "Program", programOptions(), current.program)}${select("department", "Department", departmentOptions(), current.department)}${select("semester", "Semester", ["I", "II", "III", "IV"], current.semester)}${select("division", "Division", ["A", "B", "C"], current.division)}${input("rollNo", "Roll Number", "text", true, current.rollNo)}${input("academicYear", "Academic Year", "text", true, current.academicYear)}${input("admissionDate", "Admission Date", "date", true, current.admissionDate)}${select("enrollmentType", "Enrollment Type", ["Regular", "Transfer", "Lateral Entry"], current.enrollmentType)}${input("cgpa", "CGPA", "number", true, current.cgpa)}${input("backlogs", "Backlogs", "number", true, current.backlogs)}${input("attendance", "Attendance %", "number", false, current.attendance)}${select("status", "Status", ["Active", "Inactive", "On Leave", "Graduated", "Suspended", "Alumni"], current.status)}${select("documentsStatus", "Documents", ["Pending", "Verified", "Rejected", "Incomplete"], current.documentsStatus)}
      ${input("guardianName", "Guardian Name", "text", true, current.guardian?.name || "")}${select("guardianRelationship", "Relationship", ["Mother", "Father", "Guardian"], current.guardian?.relationship || "Guardian")}${input("guardianPhone", "Guardian Phone", "tel", true, current.guardian?.phone || "")}${input("guardianEmail", "Guardian Email", "email", false, current.guardian?.email || "")}${input("guardianOccupation", "Occupation", "text", false, current.guardian?.occupation || "")}${textarea("currentAddress", "Current Address", true, current.currentAddress?.line || "")}${textarea("permanentAddress", "Permanent Address", true, current.permanentAddress?.line || "")}
      </div><div class="modal-actions"><button class="btn btn-secondary" type="button" data-admin-modal-close>Cancel</button><button class="btn btn-primary" type="submit">Save Changes</button></div></form>`;
    const modal = customModal(`Edit Student ${current.id}`, body);
    const form = modal?.root.querySelector("#edit-student-master-form");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      const payload = studentFromFormData(new FormData(form));
      payload.status = form.elements.status.value;
      payload.documentsStatus = form.elements.documentsStatus.value;
      payload.attendance = Number(form.elements.attendance.value) || 0;
      const errors = validateStudentPayload(payload, current.id, current.admissionNo);
      if (!form.checkValidity()) errors.push("Required fields must be completed.");
      if (errors.length) {
        showToast(errors[0], "error");
        return;
      }
      const list = students();
      const index = list.findIndex(item => item.id === current.id);
      if (index === -1) {
        showToast("Record not found in demo data.", "error");
        return;
      }
      list[index] = { ...list[index], ...payload };
      saveStudents(list);
      addAudit({ action: "UPDATE", module: "Student Master", recordId: payload.id, details: `Institute Admin edited student master record ${payload.id}` });
      modal.close();
      rerender();
      showToast("Student master record updated in demo mode.", "success");
    });
  }

  function deleteStudentRecord(record, rerender) {
    openModal({
      title: "Delete Student Master Record",
      text: `Delete ${record.id} from demo master records? This removes the record from Institute Admin, Student Administration and Director overview for this browser session.`,
      confirm: "Delete Record",
      onConfirm: () => {
        const list = students().filter(item => item.id !== record.id);
        saveStudents(list);
        addAudit({ action: "DELETE", module: "Student Master", recordId: record.id, details: `Institute Admin deleted student master record ${record.id}`, severity: "Warning" });
        rerender();
        showToast("Student master record deleted in demo mode.", "success");
      }
    });
  }

  function addFaculty() {
    main.innerHTML = pageHeader("Add Faculty", "Create an institutional faculty master record. Supabase is used when configured; otherwise CampusX falls back to session demo mode.", `<a class="btn btn-secondary" href="faculty.html">Back to Faculty</a>`) +
      notice("Institute Admin owns Faculty Master creation. When Supabase is configured, the record is created in public.faculty and becomes available to Faculty Administration; otherwise it remains a browser-session demo record.") +
      `<form class="student-form" id="faculty-master-form" novalidate>
        <section class="form-section"><h2>Personal</h2><div class="admin-form-grid">
          ${input("facultyId", "Faculty ID")}${input("firstName", "First Name")}${input("middleName", "Middle Name", "text", false)}${input("lastName", "Last Name")}${input("dob", "DOB", "date")}${select("gender", "Gender", ["Female", "Male", "Other"])}${input("email", "Email", "email")}${input("phone", "Phone", "tel")}
        </div></section>
        <section class="form-section"><h2>Employment</h2><div class="admin-form-grid">
          ${select("department", "Department", departmentOptions())}${select("designation", "Designation", ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"])}${input("joiningDate", "Joining Date", "date")}${select("employment", "Employment Type", ["Full Time", "Part Time", "Visiting", "Contract"])}${input("experience", "Experience", "number", true, "0")}
        </div></section>
        <section class="form-section"><h2>Academic</h2><div class="admin-form-grid">${input("qualification", "Qualification")}${input("specialization", "Specialization")}</div></section>
        <section class="form-section"><h2>Contact</h2><div class="admin-form-grid">${textarea("address", "Address")}${input("city", "City")}${input("state", "State")}${input("postalCode", "Postal Code")}</div></section>
        <section class="form-section"><h2>Documents</h2><p>Demo interface only. Files are not uploaded.</p></section>
        <div class="form-actions"><button class="btn btn-secondary" type="reset">Reset</button><button class="btn btn-primary" type="submit">Create Faculty Master Record</button></div>
      </form>`;
    bindFacultyForm();
  }

  function facultyFromFormData(fd) {
    const firstName = String(fd.get("firstName") || "").trim();
    const middleName = String(fd.get("middleName") || "").trim();
    const lastName = String(fd.get("lastName") || "").trim();
    return {
      id: String(fd.get("facultyId") || "").trim(),
      firstName,
      middleName,
      lastName,
      name: [firstName, middleName, lastName].filter(Boolean).join(" "),
      dob: fd.get("dob"),
      gender: fd.get("gender"),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      department: fd.get("department"),
      designation: fd.get("designation"),
      joiningDate: fd.get("joiningDate"),
      employment: fd.get("employment"),
      experience: Number(fd.get("experience")),
      qualification: fd.get("qualification"),
      specialization: fd.get("specialization"),
      address: fd.get("address"),
      city: fd.get("city"),
      state: fd.get("state"),
      postalCode: fd.get("postalCode"),
      attendance: Number(fd.get("attendance")) || 0,
      workload: fd.get("workload") || "Normal",
      hours: Number(fd.get("hours")) || 0,
      status: fd.get("status") || "Active",
      documentsStatus: fd.get("documentsStatus") || "Pending"
    };
  }

  function validateFacultyPayload(payload, originalId = null) {
    const list = faculty();
    const errors = [];
    if (!/^FAC\d{4}$/.test(payload.id)) errors.push("Faculty ID must use FAC1234 format.");
    if (list.some(item => item.id === payload.id && item.id !== originalId)) errors.push("Faculty ID must be unique.");
    if (!isEmail(payload.email)) errors.push("Email must be valid.");
    if (!hasTenDigits(payload.phone)) errors.push("Phone must contain 10 digits.");
    if (isFutureDate(payload.dob)) errors.push("DOB cannot be in the future.");
    if (isFutureDate(payload.joiningDate)) errors.push("Joining date cannot be in the future.");
    if (payload.dob && payload.joiningDate && new Date(payload.joiningDate) < new Date(payload.dob)) errors.push("Joining date must be after DOB.");
    if (payload.experience < 0 || Number.isNaN(payload.experience)) errors.push("Experience must be zero or higher.");
    return errors;
  }

  async function createFacultyMasterInSupabase(payload) {
    const supabase = window.CampusXSupabaseConfig?.getClient?.();
    const api = window.CampusXInstituteAdminAPI;
    if (!supabase || !api?.invoke) return { ok: false, fallback: true, message: "Supabase is not configured." };
    let departmentId = null;
    if (payload.department) {
      const { data: department, error: departmentError } = await supabase.from("departments").select("id,name").eq("name", payload.department).maybeSingle();
      if (departmentError) return { ok: false, message: departmentError.message };
      departmentId = department?.id || null;
    }
    const record = {
      faculty_id: payload.id, first_name: payload.firstName, middle_name: payload.middleName || null, last_name: payload.lastName,
      dob: payload.dob, gender: payload.gender, email: payload.email, phone: payload.phone, department_id: departmentId,
      designation: payload.designation, joining_date: payload.joiningDate, employment_type: payload.employment,
      qualification: payload.qualification || null, specialization: payload.specialization || null, experience: payload.experience, status: "ACTIVE"
    };
    return api.invoke("create-faculty-master", record);
  }

  function bindFacultyForm() {
    const form = document.querySelector("#faculty-master-form");
    form?.addEventListener("submit", async event => {
      event.preventDefault();
      const payload = facultyFromFormData(new FormData(form));
      const errors = validateFacultyPayload(payload);
      if (!form.checkValidity()) errors.push("Required fields must be completed.");
      if (errors.length) { showToast(errors[0], "error"); return; }
      const submit = form.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.textContent = "Creating Faculty..."; }
      try {
        const liveResult = await createFacultyMasterInSupabase(payload);
        if (liveResult?.ok) {
          const list = faculty();
          if (!list.some(item => item.id === payload.id)) { list.push(payload); saveFaculty(list); }
          addAudit({ action: "CREATE", module: "Faculty Master", recordId: payload.id, details: `Institute Admin created faculty master record ${payload.id}` });
          form.reset();
          showToast("Faculty master record created in Supabase.", "success");
          return;
        }
        if (!liveResult?.fallback && window.CampusXSupabaseConfig?.isConfigured?.()) { throw new Error(liveResult?.message || "Unable to create Faculty Master record."); }
        const list = faculty(); list.push(payload); saveFaculty(list);
        addAudit({ action: "CREATE", module: "Faculty Master", recordId: payload.id, details: `Institute Admin created demo faculty master record ${payload.id}` });
        form.reset(); showToast("Faculty master record created in demo session mode.", "success");
      } catch (error) { showToast(error.message || "Unable to create Faculty Master record.", "error"); }
      finally { if (submit) { submit.disabled = false; submit.textContent = "Create Faculty Master Record"; } }
    });
  }

  function editFacultyRecord(record, rerender) {
    const current = { ...record };
    const [firstName = "", ...restName] = String(current.name || "").split(" ");
    const lastName = current.lastName || restName.pop() || "";
    const middleName = current.middleName || restName.join(" ");
    const body = `<form id="edit-faculty-master-form" class="student-form admin-modal-form" novalidate><div class="admin-form-grid">
      ${input("facultyId", "Faculty ID", "text", true, current.id)}${input("firstName", "First Name", "text", true, current.firstName || firstName)}${input("middleName", "Middle Name", "text", false, middleName)}${input("lastName", "Last Name", "text", true, current.lastName || lastName)}${input("dob", "DOB", "date", true, current.dob)}${select("gender", "Gender", ["Female", "Male", "Other"], current.gender || "")}${input("email", "Email", "email", true, current.email)}${input("phone", "Phone", "tel", true, current.phone)}${select("department", "Department", departmentOptions(), current.department)}${select("designation", "Designation", ["Professor", "Associate Professor", "Assistant Professor", "Lecturer"], current.designation)}${input("joiningDate", "Joining Date", "date", true, current.joiningDate)}${select("employment", "Employment Type", ["Full Time", "Part Time", "Visiting", "Contract"], current.employment)}${input("experience", "Experience", "number", true, current.experience)}${input("qualification", "Qualification", "text", true, current.qualification || "")}${input("specialization", "Specialization", "text", true, current.specialization || "")}${input("attendance", "Attendance %", "number", false, current.attendance)}${select("workload", "Workload", ["Low", "Normal", "High"], current.workload || "Normal")}${input("hours", "Teaching Hours", "number", false, current.hours)}${select("status", "Status", ["Active", "Inactive", "On Leave", "Contract Closed"], current.status || "Active")}${select("documentsStatus", "Documents", ["Pending", "Verified", "Rejected", "Incomplete"], current.documentsStatus || "Pending")}${textarea("address", "Address", true, current.address || "")}${input("city", "City", "text", true, current.city || "")}${input("state", "State", "text", true, current.state || "")}${input("postalCode", "Postal Code", "text", true, current.postalCode || "")}
      </div><div class="modal-actions"><button class="btn btn-secondary" type="button" data-admin-modal-close>Cancel</button><button class="btn btn-primary" type="submit">Save Changes</button></div></form>`;
    const modal = customModal(`Edit Faculty ${current.id}`, body);
    const form = modal?.root.querySelector("#edit-faculty-master-form");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      const payload = facultyFromFormData(new FormData(form));
      payload.status = form.elements.status.value;
      payload.workload = form.elements.workload.value;
      payload.documentsStatus = form.elements.documentsStatus.value;
      const errors = validateFacultyPayload(payload, current.id);
      if (!form.checkValidity()) errors.push("Required fields must be completed.");
      if (errors.length) {
        showToast(errors[0], "error");
        return;
      }
      const list = faculty();
      const index = list.findIndex(item => item.id === current.id);
      if (index === -1) {
        showToast("Record not found in demo data.", "error");
        return;
      }
      list[index] = { ...list[index], ...payload };
      saveFaculty(list);
      addAudit({ action: "UPDATE", module: "Faculty Master", recordId: payload.id, details: `Institute Admin edited faculty master record ${payload.id}` });
      modal.close();
      rerender();
      showToast("Faculty master record updated in demo mode.", "success");
    });
  }

  function deleteFacultyRecord(record, rerender) {
    openModal({
      title: "Delete Faculty Master Record",
      text: `Delete ${record.id} from demo master records? This removes the record from Institute Admin, Faculty Administration and Director overview for this browser session.`,
      confirm: "Delete Record",
      onConfirm: () => {
        const list = faculty().filter(item => item.id !== record.id);
        saveFaculty(list);
        addAudit({ action: "DELETE", module: "Faculty Master", recordId: record.id, details: `Institute Admin deleted faculty master record ${record.id}`, severity: "Warning" });
        rerender();
        showToast("Faculty master record deleted in demo mode.", "success");
      }
    });
  }

  const academicConfigs = {
    courses: {
      title: "Courses",
      singular: "Course",
      module: "Course Master",
      key: "courses",
      filterField: "department",
      columns: [
        { key: "id", label: "Course ID" }, { key: "code", label: "Code" }, { key: "name", label: "Course Name" }, { key: "department", label: "Department" }, { key: "duration", label: "Duration" }, { key: "capacity", label: "Capacity" }, { key: "status", label: "Status" }, { key: "owner", label: "Master Record Owner" }
      ],
      fields: [
        ["id", "Course ID", "text"], ["code", "Course Code", "text"], ["name", "Course Name", "text"], ["department", "Department", "select", departmentOptions], ["duration", "Duration", "text"], ["capacity", "Capacity", "number"], ["status", "Status", "select", () => ["Active", "Inactive", "Archived"]]
      ]
    },
    programs: {
      title: "Programs",
      singular: "Program",
      module: "Program Master",
      key: "programs",
      filterField: "department",
      columns: [
        { key: "id", label: "Program ID" }, { key: "name", label: "Program" }, { key: "department", label: "Department" }, { key: "duration", label: "Duration" }, { key: "capacity", label: "Capacity" }, { key: "status", label: "Status" }, { key: "owner", label: "Master Record Owner" }
      ],
      fields: [
        ["id", "Program ID", "text"], ["name", "Program Name", "text"], ["department", "Department", "select", departmentOptions], ["duration", "Duration", "text"], ["capacity", "Capacity", "number"], ["status", "Status", "select", () => ["Active", "Inactive", "Archived"]]
      ]
    },
    departments: {
      title: "Departments",
      singular: "Department",
      module: "Department Master",
      key: "departments",
      filterField: "status",
      columns: [
        { key: "id", label: "Department ID" }, { key: "code", label: "Code" }, { key: "name", label: "Department" }, { key: "head", label: "Head" }, { key: "status", label: "Status" }, { key: "owner", label: "Master Record Owner" }
      ],
      fields: [
        ["id", "Department ID", "text"], ["code", "Department Code", "text"], ["name", "Department Name", "text"], ["head", "Department Head", "text"], ["status", "Status", "select", () => ["Active", "Inactive", "Archived"]]
      ]
    },
    subjects: {
      title: "Subjects",
      singular: "Subject",
      module: "Subject Master",
      key: "subjects",
      filterField: "department",
      columns: [
        { key: "id", label: "Subject ID" }, { key: "code", label: "Code" }, { key: "name", label: "Subject" }, { key: "department", label: "Department" }, { key: "semester", label: "Semester" }, { key: "credits", label: "Credits" }, { key: "status", label: "Status" }, { key: "owner", label: "Master Record Owner" }
      ],
      fields: [
        ["id", "Subject ID", "text"], ["code", "Subject Code", "text"], ["name", "Subject Name", "text"], ["department", "Department", "select", departmentOptions], ["semester", "Semester", "select", () => ["I", "II", "III", "IV", "V", "VI"]], ["credits", "Credits", "number"], ["status", "Status", "select", () => ["Active", "Inactive", "Archived"]]
      ]
    },
    classes: {
      title: "Classes & Divisions",
      singular: "Class / Division",
      module: "Class Master",
      key: "classes",
      filterField: "program",
      columns: [
        { key: "id", label: "Class ID" }, { key: "name", label: "Class" }, { key: "program", label: "Program" }, { key: "semester", label: "Semester" }, { key: "division", label: "Division" }, { key: "academicYear", label: "Academic Year" }, { key: "capacity", label: "Capacity" }, { key: "status", label: "Status" }, { key: "owner", label: "Master Record Owner" }
      ],
      fields: [
        ["id", "Class ID", "text"], ["name", "Class Name", "text"], ["program", "Program", "select", programOptions], ["semester", "Semester", "select", () => ["I", "II", "III", "IV", "V", "VI"]], ["division", "Division", "select", () => ["A", "B", "C", "D"]], ["academicYear", "Academic Year", "text"], ["capacity", "Capacity", "number"], ["status", "Status", "select", () => ["Active", "Inactive", "Archived"]]
      ]
    },
    academicYears: {
      title: "Academic Years",
      singular: "Academic Year",
      module: "Academic Year Master",
      key: "academicYears",
      filterField: "status",
      columns: [
        { key: "id", label: "Year ID" }, { key: "name", label: "Academic Year" }, { key: "startDate", label: "Start Date" }, { key: "endDate", label: "End Date" }, { key: "status", label: "Status" }, { key: "owner", label: "Master Record Owner" }
      ],
      fields: [
        ["id", "Academic Year ID", "text"], ["name", "Academic Year", "text"], ["startDate", "Start Date", "date"], ["endDate", "End Date", "date"], ["status", "Status", "select", () => ["Active", "Upcoming", "Closed", "Archived"]]
      ]
    }
  };

  function academicRecordFromForm(form, config) {
    const fd = new FormData(form);
    const record = { owner: "Institute Administration" };
    config.fields.forEach(([name, , type]) => {
      const raw = fd.get(name);
      record[name] = type === "number" ? Number(raw) : String(raw || "").trim();
    });
    return record;
  }

  function academicForm(config, record = {}) {
    return `<form id="academic-master-form" class="student-form admin-modal-form" novalidate><div class="admin-form-grid">${config.fields.map(([name, label, type, source]) => {
      const value = record[name] ?? "";
      if (type === "select") return select(name, label, typeof source === "function" ? source() : source, value);
      return input(name, label, type, true, value);
    }).join("")}</div><div class="modal-actions"><button class="btn btn-secondary" type="button" data-admin-modal-close>Cancel</button><button class="btn btn-primary" type="submit">Save ${escapeHtml(config.singular)}</button></div></form>`;
  }

  function validateAcademic(record, config, originalId = null) {
    const list = academicStore()[config.key];
    const errors = [];
    if (!record.id) errors.push(`${config.singular} ID is required.`);
    if (!record.name && config.key !== "courses") errors.push(`${config.singular} name is required.`);
    if (config.key === "courses" && !record.name) errors.push("Course name is required.");
    if (list.some(item => item.id === record.id && item.id !== originalId)) errors.push(`${config.singular} ID must be unique.`);
    if ("capacity" in record && (record.capacity < 0 || Number.isNaN(record.capacity))) errors.push("Capacity must be zero or higher.");
    if ("credits" in record && (record.credits < 0 || Number.isNaN(record.credits))) errors.push("Credits must be zero or higher.");
    if (record.startDate && record.endDate && new Date(record.endDate) < new Date(record.startDate)) errors.push("End date must be after start date.");
    return errors;
  }

  function addAcademicRecord(config, rerender) {
    const modal = customModal(`Add ${config.singular}`, academicForm(config));
    const form = modal?.root.querySelector("#academic-master-form");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      const record = academicRecordFromForm(form, config);
      const errors = validateAcademic(record, config);
      if (!form.checkValidity()) errors.push("Required fields must be completed.");
      if (errors.length) {
        showToast(errors[0], "error");
        return;
      }
      const store = academicStore();
      store[config.key].push(record);
      saveAcademicStore(store);
      addAudit({ action: "CREATE", module: config.module, recordId: record.id, details: `Institute Admin created ${config.singular.toLowerCase()} ${record.id}` });
      modal.close();
      rerender();
      showToast(`${config.singular} master record created in demo mode.`, "success");
    });
  }

  function editAcademicRecord(config, record, rerender) {
    const modal = customModal(`Edit ${config.singular} ${record.id}`, academicForm(config, record));
    const form = modal?.root.querySelector("#academic-master-form");
    form?.addEventListener("submit", event => {
      event.preventDefault();
      const updated = academicRecordFromForm(form, config);
      const errors = validateAcademic(updated, config, record.id);
      if (!form.checkValidity()) errors.push("Required fields must be completed.");
      if (errors.length) {
        showToast(errors[0], "error");
        return;
      }
      const store = academicStore();
      const index = store[config.key].findIndex(item => item.id === record.id);
      if (index === -1) {
        showToast("Record not found in demo data.", "error");
        return;
      }
      store[config.key][index] = { ...store[config.key][index], ...updated, owner: "Institute Administration" };
      saveAcademicStore(store);
      addAudit({ action: "UPDATE", module: config.module, recordId: updated.id, details: `Institute Admin edited ${config.singular.toLowerCase()} ${updated.id}` });
      modal.close();
      rerender();
      showToast(`${config.singular} master record updated in demo mode.`, "success");
    });
  }

  function deleteAcademicRecord(config, record, rerender) {
    openModal({
      title: `Delete ${config.singular}`,
      text: `Delete ${record.id} from ${config.title} demo master records?`,
      confirm: "Delete Record",
      onConfirm: () => {
        const store = academicStore();
        store[config.key] = store[config.key].filter(item => item.id !== record.id);
        saveAcademicStore(store);
        addAudit({ action: "DELETE", module: config.module, recordId: record.id, details: `Institute Admin deleted ${config.singular.toLowerCase()} ${record.id}`, severity: "Warning" });
        rerender();
        showToast(`${config.singular} master record deleted in demo mode.`, "success");
      }
    });
  }

  function academicPage(routeKey) {
    const config = academicConfigs[routeKey];
    if (!config) return adminGeneric();
    const getRows = () => academicStore()[config.key];
    const renderPage = () => {
      const rows = getRows();
      const filters = [...new Set(rows.map(row => row[config.filterField]).filter(Boolean))];
      main.innerHTML = pageHeader(config.title, `Institute Admin owns ${config.title.toLowerCase()} master data.`, `<button class="btn btn-primary" type="button" id="add-academic-record">${icon("plus")} Add ${escapeHtml(config.singular)}</button>`) +
        notice(`${config.singular} records can be created, edited and deleted only from Institute Administration in this frontend demo.`) +
        tableMarkup({ id: `admin-${config.key}`, columns: config.columns, filters, allowCrud: true });
      bindTable({
        id: `admin-${config.key}`,
        columns: config.columns,
        getRows,
        filterField: config.filterField,
        csvName: `${config.key}-master-records.csv`,
        allowCrud: true,
        onView: record => showRecord(record, `${config.singular} ${record.id}`),
        onEdit: (record, rerender) => editAcademicRecord(config, record, rerender),
        onDelete: (record, rerender) => deleteAcademicRecord(config, record, rerender)
      });
      document.querySelector("#add-academic-record")?.addEventListener("click", () => addAcademicRecord(config, renderPage));
    };
    renderPage();
  }



function studentRegistrationRequests() {
  const rows = load(STUDENT_REGISTRATION_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

function saveStudentRegistrationRequests(rows) {
  save(STUDENT_REGISTRATION_KEY, rows);
}

function studentPortalAccounts() {
  const rows = load(STUDENT_ACCOUNT_KEY, []);
  return Array.isArray(rows) ? rows : [];
}

function saveStudentPortalAccounts(rows) {
  save(STUDENT_ACCOUNT_KEY, rows);
}

function studentAccessStats() {
  const rows = studentRegistrationRequests();
  return {
    pending: rows.filter(row => row.status === "Pending Approval").length,
    approved: rows.filter(row => row.status === "Approved").length,
    rejected: rows.filter(row => row.status === "Rejected").length,
    suspended: rows.filter(row => row.status === "Suspended").length
  };
}

function linkedStudentRecord(request) {
  return students().find(item => item.id === request.studentId || item.admissionNo === request.admissionNo) || null;
}

function ensureStudentMasterFromRequest(request) {
  const list = students();
  if (list.some(item => item.id === request.studentId || item.admissionNo === request.admissionNo)) return;
  const record = normalizeStudent({
    id: request.studentId,
    admissionNo: request.admissionNo,
    rollNo: "Pending",
    firstName: request.firstName,
    middleName: request.middleName,
    lastName: request.lastName,
    name: request.name,
    dob: request.dob,
    gender: request.gender,
    email: request.email,
    phone: request.phone,
    alternatePhone: "",
    program: "Pending Master Update",
    department: "Pending Master Update",
    semester: "Pending",
    division: "Pending",
    academicYear: "Pending",
    admissionDate: "Pending",
    enrollmentType: "Pending",
    attendance: 0,
    cgpa: 0,
    backlogs: 0,
    status: "Active",
    guardian: { name: "Not updated", relationship: "Guardian", phone: "Not updated", email: "Not updated", occupation: "Not updated" },
    currentAddress: { line: "Not updated", city: "", state: "", postalCode: "", country: "India" },
    permanentAddress: { line: "Not updated", city: "", state: "", postalCode: "", country: "India" },
    documentsStatus: "Pending"
  });
  list.unshift(record);
  saveStudents(list);
}

function syncStudentPortalAccount(request) {
  const accounts = studentPortalAccounts().filter(account => account.requestId !== request.requestId && account.studentId !== request.studentId);
  const linked = linkedStudentRecord(request);
  if (request.status === "Approved") {
    accounts.unshift({
      requestId: request.requestId,
      studentId: request.studentId,
      admissionNo: request.admissionNo,
      name: request.name,
      email: request.username || request.email,
      program: linked?.program || "Pending Master Update",
      department: linked?.department || "Pending Master Update",
      semester: linked?.semester || "Pending",
      division: linked?.division || "Pending",
      academicYear: linked?.academicYear || "Pending",
      status: request.status
    });
  }
  saveStudentPortalAccounts(accounts);
}


async function postStudentAccountAction(action, requestId) {
  const supabaseApi = window.CampusXInstituteAdminAPI;
  if (supabaseApi) {
    const actionMap = {
      Approved: supabaseApi.approveStudentAccount,
      Suspended: supabaseApi.suspendStudentAccount,
      Activate: supabaseApi.activateStudentAccount
    };
    const fn = actionMap[action];
    if (fn) {
      const result = await fn(requestId);
      return { handled: true, ok: Boolean(result.ok), message: result.message || (result.ok ? "Student account request updated through Supabase." : "Supabase student account action failed.") };
    }
  }
  return { handled: false };
}

async function loadStudentAccountRequestsFromBackend() {
  const supabaseApi = window.CampusXInstituteAdminAPI;
  if (!supabaseApi?.listStudentRequests) return { handled: false };
  try {
    const result = await supabaseApi.listStudentRequests();
    if (!result.ok) return { handled: true, ok: false, message: result.message || "Unable to load Supabase requests." };
    const mapped = result.data.map(item => ({
      requestId: item.id || item.request_id || item.requestId,
      studentId: item.student_id || item.studentId,
      admissionNo: item.admission_number || item.admissionNo,
      firstName: item.first_name || item.firstName,
      middleName: item.middle_name || item.middleName,
      lastName: item.last_name || item.lastName,
      name: [item.first_name || item.firstName, item.middle_name || item.middleName, item.last_name || item.lastName].filter(Boolean).join(" "),
      dob: item.dob,
      gender: item.gender,
      email: item.email,
      phone: item.phone,
      username: item.email,
      status: String(item.status || "pending").replace(/^pending$/i, "Pending Approval").replace(/^approved$|^active$/i, "Approved").replace(/^rejected$/i, "Rejected").replace(/^suspended$/i, "Suspended"),
      submittedOn: item.created_at ? String(item.created_at).slice(0, 10) : "",
      lastUpdated: item.updated_at ? String(item.updated_at).slice(0, 10) : ""
    }));
    saveStudentRegistrationRequests(mapped);
    return { handled: true, ok: true, requests: mapped };
  } catch (error) {
    return { handled: false };
  }
}

async function updateRegistrationStatus(requestId, nextStatus, rerender, backendActionOverride = "") {
  const backendAction = backendActionOverride || (nextStatus === "Approved" ? "Approved" : nextStatus);
  const backendResult = await postStudentAccountAction(backendAction, requestId);
  if (backendResult.handled && !backendResult.ok) {
    showToast(backendResult.message, "error");
    return;
  }
  const rows = studentRegistrationRequests();
  const index = rows.findIndex(row => row.requestId === requestId);
  if (index === -1) {
    showToast("Registration request not found in demo data.", "error");
    return;
  }
  rows[index] = { ...rows[index], status: nextStatus, lastUpdated: new Date().toISOString().slice(0, 10) };
  if (nextStatus === "Approved") ensureStudentMasterFromRequest(rows[index]);
  syncStudentPortalAccount(rows[index]);
  saveStudentRegistrationRequests(rows);
  addAudit({
    action: nextStatus === "Approved" ? "APPROVE" : nextStatus === "Rejected" ? "REJECT" : nextStatus === "Suspended" ? "SUSPEND" : "ACTIVATE",
    module: "Student Login Access",
    role: "INSTITUTE_ADMIN",
    recordId: rows[index].studentId,
    details: `${nextStatus} student portal login access through Supabase-ready workflow`,
    severity: nextStatus === "Rejected" || nextStatus === "Suspended" ? "Warning" : "Info",
    status: "Success"
  });
  showToast(nextStatus === "Approved" ? "Student login access approved through Supabase-ready workflow." : `Student login access marked ${nextStatus} through Supabase-ready workflow.`, "success");
  rerender?.();
}

function statusPill(status) {
  const safe = String(status || "Pending Approval").toLowerCase().replace(/\s+/g, "-");
  return `<span class="student-access-status student-access-${escapeHtml(safe)}">${escapeHtml(status || "Pending Approval")}</span>`;
}

function studentApprovalsPage() {
  const id = "student-approvals";
  const columns = [
    { key: "requestId", label: "Request ID" },
    { key: "studentId", label: "Student ID" },
    { key: "admissionNo", label: "Admission Number" },
    { key: "name", label: "Student Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "submittedOn", label: "Submitted On" },
    { key: "status", label: "Status", render: record => statusPill(record.status) }
  ];
  const state = { query: "", filter: "", sort: "submittedOn", dir: -1, page: 1, size: 10 };
  const statuses = ["Pending Approval", "Approved", "Rejected", "Suspended"];

  function filteredRows() {
    let rows = studentRegistrationRequests();
    if (state.query) {
      const q = state.query.toLowerCase();
      rows = rows.filter(row => JSON.stringify(row).toLowerCase().includes(q));
    }
    if (state.filter) rows = rows.filter(row => row.status === state.filter);
    rows.sort((a, b) => String(a[state.sort] ?? "").localeCompare(String(b[state.sort] ?? ""), undefined, { numeric: true }) * state.dir);
    return rows;
  }

  function render() {
    const stats = studentAccessStats();
    main.innerHTML = pageHeader("Student Registration Approvals", "Review student self-registration requests and enable Student Portal login after Institute Admin approval.") +
      notice("Student Portal access is now wired for Supabase Auth, RLS and Institute Admin approval Edge Functions. SessionStorage remains only as an offline preview fallback.") +
      `<section class="stat-grid">
        ${stat("Pending Student Login Requests", stats.pending, "Student Portal access", "warning", "message")}
        ${stat("Approved Student Accounts", stats.approved, "Student Portal access", "neutral", "check")}
        ${stat("Rejected Student Requests", stats.rejected, "Student Portal access", "critical", "error")}
        ${stat("Suspended Student Accounts", stats.suspended, "Student Portal access", "warning", "warning")}
      </section>
      <section class="card"><div class="admin-table-tools"><input id="${id}-search" type="search" placeholder="Search registration requests..." aria-label="Search registration requests" value="${escapeHtml(state.query)}"><select id="${id}-filter"><option value="">All Statuses</option>${statuses.map(status => `<option value="${escapeHtml(status)}" ${state.filter === status ? "selected" : ""}>${escapeHtml(status)}</option>`).join("")}</select><button class="btn btn-secondary" id="${id}-csv" type="button">${icon("download")} Export CSV</button></div><div class="table-wrap"><table id="${id}-table"><thead><tr>${columns.map(column => `<th><button class="text-button" type="button" data-sort="${escapeHtml(column.key)}">${escapeHtml(column.label)}</button></th>`).join("")}<th class="align-right">Actions</th></tr></thead><tbody></tbody></table></div><div class="student-table-footer" id="${id}-summary"></div></section>`;
    bindEvents();
    renderRows();
  }

  function renderRows() {
    const tbody = document.querySelector(`#${id}-table tbody`);
    const summary = document.getElementById(`${id}-summary`);
    const rows = filteredRows();
    const pageCount = Math.max(1, Math.ceil(rows.length / state.size));
    state.page = Math.min(Math.max(1, state.page), pageCount);
    const start = (state.page - 1) * state.size;
    const pageRows = rows.slice(start, start + state.size);
    tbody.innerHTML = pageRows.length ? pageRows.map(record => {
      const actions = `<div class="admin-row-actions"><button class="table-action" type="button" data-action="view" data-id="${escapeHtml(record.requestId)}">View</button><button class="table-action" type="button" data-action="approve" data-id="${escapeHtml(record.requestId)}" ${record.status === "Approved" ? "disabled" : ""}>Approve</button><button class="table-action danger" type="button" data-action="reject" data-id="${escapeHtml(record.requestId)}" ${record.status === "Rejected" ? "disabled" : ""}>Reject</button><button class="table-action danger" type="button" data-action="suspend" data-id="${escapeHtml(record.requestId)}" ${record.status === "Suspended" ? "disabled" : ""}>Suspend</button><button class="table-action" type="button" data-action="activate" data-id="${escapeHtml(record.requestId)}" ${record.status === "Approved" ? "disabled" : ""}>Activate</button></div>`;
      return `<tr>${columns.map(column => `<td>${column.render ? column.render(record) : escapeHtml(record[column.key])}</td>`).join("")}<td class="align-right">${actions}</td></tr>`;
    }).join("") : `<tr><td colspan="${columns.length + 1}"><div class="empty-state"><span>${icon("message")}</span><strong>No registration requests found.</strong><p>Students can submit requests from student-portal/register.html.</p></div></td></tr>`;
    summary.innerHTML = `<span>Showing ${pageRows.length} of ${rows.length} requests</span><span><button class="table-action" type="button" data-page="prev" ${state.page <= 1 ? "disabled" : ""}>Prev</button> Page ${state.page} of ${pageCount} <button class="table-action" type="button" data-page="next" ${state.page >= pageCount ? "disabled" : ""}>Next</button></span>`;
  }

  function bindEvents() {
    document.getElementById(`${id}-search`)?.addEventListener("input", event => { state.query = event.target.value; state.page = 1; renderRows(); });
    document.getElementById(`${id}-filter`)?.addEventListener("change", event => { state.filter = event.target.value; state.page = 1; renderRows(); });
    document.getElementById(`${id}-csv`)?.addEventListener("click", () => {
      const rows = filteredRows();
      exportCsv([columns.map(column => column.label), ...rows.map(record => columns.map(column => record[column.key]))], "student-registration-approvals.csv");
    });
    document.getElementById(`${id}-table`)?.addEventListener("click", async event => {
      const sortButton = event.target.closest("[data-sort]");
      if (sortButton) {
        const key = sortButton.dataset.sort;
        state.dir = state.sort === key ? state.dir * -1 : 1;
        state.sort = key;
        renderRows();
        return;
      }
      const actionButton = event.target.closest("[data-action]");
      if (!actionButton || actionButton.disabled) return;
      const request = studentRegistrationRequests().find(row => row.requestId === actionButton.dataset.id);
      if (!request) {
        showToast("Registration request not found.", "error");
        return;
      }
      const action = actionButton.dataset.action;
      if (action === "view") return showRecord(request, `Registration ${request.requestId}`);
      if (action === "approve") return await updateRegistrationStatus(request.requestId, "Approved", render);
      if (action === "reject") return await updateRegistrationStatus(request.requestId, "Rejected", render);
      if (action === "suspend") return await updateRegistrationStatus(request.requestId, "Suspended", render);
      if (action === "activate") return await updateRegistrationStatus(request.requestId, "Approved", render, "Activate");
    });
    document.getElementById(`${id}-summary`)?.addEventListener("click", event => {
      const pageButton = event.target.closest("[data-page]");
      if (!pageButton || pageButton.disabled) return;
      if (pageButton.dataset.page === "prev") state.page -= 1;
      if (pageButton.dataset.page === "next") state.page += 1;
      renderRows();
    });
  }

  render();
  loadStudentAccountRequestsFromBackend().then(result => {
    if (result.handled && result.ok) render();
  });
}

  function adminGeneric() {
    const routeMap = {
      "student-records": "students",
      "student-documents": "students",
      "faculty-records": "faculty",
      "faculty-documents": "faculty",
      courses: "courses",
      programs: "programs",
      departments: "departments",
      subjects: "subjects",
      classes: "classes",
      "academic-years": "academicYears"
    };
    if (routeMap[page] === "students") return adminStudents();
    if (routeMap[page] === "faculty") return adminFaculty();
    if (routeMap[page]) return academicPage(routeMap[page]);
    if (page === "student-approvals") return studentApprovalsPage();
    if (page === "record-activity") return directorTablePage("Record Activity", "audit", false);
    if (page === "data-quality") return dataQualityPage();
    const titles = {
      "student-reports": ["Student Reports", "Student master report views"],
      "faculty-reports": ["Faculty Reports", "Faculty master report views"],
      "academic-reports": ["Academic Reports", "Academic master report views"],
      notifications: ["Notifications", "Institute Admin notifications"],
      profile: ["Profile", "Institute Admin account profile"],
      settings: ["Settings", "Institute Admin settings"]
    };
    const [title, description] = titles[page] || ["Institute Admin", "Prepared module"];
    main.innerHTML = pageHeader(title, description) + notice() + `<section class="card"><div class="section-head"><div><h2>${escapeHtml(title)}</h2><p>This frontend module is prepared for future PHP/MySQL integration.</p></div></div><p class="master-note">Master Record Owner: Institute Administration.</p></section>`;
  }

  function dataQualityPage() {
    const s = students();
    const f = faculty();
    const rows = [
      { id: "DQ-STU-EMAIL", area: "Student Records", issue: "Missing email", count: s.filter(item => !item.email).length, owner: "Institute Administration", status: "Review" },
      { id: "DQ-STU-DOC", area: "Student Documents", issue: "Pending documents", count: s.filter(item => item.documentsStatus === "Pending").length, owner: "Institute Administration", status: "Review" },
      { id: "DQ-FAC-EMAIL", area: "Faculty Records", issue: "Missing email", count: f.filter(item => !item.email).length, owner: "Institute Administration", status: "Review" },
      { id: "DQ-FAC-DOC", area: "Faculty Documents", issue: "Pending documents", count: f.filter(item => item.documentsStatus === "Pending").length, owner: "Institute Administration", status: "Review" }
    ];
    const columns = [{ key: "id", label: "Quality ID" }, { key: "area", label: "Area" }, { key: "issue", label: "Issue" }, { key: "count", label: "Count" }, { key: "owner", label: "Owner" }, { key: "status", label: "Status" }];
    main.innerHTML = pageHeader("Data Quality", "Incomplete records and document gaps.") + notice() + tableMarkup({ id: "data-quality", columns, filters: ["Review"], allowCrud: false });
    bindTable({ id: "data-quality", columns, getRows: () => rows, filterField: "status", csvName: "data-quality.csv", allowCrud: false, onView: record => showRecord(record, record.id) });
  }

  function average(list, key) {
    return list.length ? Math.round(list.reduce((sum, item) => sum + (Number(item[key]) || 0), 0) / list.length) : 0;
  }

  function directorDashboard() {
    const s = students();
    const f = faculty();
    const academic = academicStore();
    const a = audits();
    const attendance = s.length ? average(s, "attendance") : null;
    const cgpa = s.length ? s.reduce((sum, item) => sum + (Number(item.cgpa) || 0), 0) / s.length : null;
    const access = studentAccessStats();
    const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const metric = (label, value, ico, modifier = "") => `
      <article class="director-metric ${modifier}">
        <span class="director-metric-icon">${icon(ico)}</span>
        <span class="director-metric-label">${escapeHtml(label)}</span>
        <strong class="director-metric-value">${escapeHtml(value)}</strong>
      </article>`;
    const progressMetric = (label, value, max, suffix, ico) => `
      <article class="director-performance-metric">
        <div class="director-performance-heading"><span class="director-metric-icon">${icon(ico)}</span><span>${escapeHtml(label)}</span></div>
        <strong>${value === null ? "—" : `${escapeHtml(value)}${suffix}`}</strong>
        ${value === null ? "" : `<div class="director-progress-track" role="img" aria-label="${escapeHtml(label)}: ${escapeHtml(value)}${suffix}"><span style="--progress:${Math.min(100, Math.max(0, value / max * 100))}%"></span></div>`}
        ${label === "Average CGPA" ? '<small>Scale: 0–10</small>' : ""}
      </article>`;
    main.innerHTML = pageHeader("Director Dashboard", "Institution-wide performance, governance, and strategic oversight.",
      `<span class="director-current-date">${escapeHtml(today)}</span>`) +
      notice("Super Admin is the Institute Director. This portal monitors and governs; it is not the normal data-entry workspace.") +
      `<section class="director-section" aria-labelledby="director-overview-title">
        <div class="director-section-heading"><div><span class="eyebrow">INSTITUTION</span><h2 id="director-overview-title">Institutional Overview</h2></div></div>
        <div class="director-metric-grid">
          ${metric("Total Students", s.length, "student")}
          ${metric("Total Faculty", f.length, "faculty")}
          ${metric("Programs", academic.programs.length, "book")}
          ${metric("Departments", academic.departments.length, "building")}
        </div>
      </section>
      <div class="director-dashboard-grid">
        <section class="director-section director-panel" aria-labelledby="director-academic-title">
          <div class="director-section-heading"><div><span class="eyebrow">ACADEMICS</span><h2 id="director-academic-title">Academic Performance</h2></div></div>
          <div class="director-performance-grid">
            ${progressMetric("Average Attendance", attendance, 100, "%", "calendar")}
            ${progressMetric("Average CGPA", cgpa === null ? null : cgpa.toFixed(1), 10, "", "chart")}
          </div>
        </section>
        <section class="director-section director-panel" aria-labelledby="director-placement-title">
          <div class="director-section-heading"><div><span class="eyebrow">CAREER OUTCOMES</span><h2 id="director-placement-title">Placement Performance</h2></div></div>
          <div class="director-placement-grid">
            ${metric("Placement Rate", "74.4%", "chart")}
            ${metric("Students Placed", "96", "student")}
            ${metric("Active Companies", "84", "building")}
          </div>
        </section>
      </div>
      <section class="director-section director-panel director-governance" aria-labelledby="director-governance-title">
        <div class="director-section-heading"><div><span class="eyebrow">GOVERNANCE</span><h2 id="director-governance-title">Governance &amp; Attention</h2></div></div>
        <div class="director-governance-grid">
          ${metric("Open Complaints", "9", "message")}
          ${metric("Pending Requests", "17", "clock", "is-pending")}
          ${metric("Critical Alerts", "4", "warning", "is-critical")}
        </div>
      </section>
      <section class="director-section director-panel" aria-labelledby="director-access-title">
        <div class="director-section-heading"><div><span class="eyebrow">STUDENT PORTAL</span><h2 id="director-access-title">Student Account Access</h2></div></div>
        <div class="director-access-grid">
          ${metric("Pending Login Requests", access.pending, "clock", "is-pending")}
          ${metric("Approved Accounts", access.approved, "check")}
          ${metric("Rejected Requests", access.rejected, "error", "is-critical")}
          ${metric("Suspended Accounts", access.suspended, "warning", "is-pending")}
        </div>
      </section>
      <section class="director-section director-panel" aria-labelledby="director-activity-title">
        <div class="director-section-heading"><div><span class="eyebrow">AUDIT LOG</span><h2 id="director-activity-title">Recent Audit Activity</h2></div><a class="text-button" href="audit-log.html">Open audit log</a></div>
        ${a.length ? `<div class="director-activity-list">${a.slice(0, 6).map(item => `
          <article class="director-activity-item">
            <span class="director-activity-icon">${icon("activity")}</span>
            <div><strong>${escapeHtml(item.action)} · ${escapeHtml(item.module)}</strong><small>${escapeHtml(item.user)} · ${escapeHtml(item.recordId)}</small></div>
            <time>${escapeHtml(item.time)}</time>
          </article>`).join("")}</div>` : '<p class="director-empty-state">No audit activity is available.</p>'}
      </section>`;
  }

  function directorTablePage(title, kind) {
    let rows;
    let columns;
    let id;
    let filterField;
    if (kind === "students") {
      rows = students();
      columns = studentColumns;
      id = "director-students";
      filterField = "program";
    } else if (kind === "faculty") {
      rows = faculty();
      columns = facultyColumns;
      id = "director-faculty";
      filterField = "department";
    } else {
      rows = audits();
      columns = [
        { key: "id", label: "Audit ID" }, { key: "time", label: "Timestamp" }, { key: "user", label: "User" }, { key: "role", label: "Role" }, { key: "module", label: "Module" }, { key: "action", label: "Action" }, { key: "recordId", label: "Record ID" }, { key: "details", label: "Details" }, { key: "severity", label: "Severity", render: record => `<span class="audit-severity-${String(record.severity).toLowerCase()}">${escapeHtml(record.severity)}</span>` }, { key: "status", label: "Status" }
      ];
      id = "audit-log";
      filterField = "role";
    }
    main.innerHTML = pageHeader(title, "Director-level read-only oversight view.") + notice() + tableMarkup({ id, columns, filters: [...new Set(rows.map(item => item[filterField]).filter(Boolean))], allowCrud: false });
    bindTable({ id, columns, getRows: () => rows, filterField, csvName: `${id}.csv`, allowCrud: false, onView: record => showRecord(record, title) });
  }

  function administrators() {
    const rows = ["Institute Admin", "Student Admin", "Faculty Admin", "CR Admin", "Council Admin", "CRC Admin"].map((name, index) => ({
      id: `ADM${100 + index}`,
      role: name,
      portal: name.replace(" Admin", "") + " Portal",
      status: "Active",
      activity: ["Created student record", "Reviewed document", "Updated timetable", "Submitted class update", "Created event", "Updated company follow-up"][index],
      login: "2026-09-17",
      changes: 3 + index
    }));
    const columns = [{ key: "role", label: "Role" }, { key: "portal", label: "Portal" }, { key: "status", label: "Status" }, { key: "activity", label: "Recent Activity" }, { key: "login", label: "Last Demo Login" }, { key: "changes", label: "Recent Change Count" }];
    main.innerHTML = pageHeader("Administrators", "Monitor portal administrators and recent demo activity.") + notice() + tableMarkup({ id: "administrators", columns, filters: ["Active"], allowCrud: false });
    bindTable({ id: "administrators", columns, getRows: () => rows, filterField: "status", csvName: "administrators.csv", allowCrud: false, onView: record => showRecord(record, record.role) });
  }

  function groupRows(list, key) {
    const groups = {};
    list.forEach(item => {
      const name = item[key] || "Unassigned";
      if (!groups[name]) groups[name] = { id: name, name, count: 0, active: 0, attention: 0, pending: 0 };
      groups[name].count += 1;
      if (item.status === "Active") groups[name].active += 1;
      if ((item.attendance || 100) < 75 || (item.cgpa || 10) < 6.5 || item.backlogs > 0 || item.workload === "High") groups[name].attention += 1;
      if (item.documentsStatus === "Pending") groups[name].pending += 1;
    });
    return Object.values(groups);
  }

  function portalOverview(kind) {
    const s = students();
    const f = faculty();
    const academic = academicStore();
    const a = audits();
    let title = "Portal Overview";
    let description = "Director-level read-only oversight page.";
    let stats = [];
    let rows = [];
    let columns = [];
    let filterField = "status";
    const id = `director-${kind}`;

    if (kind === "student") {
      title = "Student Administration Overview";
      description = "Read-only Director view of Student Administration operations. This does not open the Student Admin dashboard.";
      stats = [stat("Total Students", s.length, "Shared student data", "neutral", "student"), stat("Active Students", s.filter(item => item.status === "Active").length), stat("Average Attendance", average(s, "attendance") + "%"), stat("Academic Risk", s.filter(item => (item.cgpa || 10) < 6.5 || item.backlogs > 0 || (item.attendance || 100) < 75).length, "Needs review", "warning", "warning")];
      rows = groupRows(s, "program");
      columns = [{ key: "name", label: "Program" }, { key: "count", label: "Students" }, { key: "active", label: "Active" }, { key: "attention", label: "Needs Attention" }, { key: "pending", label: "Pending Documents" }];
      filterField = "name";
    } else if (kind === "faculty") {
      title = "Faculty Overview";
      description = "Read-only Director view of faculty operations. This does not open the Faculty dashboard.";
      stats = [stat("Total Faculty", f.length, "Shared faculty data", "neutral", "faculty"), stat("Active Faculty", f.filter(item => item.status === "Active").length), stat("Average Attendance", average(f, "attendance") + "%"), stat("High Workload", f.filter(item => item.workload === "High").length, "Needs review", "warning", "warning")];
      rows = groupRows(f, "department");
      columns = [{ key: "name", label: "Department" }, { key: "count", label: "Faculty" }, { key: "active", label: "Active" }, { key: "attention", label: "Needs Attention" }, { key: "pending", label: "Pending Documents" }];
      filterField = "name";
    } else if (kind === "cr") {
      title = "Class Representative Overview";
      description = "Director-level summary of CR portal activity. The Director monitors CR work without entering the CR dashboard.";
      stats = [stat("Active CRs", "18", "Class representation", "neutral", "users"), stat("Classes Covered", "12"), stat("Pending Updates", "7", "Needs review", "warning", "message"), stat("Resolved Requests", "31")];
      rows = [{ id: "CR-MCA-IA", class: "MCA I-A", representatives: "2", updates: "4", pending: "1", lastReport: "2026-09-16" }, { id: "CR-MCA-IIB", class: "MCA II-B", representatives: "2", updates: "3", pending: "2", lastReport: "2026-09-15" }, { id: "CR-MBA-IA", class: "MBA I-A", representatives: "2", updates: "5", pending: "1", lastReport: "2026-09-17" }, { id: "CR-BCA-IIC", class: "BCA II-C", representatives: "2", updates: "2", pending: "3", lastReport: "2026-09-14" }];
      columns = [{ key: "class", label: "Class / Division" }, { key: "representatives", label: "CRs" }, { key: "updates", label: "Recent Updates" }, { key: "pending", label: "Pending Requests" }, { key: "lastReport", label: "Last Report" }];
      filterField = "class";
    } else if (kind === "council") {
      title = "Student Council Overview";
      description = "Director-level summary of council members, events, programs, feedback and complaints.";
      stats = [stat("Council Members", "24", "Council data", "neutral", "users"), stat("Active Members", "21"), stat("Upcoming Events", "6"), stat("Open Complaints", "9", "Governance", "warning", "message")];
      rows = [{ id: "COU-ACT", area: "Activities", records: "18", active: "8", pending: "3", signal: "Healthy" }, { id: "COU-EVT", area: "Events", records: "14", active: "6", pending: "5", signal: "Review registrations" }, { id: "COU-FBK", area: "Feedback", records: "62", active: "17", pending: "17", signal: "Needs response" }, { id: "COU-CMP", area: "Complaints", records: "21", active: "9", pending: "9", signal: "Governance review" }];
      columns = [{ key: "area", label: "Council Area" }, { key: "records", label: "Records" }, { key: "active", label: "Active" }, { key: "pending", label: "Pending" }, { key: "signal", label: "Director Signal" }];
      filterField = "area";
    } else if (kind === "crc") {
      title = "Corporate Resource Cell Overview";
      description = "Director-level summary of placement, companies, recruiters and Corporate Resource Cell activity.";
      stats = [stat("Active Companies", "84", "CRC data", "neutral", "building"), stat("Recruiter Contacts", "116"), stat("Open Opportunities", "32"), stat("Students Placed", "96")];
      rows = [{ id: "CRC-LEADS", area: "Company Leads", records: "27", active: "18", pending: "9", signal: "Follow-ups due" }, { id: "CRC-DRIVES", area: "Placement Drives", records: "7", active: "7", pending: "4", signal: "Upcoming" }, { id: "CRC-APPS", area: "Applications", records: "428", active: "214", pending: "36", signal: "Shortlisting review" }, { id: "CRC-OFFERS", area: "Offers", records: "112", active: "96", pending: "16", signal: "Offer confirmation" }];
      columns = [{ key: "area", label: "CRC Area" }, { key: "records", label: "Records" }, { key: "active", label: "Active" }, { key: "pending", label: "Pending" }, { key: "signal", label: "Director Signal" }];
      filterField = "area";
    } else {
      title = "Institute Administration Overview";
      description = "Director-level summary of Institute Admin master-record activity. This is oversight only, not the Institute Admin workspace.";
      stats = [stat("Students", s.length, "Master records", "neutral", "student"), stat("Faculty", f.length, "Master records", "neutral", "faculty"), stat("Academic Records", academic.courses.length + academic.programs.length + academic.departments.length + academic.subjects.length + academic.classes.length + academic.academicYears.length), stat("Recent Audit Items", a.length, "Activity visibility"), stat("Student Login Pending", studentAccessStats().pending, "Student Portal access", "warning", "message"), stat("Approved Student Accounts", studentAccessStats().approved, "Student Portal access", "neutral", "check")];
      rows = [{ id: "MASTER-STUDENT", area: "Student Master Records", owner: "Institute Administration", records: s.length, pending: s.filter(item => item.documentsStatus === "Pending").length, activity: "Creation, edits and delete visibility" }, { id: "MASTER-FACULTY", area: "Faculty Master Records", owner: "Institute Administration", records: f.length, pending: f.filter(item => item.status !== "Active").length, activity: "Creation, edits and delete visibility" }, { id: "MASTER-ACADEMIC", area: "Academic Master Data", owner: "Institute Administration", records: academic.courses.length + academic.programs.length + academic.departments.length + academic.subjects.length + academic.classes.length + academic.academicYears.length, pending: 4, activity: "Courses, programs, departments, subjects" }, { id: "MASTER-AUDIT", area: "Record Activity", owner: "Institute Administration", records: a.length, pending: 0, activity: "Audit visibility for Director" }];
      columns = [{ key: "area", label: "Area" }, { key: "owner", label: "Master Record Owner" }, { key: "records", label: "Records" }, { key: "pending", label: "Pending" }, { key: "activity", label: "Activity Type" }];
      filterField = "area";
    }

    main.innerHTML = pageHeader(title, description) + notice("Super Admin portal links are read-only oversight pages. They do not redirect into operational admin dashboards.") +
      `<section class="stat-grid">${stats.join("")}</section>` +
      tableMarkup({ id, columns, filters: [...new Set(rows.map(item => item[filterField]).filter(Boolean))], allowCrud: false }) +
      `<section class="card"><div class="section-head"><div><h2>Director Oversight Boundary</h2><p>This page summarizes portal activity for governance. Operational actions remain inside each portal and future PHP/MySQL RBAC must enforce those permissions server-side.</p></div></div><p class="master-note">No direct operational dashboard redirection is used from this Super Admin portal entry.</p></section>`;
    bindTable({ id, columns, getRows: () => rows, filterField, csvName: `${id}.csv`, allowCrud: false, onView: record => showRecord(record, title) });
  }

  function superGeneric() {
    const portalPages = { "portal-student": "student", "portal-faculty": "faculty", "portal-cr": "cr", "portal-council": "council", "portal-crc": "crc", "portal-admin": "admin" };
    if (portalPages[page]) return portalOverview(portalPages[page]);
    const map = {
      "institute-overview": ["Institute Overview", "academic"], "student-overview": ["Student Overview", "students"], "faculty-overview": ["Faculty Overview", "faculty"], "academic-overview": ["Academic Overview", "academic"], "placement-overview": ["Placement Overview", "placement"], complaints: ["Complaints", "governance"], requests: ["Requests", "governance"], administrators: ["Administrators", "admins"], "activity-monitor": ["Activity Monitor", "audit"], "audit-log": ["Audit Log", "audit"], "system-alerts": ["System Alerts", "alerts"], reports: ["Reports", "reports"], analytics: ["Analytics", "reports"], notifications: ["Notifications", "alerts"], profile: ["Profile", "profile"], settings: ["Settings", "profile"]
    };
    const entry = map[page] || ["Director Oversight", "reports"];
    if (entry[1] === "students") return directorTablePage(entry[0], "students");
    if (entry[1] === "faculty") return directorTablePage(entry[0], "faculty");
    if (entry[1] === "audit") return directorTablePage(entry[0], "audit");
    if (entry[1] === "admins") return administrators();
    if (entry[1] === "academic") return portalOverview("admin");
    main.innerHTML = pageHeader(entry[0], "Director-level monitoring and governance module.") + notice() + `<section class="card"><div class="section-head"><div><h2>${escapeHtml(entry[0])}</h2><p>Read-only oversight page prepared for future secure backend integration.</p></div></div><div class="quick-action-grid">${["Students", "Faculty", "Academics", "Placements", "Complaints", "Requests", "Alerts", "Audit"].map(item => `<article class="quick-action"><span>${icon("chart")}</span><span><strong>${escapeHtml(item)}</strong><small>Aggregated governance signal</small></span></article>`).join("")}</div></section>`;
  }

  if (roleKey === "INSTITUTE_ADMIN") {
    if (page === "dashboard") instituteDashboard();
    else if (page === "students") adminStudents();
    else if (page === "faculty") adminFaculty();
    else if (page === "add-student") addStudent();
    else if (page === "add-faculty") addFaculty();
    else if (page === "student-approvals") studentApprovalsPage();
    else adminGeneric();
  } else if (page === "dashboard") {
    directorDashboard();
  } else {
    superGeneric();
  }
})();
