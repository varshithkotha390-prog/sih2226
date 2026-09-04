const app = require('../app');
const swaggerDocument = require('../docs/swagger');

// HTTP helper
async function makeRequest({ method, url }) {
  const http = require('http');
  const server = http.createServer(app);

  return new Promise((resolve, reject) => {
    server.listen(0, () => {
      const port = server.address().port;
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port: port,
          path: url,
          method: method
        },
        (res) => {
          let data = '';
          res.on('data', chunk => { data += chunk; });
          res.on('end', () => {
            server.close();
            try {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: data ? JSON.parse(data) : {}
              });
            } catch (e) {
              resolve({
                status: res.statusCode,
                headers: res.headers,
                body: data
              });
            }
          });
        }
      );

      req.on('error', err => {
        server.close();
        reject(err);
      });

      req.end();
    });
  });
}

// Test Runner
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('🧪 Starting API Documentation & Swagger Integration Tests...\n');

  // ---------------------------------------------------------------------------
  // 1. Testing GET /api/docs/json
  // ---------------------------------------------------------------------------
  console.log('--- 1. Testing GET /api/docs/json (Raw OpenAPI Spec) ---');

  const jsonRes = await makeRequest({
    method: 'GET',
    url: '/api/docs/json'
  });

  assert(jsonRes.status === 200, 'GET /api/docs/json returns 200 OK');
  assert(jsonRes.body.openapi === '3.0.0', 'Specifies OpenAPI version 3.0.0');
  assert(jsonRes.body.info.title.includes('Kabadiwala Connect'), 'Contains correct API title');
  assert(typeof jsonRes.body.paths === 'object', 'Spec defines paths object');

  // ---------------------------------------------------------------------------
  // 2. Verifying All Required Endpoint Domains Are Present
  // ---------------------------------------------------------------------------
  console.log('\n--- 2. Verifying Comprehensive Endpoint Coverage in OpenAPI Spec ---');

  const paths = Object.keys(swaggerDocument.paths);

  // Authentication
  assert(paths.includes('/auth/register'), 'Documents POST /auth/register');
  assert(paths.includes('/auth/login'), 'Documents POST /auth/login');
  assert(paths.includes('/auth/me'), 'Documents GET /auth/me');

  // Materials
  assert(paths.includes('/materials'), 'Documents GET & POST /materials');
  assert(paths.includes('/materials/{id}'), 'Documents GET, PATCH & DELETE /materials/{id}');

  // Prices
  assert(paths.includes('/prices/{materialId}'), 'Documents GET /prices/{materialId}');
  assert(paths.includes('/prices'), 'Documents POST /prices');
  assert(paths.includes('/prices/{id}'), 'Documents PATCH /prices/{id}');

  // Recyclers
  assert(paths.includes('/recyclers'), 'Documents GET & POST /recyclers');
  assert(paths.includes('/recyclers/{id}'), 'Documents GET & PATCH /recyclers/{id}');
  assert(paths.includes('/recyclers/{id}/materials'), 'Documents GET /recyclers/{id}/materials');

  // Recommendations
  assert(paths.includes('/recyclers/recommended'), 'Documents GET /recyclers/recommended');

  // Lots
  assert(paths.includes('/lots'), 'Documents POST /lots');
  assert(paths.includes('/lots/my-lots'), 'Documents GET /lots/my-lots');
  assert(paths.includes('/lots/{id}'), 'Documents GET /lots/{id}');
  assert(paths.includes('/lots/{id}/status'), 'Documents PATCH /lots/{id}/status');

  // Transactions
  assert(paths.includes('/transactions'), 'Documents POST /transactions');
  assert(paths.includes('/transactions/my-transactions'), 'Documents GET /transactions/my-transactions');
  assert(paths.includes('/transactions/{id}'), 'Documents GET /transactions/{id}');
  assert(paths.includes('/transactions/{id}/status'), 'Documents PATCH /transactions/{id}/status');

  // Handover
  assert(paths.includes('/handover/create'), 'Documents POST /handover/create');
  assert(paths.includes('/handover/verify'), 'Documents POST /handover/verify');
  assert(paths.includes('/handover/{id}'), 'Documents GET /handover/{id}');

  // Earnings
  assert(paths.includes('/earnings/me'), 'Documents GET /earnings/me');

  // Security Scheme
  assert(swaggerDocument.components.securitySchemes.BearerAuth !== undefined, 'Configures Bearer JWT security scheme');

  // ---------------------------------------------------------------------------
  // 3. Testing GET /api/docs (Swagger UI HTML)
  // ---------------------------------------------------------------------------
  console.log('\n--- 3. Testing GET /api/docs/ (Swagger UI HTML Interface) ---');

  const uiRes = await makeRequest({
    method: 'GET',
    url: '/api/docs/'
  });

  // Swagger UI might return 200 or 301/302 redirect for trailing slash
  assert(
    uiRes.status === 200 || uiRes.status === 301 || uiRes.status === 302,
    `GET /api/docs/ returns valid HTTP status (${uiRes.status})`
  );

  if (uiRes.status === 200 && typeof uiRes.body === 'string') {
    assert(uiRes.body.includes('swagger') || uiRes.body.includes('html'), 'Serves Swagger UI assets');
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log('\n=============================================');
  console.log(`DOCS TEST RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('=============================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
