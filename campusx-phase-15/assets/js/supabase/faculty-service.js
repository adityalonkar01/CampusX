/* CampusX Prompt 14 — Supabase faculty operations service. Publishable-key + RLS only. */
(function () {
  "use strict";
  const TABLES = {
    faculty: "faculty", departments: "departments", programs: "programs", subjects: "subjects", classes: "classes", academicYears: "academic_years",
    subjectAssignments: "faculty_subject_assignments", classAssignments: "faculty_class_assignments", workload: "faculty_workload",
    attendance: "faculty_attendance", leaveRequests: "faculty_leave_requests", requests: "faculty_requests", resources: "faculty_resources",
    responsibilities: "faculty_responsibilities", activities: "faculty_activities", schedule: "faculty_schedule", documents: "faculty_documents"
  };
  function client(){ return window.CampusXSupabaseConfig?.getClient?.() || null; }
  function configured(){ return Boolean(client()); }
  function normalizeError(error){ return error ? { message:error.message || String(error), code:error.code || "" } : null; }
  async function safe(label, fn, fallback=[]){
    const c=client(); if(!c) return { ok:false, live:false, data:fallback, error:{message:"Supabase client is not configured."} };
    try { const {data,error}=await fn(c); if(error) throw error; return {ok:true,live:true,data:data ?? fallback,error:null}; }
    catch(error){ console.warn(`[CampusX Faculty] ${label}`, error); return {ok:false,live:true,data:fallback,error:normalizeError(error)}; }
  }
  const selects = {
    faculty: "id,faculty_id,first_name,middle_name,last_name,dob,gender,email,phone,department_id,designation,joining_date,employment_type,qualification,specialization,experience,status,created_at,updated_at,departments(id,code,name)",
    subjectAssignments: "id,faculty_id,subject_id,program_id,academic_year_id,semester,assignment_type,start_date,end_date,status,created_at,faculty(id,faculty_id,first_name,middle_name,last_name),subjects(id,code,name,department_id),programs(id,code,name),academic_years(id,code,name)",
    classAssignments: "id,faculty_id,class_id,subject_id,weekly_lectures,practical_hours,status,created_at,faculty(id,faculty_id,first_name,middle_name,last_name),classes(id,code,name,semester,program_id,division_id),subjects(id,code,name)",
    attendance: "id,faculty_id,attendance_date,check_in,check_out,status,working_hours,remarks,created_at,faculty(id,faculty_id,first_name,middle_name,last_name,department_id)",
    leaveRequests: "id,faculty_id,leave_type,start_date,end_date,reason,priority,status,reviewed_by,reviewed_at,remarks,created_at,faculty(id,faculty_id,first_name,middle_name,last_name)",
    requests: "id,faculty_id,request_type,title,description,priority,status,assigned_to,created_at,updated_at,faculty(id,faculty_id,first_name,middle_name,last_name)",
    resources: "id,faculty_id,subject_id,resource_type,title,description,storage_path,status,created_at,updated_at,faculty(id,faculty_id,first_name,middle_name,last_name),subjects(id,code,name)",
    responsibilities: "id,faculty_id,responsibility_type,title,start_date,end_date,status,notes,created_at,faculty(id,faculty_id,first_name,middle_name,last_name)",
    activities: "id,faculty_id,category,title,organizer,activity_date,status,description,created_at,faculty(id,faculty_id,first_name,middle_name,last_name)",
    schedule: "id,faculty_id,subject_id,class_id,schedule_date,day_of_week,start_time,end_time,room,mode,status,created_at,faculty(id,faculty_id,first_name,middle_name,last_name),subjects(id,code,name),classes(id,code,name,semester)",
    documents: "id,faculty_id,document_type,document_name,storage_path,verification_status,verified_by,verified_at,remarks,created_at,updated_at,faculty(id,faculty_id,first_name,middle_name,last_name)"
  };
  async function list(table, select="*", opts={}){
    return safe(`list ${table}`, async c=>{ let q=c.from(table).select(select); if(opts.order) q=q.order(opts.order,{ascending:opts.ascending!==false}); if(opts.limit) q=q.limit(opts.limit); return await q; }, []);
  }
  async function bootstrap(){
    const keys=["faculty","departments","programs","subjects","classes","academicYears","subjectAssignments","classAssignments","workload","attendance","leaveRequests","requests","resources","responsibilities","activities","schedule","documents"];
    const calls={
      faculty:list(TABLES.faculty,selects.faculty,{order:"faculty_id"}), departments:list(TABLES.departments,"id,code,name,status",{order:"name"}), programs:list(TABLES.programs,"id,code,name,department_id,status",{order:"name"}),
      subjects:list(TABLES.subjects,"id,code,name,program_id,department_id,semester,credits,status",{order:"code"}), classes:list(TABLES.classes,"id,code,name,program_id,division_id,academic_year_id,semester,capacity,status",{order:"code"}),
      academicYears:list(TABLES.academicYears,"id,code,name,is_current,status",{order:"name",ascending:false}), subjectAssignments:list(TABLES.subjectAssignments,selects.subjectAssignments,{order:"created_at",ascending:false}),
      classAssignments:list(TABLES.classAssignments,selects.classAssignments,{order:"created_at",ascending:false}), workload:list(TABLES.workload,"*",{order:"created_at",ascending:false}), attendance:list(TABLES.attendance,selects.attendance,{order:"attendance_date",ascending:false}),
      leaveRequests:list(TABLES.leaveRequests,selects.leaveRequests,{order:"created_at",ascending:false}), requests:list(TABLES.requests,selects.requests,{order:"created_at",ascending:false}), resources:list(TABLES.resources,selects.resources,{order:"created_at",ascending:false}),
      responsibilities:list(TABLES.responsibilities,selects.responsibilities,{order:"created_at",ascending:false}), activities:list(TABLES.activities,selects.activities,{order:"activity_date",ascending:false}), schedule:list(TABLES.schedule,selects.schedule,{order:"start_time"}), documents:list(TABLES.documents,selects.documents,{order:"created_at",ascending:false})
    };
    const values=await Promise.all(keys.map(k=>calls[k])); const data={}; let live=false; const errors=[];
    keys.forEach((k,i)=>{data[k]=values[i].data||[]; live=live||values[i].ok; if(values[i].error) errors.push({key:k,...values[i].error});});
    return {ok:true,live,data,errors};
  }
  async function currentUser(){ const c=client(); if(!c)return null; const {data}=await c.auth.getUser(); return data?.user||null; }
  async function withAudit(action,module,recordType,recordId,description){
    const c=client(); if(!c)return; try{ const user=await currentUser(); if(!user)return; await c.from("activity_logs").insert({actor_user_id:user.id,actor_role:"FACULTY_ADMIN",module,action,record_type:recordType,record_id:String(recordId||""),description}); }catch(e){ console.warn("CampusX activity log skipped",e); }
  }
  async function insert(table,payload,audit){ const c=client(); if(!c)return {ok:false,error:{message:"Supabase is not configured."}}; const user=await currentUser(); const row={...payload}; if(user && ["faculty_subject_assignments","faculty_class_assignments","faculty_workload","faculty_attendance","faculty_schedule","faculty_responsibilities","faculty_activities"].includes(table)){ if("created_by" in payload || ["faculty_subject_assignments","faculty_class_assignments","faculty_workload","faculty_attendance","faculty_schedule","faculty_responsibilities","faculty_activities"].includes(table)) row.created_by=user.id; }
    const {data,error}=await c.from(table).insert(row).select().single(); if(error)return {ok:false,error:normalizeError(error)}; if(audit)await withAudit(audit.action,audit.module,audit.recordType,data.id,audit.description); return {ok:true,data}; }
  async function update(table,id,patch,audit){ const c=client(); if(!c)return {ok:false,error:{message:"Supabase is not configured."}}; const user=await currentUser(); const row={...patch}; if(user && ["faculty_subject_assignments","faculty_class_assignments","faculty_workload","faculty_attendance","faculty_schedule"].includes(table)) row.updated_by=user.id; const {data,error}=await c.from(table).update(row).eq("id",id).select().single(); if(error)return {ok:false,error:normalizeError(error)}; if(audit)await withAudit(audit.action,audit.module,audit.recordType,id,audit.description); return {ok:true,data}; }
  async function getFacultyById(id){ return safe("get faculty", c=>c.from(TABLES.faculty).select(selects.faculty).or(`id.eq.${id},faculty_id.eq.${id}`).maybeSingle(), null); }
  const api={configured,bootstrap,getFacultyById,
    createSubjectAssignment:p=>insert(TABLES.subjectAssignments,p,{action:"SUBJECT_ASSIGNMENT_CREATED",module:"Faculty Operations",recordType:"faculty_subject_assignment",description:"Faculty subject assignment created"}),
    createClassAssignment:p=>insert(TABLES.classAssignments,p,{action:"CLASS_ASSIGNMENT_CREATED",module:"Faculty Operations",recordType:"faculty_class_assignment",description:"Faculty class assignment created"}),
    saveAttendance:p=>insert(TABLES.attendance,p,{action:"ATTENDANCE_UPDATED",module:"Faculty Attendance",recordType:"faculty_attendance",description:"Faculty attendance recorded"}),
    createLeaveRequest:p=>insert(TABLES.leaveRequests,p,{action:"LEAVE_REQUEST_CREATED",module:"Faculty Leave",recordType:"faculty_leave_request",description:"Faculty leave request created"}),
    updateLeave:(id,p)=>update(TABLES.leaveRequests,id,p,{action:"LEAVE_STATUS_UPDATED",module:"Faculty Leave",recordType:"faculty_leave_request",description:"Faculty leave status updated"}),
    createRequest:p=>insert(TABLES.requests,p,{action:"FACULTY_REQUEST_CREATED",module:"Faculty Requests",recordType:"faculty_request",description:"Faculty request created"}),
    updateRequest:(id,p)=>update(TABLES.requests,id,p,{action:"FACULTY_REQUEST_UPDATED",module:"Faculty Requests",recordType:"faculty_request",description:"Faculty request updated"}),
    createResource:p=>insert(TABLES.resources,p,{action:"RESOURCE_ADDED",module:"Teaching Resources",recordType:"faculty_resource",description:"Teaching resource metadata added"}),
    createResponsibility:p=>insert(TABLES.responsibilities,p,{action:"RESPONSIBILITY_ASSIGNED",module:"Faculty Responsibilities",recordType:"faculty_responsibility",description:"Academic responsibility assigned"}),
    createActivity:p=>insert(TABLES.activities,p,{action:"FACULTY_ACTIVITY_ADDED",module:"Faculty Activities",recordType:"faculty_activity",description:"Faculty activity added"}),
    createSchedule:p=>insert(TABLES.schedule,p,{action:"TIMETABLE_UPDATED",module:"Faculty Timetable",recordType:"faculty_schedule",description:"Faculty schedule entry created"}),
    updateSchedule:(id,p)=>update(TABLES.schedule,id,p,{action:"TIMETABLE_UPDATED",module:"Faculty Timetable",recordType:"faculty_schedule",description:"Faculty schedule entry updated"})
  };
  window.CampusXFacultyService=api;
})();
