const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../docs/swagger');

const router = express.Router();

// Expose raw OpenAPI JSON spec for external tooling & Postman imports
router.get('/json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerDocument);
});

router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(swaggerDocument);
});

// Serve interactive Swagger UI documentation at /api/docs
router.use(
  '/',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'Kabadiwala Connect API Documentation (SIH26229)',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'list',
      filter: true
    }
  })
);

module.exports = router;
