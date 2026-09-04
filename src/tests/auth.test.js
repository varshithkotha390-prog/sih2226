const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { registerUser, loginUser, getUserById, sanitizeUser, generateToken } = require('../services/auth.service');
const { validateRegister, validateLogin } = require('../validators/auth.validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const prisma = require('../config/db');

// In-memory mock database for isolated authentication tests
const mockDatabase = {
  users: []
};

// Mock prisma.user methods for test isolation
prisma.user = {
  findFirst: async ({ where }) => {
    return mockDatabase.users.find(u => {
      if (where.OR) {
        return where.OR.some(cond => (cond.email && u.email === cond.email) || (cond.phone && u.phone === cond.phone));
      }
      if (where.email) return u.email === where.email;
      if (where.id) return u.id === where.id;
      return false;
    }) || null;
  },
  findUnique: async ({ where }) => {
    return mockDatabase.users.find(u => (where.email && u.email === where.email) || (where.id && u.id === where.id)) || null;
  },
  create: async ({ data }) => {
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      passwordHash: data.passwordHash,
      role: data.role || 'COLLECTOR',
      createdAt: new Date(),
      updatedAt: new Date(),
      recyclerProfile: null
    };
    mockDatabase.users.push(newUser);
    return newUser;
  }
};

async function runAuthTests() {
  console.log('🧪 Starting Authentication & Authorization Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // ---------------------------------------------------------------------------
  // Test 1: Register a new Collector
  // ---------------------------------------------------------------------------
  console.log('--- 1. Testing Registration (POST /api/auth/register) ---');
  const collectorData = {
    name: 'Rajesh Kumar',
    email: 'rajesh.collector@kconnect.demo',
    password: 'Password@123',
    phone: '+919811002233',
    role: 'COLLECTOR'
  };

  const regResult = await registerUser(collectorData);
  assert(regResult.user.id !== undefined, 'User registered with unique ID');
  assert(regResult.user.email === collectorData.email, 'Email correctly assigned');
  assert(regResult.user.role === 'COLLECTOR', 'Role correctly set to COLLECTOR');
  assert(regResult.user.passwordHash === undefined, 'passwordHash is strictly EXCLUDED from user response');
  assert(typeof regResult.token === 'string' && regResult.token.length > 20, 'JWT token successfully issued upon registration');

  // Verify bcrypt password was hashed properly in the database
  const storedUser = mockDatabase.users.find(u => u.email === collectorData.email);
  assert(storedUser.passwordHash !== collectorData.password, 'Password in database is hashed, not plain text');
  const isHashValid = await bcrypt.compare(collectorData.password, storedUser.passwordHash);
  assert(isHashValid === true, 'Stored bcrypt hash verifies against original password');

  // ---------------------------------------------------------------------------
  // Test 2 & 3: Login & Receive JWT
  // ---------------------------------------------------------------------------
  console.log('\n--- 2 & 3. Testing Login & JWT Retrieval (POST /api/auth/login) ---');
  const loginResult = await loginUser({
    email: collectorData.email,
    password: collectorData.password
  });

  assert(loginResult.user.email === collectorData.email, 'Login successful for registered user');
  assert(typeof loginResult.token === 'string', 'JWT token received on login');
  assert(loginResult.user.passwordHash === undefined, 'passwordHash is strictly EXCLUDED from login response');

  // Decode and verify JWT payload
  const decoded = jwt.verify(loginResult.token, config.jwtSecret);
  assert(decoded.id === loginResult.user.id, 'JWT payload contains user ID');
  assert(decoded.email === collectorData.email, 'JWT payload contains user email');
  assert(decoded.role === 'COLLECTOR', 'JWT payload contains user role');

  // ---------------------------------------------------------------------------
  // Test 4: Access Protected Profile (GET /api/auth/me) with JWT
  // ---------------------------------------------------------------------------
  console.log('\n--- 4. Testing Authenticate Middleware & Profile Retrieval (GET /api/auth/me) ---');
  let authReq = {
    headers: {
      authorization: `Bearer ${loginResult.token}`
    }
  };
  let authRes = {};
  let nextCalled = false;
  await authenticate(authReq, authRes, (err) => {
    if (!err) nextCalled = true;
  });

  assert(nextCalled === true, 'authenticate middleware verified valid Bearer token');
  assert(authReq.user !== undefined, 'User object attached to req.user');
  assert(authReq.user.email === collectorData.email, 'Authenticated user matches token identity');
  assert(authReq.user.passwordHash === undefined, 'req.user has passwordHash stripped');

  // ---------------------------------------------------------------------------
  // Test 5: Invalid Credentials
  // ---------------------------------------------------------------------------
  console.log('\n--- 5. Testing Invalid Credentials ---');
  // Wrong password
  let wrongPasswordError = null;
  try {
    await loginUser({
      email: collectorData.email,
      password: 'WrongPassword999'
    });
  } catch (err) {
    wrongPasswordError = err;
  }
  assert(wrongPasswordError !== null && wrongPasswordError.statusCode === 401, 'Rejects incorrect password with 401 Unauthorized');
  assert(wrongPasswordError.message === 'Invalid email or password', 'Returns secure generic error message');

  // Non-existent email
  let nonExistentUserError = null;
  try {
    await loginUser({
      email: 'nobody@example.com',
      password: 'Password@123'
    });
  } catch (err) {
    nonExistentUserError = err;
  }
  assert(nonExistentUserError !== null && nonExistentUserError.statusCode === 401, 'Rejects non-existent email with 401 Unauthorized');

  // Duplicate registration
  let duplicateError = null;
  try {
    await registerUser(collectorData);
  } catch (err) {
    duplicateError = err;
  }
  assert(duplicateError !== null && duplicateError.statusCode === 409, 'Rejects duplicate registration with 409 Conflict');

  // ---------------------------------------------------------------------------
  // Test 6: Unauthorized Access & Role-Based Authorization
  // ---------------------------------------------------------------------------
  console.log('\n--- 6. Testing Unauthorized Access & Role-Based Access Control (RBAC) ---');
  // Missing token
  let missingTokenError = null;
  await authenticate({ headers: {} }, {}, (err) => {
    missingTokenError = err;
  });
  assert(missingTokenError !== null && missingTokenError.statusCode === 401, 'Rejects request with missing token (401)');

  // Tampered/invalid token
  let tamperedTokenError = null;
  await authenticate({ headers: { authorization: 'Bearer invalid_signature_token' } }, {}, (err) => {
    tamperedTokenError = err;
  });
  assert(tamperedTokenError !== null && tamperedTokenError.statusCode === 401, 'Rejects tampered JWT token (401)');

  // RBAC: Check collector accessing COLLECTOR route
  let rbacAllowed = false;
  const collectorRouteGuard = authorize('COLLECTOR', 'ADMIN');
  collectorRouteGuard({ user: authReq.user }, {}, (err) => {
    if (!err) rbacAllowed = true;
  });
  assert(rbacAllowed === true, 'RBAC permits COLLECTOR to access collector/admin route');

  // RBAC: Check collector accessing RECYCLER route
  let rbacBlockedError = null;
  const recyclerOnlyGuard = authorize('RECYCLER');
  recyclerOnlyGuard({ user: authReq.user }, {}, (err) => {
    rbacBlockedError = err;
  });
  assert(rbacBlockedError !== null && rbacBlockedError.statusCode === 403, 'RBAC blocks COLLECTOR from accessing RECYCLER-only route with 403 Forbidden');

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n=============================================');
  console.log(`AUTH TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTests().catch(e => {
  console.error('Test execution error:', e);
  process.exit(1);
});
