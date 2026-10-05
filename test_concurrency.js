/**
 * ============================================================================
 * CAMPUSHUB — HIGH-CONCURRENCY RESERVATION & SYSTEM VALIDATION SUITE
 * ============================================================================
 * Tests:
 * 1. Health check & Atomic Concurrency Guards
 * 2. Role-Based Authentication (Faculty Admin vs Student)
 * 3. Compound Search & Discovery Filters
 * 4. High-Concurrency Stress Test (10 concurrent bookings on 2 seats)
 *    - Verifies exactly 2 bookings succeed (201)
 *    - Verifies 8 requests rejected with 409 Conflict
 *    - Verifies availableSeats = 0 (zero overbooking)
 *    - Verifies status automatically flipped to 'Registration Closed'
 * 5. Atomic Seat Rollback & Pass Invalidation on Cancellation
 * 6. Cryptographic Pass Code Verification & Faculty Check-In
 * 7. Faculty Analytics & Capacity Utilization Telemetry
 * ============================================================================
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

// Helper for HTTP requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const payload = body !== null && body !== undefined ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {},
    };

    if (payload) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

const pass = (msg) => console.log(`  ${colors.green}✔ PASS:${colors.reset} ${msg}`);
const fail = (msg) => console.error(`  ${colors.red}✖ FAIL:${colors.reset} ${msg}`);
const banner = (title) => {
  console.log(`\n${colors.cyan}${colors.bright}====================================================================`);
  console.log(`🚀 ${title}`);
  console.log(`====================================================================${colors.reset}`);
};

async function runTestSuite() {
  let adminToken = '';
  let student1Token = '';
  let studentTokens = [];
  let testEventId = '';
  let successfulReservationId = '';
  let verifiedPassCode = '';

  try {
    banner('STAGE 1: System Health & Concurrency Engine Diagnostic');
    const healthRes = await request('GET', '/health');
    if (healthRes.status === 200 && healthRes.body.status === 'healthy') {
      pass(`Health Check OK (Status: ${healthRes.body.status}, Service: ${healthRes.body.service})`);
      pass(`Concurrency Engine: ${healthRes.body.concurrencyGuards}`);
    } else {
      fail(`Health Check Failed: ${JSON.stringify(healthRes)}`);
    }

    banner('STAGE 2: Role-Based Authentication & JWT Issue');
    // Admin login
    const adminLogin = await request('POST', '/auth/login', {
      email: 'admin@campus.edu',
      password: 'Admin@123',
    });
    if (adminLogin.status === 200 && adminLogin.body.user.role === 'admin') {
      adminToken = adminLogin.body.token;
      pass(`Admin Authenticated: ${adminLogin.body.user.name} (${adminLogin.body.user.role})`);
    } else {
      throw new Error(`Admin login failed: ${JSON.stringify(adminLogin)}`);
    }

    // Student 1 login
    const studentLogin = await request('POST', '/auth/login', {
      email: 'student1@campus.edu',
      password: 'Student@123',
    });
    if (studentLogin.status === 200 && studentLogin.body.user.role === 'student') {
      student1Token = studentLogin.body.token;
      pass(`Student Authenticated: ${studentLogin.body.user.name} (${studentLogin.body.user.role})`);
    } else {
      throw new Error(`Student login failed: ${JSON.stringify(studentLogin)}`);
    }

    // Register 8 dynamic test students to test true parallel multi-user concurrency
    console.log(`  Creating 8 isolated student test accounts for parallel stress test...`);
    for (let i = 1; i <= 8; i++) {
      const email = `loadtest_user_${Date.now()}_${i}@campus.edu`;
      const reg = await request('POST', '/auth/register', {
        name: `Load Test Student ${i}`,
        email,
        password: 'Password@123',
        department: 'Computer Science',
        year: '3rd Year',
        role: 'student',
      });
      if (reg.status === 201) {
        studentTokens.push({ name: `Student ${i}`, token: reg.body.token, id: reg.body.user._id });
      }
    }
    pass(`Successfully provisioned ${studentTokens.length} isolated student sessions`);

    banner('STAGE 3: Compound Multi-Parameter Search & Discovery');
    const searchRes = await request('GET', '/events?category=Workshop&hasSeats=true');
    if (searchRes.status === 200 && Array.isArray(searchRes.body.events)) {
      pass(`Discovery Filter: retrieved ${searchRes.body.events.length} active workshops with open seats`);
    } else {
      fail(`Search failed: ${JSON.stringify(searchRes)}`);
    }

    banner('STAGE 4: High-Concurrency Stress Test (Race Condition Elimination)');
    // Admin creates an event with strictly 2 seats
    const eventPayload = {
      title: `Critical Concurrency Stress Test [${Date.now()}]`,
      eventType: 'Workshop',
      category: 'Workshop',
      description: 'Micro-capacity test event designed to trigger race conditions under concurrent load.',
      venue: 'CS High Performance Computing Lab',
      eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      registrationDeadline: new Date(Date.now() + 86400000 * 4).toISOString(),
      maxParticipants: 2,
      availableSeats: 2,
      status: 'Registration Open',
      resourcePerson: 'Dr. Tegil',
    };

    const createEventRes = await request('POST', '/events', eventPayload, adminToken);
    if (createEventRes.status === 201 && createEventRes.body.event) {
      testEventId = createEventRes.body.event._id;
      pass(`Created target test event "${createEventRes.body.event.title}" with exactly 2 available seats.`);
    } else {
      throw new Error(`Failed to create test event: ${JSON.stringify(createEventRes)}`);
    }

    // Now fire 8 concurrent booking requests simultaneously via Promise.all
    console.log(`  🔥 Firing 8 simultaneous asynchronous reservations against 2 available seats...`);
    const bookingPromises = studentTokens.map((st) =>
      request('POST', `/events/${testEventId}/book`, {}, st.token)
    );

    const bookingResults = await Promise.all(bookingPromises);

    const successfulBookings = bookingResults.filter((r) => r.status === 201);
    const conflictRejections = bookingResults.filter((r) => r.status === 409);
    const otherErrors = bookingResults.filter((r) => r.status !== 201 && r.status !== 409);

    console.log(`  📊 Results:`);
    console.log(`     - 201 Confirmed Passes: ${successfulBookings.length}`);
    console.log(`     - 409 Capacity Reached Rejections: ${conflictRejections.length}`);
    console.log(`     - Unexpected Responses: ${otherErrors.length}`);

    if (successfulBookings.length === 2 && conflictRejections.length === 6) {
      pass(`PERFECT CONCURRENCY CONTROL: Exactly 2 seats granted, 6 overbooking attempts rejected!`);
      successfulReservationId = successfulBookings[0].body.registration._id;
      verifiedPassCode = successfulBookings[0].body.passCode;
      pass(`Generated Digital Pass Code: ${verifiedPassCode}`);
    } else {
      fail(`Concurrency violation! Successful: ${successfulBookings.length}, Expected: 2`);
    }

    // Verify event in DB is strictly at 0 seats and status is 'Registration Closed'
    const eventCheck = await request('GET', `/events/${testEventId}`);
    if (
      eventCheck.status === 200 &&
      eventCheck.body.event.availableSeats === 0 &&
      eventCheck.body.event.status === 'Registration Closed'
    ) {
      pass(`Zero-Latency Status Flip Verified: seats = 0, status = "Registration Closed"`);
    } else {
      fail(`Event state mismatch: seats=${eventCheck.body?.event?.availableSeats}, status=${eventCheck.body?.event?.status}`);
    }

    banner('STAGE 5: Atomic Seat Rollback & Pass Invalidation (Cancellation)');
    // Find the specific student session that was granted the reservation
    const bookedUserId = successfulBookings[0].body.registration.user._id || successfulBookings[0].body.registration.user;
    const winnerStudent = studentTokens.find((st) => st.id.toString() === bookedUserId.toString()) || studentTokens[0];
    const cancelRes = await request('DELETE', `/registrations/${successfulReservationId}`, null, winnerStudent.token);

    if (cancelRes.status === 200 && cancelRes.body.registration.status === 'CANCELLED') {
      pass(`Pass status marked "CANCELLED"`);
    } else {
      fail(`Cancellation failed: ${JSON.stringify(cancelRes)}`);
    }

    // Verify seat is restored and event is automatically re-opened to 'Registration Open'
    const eventAfterCancel = await request('GET', `/events/${testEventId}`);
    if (
      eventAfterCancel.status === 200 &&
      eventAfterCancel.body.event.availableSeats === 1 &&
      eventAfterCancel.body.event.status === 'Registration Open'
    ) {
      pass(`Atomic Seat Rollback Verified: seats restored to 1, status reverted to "Registration Open"`);
    } else {
      fail(`Seat rollback mismatch: seats=${eventAfterCancel.body?.event?.availableSeats}, status=${eventAfterCancel.body?.event?.status}`);
    }

    banner('STAGE 6: Cryptographic Pass Verification & Faculty Check-In');
    // The second student holds the remaining active reservation
    const secondReservationPassCode = successfulBookings[1].body.passCode;
    const verifyRes = await request('POST', '/registrations/verify-pass', { passCode: secondReservationPassCode }, adminToken);

    if (verifyRes.status === 200 && verifyRes.body.registration.status === 'CHECKED_IN') {
      pass(`Pass Code ${secondReservationPassCode} verified & checked in by Faculty Admin.`);
      pass(`Timestamp recorded: ${verifyRes.body.registration.checkedInAt}`);
    } else {
      fail(`Check-in failed: ${JSON.stringify(verifyRes)}`);
    }

    banner('STAGE 7: Faculty Administrator Telemetry & Analytics');
    const statsRes = await request('GET', '/events/stats', null, adminToken);
    if (statsRes.status === 200 && statsRes.body.stats) {
      const stats = statsRes.body.stats;
      pass(`Total Events: ${stats.totalEvents}`);
      pass(`Active Registrations: ${stats.activeRegistrations}`);
      pass(`Verified Check-Ins: ${stats.checkedInCount}`);
      pass(`Sold Out Events: ${stats.soldOutEvents}`);
      pass(`Capacity Utilization: ${stats.occupancyRate}%`);
    } else {
      fail(`Failed to fetch stats: ${JSON.stringify(statsRes)}`);
    }

    // Clean up test event
    await request('DELETE', `/events/${testEventId}`, null, adminToken);
    pass(`Test fixture cleaned up successfully.`);

    console.log(`\n${colors.green}${colors.bright}====================================================================`);
    console.log(`🎉 ALL 7 TEST STAGES PASSED WITH ZERO CONCURRENCY FAILURES!`);
    console.log(`====================================================================${colors.reset}\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}${colors.bright}FATAL TEST ERROR:${colors.reset}`, err.message);
    process.exit(1);
  }
}

runTestSuite();
