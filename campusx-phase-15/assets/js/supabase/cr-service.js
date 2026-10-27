(function () {
  "use strict";

  const clone = value => JSON.parse(JSON.stringify(value));
  const nowIso = () => new Date().toISOString();
  const today = () => new Date().toISOString().slice(0, 10);
  const client = () => window.CampusXSupabaseConfig?.getClient?.() || null;
  const isLive = () => Boolean(window.CampusXSupabaseConfig?.isConfigured?.() && client());

  const DEMO = {
    assignment: { id: "demo-cr-assignment", cr_user_id: "demo-cr-user", class_id: "demo-class", start_date: "2026-07-01", end_date: null, status: "ACTIVE" },
    classData: {
      id: "demo-class", code: "MCA-S2-A-2026", name: "MCA Semester II Division A", semester: 2, capacity: 60, status: "ACTIVE",
      program: { id: "demo-program", code: "MCA", name: "Master of Computer Applications", department_id: "demo-dept" },
      department: { id: "demo-dept", code: "CA", name: "Computer Applications" },
      division: { id: "demo-division", code: "A", name: "Division A" },
      academicYear: { id: "demo-year", code: "AY2026", name: "Academic Year 2026-27" },
      coordinator: { faculty_record_id: "demo-f1", faculty_id: "FAC1001", full_name: "Dr. Ananya Rao", designation: "Associate Professor" },
      cr: { full_name: "Sahil Patil", email: "cr.demo@campusx.edu" }
    },
    students: [
      ["STU1001","Aarav Sharma","201","94",8.7,"ACTIVE"],["STU1002","Riya Patil","202","89",8.4,"ACTIVE"],["STU1003","Aditya Joshi","203","76",7.1,"ACTIVE"],
      ["STU1004","Sneha Kulkarni","204","93",9.0,"ACTIVE"],["STU1005","Rahul Deshmukh","205","68",6.4,"ACTIVE"],["STU1006","Priya Shah","206","72",6.9,"ACTIVE"],
      ["STU1007","Kunal More","207","91",8.2,"ACTIVE"],["STU1008","Meera Joshi","208","96",9.3,"ACTIVE"],["STU1009","Vivek Pawar","209","82",7.8,"ACTIVE"],
      ["STU1010","Tanvi Desai","210","74",7.0,"ACTIVE"],["STU1011","Nikhil Jadhav","211","87",8.0,"ACTIVE"],["STU1012","Anaya Deshmukh","212","65",6.1,"ON_LEAVE"],
      ["STU1013","Ishaan Patil","213","86",7.9,"ACTIVE"],["STU1014","Mira Shah","214","90",8.5,"ACTIVE"],["STU1015","Dev Kulkarni","215","79",7.4,"ACTIVE"]
    ].map((x,i)=>({ id:`demo-student-${i+1}`, student_id:x[0], first_name:x[1].split(" ")[0], middle_name:null, last_name:x[1].split(" ").slice(1).join(" "), full_name:x[1], roll_number:x[2], program_id:"demo-program", semester:2, division_id:"demo-division", academic_year_id:"demo-year", attendance:Number(x[3]), cgpa:Number(x[4]), status:x[5] })),
    faculty: [
      { faculty_record_id:"demo-f1", faculty_id:"FAC1001", full_name:"Dr. Ananya Rao", designation:"Associate Professor", subject_id:"sub-java", subject_code:"MCA201", subject_name:"Java Programming" },
      { faculty_record_id:"demo-f2", faculty_id:"FAC1002", full_name:"Prof. Rahul Mehta", designation:"Assistant Professor", subject_id:"sub-db", subject_code:"MCA202", subject_name:"Database Management" },
      { faculty_record_id:"demo-f3", faculty_id:"FAC1003", full_name:"Dr. Neha Patil", designation:"Assistant Professor", subject_id:"sub-web", subject_code:"MCA203", subject_name:"Web Development" },
      { faculty_record_id:"demo-f4", faculty_id:"FAC1004", full_name:"Prof. Amit Joshi", designation:"Assistant Professor", subject_id:"sub-ds", subject_code:"MCA204", subject_name:"Data Structures" }
    ],
    attendance: [],
    updates: [
      {id:"UPD-1001",class_id:"demo-class",subject_id:"sub-java",faculty_id:"demo-f1",source_type:"FACULTY",title:"Internal assessment coverage confirmed",description:"Units 1 through 4 are included in the upcoming internal assessment.",priority:"IMPORTANT",publish_date:"2026-09-22T09:10:00Z",status:"PUBLISHED"},
      {id:"UPD-1002",class_id:"demo-class",subject_id:"sub-web",faculty_id:"demo-f3",source_type:"FACULTY",title:"Web Development practical rescheduled",description:"Friday practical will begin at 1:30 PM in Lab 1.",priority:"NORMAL",publish_date:"2026-09-21T10:00:00Z",status:"PUBLISHED"},
      {id:"UPD-1003",class_id:"demo-class",subject_id:null,faculty_id:null,source_type:"CR_COORDINATION",title:"Class coordination meeting",description:"Short class coordination meeting after the final lecture on Wednesday.",priority:"NORMAL",publish_date:"2026-09-20T12:00:00Z",status:"PUBLISHED"}
    ],
    assignments: [
      {id:"ASN-1001",class_id:"demo-class",subject_id:"sub-java",faculty_id:"demo-f1",title:"Java OOP Problem Set",description:"Complete all inheritance and interface problems.",assigned_date:"2026-09-18",due_date:"2026-09-27",submission_type:"ONLINE",status:"OPEN"},
      {id:"ASN-1002",class_id:"demo-class",subject_id:"sub-db",faculty_id:"demo-f2",title:"SQL Query Lab",description:"Submit the SQL query workbook.",assigned_date:"2026-09-17",due_date:"2026-09-25",submission_type:"PRACTICAL",status:"DUE_SOON"},
      {id:"ASN-1003",class_id:"demo-class",subject_id:"sub-web",faculty_id:"demo-f3",title:"Responsive Web Mini Project",description:"Build the assigned responsive interface.",assigned_date:"2026-09-20",due_date:"2026-10-02",submission_type:"ONLINE",status:"OPEN"}
    ],
    messages: [
      {id:"MSG-1001",class_id:"demo-class",cr_user_id:"demo-cr-user",faculty_id:"demo-f1",subject_id:"sub-java",topic:"Additional practical clarification",message:"Students need clarification about the additional Java practical slot.",priority:"IMPORTANT",status:"RESPONDED",created_at:"2026-09-21T08:30:00Z",updated_at:"2026-09-21T11:00:00Z"},
      {id:"MSG-1002",class_id:"demo-class",cr_user_id:"demo-cr-user",faculty_id:"demo-f2",subject_id:"sub-db",topic:"Database lab seating",message:"Can we adjust seating for Thursday's lab?",priority:"NORMAL",status:"SENT",created_at:"2026-09-22T07:20:00Z",updated_at:"2026-09-22T07:20:00Z"}
    ],
    replies: [{id:"REP-1001",message_id:"MSG-1001",sender_user_id:"demo-faculty-admin",sender_role:"FACULTY_ADMIN",message:"An additional practical slot will be available on Friday at 2:30 PM.",created_at:"2026-09-21T11:00:00Z"}],
    announcements: [
      {id:"ANN-1001",class_id:"demo-class",title:"Java practical reminder",message:"Java practical starts at 10:00 AM tomorrow.",category:"REMINDER",priority:"IMPORTANT",publish_date:"2026-09-22T08:00:00Z",status:"PUBLISHED"},
      {id:"ANN-1002",class_id:"demo-class",title:"Class seminar registration",message:"Register before 26 September.",category:"EVENT",priority:"NORMAL",publish_date:"2026-09-20T08:00:00Z",status:"PUBLISHED"}
    ],
    requests: [
      {id:"REQ-2041",class_id:"demo-class",student_id:"demo-student-5",category:"Infrastructure",title:"Classroom projector issue",description:"Projector image is unstable.",priority:"HIGH",status:"SUBMITTED",forwarded_to_role:null,cr_notes:null,created_at:"2026-09-22T06:20:00Z"},
      {id:"REQ-2042",class_id:"demo-class",student_id:"demo-student-3",category:"Academic",title:"Extra practical session",description:"Request an additional Database practical.",priority:"MEDIUM",status:"FORWARDED",forwarded_to_role:"FACULTY_ADMIN",cr_notes:"Forwarded for academic review.",created_at:"2026-09-21T07:00:00Z"},
      {id:"REQ-2043",class_id:"demo-class",student_id:"demo-student-10",category:"Timetable",title:"Lecture overlap concern",description:"Two activities appear to overlap on Friday.",priority:"LOW",status:"RESOLVED",forwarded_to_role:"INSTITUTE_ADMIN",cr_notes:"Resolved after timetable review.",created_at:"2026-09-19T10:00:00Z"}
    ],
    feedback: [
      {id:"FB-1001",class_id:"demo-class",student_id:"demo-student-1",category:"Teaching Clarity",rating:5,feedback:"Java practical instructions were clear.",identity_visibility:"NAMED",status:"REVIEWED",created_at:"2026-09-21T07:00:00Z"},
      {id:"FB-1002",class_id:"demo-class",student_id:"demo-student-3",category:"Facilities",rating:2,feedback:"Projector needs a service check.",identity_visibility:"HIDDEN_IN_CR_VIEW",status:"NEEDS_ATTENTION",created_at:"2026-09-21T08:00:00Z"},
      {id:"FB-1003",class_id:"demo-class",student_id:"demo-student-8",category:"Class Coordination",rating:4,feedback:"Announcements are timely.",identity_visibility:"NAMED",status:"NEW",created_at:"2026-09-22T08:00:00Z"}
    ],
    events: [
      {id:"EVT-1001",class_id:"demo-class",title:"Technical Seminar",category:"Seminar",description:"Class technical seminar.",event_date:"2026-09-27",start_time:"10:00",end_time:"12:00",venue:"Seminar Hall",coordinator:"CR",status:"SCHEDULED",created_at:"2026-09-20T05:00:00Z"},
      {id:"EVT-1002",class_id:"demo-class",title:"Peer Learning Session",category:"Peer Learning",description:"Peer revision session before internal assessment.",event_date:"2026-09-29",start_time:"14:00",end_time:"15:30",venue:"Room 204",coordinator:"CR",status:"PLANNED",created_at:"2026-09-21T05:00:00Z"}
    ],
    activities: [
      {id:"ACT-1001",class_id:"demo-class",title:"Java study circle",category:"Group Study",description:"Peer-led Java revision.",activity_date:"2026-09-19",organizer:"Class Representative",status:"COMPLETED"},
      {id:"ACT-1002",class_id:"demo-class",title:"Database peer practice",category:"Peer Learning",description:"Practice SQL joins and subqueries.",activity_date:"2026-09-23",organizer:"CR Team",status:"PLANNED"}
    ],
    notifications: [
      {id:"NTF-1001",class_id:"demo-class",recipient_user_id:"demo-cr-user",notification_type:"FACULTY_REPLY",title:"Faculty reply received",message:"Java practical clarification received.",read_at:null,created_at:"2026-09-22T08:20:00Z"},
      {id:"NTF-1002",class_id:"demo-class",recipient_user_id:null,notification_type:"ASSIGNMENT",title:"Assignment deadline approaching",message:"SQL Query Lab is due soon.",read_at:null,created_at:"2026-09-22T07:20:00Z"},
      {id:"NTF-1003",class_id:"demo-class",recipient_user_id:null,notification_type:"ACADEMIC_UPDATE",title:"Internal assessment coverage confirmed",message:"New faculty academic update.",read_at:"2026-09-22T09:00:00Z",created_at:"2026-09-21T09:20:00Z"}
    ]
  };

  // Generate deterministic demo attendance rows.
  DEMO.students.forEach((student, sIndex) => {
    DEMO.faculty.forEach((faculty, fIndex) => {
      for (let day = 1; day <= 10; day += 1) {
        const present = ((sIndex + fIndex + day) % 9) !== 0;
        DEMO.attendance.push({ id:`demo-att-${sIndex}-${fIndex}-${day}`, student_id:student.id, subject_id:faculty.subject_id, attendance_date:`2026-09-${String(day+8).padStart(2,"0")}`, status:present ? "PRESENT" : "ABSENT" });
      }
    });
  });

  async function user() {
    const supabase = client();
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data?.user || null;
  }

  async function selectLookup(table, id) {
    const supabase = client();
    if (!supabase || !id) return null;
    const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    return data || null;
  }

  async function getAssignedClass() {
    if (!isLive()) return { ok:true, demo:true, assignment:clone(DEMO.assignment), classData:clone(DEMO.classData), noAssignment:false };
    try {
      const supabase = client();
      const current = await user();
      if (!current) return { ok:false, message:"No authenticated user." };
      const { data: assignment, error } = await supabase.from("class_representative_assignments").select("*").eq("cr_user_id", current.id).eq("status", "ACTIVE").order("start_date", { ascending:false }).limit(1).maybeSingle();
      if (error) throw error;
      if (!assignment) return { ok:true, demo:false, assignment:null, classData:null, noAssignment:true };
      const classRow = await selectLookup("classes", assignment.class_id);
      if (!classRow) return { ok:false, message:"The assigned class could not be loaded." };
      const [program, division, academicYear] = await Promise.all([
        selectLookup("programs", classRow.program_id), selectLookup("divisions", classRow.division_id), selectLookup("academic_years", classRow.academic_year_id)
      ]);
      const department = program?.department_id ? await selectLookup("departments", program.department_id) : null;
      const { data: profile } = await supabase.from("profiles").select("full_name,email,status").eq("id", current.id).maybeSingle();
      const relevant = await getRelevantFaculty();
      return {
        ok:true, demo:false, assignment, noAssignment:false,
        classData:{ ...classRow, program, division, academicYear, department, coordinator:relevant.data?.[0] || null, cr:{ full_name:profile?.full_name || current.email, email:profile?.email || current.email } }
      };
    } catch (error) { return { ok:false, message:error.message || "Unable to load the assigned class." }; }
  }

  async function getRelevantFaculty() {
    if (!isLive()) return { ok:true, demo:true, data:clone(DEMO.faculty) };
    try {
      const { data, error } = await client().rpc("get_cr_relevant_faculty");
      if (error) throw error;
      return { ok:true, demo:false, data:data || [] };
    } catch (error) { return { ok:false, data:[], message:error.message }; }
  }

  async function getClassStudents() {
    if (!isLive()) return { ok:true, demo:true, data:clone(DEMO.students) };
    try {
      const { data, error } = await client().rpc("get_cr_class_students");
      if (error) throw error;
      return { ok:true, demo:false, data:(data || []).map(r=>({ ...r, full_name:[r.first_name,r.middle_name,r.last_name].filter(Boolean).join(" ") })) };
    } catch (error) { return { ok:false, data:[], message:error.message }; }
  }

  async function getClassAttendance() {
    if (!isLive()) return { ok:true, demo:true, rows:clone(DEMO.attendance), students:clone(DEMO.students), faculty:clone(DEMO.faculty) };
    try {
      const studentsResult = await getClassStudents();
      if (!studentsResult.ok) throw new Error(studentsResult.message);
      const students = studentsResult.data;
      if (!students.length) return { ok:true, demo:false, rows:[], students:[], faculty:[] };
      const ids = students.map(s=>s.id);
      const { data: rows, error } = await client().from("student_attendance").select("id,student_id,subject_id,attendance_date,status").in("student_id", ids).order("attendance_date", { ascending:false });
      if (error) throw error;
      const facultyResult = await getRelevantFaculty();
      return { ok:true, demo:false, rows:rows || [], students, faculty:facultyResult.data || [] };
    } catch (error) { return { ok:false, rows:[], students:[], faculty:[], message:error.message }; }
  }

  async function classId() {
    const assigned = await getAssignedClass();
    if (!assigned.ok) throw new Error(assigned.message);
    if (!assigned.assignment) throw new Error("No active class assignment.");
    return assigned.assignment.class_id;
  }

  async function getAcademicUpdates() {
    if (!isLive()) return { ok:true, demo:true, data:clone(DEMO.updates) };
    try { const id=await classId(); const {data,error}=await client().from("class_academic_updates").select("*").eq("class_id",id).order("publish_date",{ascending:false}); if(error)throw error; return {ok:true,demo:false,data:data||[]}; }
    catch(error){return {ok:false,data:[],message:error.message};}
  }
  async function createAcademicUpdate(payload) {
    if (!isLive()) { const row={id:`DEMO-UPD-${Date.now()}`,class_id:DEMO.assignment.class_id,source_type:"CR_COORDINATION",publish_date:nowIso(),status:"PUBLISHED",...payload}; DEMO.updates.unshift(row); return {ok:true,demo:true,data:clone(row)}; }
    try { const current=await user(), id=await classId(); const row={class_id:id,created_by:current.id,source_type:"CR_COORDINATION",status:"PUBLISHED",...payload}; const {data,error}=await client().from("class_academic_updates").insert(row).select().single(); if(error)throw error; return {ok:true,data}; } catch(error){return {ok:false,message:error.message};}
  }

  async function getAssignments() {
    if (!isLive()) return {ok:true,demo:true,data:clone(DEMO.assignments)};
    try { const id=await classId(); const {data,error}=await client().from("class_assignments").select("*").eq("class_id",id).order("due_date",{ascending:true}); if(error)throw error; return {ok:true,demo:false,data:data||[]}; } catch(error){return {ok:false,data:[],message:error.message};}
  }

  async function sendAssignmentReminder(assignment) {
    const title=`Assignment reminder: ${assignment.title}`;
    const message=`${assignment.title} is due on ${assignment.due_date}. Please review the assignment details in CampusX.`;
    return createClassAnnouncement({title,message,category:"REMINDER",priority:assignment.status==="DUE_SOON"?"IMPORTANT":"NORMAL",status:"PUBLISHED"});
  }

  async function getFacultyMessages() {
    if (!isLive()) return {ok:true,demo:true,data:clone(DEMO.messages),replies:clone(DEMO.replies),faculty:clone(DEMO.faculty)};
    try {
      const id=await classId();
      const [{data:messages,error:mErr}, facultyResult] = await Promise.all([
        client().from("class_faculty_messages").select("*").eq("class_id",id).order("created_at",{ascending:false}), getRelevantFaculty()
      ]);
      if(mErr)throw mErr;
      const ids=(messages||[]).map(m=>m.id); let replies=[];
      if(ids.length){ const {data,error}=await client().from("class_faculty_message_replies").select("*").in("message_id",ids).order("created_at",{ascending:true}); if(error)throw error; replies=data||[]; }
      return {ok:true,demo:false,data:messages||[],replies,faculty:facultyResult.data||[]};
    } catch(error){return {ok:false,data:[],replies:[],faculty:[],message:error.message};}
  }
  async function sendFacultyMessage(payload) {
    if(!isLive()){const row={id:`DEMO-MSG-${Date.now()}`,class_id:DEMO.assignment.class_id,cr_user_id:"demo-cr-user",status:"SENT",created_at:nowIso(),updated_at:nowIso(),...payload};DEMO.messages.unshift(row);return {ok:true,demo:true,data:clone(row)};}
    try{const current=await user(),id=await classId();const {data,error}=await client().from("class_faculty_messages").insert({class_id:id,cr_user_id:current.id,status:"SENT",...payload}).select().single();if(error)throw error;return {ok:true,data};}catch(error){return {ok:false,message:error.message};}
  }
  async function updateFacultyMessageStatus(id,status){
    if(!isLive()){const row=DEMO.messages.find(m=>m.id===id);if(row){row.status=status;row.updated_at=nowIso();}return {ok:true,demo:true,data:clone(row)};}
    try{const {data,error}=await client().from("class_faculty_messages").update({status}).eq("id",id).select().single();if(error)throw error;return {ok:true,data};}catch(error){return {ok:false,message:error.message};}
  }
  async function replyToFacultyMessage(messageId,message){
    if(!isLive()){const row={id:`DEMO-REP-${Date.now()}`,message_id:messageId,sender_user_id:"demo-cr-user",sender_role:"CR_ADMIN",message,created_at:nowIso()};DEMO.replies.push(row);return {ok:true,demo:true,data:clone(row)};}
    try{const current=await user();const {data,error}=await client().from("class_faculty_message_replies").insert({message_id:messageId,sender_user_id:current.id,sender_role:"CR_ADMIN",message}).select().single();if(error)throw error;return {ok:true,data};}catch(error){return {ok:false,message:error.message};}
  }

  async function getClassAnnouncements(){if(!isLive())return{ok:true,demo:true,data:clone(DEMO.announcements)};try{const id=await classId();const{data,error}=await client().from("class_announcements").select("*").eq("class_id",id).order("publish_date",{ascending:false});if(error)throw error;return{ok:true,demo:false,data:data||[]};}catch(error){return{ok:false,data:[],message:error.message};}}
  async function createClassAnnouncement(payload){if(!isLive()){const row={id:`DEMO-ANN-${Date.now()}`,class_id:DEMO.assignment.class_id,publish_date:nowIso(),created_at:nowIso(),updated_at:nowIso(),...payload};DEMO.announcements.unshift(row);DEMO.notifications.unshift({id:`DEMO-NTF-${Date.now()}`,class_id:DEMO.assignment.class_id,recipient_user_id:null,notification_type:"ANNOUNCEMENT",title:row.title,message:row.message,read_at:null,created_at:nowIso()});return{ok:true,demo:true,data:clone(row)};}try{const current=await user(),id=await classId();const{data,error}=await client().from("class_announcements").insert({class_id:id,created_by:current.id,status:"PUBLISHED",...payload}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  async function getClassRequests(){if(!isLive())return{ok:true,demo:true,data:clone(DEMO.requests),students:clone(DEMO.students)};try{const id=await classId();const[dataResult,studentsResult]=await Promise.all([client().from("class_requests").select("*").eq("class_id",id).order("created_at",{ascending:false}),getClassStudents()]);if(dataResult.error)throw dataResult.error;return{ok:true,demo:false,data:dataResult.data||[],students:studentsResult.data||[]};}catch(error){return{ok:false,data:[],students:[],message:error.message};}}
  async function updateClassRequest(id,patch){if(!isLive()){const row=DEMO.requests.find(r=>r.id===id);if(row)Object.assign(row,patch,{updated_at:nowIso()});return{ok:true,demo:true,data:clone(row)};}try{const{data,error}=await client().from("class_requests").update(patch).eq("id",id).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}
  async function createClassRequest(payload){if(!isLive()){const row={id:`DEMO-REQ-${Date.now()}`,class_id:DEMO.assignment.class_id,created_at:nowIso(),status:"SUBMITTED",...payload};DEMO.requests.unshift(row);return{ok:true,demo:true,data:clone(row)};}try{const current=await user(),id=await classId();const{data,error}=await client().from("class_requests").insert({class_id:id,created_by:current.id,status:"SUBMITTED",...payload}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  async function getClassFeedback(){if(!isLive())return{ok:true,demo:true,data:clone(DEMO.feedback),students:clone(DEMO.students)};try{const id=await classId();const[dataResult,studentsResult]=await Promise.all([client().from("class_feedback").select("*").eq("class_id",id).order("created_at",{ascending:false}),getClassStudents()]);if(dataResult.error)throw dataResult.error;return{ok:true,demo:false,data:dataResult.data||[],students:studentsResult.data||[]};}catch(error){return{ok:false,data:[],students:[],message:error.message};}}
  async function updateFeedbackStatus(id,status){if(!isLive()){const row=DEMO.feedback.find(f=>f.id===id);if(row)row.status=status;return{ok:true,demo:true,data:clone(row)};}try{const{data,error}=await client().from("class_feedback").update({status}).eq("id",id).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  async function getClassEvents(){if(!isLive())return{ok:true,demo:true,data:clone(DEMO.events)};try{const id=await classId();const{data,error}=await client().from("class_events").select("*").eq("class_id",id).order("event_date",{ascending:true});if(error)throw error;return{ok:true,demo:false,data:data||[]};}catch(error){return{ok:false,data:[],message:error.message};}}
  async function createClassEvent(payload){if(!isLive()){const row={id:`DEMO-EVT-${Date.now()}`,class_id:DEMO.assignment.class_id,created_at:nowIso(),updated_at:nowIso(),...payload};DEMO.events.push(row);return{ok:true,demo:true,data:clone(row)};}try{const current=await user(),id=await classId();const{data,error}=await client().from("class_events").insert({class_id:id,created_by:current.id,...payload}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}
  async function updateClassEvent(id,patch){if(!isLive()){const row=DEMO.events.find(e=>e.id===id);if(row)Object.assign(row,patch);return{ok:true,demo:true,data:clone(row)};}try{const{data,error}=await client().from("class_events").update(patch).eq("id",id).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  async function getClassActivities(){if(!isLive())return{ok:true,demo:true,data:clone(DEMO.activities)};try{const id=await classId();const{data,error}=await client().from("class_activities").select("*").eq("class_id",id).order("activity_date",{ascending:false});if(error)throw error;return{ok:true,demo:false,data:data||[]};}catch(error){return{ok:false,data:[],message:error.message};}}
  async function createClassActivity(payload){if(!isLive()){const row={id:`DEMO-ACT-${Date.now()}`,class_id:DEMO.assignment.class_id,created_at:nowIso(),...payload};DEMO.activities.unshift(row);return{ok:true,demo:true,data:clone(row)};}try{const current=await user(),id=await classId();const{data,error}=await client().from("class_activities").insert({class_id:id,created_by:current.id,...payload}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  async function getClassNotifications(){if(!isLive())return{ok:true,demo:true,data:clone(DEMO.notifications)};try{const id=await classId();const{data,error}=await client().from("class_notifications").select("*").eq("class_id",id).order("created_at",{ascending:false});if(error)throw error;return{ok:true,demo:false,data:data||[]};}catch(error){return{ok:false,data:[],message:error.message};}}
  async function markNotificationRead(id){if(!isLive()){const row=DEMO.notifications.find(n=>n.id===id);if(row)row.read_at=nowIso();return{ok:true,demo:true};}try{const{error}=await client().from("class_notifications").update({read_at:nowIso()}).eq("id",id);if(error)throw error;return{ok:true};}catch(error){return{ok:false,message:error.message};}}
  async function markAllNotificationsRead(){const result=await getClassNotifications();if(!result.ok)return result;const unread=result.data.filter(n=>!n.read_at);for(const n of unread){const r=await markNotificationRead(n.id);if(!r.ok)return r;}return{ok:true,count:unread.length};}

  async function getActivityHistory(){if(!isLive())return{ok:true,demo:true,data:[{id:"LOG-1",action:"FACULTY_MESSAGE_SENT",description:"CR faculty communication sent.",created_at:"2026-09-22T07:20:00Z"},{id:"LOG-2",action:"CLASS_ANNOUNCEMENT_CREATED",description:"CR class announcement created.",created_at:"2026-09-22T06:30:00Z"}]};try{const current=await user();const{data,error}=await client().from("activity_logs").select("*").eq("actor_user_id",current.id).eq("module","CR_COORDINATION").order("created_at",{ascending:false}).limit(30);if(error)throw error;return{ok:true,data:data||[]};}catch(error){return{ok:false,data:[],message:error.message};}}

  async function getNotices(){const updates=await getAcademicUpdates();if(!updates.ok)return updates;return{ok:true,demo:updates.demo,data:updates.data.filter(x=>x.source_type==="ADMIN"||x.priority==="URGENT")};}
  async function getAcademicCalendar(){const[a,e,u]=await Promise.all([getAssignments(),getClassEvents(),getAcademicUpdates()]);return{ok:a.ok&&e.ok&&u.ok,assignments:a.data||[],events:e.data||[],updates:u.data||[],message:a.message||e.message||u.message};}

  // Institute Admin / Super Admin coordination management.
  async function listCRAdminAccounts(){
    if(!isLive())return{ok:true,demo:true,data:[{user_id:"demo-cr-user",role_key:"CR_ADMIN",status:"ACTIVE",full_name:"Sahil Patil",email:"cr.demo@campusx.edu"}]};
    try{const supabase=client();const{data:roles,error}=await supabase.from("admin_users").select("user_id,role_key,status").eq("role_key","CR_ADMIN").eq("status","ACTIVE");if(error)throw error;const ids=(roles||[]).map(r=>r.user_id);let profiles=[];if(ids.length){const p=await supabase.from("profiles").select("id,full_name,email,status").in("id",ids);if(p.error)throw p.error;profiles=p.data||[];}const map=new Map(profiles.map(p=>[p.id,p]));return{ok:true,data:(roles||[]).map(r=>({...r,...(map.get(r.user_id)||{})}))};}catch(error){return{ok:false,data:[],message:error.message};}
  }
  async function listClasses(){if(!isLive())return{ok:true,demo:true,data:[clone(DEMO.classData)]};try{const{data,error}=await client().from("classes").select("*").order("code");if(error)throw error;return{ok:true,data:data||[]};}catch(error){return{ok:false,data:[],message:error.message};}}
  async function listAllCRAssignments(){
    if(!isLive())return{ok:true,demo:true,data:[{...clone(DEMO.assignment),class_code:DEMO.classData.code,class_name:DEMO.classData.name,cr_name:DEMO.classData.cr.full_name,cr_email:DEMO.classData.cr.email}]};
    try{const supabase=client();const{data,error}=await supabase.from("class_representative_assignments").select("*").order("created_at",{ascending:false});if(error)throw error;const rows=data||[];const classIds=[...new Set(rows.map(r=>r.class_id))],userIds=[...new Set(rows.map(r=>r.cr_user_id))];let classes=[],profiles=[];if(classIds.length){const q=await supabase.from("classes").select("id,code,name,program_id,division_id,academic_year_id,semester,status").in("id",classIds);if(q.error)throw q.error;classes=q.data||[];}if(userIds.length){const q=await supabase.from("profiles").select("id,full_name,email,status").in("id",userIds);if(q.error)throw q.error;profiles=q.data||[];}const cm=new Map(classes.map(c=>[c.id,c])),pm=new Map(profiles.map(p=>[p.id,p]));return{ok:true,data:rows.map(r=>({...r,class_code:cm.get(r.class_id)?.code||"—",class_name:cm.get(r.class_id)?.name||"—",cr_name:pm.get(r.cr_user_id)?.full_name||"—",cr_email:pm.get(r.cr_user_id)?.email||"—"}))};}catch(error){return{ok:false,data:[],message:error.message};}
  }
  async function assignCR(payload){if(!isLive())return{ok:true,demo:true,data:{id:`DEMO-CRA-${Date.now()}`,status:"ACTIVE",...payload}};try{const current=await user();const row={cr_user_id:payload.cr_user_id,class_id:payload.class_id,start_date:payload.start_date||today(),end_date:payload.end_date||null,status:"ACTIVE",assigned_by:current.id};const{data,error}=await client().from("class_representative_assignments").insert(row).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}
  async function updateCRAssignment(id,patch){if(!isLive())return{ok:true,demo:true,data:{id,...patch}};try{const{data,error}=await client().from("class_representative_assignments").update(patch).eq("id",id).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  async function getOversightSummary(){
    if(!isLive())return{ok:true,demo:true,data:{activeCRs:1,representedClasses:1,openIssues:2,pendingEscalations:1,messages:2,attendanceAlertClasses:1}};
    try{const supabase=client();const [a,r,m]=await Promise.all([supabase.from("class_representative_assignments").select("id,class_id,status"),supabase.from("class_requests").select("id,class_id,status"),supabase.from("class_faculty_messages").select("id,class_id,status")]);if(a.error)throw a.error;if(r.error)throw r.error;if(m.error)throw m.error;const active=(a.data||[]).filter(x=>x.status==="ACTIVE");return{ok:true,data:{activeCRs:active.length,representedClasses:new Set(active.map(x=>x.class_id)).size,openIssues:(r.data||[]).filter(x=>!['RESOLVED','CLOSED','REJECTED'].includes(x.status)).length,pendingEscalations:(r.data||[]).filter(x=>x.status==='FORWARDED').length,messages:(m.data||[]).length,attendanceAlertClasses:0}};}catch(error){return{ok:false,message:error.message};}
  }

  // Faculty Administration integration for actual replies and assignment/update origination.
  async function getFacultyCommunicationInbox(){
    if(!isLive())return{ok:true,demo:true,data:clone(DEMO.messages),replies:clone(DEMO.replies),faculty:clone(DEMO.faculty)};
    try{const supabase=client();const{data,error}=await supabase.from("class_faculty_messages").select("*").order("created_at",{ascending:false});if(error)throw error;const rows=data||[],ids=rows.map(x=>x.id),facultyIds=[...new Set(rows.map(x=>x.faculty_id))];let replies=[],faculty=[];if(ids.length){const q=await supabase.from("class_faculty_message_replies").select("*").in("message_id",ids).order("created_at",{ascending:true});if(q.error)throw q.error;replies=q.data||[];}if(facultyIds.length){const q=await supabase.from("faculty").select("id,faculty_id,first_name,middle_name,last_name,designation").in("id",facultyIds);if(q.error)throw q.error;faculty=(q.data||[]).map(f=>({faculty_record_id:f.id,faculty_id:f.faculty_id,full_name:[f.first_name,f.middle_name,f.last_name].filter(Boolean).join(" "),designation:f.designation}));}return{ok:true,data:rows,replies,faculty};}catch(error){return{ok:false,data:[],replies:[],faculty:[],message:error.message};}
  }
  async function facultyReply(messageId,message){if(!isLive()){const row={id:`DEMO-FREP-${Date.now()}`,message_id:messageId,sender_user_id:"demo-faculty-admin",sender_role:"FACULTY_ADMIN",message,created_at:nowIso()};DEMO.replies.push(row);const m=DEMO.messages.find(x=>x.id===messageId);if(m)m.status="RESPONDED";return{ok:true,demo:true,data:clone(row)};}try{const current=await user();const{data,error}=await client().from("class_faculty_message_replies").insert({message_id:messageId,sender_user_id:current.id,sender_role:"FACULTY_ADMIN",message}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}
  async function facultyPublishAcademicUpdate(payload){if(!isLive())return{ok:true,demo:true,data:{id:`DEMO-FUPD-${Date.now()}`,source_type:"FACULTY",created_at:nowIso(),...payload}};try{const current=await user();const{data,error}=await client().from("class_academic_updates").insert({created_by:current.id,source_type:"FACULTY",status:"PUBLISHED",...payload}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}
  async function facultyCreateStudentAssignment(payload){if(!isLive())return{ok:true,demo:true,data:{id:`DEMO-FASN-${Date.now()}`,created_at:nowIso(),...payload}};try{const current=await user();const{data,error}=await client().from("class_assignments").insert({created_by:current.id,...payload}).select().single();if(error)throw error;return{ok:true,data};}catch(error){return{ok:false,message:error.message};}}

  window.CampusXCRService = {
    isLive, DEMO, getAssignedClass, getRelevantFaculty, getClassStudents, getClassAttendance,
    getAcademicUpdates, createAcademicUpdate, getAssignments, sendAssignmentReminder,
    getFacultyMessages, sendFacultyMessage, updateFacultyMessageStatus, replyToFacultyMessage,
    getClassAnnouncements, createClassAnnouncement, getClassRequests, updateClassRequest, createClassRequest,
    getClassFeedback, updateFeedbackStatus, getClassEvents, createClassEvent, updateClassEvent,
    getClassActivities, createClassActivity, getClassNotifications, markNotificationRead, markAllNotificationsRead,
    getActivityHistory, getNotices, getAcademicCalendar,
    listCRAdminAccounts, listClasses, listAllCRAssignments, assignCR, updateCRAssignment, getOversightSummary,
    getFacultyCommunicationInbox, facultyReply, facultyPublishAcademicUpdate, facultyCreateStudentAssignment
  };
})();
