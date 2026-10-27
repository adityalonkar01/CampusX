/* CampusX Corporate Resource Cell — Prompt 9 frontend/demo module.
 * Uses shared dashboard shell. No real calls, emails, APIs, authentication or database.
 */
(() => {
  "use strict";
  const CX = window.CampusXDashboard;
  if (!CX || document.body.dataset.role !== "CRC_ADMIN") return;
  const esc = CX.escapeHtml;
  const toast = CX.showToast;
  const modal = CX.openModal;
  const page = document.body.dataset.dashboardPage || "dashboard";
  const DEMO_MODE = true;

  const companies = [
    {id:"COM001",company:"Infosys",industry:"IT Services",location:"Pune",recruiter:"Recruiter A",opportunities:4,status:"Active"},
    {id:"COM002",company:"TCS",industry:"IT Services",location:"Mumbai",recruiter:"Recruiter B",opportunities:6,status:"Active"},
    {id:"COM003",company:"Deloitte",industry:"Consulting",location:"Pune",recruiter:"Recruiter C",opportunities:3,status:"Active"},
    {id:"COM004",company:"Accenture",industry:"IT Services",location:"Bengaluru",recruiter:"Recruiter D",opportunities:5,status:"Active"},
    {id:"COM005",company:"Capgemini",industry:"IT Services",location:"Pune",recruiter:"Recruiter E",opportunities:4,status:"Active"},
    {id:"COM006",company:"Wipro",industry:"IT Services",location:"Hyderabad",recruiter:"Recruiter F",opportunities:3,status:"Active"},
    {id:"COM007",company:"HDFC Bank",industry:"Banking",location:"Mumbai",recruiter:"Recruiter G",opportunities:2,status:"Active"},
    {id:"COM008",company:"KPMG",industry:"Consulting",location:"Mumbai",recruiter:"Recruiter H",opportunities:3,status:"Active"},
    {id:"COM009",company:"Persistent Systems",industry:"Software",location:"Pune",recruiter:"Recruiter I",opportunities:4,status:"Active"},
    {id:"COM010",company:"Tech Mahindra",industry:"IT Services",location:"Pune",recruiter:"Recruiter J",opportunities:3,status:"Active"}
  ];
  const companyLeads = [
    {id:"LEAD001",company:"Infosys",industry:"IT Services",contact:"Recruiter A",source:"LinkedIn",status:"Follow-up",followup:"12 Sep",volunteer:"Volunteer 01"},
    {id:"LEAD002",company:"TCS",industry:"IT Services",contact:"Recruiter B",source:"Referral",status:"Interested",followup:"14 Sep",volunteer:"Volunteer 02"},
    {id:"LEAD003",company:"Deloitte",industry:"Consulting",contact:"Recruiter C",source:"Website",status:"Contacted",followup:"13 Sep",volunteer:"Volunteer 03"},
    {id:"LEAD004",company:"Accenture",industry:"IT Services",contact:"Recruiter D",source:"Alumni",status:"Discussion",followup:"16 Sep",volunteer:"Volunteer 04"},
    {id:"LEAD005",company:"KPMG",industry:"Consulting",contact:"Recruiter H",source:"Referral",status:"New",followup:"15 Sep",volunteer:"Volunteer 01"},
    {id:"LEAD006",company:"Persistent Systems",industry:"Software",contact:"Recruiter I",source:"Alumni",status:"Converted",followup:"18 Sep",volunteer:"Volunteer 03"}
  ];
  const recruiters = [
    {id:"REC001",name:"Recruiter A",company:"Infosys",designation:"Talent Acquisition Partner",email:"recruiter.a@example.com",phone:"+91 90000 10001",preferred:"Phone",last:"09 Sep",next:"12 Sep",status:"Engaged"},
    {id:"REC002",name:"Recruiter B",company:"TCS",designation:"Campus Hiring Lead",email:"recruiter.b@example.com",phone:"+91 90000 10002",preferred:"Email",last:"09 Sep",next:"14 Sep",status:"Active"},
    {id:"REC003",name:"Recruiter C",company:"Deloitte",designation:"University Recruiter",email:"recruiter.c@example.com",phone:"+91 90000 10003",preferred:"Phone",last:"10 Sep",next:"13 Sep",status:"Follow-up Required"},
    {id:"REC004",name:"Recruiter D",company:"Accenture",designation:"Campus Recruitment Manager",email:"recruiter.d@example.com",phone:"+91 90000 10004",preferred:"Email",last:"10 Sep",next:"16 Sep",status:"Engaged"},
    {id:"REC005",name:"Recruiter E",company:"Capgemini",designation:"Talent Partner",email:"recruiter.e@example.com",phone:"+91 90000 10005",preferred:"Email",last:"08 Sep",next:"15 Sep",status:"Active"}
  ];
  const industryContacts = recruiters.map((r,i)=>({id:"IC00"+(i+1),name:r.name,company:r.company,industry:i===2||i===3?"Consulting":"IT Services",type:"Recruiter",email:r.email,phone:r.phone,status:r.status}));
  const outreachActivities = [
    {id:"OUT001",volunteer:"Volunteer 03",company:"Deloitte",contact:"Recruiter C",method:"Phone",date:"10 Sep",outcome:"Discussion scheduled",next:"16 Sep",status:"Follow-up"},
    {id:"OUT002",volunteer:"Volunteer 01",company:"Infosys",contact:"Recruiter A",method:"LinkedIn",date:"09 Sep",outcome:"Interested",next:"12 Sep",status:"Follow-up"},
    {id:"OUT003",volunteer:"Volunteer 02",company:"TCS",contact:"Recruiter B",method:"Email",date:"09 Sep",outcome:"Drive discussion",next:"14 Sep",status:"Interested"},
    {id:"OUT004",volunteer:"Volunteer 04",company:"Accenture",contact:"Recruiter D",method:"Alumni referral",date:"10 Sep",outcome:"Role details requested",next:"16 Sep",status:"Discussion"}
  ];
  const callLogs = [
    {id:"CALL001",volunteer:"Volunteer 01",company:"Infosys",recruiter:"Recruiter A",date:"09 Sep",duration:"8 min",outcome:"Interested",followup:"12 Sep"},
    {id:"CALL002",volunteer:"Volunteer 02",company:"TCS",recruiter:"Recruiter B",date:"09 Sep",duration:"5 min",outcome:"Follow-up",followup:"14 Sep"},
    {id:"CALL003",volunteer:"Volunteer 03",company:"Deloitte",recruiter:"Recruiter C",date:"10 Sep",duration:"12 min",outcome:"Discussion",followup:"16 Sep"},
    {id:"CALL004",volunteer:"Volunteer 04",company:"Accenture",recruiter:"Recruiter D",date:"10 Sep",duration:"7 min",outcome:"Interested",followup:"16 Sep"}
  ];
  const emailFollowUps = [
    {id:"EM001",company:"Infosys",recruiter:"Recruiter A",volunteer:"Volunteer 01",subject:"MCA campus hiring",sent:"09 Sep",response:"Awaiting response",next:"12 Sep",status:"Follow-up Required"},
    {id:"EM002",company:"TCS",recruiter:"Recruiter B",volunteer:"Volunteer 02",subject:"Campus drive proposal",sent:"09 Sep",response:"Replied",next:"14 Sep",status:"Replied"},
    {id:"EM003",company:"Deloitte",recruiter:"Recruiter C",volunteer:"Volunteer 03",subject:"Student eligibility list",sent:"10 Sep",response:"Awaiting response",next:"13 Sep",status:"Awaiting Response"}
  ];
  const communicationHistory = [
    {date:"10 Sep",method:"Phone Call",volunteer:"Volunteer 03",company:"Deloitte",recruiter:"Recruiter C",outcome:"Discussion",notes:"Campus drive requirements discussed."},
    {date:"10 Sep",method:"Email",volunteer:"Volunteer 04",company:"Accenture",recruiter:"Recruiter D",outcome:"Role details requested",notes:"JD confirmation pending."},
    {date:"09 Sep",method:"Phone Call",volunteer:"Volunteer 01",company:"Infosys",recruiter:"Recruiter A",outcome:"Interested",notes:"Follow-up scheduled."},
    {date:"09 Sep",method:"Email",volunteer:"Volunteer 02",company:"TCS",recruiter:"Recruiter B",outcome:"Replied",notes:"Drive discussion initiated."}
  ];
  const placementOpportunities = [
    {id:"OPP001",company:"Infosys",role:"Software Developer",type:"Full Time",eligibility:"MCA",openings:12,status:"Open"},
    {id:"OPP002",company:"Deloitte",role:"Business Analyst",type:"Full Time",eligibility:"MBA",openings:8,status:"Open"},
    {id:"OPP003",company:"TCS",role:"Web Developer Intern",type:"Internship",eligibility:"MCA",openings:10,status:"Open"},
    {id:"OPP004",company:"Accenture",role:"Data Analyst",type:"Full Time",eligibility:"MCA",openings:6,status:"Open"},
    {id:"OPP005",company:"KPMG",role:"Risk Analyst",type:"Full Time",eligibility:"MBA",openings:5,status:"Open"}
  ];
  const jobOpenings = [
    {id:"JOB001",company:"Infosys",role:"Software Developer",department:"MCA",location:"Pune",ctc:"6.5 LPA",eligibility:"MCA, CGPA 6.5+",experience:"Fresher",openings:12,deadline:"15 Sep",status:"Open"},
    {id:"JOB002",company:"Deloitte",role:"Business Analyst",department:"MBA",location:"Mumbai",ctc:"8 LPA",eligibility:"MBA, CGPA 7+",experience:"Fresher",openings:8,deadline:"20 Sep",status:"Open"},
    {id:"JOB003",company:"Accenture",role:"Data Analyst",department:"MCA",location:"Bengaluru",ctc:"7 LPA",eligibility:"MCA, no active backlog",experience:"Fresher",openings:6,deadline:"23 Sep",status:"Open"}
  ];
  const internships = [
    {id:"INT001",company:"TCS",role:"Web Developer Intern",duration:"3 Months",stipend:"₹20,000/month",eligibility:"MCA",openings:10,deadline:"16 Sep",status:"Open"},
    {id:"INT002",company:"Persistent Systems",role:"Software Engineering Intern",duration:"6 Months",stipend:"₹25,000/month",eligibility:"MCA",openings:8,deadline:"19 Sep",status:"Open"},
    {id:"INT003",company:"Infosys",role:"Data Science Intern",duration:"4 Months",stipend:"₹22,000/month",eligibility:"MCA",openings:6,deadline:"22 Sep",status:"Open"}
  ];
  const placementDrives = [
    {id:"DRIVE001",company:"Infosys",role:"Software Developer",date:"18 Sep",registered:126,eligible:112,status:"Scheduled",mode:"On Campus",venue:"Main Auditorium"},
    {id:"DRIVE002",company:"TCS",role:"Graduate Engineer",date:"22 Sep",registered:148,eligible:130,status:"Scheduled",mode:"Hybrid",venue:"Seminar Hall"},
    {id:"DRIVE003",company:"Deloitte",role:"Business Analyst",date:"28 Sep",registered:84,eligible:72,status:"Planned",mode:"Online",venue:"Virtual"},
    {id:"DRIVE004",company:"Accenture",role:"Data Analyst",date:"02 Oct",registered:70,eligible:60,status:"Registration Open",mode:"On Campus",venue:"Placement Hall"}
  ];
  const driveRegistrations = [
    {id:"REG001",student:"Student 01",studentId:"STU1023",drive:"DRIVE001",company:"Infosys",date:"08 Sep",eligibility:"Eligible",status:"Shortlisted"},
    {id:"REG002",student:"Student 02",studentId:"STU1024",drive:"DRIVE001",company:"Infosys",date:"08 Sep",eligibility:"Eligible",status:"Registered"},
    {id:"REG003",student:"Student 03",studentId:"STU1025",drive:"DRIVE002",company:"TCS",date:"09 Sep",eligibility:"Eligible",status:"Selected"},
    {id:"REG004",student:"Student 04",studentId:"STU1026",drive:"DRIVE003",company:"Deloitte",date:"09 Sep",eligibility:"Not Eligible",status:"Not Eligible"},
    {id:"REG005",student:"Student 05",studentId:"STU1027",drive:"DRIVE004",company:"Accenture",date:"10 Sep",eligibility:"Eligible",status:"Registered"}
  ];
  const interviewSchedules = [
    {id:"INTV001",student:"Student 01",company:"Infosys",role:"Software Developer",round:"Technical",date:"18 Sep",time:"11:00 AM",mode:"On Campus",status:"Scheduled"},
    {id:"INTV002",student:"Student 03",company:"TCS",role:"Graduate Engineer",round:"HR",date:"22 Sep",time:"02:00 PM",mode:"Online",status:"Scheduled"},
    {id:"INTV003",student:"Student 06",company:"Deloitte",role:"Business Analyst",round:"Aptitude",date:"28 Sep",time:"10:00 AM",mode:"Online",status:"Scheduled"}
  ];
  const eligibleStudents = [
    {id:"STU1023",name:"Student 01",program:"MCA",semester:"II",cgpa:8.4,backlogs:0,opportunities:3,status:"Eligible"},
    {id:"STU1024",name:"Student 02",program:"MCA",semester:"II",cgpa:7.8,backlogs:0,opportunities:4,status:"Eligible"},
    {id:"STU1025",name:"Student 03",program:"MBA",semester:"II",cgpa:8.1,backlogs:0,opportunities:3,status:"Eligible"},
    {id:"STU1026",name:"Student 04",program:"MCA",semester:"II",cgpa:6.1,backlogs:1,opportunities:1,status:"Conditional"},
    {id:"STU1027",name:"Student 05",program:"MBA",semester:"II",cgpa:7.5,backlogs:0,opportunities:3,status:"Eligible"},
    {id:"STU1028",name:"Student 06",program:"MCA",semester:"II",cgpa:8.8,backlogs:0,opportunities:5,status:"Eligible"}
  ];
  const applications = [
    {id:"APP001",student:"Student 01",studentId:"STU1023",company:"Infosys",role:"Developer",program:"MCA",date:"08 Sep",status:"Shortlisted"},
    {id:"APP002",student:"Student 02",studentId:"STU1024",company:"TCS",role:"Developer",program:"MCA",date:"08 Sep",status:"Applied"},
    {id:"APP003",student:"Student 03",studentId:"STU1025",company:"Deloitte",role:"Analyst",program:"MBA",date:"09 Sep",status:"Interview"},
    {id:"APP004",student:"Student 04",studentId:"STU1026",company:"Accenture",role:"Analyst",program:"MCA",date:"09 Sep",status:"Selected"},
    {id:"APP005",student:"Student 05",studentId:"STU1027",company:"KPMG",role:"Risk Analyst",program:"MBA",date:"10 Sep",status:"Applied"}
  ];
  const shortlistedStudents = [
    {student:"Student 01",company:"Infosys",role:"Software Developer",drive:"DRIVE001",date:"10 Sep",round:"Technical",interview:"18 Sep",status:"Scheduled"},
    {student:"Student 03",company:"Deloitte",role:"Business Analyst",drive:"DRIVE003",date:"11 Sep",round:"Aptitude",interview:"28 Sep",status:"Scheduled"},
    {student:"Student 06",company:"Accenture",role:"Data Analyst",drive:"DRIVE004",date:"11 Sep",round:"Technical",interview:"02 Oct",status:"Scheduled"}
  ];
  const selectedStudents = [
    {id:"STU1026",student:"Student 04",company:"Accenture",role:"Data Analyst",ctc:"7 LPA",date:"10 Sep",drive:"DRIVE004",offer:"Offer Received"},
    {id:"STU1025",student:"Student 03",company:"TCS",role:"Graduate Engineer",ctc:"6.8 LPA",date:"09 Sep",drive:"DRIVE002",offer:"Accepted"},
    {id:"STU1030",student:"Student 10",company:"Infosys",role:"Software Developer",ctc:"6.5 LPA",date:"08 Sep",drive:"DRIVE001",offer:"Joining Pending"}
  ];
  const offers = [
    {id:"OFF001",student:"Student 03",company:"TCS",role:"Graduate Engineer",ctc:"6.8 LPA",location:"Mumbai",offerDate:"09 Sep",joining:"15 Oct",status:"Accepted"},
    {id:"OFF002",student:"Student 04",company:"Accenture",role:"Data Analyst",ctc:"7 LPA",location:"Bengaluru",offerDate:"10 Sep",joining:"20 Oct",status:"Offer Received"},
    {id:"OFF003",student:"Student 10",company:"Infosys",role:"Software Developer",ctc:"6.5 LPA",location:"Pune",offerDate:"08 Sep",joining:"01 Nov",status:"Joining Pending"}
  ];
  const volunteers = [
    {id:"VOL001",name:"Volunteer 01",program:"MCA",semester:"II",email:"vol01@example.com",phone:"+91 91000 10001",companies:8,calls:24,followups:4,opportunities:3,status:"Active"},
    {id:"VOL002",name:"Volunteer 02",program:"MBA",semester:"II",email:"vol02@example.com",phone:"+91 91000 10002",companies:6,calls:19,followups:3,opportunities:4,status:"Active"},
    {id:"VOL003",name:"Volunteer 03",program:"MCA",semester:"II",email:"vol03@example.com",phone:"+91 91000 10003",companies:10,calls:31,followups:7,opportunities:5,status:"Active"},
    {id:"VOL004",name:"Volunteer 04",program:"MBA",semester:"II",email:"vol04@example.com",phone:"+91 91000 10004",companies:5,calls:16,followups:2,opportunities:2,status:"Active"}
  ];
  const tasks = [
    {id:"TASK001",task:"Call company",company:"Infosys",volunteer:"Volunteer 01",due:"12 Sep",priority:"High",status:"Pending"},
    {id:"TASK002",task:"Collect company JD",company:"Accenture",volunteer:"Volunteer 04",due:"11 Sep",priority:"Critical",status:"Overdue"},
    {id:"TASK003",task:"Verify eligibility criteria",company:"TCS",volunteer:"Volunteer 02",due:"13 Sep",priority:"Medium",status:"In Progress"},
    {id:"TASK004",task:"Confirm placement drive",company:"Deloitte",volunteer:"Volunteer 03",due:"16 Sep",priority:"High",status:"Pending"},
    {id:"TASK005",task:"Coordinate student registrations",company:"Infosys",volunteer:"Volunteer 01",due:"17 Sep",priority:"Medium",status:"Completed"}
  ];
  const followUps = [
    {id:"FUP001",company:"Infosys",recruiter:"Recruiter A",volunteer:"Volunteer 01",previous:"09 Sep",date:"12 Sep",method:"Phone",priority:"High",status:"Due"},
    {id:"FUP002",company:"TCS",recruiter:"Recruiter B",volunteer:"Volunteer 02",previous:"09 Sep",date:"14 Sep",method:"Email",priority:"Medium",status:"Upcoming"},
    {id:"FUP003",company:"Deloitte",recruiter:"Recruiter C",volunteer:"Volunteer 03",previous:"10 Sep",date:"13 Sep",method:"Phone",priority:"High",status:"Upcoming"},
    {id:"FUP004",company:"Accenture",recruiter:"Recruiter D",volunteer:"Volunteer 04",previous:"10 Sep",date:"10 Sep",method:"Email",priority:"Critical",status:"Overdue"}
  ];
  const placementActivities = [
    {id:"ACT001",type:"Company Outreach",title:"Deloitte recruiter discussion",date:"10 Sep",owner:"Volunteer 03",status:"Completed"},
    {id:"ACT002",type:"Placement Drive",title:"TCS campus drive coordination",date:"09 Sep",owner:"Volunteer 02",status:"In Progress"},
    {id:"ACT003",type:"Pre-Placement Talk",title:"Infosys career session",date:"18 Sep",owner:"Volunteer 01",status:"Planned"},
    {id:"ACT004",type:"Resume Workshop",title:"Placement resume review",date:"20 Sep",owner:"Volunteer 04",status:"Planned"}
  ];
  const announcements = [
    {id:"ANN001",title:"New placement opportunity — Infosys",date:"11 Sep",audience:"Eligible Students",status:"Published"},
    {id:"ANN002",title:"TCS campus drive registration open",date:"10 Sep",audience:"MCA Students",status:"Published"},
    {id:"ANN003",title:"Deloitte interview schedule",date:"10 Sep",audience:"Shortlisted Students",status:"Published"}
  ];
  const notices = [
    {id:"NOT001",title:"Placement registration notice",date:"11 Sep",priority:"High",status:"Published"},
    {id:"NOT002",title:"Resume submission deadline",date:"12 Sep",priority:"Medium",status:"Published"},
    {id:"NOT003",title:"Interview instructions",date:"15 Sep",priority:"High",status:"Published"}
  ];
  const notifications = [
    {id:"N001",title:"Follow-up due today",time:"10 minutes ago",type:"Follow-up",read:false},
    {id:"N002",title:"New company lead assigned",time:"1 hour ago",type:"Lead",read:false},
    {id:"N003",title:"Recruiter responded",time:"2 hours ago",type:"Recruiter",read:false},
    {id:"N004",title:"Placement drive scheduled",time:"Yesterday",type:"Drive",read:false},
    {id:"N005",title:"Offer received from Accenture",time:"Yesterday",type:"Offer",read:true}
  ];

  const datasets = {companies,companyLeads,recruiters,industryContacts,outreachActivities,callLogs,emailFollowUps,communicationHistory,placementOpportunities,jobOpenings,internships,placementDrives,driveRegistrations,interviewSchedules,eligibleStudents,applications,shortlistedStudents,selectedStudents,offers,volunteers,tasks,followUps,placementActivities,announcements,notices,notifications};
  const configs = {
    "company-leads": {title:"Company Leads",sub:"Research, qualify and follow up with prospective employers.",data:"companyLeads",columns:[["id","Lead ID"],["company","Company"],["industry","Industry"],["contact","Contact Person"],["source","Source"],["status","Status"],["followup","Next Follow-up"],["volunteer","Volunteer"]],filters:["industry","status","volunteer"],search:["id","company","contact","volunteer"],sort:["id","company","industry","status","followup"],actions:["Preview","Update Status"],export:"Company Leads"},
    companies:{title:"Companies",sub:"Maintain the demo employer relationship directory.",data:"companies",columns:[["id","Company ID"],["company","Company"],["industry","Industry"],["location","Location"],["recruiter","Recruiter"],["opportunities","Opportunities"],["status","Status"]],filters:["industry","location","status"],search:["id","company","industry","location"],sort:["company","industry","opportunities","status"],actions:["Preview","Follow-up"],export:"Companies"},
    recruiters:{title:"Recruiters",sub:"Track recruiter contacts and relationship health.",data:"recruiters",columns:[["id","Recruiter ID"],["name","Name"],["company","Company"],["designation","Designation"],["email","Email"],["phone","Phone"],["preferred","Preferred Contact"],["last","Last Contact"],["next","Next Follow-up"],["status","Status"]],filters:["company","status","preferred"],search:["id","name","company","email"],sort:["name","company","last","next","status"],actions:["Preview","Follow-up"],export:"Recruiters"},
    "industry-contacts":{title:"Industry Contacts",sub:"Search all company and recruiter contacts in one place.",data:"industryContacts",columns:[["id","Contact ID"],["name","Name"],["company","Company"],["industry","Industry"],["type","Contact Type"],["email","Email"],["phone","Phone"],["status","Status"]],filters:["company","industry","type","status"],search:["id","name","company","industry"],sort:["name","company","industry","status"],actions:["Preview"],export:"Industry Contacts"},
    outreach:{title:"Outreach Activity",sub:"Track company outreach, outcomes and next actions.",data:"outreachActivities",columns:[["id","Activity ID"],["volunteer","Volunteer"],["company","Company"],["contact","Contact"],["method","Method"],["date","Date"],["outcome","Outcome"],["next","Next Follow-up"],["status","Status"]],filters:["volunteer","company","method","status"],search:["id","volunteer","company","contact"],sort:["date","company","volunteer","status"],actions:["Preview"],export:"Outreach Activity"},
    "call-logs":{title:"Call Logs",sub:"Record company calls without initiating real phone communication.",data:"callLogs",columns:[["id","Call ID"],["volunteer","Volunteer"],["company","Company"],["recruiter","Recruiter"],["date","Date"],["duration","Duration"],["outcome","Outcome"],["followup","Follow-up"]],filters:["company","volunteer","outcome"],search:["id","company","recruiter","volunteer"],sort:["date","company","duration"],actions:["Preview"],export:"Call Logs",primary:"Log Call"},
    "email-followups":{title:"Email Follow-ups",sub:"Track demo email workflows; no email is actually sent.",data:"emailFollowUps",columns:[["id","Email ID"],["company","Company"],["recruiter","Recruiter"],["volunteer","Volunteer"],["subject","Subject"],["sent","Sent Date"],["response","Response"],["next","Next Follow-up"],["status","Status"]],filters:["company","volunteer","status"],search:["id","company","recruiter","subject"],sort:["sent","next","status"],actions:["Preview"],export:"Email Follow-ups"},
    "communication-history":{title:"Communication History",sub:"Chronological company and recruiter communication timeline.",data:"communicationHistory",columns:[["date","Date"],["method","Method"],["volunteer","Volunteer"],["company","Company"],["recruiter","Recruiter"],["outcome","Outcome"],["notes","Notes"]],filters:["company","method","volunteer"],search:["company","recruiter","volunteer","outcome"],sort:["date","company","method"],actions:["Preview"],export:"Communication History"},
    opportunities:{title:"Placement Opportunities",sub:"Employer opportunities available for student placement.",data:"placementOpportunities",columns:[["id","Opportunity"],["company","Company"],["role","Role"],["type","Type"],["eligibility","Eligibility"],["openings","Openings"],["status","Status"]],filters:["company","type","eligibility","status"],search:["id","company","role"],sort:["company","role","openings","status"],actions:["Preview"],export:"Placement Opportunities"},
    "job-openings":{title:"Job Openings",sub:"Track full-time campus job openings and deadlines.",data:"jobOpenings",columns:[["id","Opening ID"],["company","Company"],["role","Job Role"],["department","Department"],["location","Location"],["ctc","Salary / CTC"],["eligibility","Eligibility"],["experience","Experience"],["openings","Openings"],["deadline","Deadline"],["status","Status"]],filters:["company","department","location","status"],search:["id","company","role","department"],sort:["company","openings","deadline","ctc"],actions:["Preview"],export:"Job Openings"},
    internships:{title:"Internship Opportunities",sub:"Track internships and pre-placement pathways.",data:"internships",columns:[["id","Internship ID"],["company","Company"],["role","Role"],["duration","Duration"],["stipend","Stipend"],["eligibility","Eligibility"],["openings","Openings"],["deadline","Deadline"],["status","Status"]],filters:["company","eligibility","status"],search:["id","company","role"],sort:["company","openings","deadline"],actions:["Preview"],export:"Internships"},
    "placement-drives":{title:"Placement Drives",sub:"Coordinate campus hiring drives from planning through completion.",data:"placementDrives",columns:[["id","Drive ID"],["company","Company"],["role","Role"],["date","Date"],["registered","Registered"],["eligible","Eligible"],["mode","Mode"],["status","Status"]],filters:["company","status","mode"],search:["id","company","role"],sort:["date","company","registered","eligible","status"],actions:["Preview","Registrations"],export:"Placement Drives",primary:"Create Placement Drive"},
    "drive-registrations":{title:"Drive Registrations",sub:"Track student registrations and placement eligibility.",data:"driveRegistrations",columns:[["id","Registration ID"],["student","Student"],["studentId","Student ID"],["drive","Drive"],["company","Company"],["date","Registration Date"],["eligibility","Eligibility"],["status","Application Status"]],filters:["company","eligibility","status"],search:["id","student","studentId","company"],sort:["date","student","status"],actions:["Preview"],export:"Drive Registrations"},
    "interview-schedules":{title:"Interview Schedules",sub:"Coordinate placement interview rounds and schedules.",data:"interviewSchedules",columns:[["id","Interview ID"],["student","Student"],["company","Company"],["role","Role"],["round","Round"],["date","Date"],["time","Time"],["mode","Mode"],["status","Interview Status"]],filters:["company","round","mode","status"],search:["id","student","company","role"],sort:["date","time","company","status"],actions:["Preview"],export:"Interview Schedules"},
    "eligible-students":{title:"Eligible Students",sub:"View demo placement eligibility without modifying official academic records.",data:"eligibleStudents",columns:[["id","Student ID"],["name","Student Name"],["program","Program"],["semester","Semester"],["cgpa","CGPA"],["backlogs","Backlogs"],["opportunities","Eligible Opportunities"],["status","Status"]],filters:["program","semester","status"],search:["id","name","program"],sort:["name","cgpa","backlogs","status"],actions:["Preview"],export:"Eligible Students"},
    applications:{title:"Student Applications",sub:"Track applications from submission to selection.",data:"applications",columns:[["id","Application ID"],["student","Student"],["studentId","Student ID"],["company","Company"],["role","Role"],["program","Program"],["date","Date"],["status","Status"]],filters:["company","program","status"],search:["id","student","company","role"],sort:["date","student","company","status"],actions:["Preview"],export:"Student Applications"},
    shortlisted:{title:"Shortlisted Students",sub:"Coordinate interview-ready students after company shortlisting.",data:"shortlistedStudents",columns:[["student","Student"],["company","Company"],["role","Role"],["drive","Drive"],["date","Shortlisting Date"],["round","Interview Round"],["interview","Interview Date"],["status","Status"]],filters:["company","round","status"],search:["student","company","role","drive"],sort:["interview","student","company"],actions:["Preview"],export:"Shortlisted Students"},
    "selected-students":{title:"Selected Students",sub:"Track students selected through placement drives.",data:"selectedStudents",columns:[["id","Student ID"],["student","Student"],["company","Company"],["role","Role"],["ctc","CTC"],["date","Selection Date"],["drive","Drive"],["offer","Offer Status"]],filters:["company","offer"],search:["id","student","company","role"],sort:["ctc","date","company"],actions:["Preview"],export:"Selected Students"},
    offers:{title:"Offers",sub:"Track placement offers, joining dates and status.",data:"offers",columns:[["id","Offer ID"],["student","Student"],["company","Company"],["role","Role"],["ctc","CTC"],["location","Location"],["offerDate","Offer Date"],["joining","Joining Date"],["status","Offer Status"]],filters:["company","status"],search:["id","student","company","role"],sort:["ctc","offerDate","joining","status"],actions:["Preview"],export:"Offers"},
    volunteers:{title:"Volunteer Team",sub:"Manage the student volunteers who operate the Corporate Resource Cell.",data:"volunteers",columns:[["id","Volunteer ID"],["name","Name"],["program","Program"],["semester","Semester"],["companies","Assigned Companies"],["calls","Calls Completed"],["followups","Follow-ups"],["opportunities","Opportunities Generated"],["status","Status"]],filters:["program","status"],search:["id","name","program"],sort:["name","companies","calls","followups","opportunities"],actions:["Preview"],export:"Volunteers"},
    tasks:{title:"Tasks",sub:"Coordinate day-to-day CRC placement operations.",data:"tasks",columns:[["id","Task ID"],["task","Task"],["company","Company"],["volunteer","Volunteer"],["due","Due"],["priority","Priority"],["status","Status"]],filters:["volunteer","priority","status","company"],search:["id","task","company","volunteer"],sort:["due","priority","status"],actions:["Preview","Complete"],export:"Tasks"},
    "follow-ups":{title:"Follow-ups",sub:"Prioritize due, upcoming and overdue recruiter follow-ups.",data:"followUps",columns:[["id","Follow-up ID"],["company","Company"],["recruiter","Recruiter"],["volunteer","Volunteer"],["previous","Previous Contact"],["date","Follow-up Date"],["method","Method"],["priority","Priority"],["status","Status"]],filters:["company","volunteer","priority","status"],search:["id","company","recruiter","volunteer"],sort:["date","priority","status"],actions:["Preview","Complete"],export:"Follow-ups"},
    activities:{title:"Placement Activities",sub:"Track outreach, drives, career sessions and workshops.",data:"placementActivities",columns:[["id","Activity ID"],["type","Type"],["title","Activity"],["date","Date"],["owner","Owner"],["status","Status"]],filters:["type","owner","status"],search:["id","type","title","owner"],sort:["date","type","status"],actions:["Preview"],export:"Placement Activities"},
    announcements:{title:"Announcements",sub:"Placement updates for students and stakeholders.",data:"announcements",columns:[["id","Announcement ID"],["title","Title"],["date","Date"],["audience","Audience"],["status","Status"]],filters:["audience","status"],search:["id","title","audience"],sort:["date","title","status"],actions:["Preview"],export:"Announcements"},
    notices:{title:"Notices",sub:"Operational placement notices and deadlines.",data:"notices",columns:[["id","Notice ID"],["title","Title"],["date","Date"],["priority","Priority"],["status","Status"]],filters:["priority","status"],search:["id","title"],sort:["date","priority","status"],actions:["Preview"],export:"Notices"},
    notifications:{title:"Notifications",sub:"Follow-ups, recruiter responses and placement alerts.",data:"notifications",columns:[["id","Notification ID"],["title","Notification"],["time","Time"],["type","Type"],["read","State"]],filters:["type","read"],search:["id","title","type"],sort:["time","type"],actions:["Mark Read"],export:"Notifications"},
    "placement-reports":{title:"Placement Reports",sub:"Demo placement outcomes and program-wise performance.",data:"selectedStudents",columns:[["company","Company"],["student","Students Selected"],["ctc","CTC"],["date","Selection Date"],["offer","Offer Status"]],filters:["company","offer"],search:["company","student"],sort:["company","ctc"],actions:["Preview"],export:"Placement Report"},
    "industry-reports":{title:"Industry Reports",sub:"Employer pipeline, recruiter response and conversion indicators.",data:"companyLeads",columns:[["company","Company"],["industry","Industry"],["status","Lead Status"],["source","Source"],["volunteer","Volunteer"]],filters:["industry","status","volunteer"],search:["company","industry","volunteer"],sort:["company","status"],actions:["Preview"],export:"Industry Report"},
    "outreach-reports":{title:"Outreach Reports",sub:"Calls, emails, follow-ups and volunteer performance.",data:"volunteers",columns:[["id","Volunteer ID"],["name","Volunteer"],["companies","Companies"],["calls","Calls"],["followups","Follow-ups"],["opportunities","Opportunities"]],filters:["program","status"],search:["id","name","program"],sort:["calls","followups","opportunities"],actions:["Preview"],export:"Outreach Report"}
  };

  const state = {q:"", filters:{}, sortKey:null, dir:1, page:1, pageSize:8, tableData:null};
  const badge = v => `<span class="badge badge-${String(v).toLowerCase().includes("overdue")||String(v).toLowerCase().includes("critical")?"critical":String(v).toLowerCase().includes("pending")||String(v).toLowerCase().includes("follow")||String(v).toLowerCase().includes("due")||String(v).toLowerCase().includes("planned")?"pending":String(v).toLowerCase().includes("open")||String(v).toLowerCase().includes("active")||String(v).toLowerCase().includes("completed")||String(v).toLowerCase().includes("selected")||String(v).toLowerCase().includes("accepted")||String(v).toLowerCase().includes("eligible")?"active":"neutral"}><span></span>${esc(v)}</span>`;
  const format = v => (typeof v === "string" && /^(Active|Open|Pending|Follow-up|Interested|Discussion|Converted|Closed|New|Scheduled|Planned|Completed|Overdue|Eligible|Conditional|Applied|Shortlisted|Interview|Selected|Offer Received|Accepted|Joining Pending|Replied|Awaiting Response|Follow-up Required|Due|Upcoming|In Progress|Published|Sent|Draft|Registration Open|Not Eligible)$/.test(v)) ? badge(v) : esc(v);

  function pageHeader(c) {
    return `<div class="page-heading crc-heading"><div><span class="eyebrow">CRC · DEMO WORKSPACE</span><h1>${esc(c?.title||"Corporate Resource Cell")}</h1><p>${esc(c?.sub||"Coordinate industry outreach, campus placements, recruiters, placement drives and student opportunities.")}</p></div><div class="page-actions">${c?.primary?`<button class="btn btn-primary" data-crc-primary>${esc(c.primary)}</button>`:""}<button class="btn btn-secondary" data-crc-export>Export CSV</button></div></div>
      <div class="dashboard-notice crc-notice"><span>${CX.icon("info")}</span><div><strong>Demo Mode — Corporate Resource Cell</strong><p>Sample placement and industry coordination data is shown here. Real company communication, database operations and placement workflows will be implemented in later backend phases.</p></div></div>`;
  }

  function dashboard() {
    const stats=[["Companies","84","Industry directory","positive"],["Active Company Leads","27","Pipeline","positive"],["Recruiter Contacts","116","Contacts tracked","positive"],["Follow-ups Due","18","Requires attention","warning"],["Active Opportunities","32","Open roles","positive"],["Upcoming Placement Drives","7","Scheduled/planned","positive"],["Students Registered","428","Placement drives","positive"],["Students Selected","96","Selection pipeline","positive"],["Offers Received","112","Offer records","positive"],["Students Placed","96","Current placements","positive"],["Placement Rate","74.4%","Demo cohort","positive"],["Companies Contacted This Month","38","Outreach activity","positive"]];
    const k=stats.map((s,i)=>`<article class="stat-card card stat-${s[3]}"><div class="stat-card-top"><span class="stat-icon">${CX.icon(["building","users","faculty","calendar","briefcase","calendar","student","check","document","check","chart","phone"][i])}</span><span class="stat-kicker">CRC KPI</span></div><div class="stat-value">${s[1]}</div><div class="stat-bottom"><strong>${s[0]}</strong><span>${s[2]}</span></div></article>`).join("");
    const pipeline=[["New Lead",12],["Contacted",9],["Follow-up",18],["Interested",14],["Discussion",7],["Opportunity",11],["Drive Scheduled",7],["Completed",4]];
    const head=`<div class="page-heading crc-heading"><div><span class="eyebrow">CRC · DEMO WORKSPACE</span><h1>Corporate Resource Cell</h1><p>Coordinate industry outreach, campus placements, recruiters, placement drives and student opportunities.</p></div><div class="page-actions"><button class="btn btn-secondary" data-crc-dash-action="company">Add Company</button><button class="btn btn-secondary" data-crc-dash-action="lead">Add Company Lead</button><button class="btn btn-secondary" data-crc-dash-action="call">Log Call</button><button class="btn btn-secondary" data-crc-dash-action="followup">Schedule Follow-up</button><button class="btn btn-primary" data-crc-dash-action="drive">Create Placement Drive</button><button class="btn btn-secondary" data-crc-dash-action="export">Export Report</button></div></div><div class="dashboard-notice crc-notice"><span>${CX.icon("info")}</span><div><strong>Demo Mode — Corporate Resource Cell</strong><p>Sample placement and industry coordination data is shown here. Real company communication, database operations and placement workflows will be implemented in later backend phases.</p></div></div>`+
      `<section class="stat-grid crc-stat-grid">${k}</section>
      <section class="card crc-pipeline"><div class="section-head"><div><h2>Industry Outreach Pipeline</h2><p>Company relationship progression from lead to completed drive.</p></div></div><div class="pipeline-track">${pipeline.map((p,i)=>`<div class="pipeline-stage"><div class="pipeline-count">${p[1]}</div><strong>${p[0]}</strong>${i<pipeline.length-1?'<span class="pipeline-arrow">→</span>':''}</div>`).join("")}</div></section>
      <section class="dashboard-grid dashboard-grid-two"><article class="card"><div class="section-head"><div><h2>Recent CRC Activity</h2><p>Latest industry and placement coordination events.</p></div></div><div class="activity-feed">${[
        ["Volunteer 03 contacted Deloitte recruiter","10 Sep · Discussion scheduled","phone"],
        ["TCS confirmed campus placement drive","09 Sep · Drive coordination","calendar"],
        ["Infosys requested student eligibility list","09 Sep · Documentation request","document"],
        ["New recruiter contact added","09 Sep · Industry relations","users"],
        ["24 students registered for placement drive","08 Sep · Student applications","student"],
        ["Deloitte shortlisted 18 students","08 Sep · Selection workflow","check"],
        ["New offer received from Accenture","08 Sep · Offer tracking","document"]
      ].map(a=>`<div class="activity-item"><span class="activity-icon">${CX.icon(a[2])}</span><div><strong>${esc(a[0])}</strong><small>${esc(a[1])}</small></div></div>`).join("")}</div></article>
      <article class="card crc-attention"><div class="section-head"><div><h2>Attention Required</h2><p>Items needing CRC volunteer action.</p></div></div><div class="notice-list">${[
        ["18 follow-ups due","warning"],["6 overdue company responses","critical"],["3 placement drives requiring coordination","warning"],["12 student registrations pending verification","warning"],["5 recruiter contacts requiring follow-up","warning"],["2 company JDs awaiting confirmation","critical"]
      ].map(a=>`<div class="notice-item notice-${a[1]}"><span>${CX.icon(a[1]==="critical"?"error":"warning")}</span><div><strong>${esc(a[0])}</strong><small>Review and update in the relevant CRC module.</small></div></div>`).join("")}</div></article></section>
      <section class="dashboard-grid dashboard-grid-two"><article class="card"><div class="section-head"><div><h2>Upcoming Placement Drives</h2><p>Registration and eligibility overview.</p></div><a class="text-button" href="placement-drives.html">View all</a></div>${miniTable(placementDrives.slice(0,4),[["id","Drive"],["company","Company"],["role","Role"],["date","Date"],["registered","Registered"],["eligible","Eligible"],["status","Status"]])}</article>
      <article class="card"><div class="section-head"><div><h2>Placement Funnel</h2><p>Demo cohort progression.</p></div></div><div class="funnel">${[["Applications",428],["Shortlisted",184],["Interviews",132],["Selected",96],["Offers",112]].map(x=>`<div><span>${esc(x[0])}</span><b>${x[1]}</b><i style="width:${Math.min(100,x[1]/4.28)}%"></i></div>`).join("")}</div></article></section>
      <section class="card crc-boundary"><strong>Data access boundary</strong><span>CRC can coordinate placement information and view relevant student placement fields, but cannot modify official academic, attendance, examination, fee, faculty or personal records.</span></section>`;
    return head;
  }

  function miniTable(rows, cols) {
    return `<div class="table-wrap"><table><thead><tr>${cols.map(c=>`<th>${esc(c[1])}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${cols.map(c=>`<td>${format(r[c[0]]??"—")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  function toolbar(c) {
    const opts = {};
    c.filters.forEach(k=>opts[k]=[...new Set(datasets[c.data].map(r=>r[k]).filter(v=>v!==undefined&&v!==null))]);
    return `<div class="crc-toolbar card"><div class="crc-search"><span>${CX.icon("search")}</span><input id="crc-table-search" type="search" placeholder="Search ${esc(c.title.toLowerCase())}..." aria-label="Search ${esc(c.title)}"></div><div class="crc-filters">${c.filters.map(k=>`<select data-crc-filter="${esc(k)}" aria-label="Filter ${esc(k)}"><option value="">All ${esc(k.replace(/([A-Z])/g," $1"))}</option>${opts[k].map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join("")}</select>`).join("")}</div><button class="btn btn-secondary" type="button" data-crc-reset>Reset</button></div>`;
  }

  function renderTable(c) {
    const source=datasets[c.data]||[];
    let rows=source.filter(r=>{
      const q=state.q.toLowerCase();
      if(q && !c.search.some(k=>String(r[k]??"").toLowerCase().includes(q))) return false;
      return c.filters.every(k=>!state.filters[k]||String(r[k])===state.filters[k]);
    });
    if(state.sortKey) rows.sort((a,b)=>{let x=a[state.sortKey],y=b[state.sortKey]; const nx=Number.parseFloat(x),ny=Number.parseFloat(y); if(!Number.isNaN(nx)&&!Number.isNaN(ny)){x=nx;y=ny;}else{x=String(x??"").toLowerCase();y=String(y??"").toLowerCase();} return x<y?-state.dir:x>y?state.dir:0;});
    const total=rows.length, pages=Math.max(1,Math.ceil(total/state.pageSize)); if(state.page>pages)state.page=pages;
    const visible=rows.slice((state.page-1)*state.pageSize,state.page*state.pageSize);
    const th=c.columns.map(([k,l])=>`<th><button class="table-sort" type="button" data-crc-sort="${esc(k)}" aria-label="Sort by ${esc(l)}">${esc(l)} ${state.sortKey===k?(state.dir===1?"↑":"↓"):"↕"}</button></th>`).join("");
    const body=visible.length?visible.map((r,i)=>`<tr data-crc-row="${esc(r.id||r.student||String(i))}">${c.columns.map(([k])=>`<td>${format(r[k]??"—")}</td>`).join("")}<td class="align-right">${(c.actions||[]).map(a=>`<button class="table-action" type="button" data-crc-action="${esc(a)}" data-crc-id="${esc(r.id||r.student||String(i))}">${esc(a)}</button>`).join(" ")}</td></tr>`).join(""):`<tr><td colspan="${c.columns.length+1}" class="crc-empty">No records match the current search and filters.</td></tr>`;
    return `<div class="crc-table-card card"><div class="section-head"><div><h2>${esc(c.title)} Records</h2><p>${total} matching record${total===1?"":"s"} · page ${state.page} of ${pages}</p></div><button class="text-button" type="button" data-crc-export>Export CSV</button></div><div class="table-wrap"><table><thead><tr>${th}<th class="align-right">Actions</th></tr></thead><tbody>${body}</tbody></table></div><div class="crc-pagination"><span>Showing ${total?((state.page-1)*state.pageSize+1):0}–${Math.min(state.page*state.pageSize,total)} of ${total}</span><div><button class="btn btn-secondary" data-crc-page="${state.page-1}" ${state.page<=1?"disabled":""}>Previous</button>${Array.from({length:pages},(_,i)=>`<button class="crc-page ${i+1===state.page?"active":""}" data-crc-page="${i+1}">${i+1}</button>`).join("")}<button class="btn btn-secondary" data-crc-page="${state.page+1}" ${state.page>=pages?"disabled":""}>Next</button></div></div></div>`;
  }

  function reportPage(c) {
    if(page==="placement-reports") return pageHeader(c)+`<section class="crc-report-grid">${[["Students Placed","96"],["Offers","112"],["Companies","84"],["Placement Rate","74.4%"],["Average CTC","7.1 LPA"],["Highest CTC","14.5 LPA"]].map(x=>`<article class="card report-metric"><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong></article>`).join("")}</section><section class="dashboard-grid dashboard-grid-two"><article class="card"><div class="section-head"><div><h2>Company-wise Placement</h2><p>Students selected and offer outcomes.</p></div></div>${miniTable([{company:"Infosys",selected:28,offers:31,ctc:"6.8 LPA"},{company:"TCS",selected:24,offers:29,ctc:"6.8 LPA"},{company:"Deloitte",selected:18,offers:20,ctc:"8.2 LPA"},{company:"Accenture",selected:16,offers:18,ctc:"7.0 LPA"}],[["company","Company"],["selected","Students Selected"],["offers","Offers"],["ctc","Average CTC"]])}</article><article class="card"><div class="section-head"><div><h2>Program-wise Placement</h2><p>Demo placement rate by program.</p></div></div>${miniTable([{program:"MCA",students:180,placed:132,rate:"73.3%"},{program:"MBA",students:160,placed:124,rate:"77.5%"},{program:"MCom",students:80,placed:52,rate:"65.0%"}],[["program","Program"],["students","Students"],["placed","Placed"],["rate","Placement Rate"]])}</article></section>`;
    if(page==="industry-reports") return pageHeader(c)+`<section class="crc-report-grid">${[["Companies Contacted","38"],["Companies Interested","14"],["Companies Converted","7"],["Recruiter Contacts","116"],["Outreach Attempts","214"],["Response Rate","41.2%"],["Opportunities Generated","32"]].map(x=>`<article class="card report-metric"><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong></article>`).join("")}</section>`+miniTable([{industry:"IT Services",contacted:22,interested:9,converted:5,rate:"40.9%"},{industry:"Consulting",contacted:8,interested:3,converted:1,rate:"37.5%"},{industry:"Banking",contacted:5,interested:2,converted:1,rate:"40.0%"},{industry:"Software",contacted:3,interested:0,converted:0,rate:"0%"}],[["industry","Industry"],["contacted","Contacted"],["interested","Interested"],["converted","Converted"],["rate","Response Rate"]]);
    if(page==="outreach-reports") return pageHeader(c)+`<section class="crc-report-grid">${[["Calls","90"],["Emails","72"],["Meetings","18"],["Follow-ups","34"],["Successful Contacts","41"],["Interested Companies","14"],["Converted Companies","7"]].map(x=>`<article class="card report-metric"><span>${esc(x[0])}</span><strong>${esc(x[1])}</strong></article>`).join("")}</section>`+miniTable(volunteers,[["name","Volunteer"],["companies","Companies"],["calls","Calls"],["followups","Follow-ups"],["opportunities","Opportunities"]]);
    return "";
  }

  function analytics() {
    return pageHeader({title:"Analytics",sub:"Placement, industry outreach, company and volunteer analytics."})+
      `<section class="dashboard-grid dashboard-grid-two"><article class="card analytics-card"><div class="section-head"><div><h2>Industry Outreach Analytics</h2><p>Leads → contacts → responses → conversions.</p></div></div>${bar("Leads",27,40)}${bar("Contact Rate",76,100)}${bar("Response Rate",41,100)}${bar("Conversion Rate",26,100)}</article><article class="card analytics-card"><div class="section-head"><div><h2>Placement Analytics</h2><p>Applications through offers.</p></div></div>${bar("Applications",428,500)}${bar("Shortlists",184,500)}${bar("Interviews",132,500)}${bar("Selections",96,500)}${bar("Offers",112,500)}</article></section>
      <section class="dashboard-grid dashboard-grid-two"><article class="card analytics-card"><div class="section-head"><div><h2>Company Analytics</h2><p>Employer portfolio indicators.</p></div></div>${bar("Active Companies",84,100)}${bar("New Companies",12,30)}${bar("Repeat Recruiters",28,50)}${bar("IT Services",42,60)}</article><article class="card analytics-card"><div class="section-head"><div><h2>Student Analytics</h2><p>Demo placement cohort.</p></div></div>${bar("Registered",428,500)}${bar("Eligible",372,500)}${bar("Applied",318,500)}${bar("Shortlisted",184,500)}${bar("Selected",96,500)}${bar("Placed",96,500)}</article></section>
      <section class="card analytics-card"><div class="section-head"><div><h2>Volunteer Analytics</h2><p>CRC student volunteer contribution.</p></div></div>${volunteers.map(v=>`<div class="vol-row"><strong>${esc(v.name)}</strong><span>${v.calls} calls</span><span>${v.followups} follow-ups</span><span>${v.opportunities} opportunities</span></div>`).join("")}</section>`;
  }
  function bar(label,value,max){return `<div class="metric-bar"><div><span>${esc(label)}</span><strong>${value}</strong></div><i><b style="width:${Math.max(3,Math.min(100,value/max*100))}%"></b></i></div>`;}

  function calendar(type) {
    const isFollow=type==="follow-up-calendar";
    const events=isFollow?[["10 Sep","Overdue · Accenture","Email","Critical"],["12 Sep","Infosys · Recruiter A","Phone","High"],["13 Sep","Deloitte · Recruiter C","Phone","High"],["14 Sep","TCS · Recruiter B","Email","Medium"],["16 Sep","Accenture · Recruiter D","Meeting","High"]]:placementDrives.map(d=>[d.date,`${d.company} · ${d.role}`,d.mode,d.status]);
    return pageHeader({title:isFollow?"Follow-up Calendar":"Drive Calendar",sub:isFollow?"Calls, emails, meetings and recruiter follow-ups.":"Placement drives by date, employer, role and venue."})+
      `<section class="card calendar-card"><div class="calendar-head"><button class="btn btn-secondary" type="button">‹</button><strong>September 2026</strong><button class="btn btn-secondary" type="button">›</button></div><div class="calendar-grid">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<span class="cal-day-name">${d}</span>`).join("")}${Array.from({length:30},(_,i)=>{const n=i+1;const hit=events.some(e=>parseInt(e[0])===n);return `<button class="cal-date ${hit?"has-event":""}" type="button" data-cal-date="${n}"><b>${n}</b>${hit?events.filter(e=>parseInt(e[0])===n).slice(0,1).map(e=>`<small>${esc(e[1])}</small>`).join(""):""}</button>`}).join("")}</div></section>
      <section class="dashboard-grid dashboard-grid-two"><article class="card"><h2>Today</h2>${events.filter(e=>e[0]==="10 Sep").map(e=>calendarEvent(e)).join("")||"<p>No items.</p>"}</article><article class="card"><h2>Upcoming</h2>${events.filter(e=>e[0]!=="10 Sep").slice(0,5).map(e=>calendarEvent(e)).join("")}</article></section>`;
  }
  function calendarEvent(e){return `<div class="cal-event"><span>${esc(e[0])}</span><div><strong>${esc(e[1])}</strong><small>${esc(e[2])} · ${esc(e[3])}</small></div></div>`;}

  function communicationTimeline() {
    return pageHeader(configs["communication-history"])+`<section class="card timeline">${communicationHistory.map(x=>`<div class="timeline-item"><div class="timeline-date">${esc(x.date)}</div><div class="timeline-dot"></div><div class="timeline-body"><strong>${esc(x.method)} · ${esc(x.company)}</strong><span>${esc(x.recruiter)} · ${esc(x.volunteer)}</span><p>${esc(x.outcome)} — ${esc(x.notes)}</p></div></div>`).join("")}</section>`;
  }

  function profile() {
    return pageHeader({title:"Profile",sub:"Corporate Resource Cell volunteer profile and responsibilities."})+`<section class="dashboard-grid dashboard-grid-two"><article class="card profile-card"><div class="profile-large"><span class="avatar avatar-lg">SK</span><div><h2>Sahil Kaware</h2><p>CRC Student Volunteer</p></div></div><dl><div><dt>Program</dt><dd>MCA</dd></div><div><dt>Semester</dt><dd>II</dd></div><div><dt>Email</dt><dd>crc.volunteer@example.com</dd></div><div><dt>Phone</dt><dd>+91 90000 00000</dd></div><div><dt>Account Status</dt><dd>${badge("Active")}</dd></div></dl></article><article class="card"><h2>Assigned Responsibilities</h2><ul class="responsibility-list"><li>Industry research and company discovery</li><li>Recruiter outreach and communication records</li><li>Placement drive coordination</li><li>Student registration coordination</li><li>Follow-up and task management</li><li>Placement reporting</li></ul></article></section>`;
  }
  function settings() {
    return pageHeader({title:"Settings",sub:"Frontend/demo notification and interface preferences."})+`<form class="card crc-settings" id="crc-settings-form"><h2>Notification Preferences</h2>${["Follow-up alerts","Recruiter responses","Placement drive alerts","Student application alerts","Interview schedule alerts","Offer notifications"].map((x,i)=>`<label class="setting-row"><span><strong>${x}</strong><small>Receive demo portal notifications for this category.</small></span><input type="checkbox" ${i<5?"checked":""}></label>`).join("")}<h2>Interface</h2><label class="setting-row"><span><strong>Compact mode</strong><small>Reduce spacing in data-heavy views.</small></span><input type="checkbox"></label><label class="setting-row"><span><strong>Reduce animation</strong><small>Minimize non-essential motion.</small></span><input type="checkbox"></label><div class="form-actions"><button class="btn btn-primary" type="submit">Save Preferences</button></div></form>`;
  }

  function generic(c) { return pageHeader(c)+toolbar(c)+renderTable(c); }

  function formModal(kind) {
    const defs={
      "company":[["Company ID","companyId","text",true],["Company Name","company","text",true],["Industry","industry","text",true],["Website","website","url",false],["Location","location","text",true],["Recruiter","recruiter","text",false],["Status","status","text",true]],
      "company-lead":[["Lead ID","leadId","text",true],["Company Name","company","text",true],["Industry","industry","text",true],["Website","website","url",false],["Location","location","text",false],["Recruiter Name","recruiter","text",true],["Recruiter Email","email","email",true],["Recruiter Phone","phone","tel",true],["Source","source","text",true],["Assigned Volunteer","volunteer","text",true],["Initial Contact Date","contactDate","date",true],["Preferred Contact Method","method","text",true],["Status","status","text",true],["Next Follow-up","followup","date",true],["Notes","notes","textarea",false]]
      ,"call":[["Call ID","callId","text",true],["Company","company","text",true],["Recruiter","recruiter","text",true],["Volunteer","volunteer","text",true],["Date","date","date",true],["Time","time","time",true],["Duration (minutes)","duration","number",true],["Outcome","outcome","text",true],["Next Follow-up","followup","date",true],["Notes","notes","textarea",false]]
      ,"drive":[["Drive ID","driveId","text",true],["Company","company","text",true],["Recruiter","recruiter","text",true],["Opportunity","opportunity","text",true],["Job Role","role","text",true],["Drive Date","driveDate","date",true],["Start Time","start","time",true],["End Time","end","time",true],["Venue","venue","text",true],["Mode","mode","text",true],["Registration Deadline","deadline","date",true],["Program","program","text",true],["Department","department","text",true],["Semester","semester","text",true],["Minimum CGPA","cgpa","number",true],["Backlog Criteria","backlogs","text",true],["Graduation Year","year","number",true],["Status","status","text",true]]
      ,"followup":[["Follow-up ID","followupId","text",true],["Company","company","text",true],["Recruiter","recruiter","text",true],["Volunteer","volunteer","text",true],["Previous Contact","previous","date",true],["Follow-up Date","date","date",true],["Method","method","text",true],["Priority","priority","text",true],["Status","status","text",true]]
    };
    const fields=defs[kind]||defs["company-lead"];
    const labels={leadId:"Lead ID",callId:"Call ID",driveId:"Drive ID",followupId:"Follow-up ID"};
    const title={ "company":"Add Company","company-lead":"Add Company Lead",call:"Log Call",drive:"Create Placement Drive",followup:"Add Follow-up"}[kind];
    const fieldHTML=fields.map(f=>`<div class="form-field ${f[2]==="textarea"?"full":""}"><label for="crc-${f[1]}">${esc(f[0])}${f[3]?" *":""}</label>${f[2]==="textarea"?`<textarea id="crc-${f[1]}" name="${f[1]}" class="form-textarea" ${f[3]?"required":""}></textarea>`:`<input id="crc-${f[1]}" name="${f[1]}" class="form-control" type="${f[2]}" ${f[3]?"required":""} ${f[1]==="cgpa"?'min="0" max="10" step="0.1"':""} ${f[1]==="duration"?'min="1" max="480"':""}></input>`}</div>`).join("");
    const root=document.querySelector("#dashboard-modal-root");
    root.innerHTML=`<div class="modal-backdrop" data-crc-form-backdrop><section class="dashboard-modal dashboard-form-modal" role="dialog" aria-modal="true" aria-labelledby="crc-form-title"><button class="icon-button modal-close" type="button" aria-label="Close" data-crc-form-close>${CX.icon("close")}</button><div class="modal-icon">${CX.icon("document")}</div><h2 id="crc-form-title">${esc(title)}</h2><p>Demo-only workflow. No external communication or database write will occur.</p><form id="crc-form" class="form-grid">${fieldHTML}<div class="form-actions full"><button type="button" class="btn btn-secondary" data-crc-form-close>Cancel</button><button type="submit" class="btn btn-primary">Save Demo Record</button></div></form></section></div>`;
    const close=()=>root.innerHTML="";
    root.querySelectorAll("[data-crc-form-close]").forEach(b=>b.addEventListener("click",close));
    root.querySelector("[data-crc-form-backdrop]").addEventListener("click",e=>{if(e.target===e.currentTarget)close();});
    const form=root.querySelector("#crc-form");
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const fd=new FormData(form), d=Object.fromEntries(fd.entries());
      const email=d.email; if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){toast("Enter a valid recruiter email.","error");return;}
      const phone=d.phone; if(phone && !/^[+]?[\d\s()-]{8,18}$/.test(phone)){toast("Enter a valid phone number.","error");return;}
      if(d.cgpa && (+d.cgpa<0||+d.cgpa>10)){toast("CGPA must be between 0 and 10.","error");return;}
      if(kind==="call" && d.duration && (+d.duration<1||+d.duration>480)){toast("Call duration must be between 1 and 480 minutes.","error");return;}
      if(kind==="drive"){if(d.start>=d.end){toast("Start time must be before end time.","error");return;}if(d.deadline>=d.driveDate){toast("Registration deadline must be before the drive date.","error");return;}if(d.cgpa && (+d.cgpa<0||+d.cgpa>10)){toast("CGPA must be between 0 and 10.","error");return;}}
      if(kind==="followup" && d.date<d.previous){toast("Follow-up date cannot be before previous contact date.","error");return;}
      if(kind==="company-lead" && d.followup<d.contactDate){toast("Follow-up date cannot be before initial contact date.","error");return;}
      close(); toast(kind==="call"?"Call interaction recorded in demo mode. No phone call was initiated.":"Demo record saved locally for this interface. No backend/database write occurred.","success");
    });
    root.querySelector("input")?.focus();
  }

  function preview(c,id){
    const row=(datasets[c.data]||[]).find(r=>String(r.id||r.student)===String(id));
    if(!row){toast("Record not found.","error");return;}
    const details=c.columns.map(([k,l])=>`<div><dt>${esc(l)}</dt><dd>${format(row[k]??"—")}</dd></div>`).join("");
    const root=document.querySelector("#dashboard-modal-root");
    root.innerHTML=`<div class="modal-backdrop" data-crc-preview-backdrop><section class="dashboard-modal crc-preview" role="dialog" aria-modal="true"><button class="icon-button modal-close" type="button" data-crc-preview-close aria-label="Close">${CX.icon("close")}</button><div class="modal-icon">${CX.icon("document")}</div><h2>${esc(c.title)} Preview</h2><p>Demo record. Editing official academic or administrative records is outside CRC permissions.</p><dl>${details}</dl><div class="modal-actions"><button class="btn btn-secondary" data-crc-preview-close>Close</button>${c.data==="companies"?'<button class="btn btn-primary" data-crc-demo-action="followup">Schedule Follow-up</button>':""}</div></section></div>`;
    root.querySelectorAll("[data-crc-preview-close]").forEach(b=>b.addEventListener("click",()=>root.innerHTML=""));
    root.querySelector("[data-crc-preview-backdrop]").addEventListener("click",e=>{if(e.target===e.currentTarget)root.innerHTML=""});
    root.querySelector("[data-crc-demo-action]")?.addEventListener("click",()=>{root.innerHTML="";toast("Demo follow-up scheduled. No external message was sent.","success")});
  }

  function csv(c){
    const rows=datasets[c.data]||[]; const cols=c.columns;
    const csv=[cols.map(x=>x[1]),...rows.map(r=>cols.map(x=>String(r[x[0]]??"").replace(/"/g,'""')))].map(r=>r.map(v=>`"${v}"`).join(",")).join("\r\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}), url=URL.createObjectURL(blob), a=document.createElement("a");
    a.href=url;a.download=`${c.export.replace(/\s+/g,"-").toLowerCase()}-demo.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);
    toast(`${c.export} CSV exported in demo mode.`,"success");
  }

  function bindTable(c){
    const main=document.querySelector("#main-content");
    main.querySelector("#crc-table-search")?.addEventListener("input",e=>{state.q=e.target.value;state.page=1;refresh(c);});
    main.querySelectorAll("[data-crc-filter]").forEach(s=>s.addEventListener("change",e=>{state.filters[e.target.dataset.crcFilter]=e.target.value;state.page=1;refresh(c);}));
    main.querySelector("[data-crc-reset]")?.addEventListener("click",()=>{state.q="";state.filters={};state.sortKey=null;state.dir=1;state.page=1;refresh(c);});
    main.querySelectorAll("[data-crc-sort]").forEach(b=>b.addEventListener("click",()=>{const k=b.dataset.crcSort;if(state.sortKey===k)state.dir*=-1;else{state.sortKey=k;state.dir=1;}state.page=1;refresh(c);}));
    main.querySelectorAll("[data-crc-page]").forEach(b=>b.addEventListener("click",()=>{if(!b.disabled){state.page=+b.dataset.crcPage;refresh(c);}}));
    main.querySelectorAll("[data-crc-export]").forEach(b=>b.addEventListener("click",()=>csv(c)));
    main.querySelectorAll("[data-crc-action]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.crcAction,id=b.dataset.crcId;if(a==="Preview")preview(c,id);else if(a==="Log Call")formModal("call");else if(a==="Complete"){modal({title:"Complete task?",text:"Mark this demo item as completed?",confirm:"Complete",onConfirm:()=>toast("Demo item marked completed.","success")});}else if(a==="Update Status"){toast("Demo status action opened. Backend workflow will persist status later.","success");}else if(a==="Follow-up"){toast("Demo follow-up workflow prepared. No message was sent.","success");}else if(a==="Registrations"){location.href="drive-registrations.html";}else if(a==="Mark Read"){toast("Notification marked read in demo UI.","success");}}));
    const topSearch=document.querySelector("[data-dashboard-search]");
    topSearch?.addEventListener("input",e=>{state.q=e.target.value;state.page=1;refresh(c);});
  }
  function refresh(c){const main=document.querySelector("#main-content");const old=main.querySelector(".crc-table-card");if(old){old.outerHTML=renderTable(c);bindTable(c);}else render(c);}
  function render(c){
    const main=document.querySelector("#main-content");
    if(page==="dashboard"){main.innerHTML=dashboard();bindDashboard();return;}
    if(page==="follow-up-calendar"||page==="drive-calendar"){main.innerHTML=calendar(page);return;}
    if(page==="communication-history"){main.innerHTML=communicationTimeline();return;}
    if(page==="analytics"){main.innerHTML=analytics();return;}
    if(["placement-reports","industry-reports","outreach-reports"].includes(page)){main.innerHTML=reportPage(c);return;}
    if(page==="profile"){main.innerHTML=profile();return;}
    if(page==="settings"){main.innerHTML=settings();bindSettings();return;}
    if(["company-leads","call-logs","placement-drives","follow-ups"].includes(page)){}
    main.innerHTML=generic(c);bindTable(c);
  }

  function bindDashboard(){
    const actions={
      company:()=>formModal("company"),
      lead:()=>formModal("company-lead"),
      call:()=>formModal("call"),
      followup:()=>formModal("followup"),
      drive:()=>formModal("drive"),
      export:()=>csv({data:"companies",columns:[["id","Company ID"],["company","Company"],["industry","Industry"],["location","Location"],["recruiter","Recruiter"],["opportunities","Opportunities"],["status","Status"]],export:"CRC Company Report"})
    };
    document.querySelectorAll("[data-crc-dash-action]").forEach(b=>b.addEventListener("click",()=>actions[b.dataset.crcDashAction]?.()));
    const top=document.querySelector("[data-dashboard-search]");
    top?.addEventListener("input",e=>{const q=e.target.value.trim();if(q)toast("Dashboard search is active across the CRC workspace.","info");});
  }
  function bindSettings(){document.querySelector("#crc-settings-form")?.addEventListener("submit",e=>{e.preventDefault();toast("Demo notification preferences saved. No server settings were changed.","success")});}

  function bindSpecial(){
    const main=document.querySelector("#main-content");
    main.querySelectorAll("[data-cal-date]").forEach(b=>b.addEventListener("click",()=>toast(`September ${b.dataset.calDate}: demo calendar details shown in this view.`,"info")));
    if(page==="dashboard")return;
  }

  // Add/Company lead header action aliases and module-specific forms.
  function wireHeaderActions(){
    const actions=Array.from(document.querySelectorAll(".page-actions button"));
    actions.forEach(b=>b.addEventListener("click",()=>{const t=b.textContent;if(t==="Add Company Lead")formModal("company-lead");}));
  }

  const originalRenderShell=()=>{};
  const c=configs[page];
  if(!c && !["dashboard","follow-up-calendar","drive-calendar","communication-history","analytics","profile","settings"].includes(page)) {
    document.querySelector("#main-content").innerHTML=`<div class="card placeholder-module"><div class="placeholder-module-inner"><h2>CRC module unavailable</h2><p>The requested page is not configured.</p></div></div>`;
  } else render(c||{title:"Corporate Resource Cell"});
  bindSpecial();
  wireHeaderActions();

  // Page-specific primary actions that are intentionally frontend/demo.
  if(page==="company-leads"){
    document.querySelector("[data-crc-primary]")?.addEventListener("click",()=>formModal("company-lead"));
  }
  if(page==="call-logs"){
    document.querySelector("[data-crc-primary]")?.addEventListener("click",()=>formModal("call"));
  }
  if(page==="placement-drives"){
    document.querySelector("[data-crc-primary]")?.addEventListener("click",()=>formModal("drive"));
  }
})();
