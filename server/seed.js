const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');
const User = require('./models/User');
const Event = require('./models/Event');
const Registration = require('./models/Registration');

dotenv.config({ path: path.join(__dirname, '.env') });

const generatePassCode = () => {
  return `CHUB-2026-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus_events';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB');

    // Clear existing data
    await Registration.deleteMany({});
    await Event.deleteMany({});
    await User.deleteMany({});
    console.log('[Seed] Cleared existing records (Registrations, Events, Users)');

    // 1. Create Users
    const users = await User.create([
      {
        name: 'Dr. Tegil',
        email: 'admin@campus.edu',
        password: 'Admin@123',
        role: 'admin',
      },
      {
        name: 'Yashraj Kumar',
        email: 'student1@campus.edu',
        password: 'Student@123',
        role: 'student',
      },
      {
        name: 'Aarav Sharma',
        email: 'student2@campus.edu',
        password: 'Student@123',
        role: 'student',
      },
      {
        name: 'Priya Patel',
        email: 'student3@campus.edu',
        password: 'Student@123',
        role: 'student',
      },
    ]);

    const admin = users[0];
    const student1 = users[1];
    const student2 = users[2];
    const student3 = users[3];

    console.log(`[Seed] Created ${users.length} users (Faculty Admin: Dr. Tegil, Student: Yashraj Kumar)`);

    // Helper date functions
    const now = new Date();
    const addDays = (days, hours = 10, minutes = 0) => {
      const d = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      d.setHours(hours, minutes, 0, 0);
      return d;
    };

    // 2. Create Events
    const eventsData = [
      {
        title: 'HackSprint 2026: 36-Hour Campus Innovation Marathon',
        eventType: 'Hackathon',
        resourcePerson: 'Alex Chen (Principal Architect, Google Cloud) & Mentor Panel',
        eventDate: addDays(4, 9, 0),
        venue: 'Auditorium Hall A & Central Innovation Hub',
        description:
          'Join over 150 passionate student innovators for an exhilarating 36-hour hackathon. Build scalable AI, Web3, and IoT prototypes with real-time mentorship, cloud credits, and compete for ₹1,50,000 in grand prize tracks.',
        maxParticipants: 80,
        availableSeats: 77,
        status: 'Registration Open',
        createdBy: admin._id,
      },
      {
        title: 'Generative AI & LLM Systems: Hands-On Masterclass',
        eventType: 'Workshop',
        resourcePerson: 'Dr. Maya Sundaram (AI Research Scientist, Meta)',
        eventDate: addDays(7, 14, 0),
        venue: 'Computer Science Lab 1 (Advanced Computing Wing)',
        description:
          'Deep dive into LangChain, Vector Databases (Pinecone/Chroma), and fine-tuning Transformer models. Attendees will build and deploy a multi-agent autonomous coding assistant on local hardware.',
        maxParticipants: 45,
        availableSeats: 4, // Critical capacity demonstration (<5 seats left: Amber alert)
        status: 'Registration Open',
        createdBy: admin._id,
      },
      {
        title: 'High-Concurrency Distributed Systems & Go Microservices',
        eventType: 'Technical',
        resourcePerson: 'Vikramaditya Rao (Staff DevOps Engineer, AWS)',
        eventDate: addDays(11, 11, 30),
        venue: 'Seminar Hall 2, Tech Block',
        description:
          'Learn enterprise container orchestration, rate-limiting algorithms, atomic concurrency guards with MongoDB and Redis, distributed tracing with OpenTelemetry, and CI/CD pipeline automation.',
        maxParticipants: 60,
        availableSeats: 58,
        status: 'Registration Open',
        createdBy: admin._id,
      },
      {
        title: 'Cybersecurity Threat Hunting & Ethical Hacking Bootcamp',
        eventType: 'Workshop',
        resourcePerson: 'Sarah Jenkins (Certified Ethical Hacker & Security Lead, RedTeam)',
        eventDate: addDays(15, 10, 0),
        venue: 'Cyber Security Lab, Block C',
        description:
          'Hands-on Capture The Flag (CTF) challenges covering OWASP Top 10 vulnerabilities, API security exploits, binary analysis, and penetration testing fundamentals in an isolated sandboxed environment.',
        maxParticipants: 50,
        availableSeats: 50,
        status: 'Published',
        createdBy: admin._id,
      },
      {
        title: 'Quantum Computing & Post-Quantum Cryptography Keynote',
        eventType: 'Seminar',
        resourcePerson: 'Prof. David Miller (Department of Quantum Physics, MIT)',
        eventDate: addDays(18, 15, 0),
        venue: 'Main University Amphitheatre',
        description:
          'An insightful keynote exploration of quantum supremacy, Qubits superposition, Shor’s algorithm, and how quantum hardware advances will disrupt global public-key infrastructure.',
        maxParticipants: 120,
        availableSeats: 119,
        status: 'Registration Open',
        createdBy: admin._id,
      },
      {
        title: 'Harmony 2026: Annual Inter-College Cultural & Music Fest',
        eventType: 'Cultural',
        resourcePerson: 'Campus Cultural Committee & Celebrity Guest Performers',
        eventDate: addDays(22, 17, 30),
        venue: 'Open Air Campus Grounds',
        description:
          'The flagship cultural event of the year featuring live acoustic performances, battle of the bands, classical fusion choreography, street play competitions, and food truck stalls.',
        maxParticipants: 300,
        availableSeats: 298,
        status: 'Registration Open',
        createdBy: admin._id,
      },
      {
        title: 'Robotics & Autonomous Drones Design Sprint',
        eventType: 'Workshop',
        resourcePerson: 'Karan Mehra (Founder, AeroDrone Dynamics)',
        eventDate: addDays(25, 10, 0),
        venue: 'Computer Science Lab 1',
        description:
          'Assemble, calibrate, and program autonomous quadcopters using ROS (Robot Operating System), computer vision obstacle detection, and Raspberry Pi edge controllers.',
        maxParticipants: 25,
        availableSeats: 0, // Fully booked to showcase 'Registration Closed' status
        status: 'Registration Closed',
        createdBy: admin._id,
      },
      {
        title: 'Academic Research Methodologies & High-Impact Paper Publishing',
        eventType: 'Academic',
        resourcePerson: 'Dr. Anita Desai (Editor-in-Chief, International Journal of Computing)',
        eventDate: addDays(30, 11, 0),
        venue: 'Seminar Hall 1',
        description:
          'Essential guidance for graduate and undergraduate scholars on structuring IEEE/ACM research papers, conducting systematic literature reviews, experimental benchmarks, and avoiding peer review pitfalls.',
        maxParticipants: 40,
        availableSeats: 40,
        status: 'Draft',
        createdBy: admin._id,
      },
      {
        title: 'Campus Winter CodeFest & Algorithmic Problem Solving (Past Event)',
        eventType: 'Technical',
        resourcePerson: 'Competitive Programming Club Leads',
        eventDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        venue: 'Auditorium Hall B',
        description:
          'Speed programming tournament testing dynamic programming, graph traversal, and complex mathematical algorithms with rapid-fire leaderboard updates.',
        maxParticipants: 50,
        availableSeats: 0,
        status: 'Event Completed',
        createdBy: admin._id,
      },
    ];

    const createdEvents = await Event.insertMany(eventsData);
    console.log(`[Seed] Created ${createdEvents.length} events across all categories and venues`);

    // 3. Create Sample Registrations
    const registrationsData = [
      // Student 1 (Yashraj Kumar) registrations
      {
        event: createdEvents[0]._id, // HackSprint
        user: student1._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-X9A7K2',
        registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[1]._id, // GenAI Workshop
        user: student1._id,
        status: 'CHECKED_IN',
        passCode: 'CHUB-2026-G8N4W1',
        registeredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        checkedInAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[4]._id, // Quantum Keynote
        user: student1._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-Q3T9M5',
        registeredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[8]._id, // Winter CodeFest (Completed)
        user: student1._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-W1C2F3',
        registeredAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },

      // Student 2 (Aarav Sharma) registrations
      {
        event: createdEvents[0]._id, // HackSprint
        user: student2._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-A4R8S2',
        registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[2]._id, // Go Microservices
        user: student2._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-C7L9N2',
        registeredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[5]._id, // Harmony Fest
        user: student2._id,
        status: 'CANCELLED',
        passCode: 'CHUB-2026-H5M6F1',
        registeredAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        cancelledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },

      // Student 3 (Priya Patel) registrations
      {
        event: createdEvents[1]._id, // GenAI Workshop
        user: student3._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-P8Y3P1',
        registeredAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[2]._id, // Go Microservices
        user: student3._id,
        status: 'CHECKED_IN',
        passCode: 'CHUB-2026-P2R9Y4',
        registeredAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        checkedInAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        event: createdEvents[5]._id, // Harmony Fest
        user: student3._id,
        status: 'ACTIVE',
        passCode: 'CHUB-2026-H1M2F3',
        registeredAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdRegistrations = await Registration.insertMany(registrationsData);
    console.log(`[Seed] Created ${createdRegistrations.length} student registrations with verified pass codes`);

    console.log('\n======================================================');
    console.log('✅ CAMPUSHUB DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('👤 Faculty Admin Profile:');
    console.log('   Name:     Dr. Tegil');
    console.log('   Email:    admin@campus.edu');
    console.log('   Password: Admin@123');
    console.log('------------------------------------------------------');
    console.log('🎓 Student Profile:');
    console.log('   Name:     Yashraj Kumar');
    console.log('   Email:    student1@campus.edu');
    console.log('   Password: Student@123');
    console.log('------------------------------------------------------');
    console.log('🎓 Student 2 Profile:');
    console.log('   Name:     Aarav Sharma');
    console.log('   Email:    student2@campus.edu');
    console.log('   Password: Student@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Database seeding failed:', error);
    process.exit(1);
  }
};

seedData();
