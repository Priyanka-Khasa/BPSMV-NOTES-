require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('./src/models/Subject');

const subjects = [
  // ─── SEMESTER I (1st Year) ───────────────────────────────────────────────
  { name: 'Physics (Semiconductor Physics)', code: 'CS101', degree: 'B.Tech', branch: 'CSE', semester: 1 },
  { name: 'Mathematics-I (Calculus & Linear Algebra)', code: 'CS102', degree: 'B.Tech', branch: 'CSE', semester: 1 },
  { name: 'Basic Electrical Engineering', code: 'CS103', degree: 'B.Tech', branch: 'CSE', semester: 1 },
  { name: 'Engineering Graphics & Design', code: 'CS104', degree: 'B.Tech', branch: 'CSE', semester: 1 },
  { name: 'Induction Program', code: 'CS105', degree: 'B.Tech', branch: 'CSE', semester: 1 },

  // ─── SEMESTER II (1st Year) ──────────────────────────────────────────────
  { name: 'Chemistry-I', code: 'CS201', degree: 'B.Tech', branch: 'CSE', semester: 2 },
  { name: 'Mathematics-II (Probability & Statistics)', code: 'CS202', degree: 'B.Tech', branch: 'CSE', semester: 2 },
  { name: 'Programming for Problem Solving (C)', code: 'CS203', degree: 'B.Tech', branch: 'CSE', semester: 2 },
  { name: 'English / Effective Technical Communication', code: 'CS204', degree: 'B.Tech', branch: 'CSE', semester: 2 },
  { name: 'Workshop / Manufacturing Practices', code: 'CS205', degree: 'B.Tech', branch: 'CSE', semester: 2 },

  // ─── SEMESTER III (2nd Year) ─────────────────────────────────────────────
  { name: 'Data Structures & Algorithms', code: 'CS301', degree: 'B.Tech', branch: 'CSE', semester: 3 },
  { name: 'Computer Organization & Architecture', code: 'CS302', degree: 'B.Tech', branch: 'CSE', semester: 3 },
  { name: 'Object-Oriented Programming with C++', code: 'CS303', degree: 'B.Tech', branch: 'CSE', semester: 3 },
  { name: 'Mathematics-III (Calculus & ODEs)', code: 'CS304', degree: 'B.Tech', branch: 'CSE', semester: 3 },
  { name: 'Digital Electronics', code: 'CS305', degree: 'B.Tech', branch: 'CSE', semester: 3 },
  { name: 'Humanities-I (Organizational Behaviour)', code: 'CS306', degree: 'B.Tech', branch: 'CSE', semester: 3 },

  // ─── SEMESTER IV (2nd Year) ──────────────────────────────────────────────
  { name: 'Discrete Mathematics', code: 'CS401', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Operating Systems', code: 'CS402', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Design and Analysis of Algorithms', code: 'CS403', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Software Engineering', code: 'CS404', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Python Programming', code: 'CS405', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Hardware Lab / Scilab / MATLAB', code: 'CS406', degree: 'B.Tech', branch: 'CSE', semester: 4 },
  { name: 'Environmental Sciences', code: 'CS407', degree: 'B.Tech', branch: 'CSE', semester: 4 },

  // ─── SEMESTER V (3rd Year) ───────────────────────────────────────────────
  { name: 'Database Management Systems (DBMS)', code: 'CS501', degree: 'B.Tech', branch: 'CSE', semester: 5 },
  { name: 'Formal Language and Automata Theory (FLAT)', code: 'CS502', degree: 'B.Tech', branch: 'CSE', semester: 5 },
  { name: 'Java Programming', code: 'CS503', degree: 'B.Tech', branch: 'CSE', semester: 5 },
  { name: 'Machine Learning', code: 'CS504', degree: 'B.Tech', branch: 'CSE', semester: 5 },
  { name: 'Humanities-II (Economics for Engineers)', code: 'CS505', degree: 'B.Tech', branch: 'CSE', semester: 5 },
  { name: 'Constitution of India / Indian Traditional Knowledge', code: 'CS506', degree: 'B.Tech', branch: 'CSE', semester: 5 },

  // ─── SEMESTER VI (3rd Year) ──────────────────────────────────────────────
  { name: 'Compiler Design', code: 'CS601', degree: 'B.Tech', branch: 'CSE', semester: 6 },
  { name: 'Computer Networks', code: 'CS602', degree: 'B.Tech', branch: 'CSE', semester: 6 },
  { name: 'Professional Elective-I (e.g. Software Project Management)', code: 'CS603', degree: 'B.Tech', branch: 'CSE', semester: 6 },
  { name: 'Professional Elective-II (e.g. Data Mining)', code: 'CS604', degree: 'B.Tech', branch: 'CSE', semester: 6 },
  { name: 'Open Elective-I', code: 'CS605', degree: 'B.Tech', branch: 'CSE', semester: 6 },
  { name: 'Mini Project / Institutional Training', code: 'CS606', degree: 'B.Tech', branch: 'CSE', semester: 6 },

  // ─── SEMESTER VII (4th Year) ─────────────────────────────────────────────
  { name: 'Professional Elective-III (e.g. Cryptography & Network Security)', code: 'CS701', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Professional Elective-IV (e.g. Artificial Intelligence)', code: 'CS702', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Professional Elective-V (e.g. Soft Computing)', code: 'CS703', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Open Elective-II (e.g. Human Resource Management)', code: 'CS704', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Bioinformatics', code: 'CS705', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Project-I / Major Project Phase-I', code: 'CS706', degree: 'B.Tech', branch: 'CSE', semester: 7 },
  { name: 'Practical Training / Industrial Internship Evaluation', code: 'CS707', degree: 'B.Tech', branch: 'CSE', semester: 7 },

  // ─── SEMESTER VIII (4th Year) ────────────────────────────────────────────
  { name: 'Professional Elective-VI (e.g. Big Data)', code: 'CS801', degree: 'B.Tech', branch: 'CSE', semester: 8 },
  { name: 'Open Elective-III/IV (e.g. Cyber Laws)', code: 'CS802', degree: 'B.Tech', branch: 'CSE', semester: 8 },
  { name: 'Project-II / Final Major Project', code: 'CS803', degree: 'B.Tech', branch: 'CSE', semester: 8 },
  { name: 'Seminar', code: 'CS804', degree: 'B.Tech', branch: 'CSE', semester: 8 },

  // ════════════════════════════════════════════════════════════════════════
  // ECE - ELECTRONICS & COMMUNICATION ENGINEERING
  // ════════════════════════════════════════════════════════════════════════

  // ─── SEMESTER I (1st Year) ───────────────────────────────────────────────
  { name: 'Electromagnetic Theory / Oscillations, Waves & Optics', code: 'EC101', degree: 'B.Tech', branch: 'ECE', semester: 1 },
  { name: 'Mathematics-I (Calculus & Linear Algebra)', code: 'EC102', degree: 'B.Tech', branch: 'ECE', semester: 1 },
  { name: 'Programming for Problem Solving (C)', code: 'EC103', degree: 'B.Tech', branch: 'ECE', semester: 1 },
  { name: 'English / Effective Technical Communication', code: 'EC104', degree: 'B.Tech', branch: 'ECE', semester: 1 },
  { name: 'Workshop / Manufacturing Practices', code: 'EC105', degree: 'B.Tech', branch: 'ECE', semester: 1 },
  { name: 'Induction Program', code: 'EC106', degree: 'B.Tech', branch: 'ECE', semester: 1 },

  // ─── SEMESTER II (1st Year) ──────────────────────────────────────────────
  { name: 'Semiconductor Physics', code: 'EC201', degree: 'B.Tech', branch: 'ECE', semester: 2 },
  { name: 'Mathematics-II (Probability & Statistics)', code: 'EC202', degree: 'B.Tech', branch: 'ECE', semester: 2 },
  { name: 'Basic Electrical Engineering', code: 'EC203', degree: 'B.Tech', branch: 'ECE', semester: 2 },
  { name: 'Engineering Graphics & Design (CAD)', code: 'EC204', degree: 'B.Tech', branch: 'ECE', semester: 2 },

  // ─── SEMESTER III (2nd Year) ─────────────────────────────────────────────
  { name: 'Electronic Devices', code: 'EC301', degree: 'B.Tech', branch: 'ECE', semester: 3 },
  { name: 'Digital System and Design', code: 'EC302', degree: 'B.Tech', branch: 'ECE', semester: 3 },
  { name: 'Network Theory', code: 'EC303', degree: 'B.Tech', branch: 'ECE', semester: 3 },
  { name: 'Mathematics-III (Calculus & ODEs)', code: 'EC304', degree: 'B.Tech', branch: 'ECE', semester: 3 },
  { name: 'Electronic Equipment and Maintenance', code: 'EC305', degree: 'B.Tech', branch: 'ECE', semester: 3 },
  { name: 'Engineering Economics and Management', code: 'EC306', degree: 'B.Tech', branch: 'ECE', semester: 3 },

  // ─── SEMESTER IV (2nd Year) ──────────────────────────────────────────────
  { name: 'Analog Circuits', code: 'EC401', degree: 'B.Tech', branch: 'ECE', semester: 4 },
  { name: 'Signals and Systems', code: 'EC402', degree: 'B.Tech', branch: 'ECE', semester: 4 },
  { name: 'Microprocessors and Microcontrollers', code: 'EC403', degree: 'B.Tech', branch: 'ECE', semester: 4 },
  { name: 'Data Structures', code: 'EC404', degree: 'B.Tech', branch: 'ECE', semester: 4 },
  { name: 'Environmental Sciences', code: 'EC405', degree: 'B.Tech', branch: 'ECE', semester: 4 },

  // ─── SEMESTER V (3rd Year) ───────────────────────────────────────────────
  { name: 'Analog and Digital Communication', code: 'EC501', degree: 'B.Tech', branch: 'ECE', semester: 5 },
  { name: 'Digital Signal Processing (DSP)', code: 'EC502', degree: 'B.Tech', branch: 'ECE', semester: 5 },
  { name: 'Program Elective-I (e.g. Wireless & Mobile Communication)', code: 'EC503', degree: 'B.Tech', branch: 'ECE', semester: 5 },
  { name: 'Open Elective-I (e.g. Optimization Techniques)', code: 'EC504', degree: 'B.Tech', branch: 'ECE', semester: 5 },
  { name: 'Foreign Language (Non-credit)', code: 'EC505', degree: 'B.Tech', branch: 'ECE', semester: 5 },

  // ─── SEMESTER VI (3rd Year) ──────────────────────────────────────────────
  { name: 'Mobile Communication and Network', code: 'EC601', degree: 'B.Tech', branch: 'ECE', semester: 6 },
  { name: 'Control Systems', code: 'EC602', degree: 'B.Tech', branch: 'ECE', semester: 6 },
  { name: 'Digital System Design', code: 'EC603', degree: 'B.Tech', branch: 'ECE', semester: 6 },
  { name: 'Single Board Computers for Electronic System Design (Arduino/RPi)', code: 'EC604', degree: 'B.Tech', branch: 'ECE', semester: 6 },
  { name: 'Program Elective-II (Advanced Industry Specialization)', code: 'EC605', degree: 'B.Tech', branch: 'ECE', semester: 6 },
  { name: 'Open Elective-II', code: 'EC606', degree: 'B.Tech', branch: 'ECE', semester: 6 },

  // ─── SEMESTER VII (4th Year) ─────────────────────────────────────────────
  { name: 'Fiber Optic Communications', code: 'EC701', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Program Elective-III (e.g. Cryptography & Network Security)', code: 'EC702', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Program Elective-IV (e.g. Machine Learning & AI)', code: 'EC703', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Program Elective-V (e.g. Biomedical Signal Processing)', code: 'EC704', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Open Elective-III (e.g. Design Thinking)', code: 'EC705', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Design & Simulation Lab (MATLAB / LabVIEW)', code: 'EC706', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Minor Project', code: 'EC707', degree: 'B.Tech', branch: 'ECE', semester: 7 },
  { name: 'Professional Training / Industrial Internship Assessment', code: 'EC708', degree: 'B.Tech', branch: 'ECE', semester: 7 },

  // ─── SEMESTER VIII (4th Year) ────────────────────────────────────────────
  { name: 'Program Elective-VI (e.g. Advanced VLSI / Radar Systems)', code: 'EC801', degree: 'B.Tech', branch: 'ECE', semester: 8 },
  { name: 'Open Elective-IV (e.g. Cloud Computing & Big Data)', code: 'EC802', degree: 'B.Tech', branch: 'ECE', semester: 8 },
  { name: 'Major Project / Final Year Dissertation', code: 'EC803', degree: 'B.Tech', branch: 'ECE', semester: 8 },
  { name: 'Seminar & General Proficiency', code: 'EC804', degree: 'B.Tech', branch: 'ECE', semester: 8 },

  // ════════════════════════════════════════════════════════════════════════
  // IT - INFORMATION TECHNOLOGY
  // ════════════════════════════════════════════════════════════════════════

  // ─── SEMESTER I (1st Year) ───────────────────────────────────────────────
  { name: 'Physics (Semiconductor Physics)', code: 'IT101', degree: 'B.Tech', branch: 'IT', semester: 1 },
  { name: 'Mathematics-I (Calculus & Linear Algebra)', code: 'IT102', degree: 'B.Tech', branch: 'IT', semester: 1 },
  { name: 'Basic Electrical Engineering', code: 'IT103', degree: 'B.Tech', branch: 'IT', semester: 1 },
  { name: 'Engineering Graphics & Design', code: 'IT104', degree: 'B.Tech', branch: 'IT', semester: 1 },
  { name: 'Induction Program', code: 'IT105', degree: 'B.Tech', branch: 'IT', semester: 1 },

  // ─── SEMESTER II (1st Year) ──────────────────────────────────────────────
  { name: 'Chemistry-I', code: 'IT201', degree: 'B.Tech', branch: 'IT', semester: 2 },
  { name: 'Mathematics-II (Probability & Statistics)', code: 'IT202', degree: 'B.Tech', branch: 'IT', semester: 2 },
  { name: 'Programming for Problem Solving (C)', code: 'IT203', degree: 'B.Tech', branch: 'IT', semester: 2 },
  { name: 'English / Effective Technical Communication', code: 'IT204', degree: 'B.Tech', branch: 'IT', semester: 2 },
  { name: 'Workshop / Manufacturing Practices', code: 'IT205', degree: 'B.Tech', branch: 'IT', semester: 2 },

  // ─── SEMESTER III (2nd Year) ─────────────────────────────────────────────
  { name: 'Data Structures & Algorithms', code: 'IT301', degree: 'B.Tech', branch: 'IT', semester: 3 },
  { name: 'Computer Organization & Architecture', code: 'IT302', degree: 'B.Tech', branch: 'IT', semester: 3 },
  { name: 'Object-Oriented Programming with C++', code: 'IT303', degree: 'B.Tech', branch: 'IT', semester: 3 },
  { name: 'Mathematics-III (Calculus & ODEs)', code: 'IT304', degree: 'B.Tech', branch: 'IT', semester: 3 },
  { name: 'Digital Electronics', code: 'IT305', degree: 'B.Tech', branch: 'IT', semester: 3 },
  { name: 'Humanities-I (Organizational Behaviour)', code: 'IT306', degree: 'B.Tech', branch: 'IT', semester: 3 },

  // ─── SEMESTER IV (2nd Year) ──────────────────────────────────────────────
  { name: 'Discrete Mathematics', code: 'IT401', degree: 'B.Tech', branch: 'IT', semester: 4 },
  { name: 'Operating Systems', code: 'IT402', degree: 'B.Tech', branch: 'IT', semester: 4 },
  { name: 'Software Engineering', code: 'IT403', degree: 'B.Tech', branch: 'IT', semester: 4 },
  { name: 'Design and Analysis of Algorithms', code: 'IT404', degree: 'B.Tech', branch: 'IT', semester: 4 },
  { name: 'Python Programming', code: 'IT405', degree: 'B.Tech', branch: 'IT', semester: 4 },
  { name: 'Hardware Lab / Scilab / MATLAB', code: 'IT406', degree: 'B.Tech', branch: 'IT', semester: 4 },
  { name: 'Environmental Sciences', code: 'IT407', degree: 'B.Tech', branch: 'IT', semester: 4 },

  // ─── SEMESTER V (3rd Year) ───────────────────────────────────────────────
  { name: 'Database Management Systems (DBMS)', code: 'IT501', degree: 'B.Tech', branch: 'IT', semester: 5 },
  { name: 'Multimedia and Technology', code: 'IT502', degree: 'B.Tech', branch: 'IT', semester: 5 },
  { name: 'Java Programming', code: 'IT503', degree: 'B.Tech', branch: 'IT', semester: 5 },
  { name: 'Machine Learning', code: 'IT504', degree: 'B.Tech', branch: 'IT', semester: 5 },
  { name: 'Humanities-II (Economics for Engineers)', code: 'IT505', degree: 'B.Tech', branch: 'IT', semester: 5 },
  { name: 'Constitution of India / Indian Traditional Knowledge', code: 'IT506', degree: 'B.Tech', branch: 'IT', semester: 5 },

  // ─── SEMESTER VI (3rd Year) ──────────────────────────────────────────────
  { name: 'Web & Internet Technology', code: 'IT601', degree: 'B.Tech', branch: 'IT', semester: 6 },
  { name: 'Computer Networks', code: 'IT602', degree: 'B.Tech', branch: 'IT', semester: 6 },
  { name: 'Professional Elective-I (e.g. Software Project Management)', code: 'IT603', degree: 'B.Tech', branch: 'IT', semester: 6 },
  { name: 'Professional Elective-II (e.g. Advanced Java / Data Mining)', code: 'IT604', degree: 'B.Tech', branch: 'IT', semester: 6 },
  { name: 'Open Elective-I', code: 'IT605', degree: 'B.Tech', branch: 'IT', semester: 6 },
  { name: 'Mini Project / Institutional Training', code: 'IT606', degree: 'B.Tech', branch: 'IT', semester: 6 },

  // ─── SEMESTER VII (4th Year) ─────────────────────────────────────────────
  { name: 'Bioinformatics', code: 'IT701', degree: 'B.Tech', branch: 'IT', semester: 7 },
  { name: 'Professional Elective-III (e.g. Cryptography & Network Security)', code: 'IT702', degree: 'B.Tech', branch: 'IT', semester: 7 },
  { name: 'Professional Elective-IV (e.g. Web & Internet Technology Tracks)', code: 'IT703', degree: 'B.Tech', branch: 'IT', semester: 7 },
  { name: 'Professional Elective-V (e.g. Soft Computing / Information Retrieval)', code: 'IT704', degree: 'B.Tech', branch: 'IT', semester: 7 },
  { name: 'Open Elective-II (e.g. Human Resource Management)', code: 'IT705', degree: 'B.Tech', branch: 'IT', semester: 7 },
  { name: 'Project-I / Major Project Phase-I', code: 'IT706', degree: 'B.Tech', branch: 'IT', semester: 7 },
  { name: 'Practical Training / Industrial Internship Evaluation', code: 'IT707', degree: 'B.Tech', branch: 'IT', semester: 7 },

  // ─── SEMESTER VIII (4th Year) ────────────────────────────────────────────
  { name: 'Professional Elective-VI (e.g. Big Data Analytics)', code: 'IT801', degree: 'B.Tech', branch: 'IT', semester: 8 },
  { name: 'Open Elective-IV (e.g. Cyber Laws / E-Commerce)', code: 'IT802', degree: 'B.Tech', branch: 'IT', semester: 8 },
  { name: 'Project-II / Final Major Project', code: 'IT803', degree: 'B.Tech', branch: 'IT', semester: 8 },
  { name: 'Seminar', code: 'IT804', degree: 'B.Tech', branch: 'IT', semester: 8 },

  // ════════════════════════════════════════════════════════════════════════
  // FT - FASHION TECHNOLOGY
  // ════════════════════════════════════════════════════════════════════════

  // ─── SEMESTER I (1st Year) ───────────────────────────────────────────────
  { name: 'Semiconductor Physics / Chemistry', code: 'FT101', degree: 'B.Tech', branch: 'FT', semester: 1 },
  { name: 'Mathematics-I (Calculus & Linear Algebra)', code: 'FT102', degree: 'B.Tech', branch: 'FT', semester: 1 },
  { name: 'Programming for Problem Solving', code: 'FT103', degree: 'B.Tech', branch: 'FT', semester: 1 },
  { name: 'English for Effective Communication', code: 'FT104', degree: 'B.Tech', branch: 'FT', semester: 1 },
  { name: 'Workshop / Manufacturing Practices', code: 'FT105', degree: 'B.Tech', branch: 'FT', semester: 1 },
  { name: 'Induction Program', code: 'FT106', degree: 'B.Tech', branch: 'FT', semester: 1 },

  // ─── SEMESTER II (1st Year) ──────────────────────────────────────────────
  { name: 'Engineering Chemistry / Applied Physics', code: 'FT201', degree: 'B.Tech', branch: 'FT', semester: 2 },
  { name: 'Mathematics-II (Probability, Vectors & Calculus)', code: 'FT202', degree: 'B.Tech', branch: 'FT', semester: 2 },
  { name: 'Basic Electrical & Electronics Engineering', code: 'FT203', degree: 'B.Tech', branch: 'FT', semester: 2 },
  { name: 'Engineering Graphics & Design (CAD)', code: 'FT204', degree: 'B.Tech', branch: 'FT', semester: 2 },

  // ─── SEMESTER III (2nd Year) ─────────────────────────────────────────────
  { name: 'Fashion & Apparel Industry Concepts', code: 'FT301', degree: 'B.Tech', branch: 'FT', semester: 3 },
  { name: 'Apparel Production - I', code: 'FT302', degree: 'B.Tech', branch: 'FT', semester: 3 },
  { name: 'Elements of Fashion & Design', code: 'FT303', degree: 'B.Tech', branch: 'FT', semester: 3 },
  { name: 'Applied Statistics for Fashion and Apparel Engineering', code: 'FT304', degree: 'B.Tech', branch: 'FT', semester: 3 },
  { name: 'Fibre Identification and Yarn Formation Lab', code: 'FT305', degree: 'B.Tech', branch: 'FT', semester: 3 },
  { name: 'Fashion Sketching and Illustration Lab', code: 'FT306', degree: 'B.Tech', branch: 'FT', semester: 3 },
  { name: 'Constitution of India (Non-Credit)', code: 'FT307', degree: 'B.Tech', branch: 'FT', semester: 3 },

  // ─── SEMESTER IV (2nd Year) ──────────────────────────────────────────────
  { name: 'Color Physics', code: 'FT401', degree: 'B.Tech', branch: 'FT', semester: 4 },
  { name: 'Textile Fabric Structure', code: 'FT402', degree: 'B.Tech', branch: 'FT', semester: 4 },
  { name: 'Design Concepts in Fashion and Apparel', code: 'FT403', degree: 'B.Tech', branch: 'FT', semester: 4 },
  { name: 'Traditional Indian Textiles & Embroideries', code: 'FT404', degree: 'B.Tech', branch: 'FT', semester: 4 },
  { name: 'Pattern Making & Garment Construction Lab - I', code: 'FT405', degree: 'B.Tech', branch: 'FT', semester: 4 },
  { name: 'Fabric Structure & Geometry Lab', code: 'FT406', degree: 'B.Tech', branch: 'FT', semester: 4 },
  { name: 'Environmental Sciences (Non-Credit)', code: 'FT407', degree: 'B.Tech', branch: 'FT', semester: 4 },

  // ─── SEMESTER V (3rd Year) ───────────────────────────────────────────────
  { name: 'Textile Chemical Processing (Dyeing & Printing)', code: 'FT501', degree: 'B.Tech', branch: 'FT', semester: 5 },
  { name: 'Apparel Production - II', code: 'FT502', degree: 'B.Tech', branch: 'FT', semester: 5 },
  { name: 'Garment Machinery & Equipment', code: 'FT503', degree: 'B.Tech', branch: 'FT', semester: 5 },
  { name: 'Structure and Design of Woven Fabrics', code: 'FT504', degree: 'B.Tech', branch: 'FT', semester: 5 },
  { name: 'Advanced Pattern Making & Draping Lab', code: 'FT505', degree: 'B.Tech', branch: 'FT', semester: 5 },
  { name: 'Garment Construction Lab - II', code: 'FT506', degree: 'B.Tech', branch: 'FT', semester: 5 },
  { name: 'Industrial Training Assessment - I', code: 'FT507', degree: 'B.Tech', branch: 'FT', semester: 5 },

  // ─── SEMESTER VI (3rd Year) ──────────────────────────────────────────────
  { name: 'Testing of Textiles & Garments', code: 'FT601', degree: 'B.Tech', branch: 'FT', semester: 6 },
  { name: 'Computer-Aided Design (CAD) in Fashion', code: 'FT602', degree: 'B.Tech', branch: 'FT', semester: 6 },
  { name: 'Professional Elective-I (e.g. Sustainable Fashion)', code: 'FT603', degree: 'B.Tech', branch: 'FT', semester: 6 },
  { name: 'Professional Elective-II (e.g. Knitwear Technology)', code: 'FT604', degree: 'B.Tech', branch: 'FT', semester: 6 },
  { name: 'Open Elective-I (Cross-departmental)', code: 'FT605', degree: 'B.Tech', branch: 'FT', semester: 6 },
  { name: 'Fashion Styling & Portfolio Development Lab', code: 'FT606', degree: 'B.Tech', branch: 'FT', semester: 6 },

  // ─── SEMESTER VII (4th Year) ─────────────────────────────────────────────
  { name: 'Apparel Quality Management', code: 'FT701', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Garment Costing and Merchandising', code: 'FT702', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Professional Elective-III (e.g. Lean Manufacturing in Apparels)', code: 'FT703', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Professional Elective-IV (e.g. Fashion Marketing & Retail Management)', code: 'FT704', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Open Elective-II (e.g. Entrepreneurship Development)', code: 'FT705', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Computer Integrated Manufacturing (CIM) Lab', code: 'FT706', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Minor Project / Fabric Product Development', code: 'FT707', degree: 'B.Tech', branch: 'FT', semester: 7 },
  { name: 'Industrial Internship Evaluation - II', code: 'FT708', degree: 'B.Tech', branch: 'FT', semester: 7 },

  // ─── SEMESTER VIII (4th Year) ────────────────────────────────────────────
  { name: 'Professional Elective-V (e.g. Global Logistics & Supply Chain)', code: 'FT801', degree: 'B.Tech', branch: 'FT', semester: 8 },
  { name: 'Open Elective-III/IV (e.g. Cyber Laws / Operations Research)', code: 'FT802', degree: 'B.Tech', branch: 'FT', semester: 8 },
  { name: 'Major Project / Graduation Fashion Show Portfolio', code: 'FT803', degree: 'B.Tech', branch: 'FT', semester: 8 },
  { name: 'Comprehensive Seminar & General Proficiency', code: 'FT804', degree: 'B.Tech', branch: 'FT', semester: 8 },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    const subjectsWithYear = subjects.map((subject) => ({
      ...subject,
      year: Math.ceil(Math.min(Math.max(Number(subject.semester) || 1, 1), 8) / 2)
    }));

    const invalidSubjects = subjectsWithYear.filter((subject) => (
      !subject.branch ||
      !subject.year ||
      !subject.semester ||
      subject.semester < 1 ||
      subject.semester > 8 ||
      subject.year !== Math.ceil(subject.semester / 2)
    ));

    if (invalidSubjects.length) {
      throw new Error(`Invalid subject mappings found: ${invalidSubjects.map((subject) => subject.code).join(', ')}`);
    }

    const result = await Subject.bulkWrite(subjectsWithYear.map((subject) => ({
      updateOne: {
        filter: { code: subject.code, degree: subject.degree, branch: subject.branch },
        update: { $set: subject },
        upsert: true
      }
    })));
    console.log(`Subjects seeded successfully! Upserted: ${result.upsertedCount}, updated: ${result.modifiedCount}`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
