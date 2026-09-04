/**
 * OpenAPI 3.0 Specification for SIH26229 - Kabadiwala Connect API
 */

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Kabadiwala Connect API — SIH26229',
    version: '1.0.0',
    description: `
**Smart India Hackathon 2026 Prototype — Problem Statement SIH26229**

A secure, high-integrity REST backend connecting informal e-waste collectors (Kabadiwalas) with certified recyclers. Features include:
- Role-based Access Control (COLLECTOR, RECYCLER, ADMIN)
- Dynamic pricing and historical ledger tracking
- E-waste lot management with tamper-proof backend valuation
- Transparent multi-factor recycler recommendation engine
- End-to-end transaction lifecycle with lot state synchronization
- Cryptographic QR-based physical handover and verification
- Dynamic collector earnings calculation without redundant storage
    `
  },
  servers: [
    {
      url: '/api',
      description: 'API Base Path'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>'
      }
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation completed successfully' },
          data: { type: 'object' }
        }
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error description' },
          error: { type: 'object', nullable: true }
        }
      }
    }
  },
  tags: [
    { name: 'Health', description: 'System health and uptime checks' },
    { name: 'Authentication', description: 'User registration, login, and profile operations' },
    { name: 'Materials', description: 'Catalog of e-waste materials' },
    { name: 'Prices', description: 'Dynamic benchmark pricing & historical records' },
    { name: 'Recyclers', description: 'Recycler directory, geolocation, and accepted materials' },
    { name: 'Recommendations', description: 'Multi-factor transparent recycler recommendation engine' },
    { name: 'Lots', description: 'Collector aggregated e-waste lot management' },
    { name: 'Transactions', description: 'Collector-Recycler transaction lifecycle' },
    { name: 'Handover', description: 'QR-based physical handover, scale verification & audit logging' },
    { name: 'Earnings', description: 'Collector earnings calculations from completed transactions' }
  ],
  paths: {
    // -------------------------------------------------------------------------
    // Health
    // -------------------------------------------------------------------------
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health Check',
        description: 'Verify server uptime and operational status.',
        responses: {
          200: {
            description: 'API is running',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Kabadiwala Connect API is running',
                  timestamp: '2026-09-04T10:00:00.000Z'
                }
              }
            }
          }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Authentication
    // -------------------------------------------------------------------------
    '/auth/register': {
      post: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Register a COLLECTOR, RECYCLER, or ADMIN user. Passwords are encrypted with bcrypt (10 rounds).',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Ramesh Kumar' },
                  email: { type: 'string', format: 'email', example: 'ramesh@kconnect.demo' },
                  password: { type: 'string', minLength: 6, example: 'Password@123' },
                  phone: { type: 'string', example: '+919811001001' },
                  role: { type: 'string', enum: ['COLLECTOR', 'RECYCLER', 'ADMIN'], default: 'COLLECTOR' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'User registered successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'User registered successfully',
                  data: {
                    user: {
                      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      name: 'Ramesh Kumar',
                      email: 'ramesh@kconnect.demo',
                      phone: '+919811001001',
                      role: 'COLLECTOR',
                      createdAt: '2026-09-04T10:00:00.000Z'
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
                }
              }
            }
          },
          400: {
            description: 'Validation failed or email already registered',
            content: {
              'application/json': {
                example: {
                  success: false,
                  message: 'A user with this email address already exists.'
                }
              }
            }
          }
        }
      }
    },

    '/auth/login': {
      post: {
        tags: ['Authentication'],
        summary: 'Authenticate user & receive JWT',
        description: 'Validate credentials and return signed JWT token.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'ramesh@kconnect.demo' },
                  password: { type: 'string', example: 'Password@123' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Login successful',
                  data: {
                    user: {
                      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                      name: 'Ramesh Kumar',
                      email: 'ramesh@kconnect.demo',
                      role: 'COLLECTOR'
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                  }
                }
              }
            }
          },
          401: {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                example: {
                  success: false,
                  message: 'Invalid email or password.'
                }
              }
            }
          }
        }
      }
    },

    '/auth/me': {
      get: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        description: 'Returns profile of authenticated user. Password hashes are never returned.',
        responses: {
          200: {
            description: 'User profile retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Current user profile retrieved',
                  data: {
                    id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                    name: 'Ramesh Kumar',
                    email: 'ramesh@kconnect.demo',
                    role: 'COLLECTOR',
                    phone: '+919811001001'
                  }
                }
              }
            }
          },
          401: {
            description: 'Unauthorized / missing token'
          }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Materials
    // -------------------------------------------------------------------------
    '/materials': {
      get: {
        tags: ['Materials'],
        summary: 'List all materials',
        description: 'Get catalog of e-waste materials with current spot prices. Supports optional ?search filter.',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Filter by material name or code' }
        ],
        responses: {
          200: {
            description: 'Materials list retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id: 'mat-001',
                      name: 'Printed Circuit Boards (Grade A)',
                      code: 'MAT-PCB-A',
                      unit: 'kg',
                      currentPrice: { pricePerKg: 520.00, location: 'Delhi NCR' }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Materials'],
        summary: 'Create material (Admin only)',
        security: [{ BearerAuth: [] }],
        description: 'Add a new e-waste material category to the system catalog.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Lithium Iron Phosphate (LFP) Cells' },
                  code: { type: 'string', example: 'MAT-LFP-01' },
                  description: { type: 'string', example: 'High capacity rechargeable battery cells' },
                  unit: { type: 'string', default: 'kg', example: 'kg' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Material created successfully' },
          403: { description: 'Forbidden: Admin access required' }
        }
      }
    },

    '/materials/{id}': {
      get: {
        tags: ['Materials'],
        summary: 'Get material details by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Material details with price history' },
          404: { description: 'Material not found' }
        }
      },
      patch: {
        tags: ['Materials'],
        summary: 'Update material (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  unit: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Material updated' },
          403: { description: 'Forbidden: Admin access required' }
        }
      },
      delete: {
        tags: ['Materials'],
        summary: 'Delete material (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Material deleted' },
          403: { description: 'Forbidden: Admin access required' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Prices
    // -------------------------------------------------------------------------
    '/prices/{materialId}': {
      get: {
        tags: ['Prices'],
        summary: 'Get historical price ledger for material',
        parameters: [{ name: 'materialId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Historical price records retrieved',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id: 'pr-001',
                      pricePerKg: 520.00,
                      location: 'Delhi NCR',
                      source: 'Government Benchmark / CPCB',
                      validFrom: '2026-08-01T00:00:00.000Z',
                      validTo: null
                    }
                  ]
                }
              }
            }
          }
        }
      }
    },

    '/prices': {
      post: {
        tags: ['Prices'],
        summary: 'Record new price rate (Admin only)',
        security: [{ BearerAuth: [] }],
        description: 'Add a new market rate for a material while preserving previous records in historical ledger.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['materialId', 'pricePerKg', 'location', 'source'],
                properties: {
                  materialId: { type: 'string' },
                  pricePerKg: { type: 'number', example: 540.00 },
                  location: { type: 'string', example: 'Delhi NCR' },
                  source: { type: 'string', example: 'CPCB Benchmark' },
                  validFrom: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Price rate recorded successfully' },
          403: { description: 'Forbidden: Admin access required' }
        }
      }
    },

    '/prices/{id}': {
      patch: {
        tags: ['Prices'],
        summary: 'Update price record (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  pricePerKg: { type: 'number' },
                  validTo: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Price record updated' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Recyclers
    // -------------------------------------------------------------------------
    '/recyclers': {
      get: {
        tags: ['Recyclers'],
        summary: 'List recyclers with filters',
        description: 'Query certified recyclers. Supports filters for authorized status, pickup availability, material compatibility, and search.',
        parameters: [
          { name: 'authorized', in: 'query', schema: { type: 'boolean' }, description: 'Filter by authorized status' },
          { name: 'pickupAvailable', in: 'query', schema: { type: 'boolean' }, description: 'Filter by pickup service availability' },
          { name: 'materialId', in: 'query', schema: { type: 'string' }, description: 'Filter by accepted material UUID' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name, address, or contact' }
        ],
        responses: {
          200: {
            description: 'Recyclers retrieved successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  data: [
                    {
                      id: 'rec-001',
                      name: 'EcoGreen E-Waste Recyclers Pvt Ltd',
                      address: 'Plot 42, Mayapuri Phase 1, New Delhi',
                      latitude: 28.6342,
                      longitude: 77.1265,
                      authorizedStatus: true,
                      pickupAvailable: true,
                      supportedMaterials: [{ id: 'mat-001', name: 'Printed Circuit Boards' }]
                    }
                  ]
                }
              }
            }
          }
        }
      },
      post: {
        tags: ['Recyclers'],
        summary: 'Create recycler facility profile (Admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'name', 'address', 'latitude', 'longitude', 'contactInfo'],
                properties: {
                  userId: { type: 'string' },
                  name: { type: 'string', example: 'CleanTech Recyclers' },
                  address: { type: 'string', example: 'Plot 10, Okhla Phase 3' },
                  latitude: { type: 'number', example: 28.5355 },
                  longitude: { type: 'number', example: 77.2732 },
                  authorizedStatus: { type: 'boolean', default: false },
                  pickupAvailable: { type: 'boolean', default: false },
                  contactInfo: { type: 'string', example: '+91-11-26810001' },
                  supportedMaterialIds: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Recycler profile registered' },
          403: { description: 'Forbidden: Admin access required' }
        }
      }
    },

    '/recyclers/{id}': {
      get: {
        tags: ['Recyclers'],
        summary: 'Get recycler profile by ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Recycler details retrieved' },
          404: { description: 'Recycler not found' }
        }
      },
      patch: {
        tags: ['Recyclers'],
        summary: 'Update recycler profile (Admin only)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Recycler profile updated' }
        }
      }
    },

    '/recyclers/{id}/materials': {
      get: {
        tags: ['Recyclers'],
        summary: 'Get materials accepted by recycler',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Accepted materials with current benchmark prices' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Recycler Recommendations
    // -------------------------------------------------------------------------
    '/recyclers/recommended': {
      get: {
        tags: ['Recommendations'],
        summary: 'Multi-factor transparent recycler recommendation engine',
        security: [{ BearerAuth: [] }],
        description: `
Evaluates and scores recyclers using 5 weighted criteria:
- **Price Match Score (30%)**: Recycler spot rates vs market rate
- **Distance Score (25%)**: Computed via Haversine geodesic formula from collector coordinates
- **Material Compatibility (20%)**: Verifies recycler handles the specific lot e-waste
- **CPCB Authorization (15%)**: Certification and environmental compliance
- **Pickup Availability (10%)**: Logistics doorstep collection availability
        `,
        parameters: [
          { name: 'lotId', in: 'query', required: true, schema: { type: 'string' }, description: 'Target e-waste lot UUID' }
        ],
        responses: {
          200: {
            description: 'Ranked list of recommended recyclers with explainable score components',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Top recommended recyclers calculated successfully',
                  data: {
                    lot: {
                      id: 'lot-001',
                      lotNumber: 'LOT-2026-10293',
                      material: 'Printed Circuit Boards (Grade A)',
                      weightKg: 25.0
                    },
                    recommendations: [
                      {
                        recyclerId: 'rec-001',
                        name: 'EcoGreen E-Waste Recyclers Pvt Ltd',
                        address: 'Plot 42, Mayapuri Phase 1, New Delhi',
                        distanceKm: 2.15,
                        authorized: true,
                        pickupAvailable: true,
                        finalScore: 92.4,
                        scoreBreakdown: {
                          priceScore: { score: 95.0, weight: 0.30, contribution: 28.5 },
                          distanceScore: { score: 89.6, weight: 0.25, contribution: 22.4 },
                          materialScore: { score: 100.0, weight: 0.20, contribution: 20.0 },
                          authorizationScore: { score: 100.0, weight: 0.15, contribution: 15.0 },
                          pickupScore: { score: 100.0, weight: 0.10, contribution: 10.0 }
                        }
                      }
                    ]
                  }
                }
              }
            }
          },
          400: { description: 'Missing lotId parameter' },
          404: { description: 'Lot not found' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Lots
    // -------------------------------------------------------------------------
    '/lots': {
      post: {
        tags: ['Lots'],
        summary: 'Create e-waste lot (Collector only)',
        security: [{ BearerAuth: [] }],
        description: 'Creates a lot. Backend fetches current benchmark rate, calculates estimatedPrice (weight * pricePerKg), and generates a unique lot number (LOT-2026-XXXXX). Client cannot tamper with estimated price.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['materialId', 'weight', 'collectorLocation'],
                properties: {
                  materialId: { type: 'string', example: 'mat-001' },
                  weight: { type: 'number', minimum: 0.1, example: 15.5 },
                  collectorLocation: { type: 'string', example: 'Seelampur Depot, New Delhi' },
                  latitude: { type: 'number', example: 28.6692 },
                  longitude: { type: 'number', example: 77.2680 },
                  imageUrl: { type: 'string', nullable: true, example: 'https://images.demo/pcb-lot-1.jpg' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Lot created successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'E-waste lot created successfully',
                  data: {
                    id: 'lot-001',
                    lotNumber: 'LOT-2026-89214',
                    materialId: 'mat-001',
                    weight: 15.5,
                    estimatedPrice: 8060.00,
                    status: 'AVAILABLE',
                    collectorLocation: 'Seelampur Depot, New Delhi'
                  }
                }
              }
            }
          },
          400: { description: 'Invalid weight or material' },
          403: { description: 'Forbidden: Collector role required' }
        }
      }
    },

    '/lots/my-lots': {
      get: {
        tags: ['Lots'],
        summary: 'Get collector lots (Collector only)',
        security: [{ BearerAuth: [] }],
        description: 'Returns all lots created by the authenticated collector.',
        responses: {
          200: { description: 'List of collector lots' }
        }
      }
    },

    '/lots/{id}': {
      get: {
        tags: ['Lots'],
        summary: 'Get lot details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Lot details retrieved' },
          403: { description: 'Forbidden: Access restricted to owner, recyclers, or admin' },
          404: { description: 'Lot not found' }
        }
      }
    },

    '/lots/{id}/status': {
      patch: {
        tags: ['Lots'],
        summary: 'Update lot status',
        security: [{ BearerAuth: [] }],
        description: 'Transition lot lifecycle status (e.g. AVAILABLE -> CANCELLED). Validates permitted transitions.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['AVAILABLE', 'ASSIGNED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Lot status updated' },
          400: { description: 'Invalid status transition' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Transactions
    // -------------------------------------------------------------------------
    '/transactions': {
      post: {
        tags: ['Transactions'],
        summary: 'Initiate transaction with recycler (Collector only)',
        security: [{ BearerAuth: [] }],
        description: 'Initiate transaction. Validates lot ownership, lot AVAILABLE status, and recycler material compatibility. Backend calculates totalAmount = weight * agreedPrice.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lotId', 'recyclerId'],
                properties: {
                  lotId: { type: 'string' },
                  recyclerId: { type: 'string' },
                  offeredPrice: { type: 'number', example: 550.00 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Transaction initiated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Transaction initiated successfully',
                  data: {
                    id: 'tx-001',
                    lotId: 'lot-001',
                    collectorId: 'col-001',
                    recyclerId: 'rec-001',
                    offeredPrice: 550.00,
                    totalAmount: 8525.00,
                    transactionStatus: 'PENDING',
                    paymentStatus: 'PENDING'
                  }
                }
              }
            }
          },
          400: { description: 'Incompatible material or lot unavailable' },
          403: { description: 'Unauthorized collector' }
        }
      }
    },

    '/transactions/my-transactions': {
      get: {
        tags: ['Transactions'],
        summary: 'Get user transactions',
        security: [{ BearerAuth: [] }],
        description: 'Returns all transactions where the user is a participant (collector or recycler). Supports optional ?status= filter.',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string' }, description: 'Filter by TransactionStatus' }
        ],
        responses: {
          200: { description: 'Transactions retrieved' }
        }
      }
    },

    '/transactions/{id}': {
      get: {
        tags: ['Transactions'],
        summary: 'Get transaction details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Transaction details retrieved' },
          403: { description: 'Forbidden: Access restricted to transaction participants and admin' }
        }
      }
    },

    '/transactions/{id}/status': {
      patch: {
        tags: ['Transactions'],
        summary: 'Update transaction lifecycle status',
        security: [{ BearerAuth: [] }],
        description: 'Transitions transaction status (PENDING -> ACCEPTED -> PICKUP_SCHEDULED -> HANDED_OVER -> COMPLETED / CANCELLED / REJECTED) and synchronizes associated lot status.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['PENDING', 'ACCEPTED', 'PICKUP_SCHEDULED', 'HANDED_OVER', 'COMPLETED', 'CANCELLED', 'REJECTED']
                  },
                  paymentStatus: {
                    type: 'string',
                    enum: ['PENDING', 'ESCROWED', 'PAID', 'FAILED']
                  }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Status updated and lot state synchronized' },
          400: { description: 'Invalid state transition' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Handover
    // -------------------------------------------------------------------------
    '/handover/create': {
      post: {
        tags: ['Handover'],
        summary: 'Generate handover QR code (Collector only)',
        security: [{ BearerAuth: [] }],
        description: 'Generates a unique QR code identifier (QR-KC-2026-XXXXXXXX) when a transaction is accepted. The frontend renders this string into a QR code for the recycler to scan.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['transactionId'],
                properties: {
                  transactionId: { type: 'string' },
                  location: { type: 'string', example: 'Collector Depot Gate 1' }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Handover record created with QR code identifier',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Handover record created successfully. Display QR code to recycler.',
                  data: {
                    handover: {
                      id: 'ho-001',
                      qrIdentifier: 'QR-KC-2026-F9A83B1C',
                      status: 'PENDING',
                      location: 'Collector Depot Gate 1'
                    },
                    qrData: {
                      code: 'QR-KC-2026-F9A83B1C',
                      material: 'Printed Circuit Boards',
                      lotWeight: 25.0,
                      instruction: 'Display this code or QR to the authorized recycler upon physical material inspection'
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Transaction not in accepted status or already completed' },
          403: { description: 'Forbidden: You are not the transaction owner' }
        }
      }
    },

    '/handover/verify': {
      post: {
        tags: ['Handover'],
        summary: 'Recycler scans & verifies QR handover (Recycler only)',
        security: [{ BearerAuth: [] }],
        description: 'Recycler scans the QR code and submits verification. The backend validates recycler identity, checks scale weight, marks the handover VERIFIED, transitions transaction and lot to COMPLETED, records pickupTime, and permanently prevents replay attacks.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['qrCode'],
                properties: {
                  qrCode: { type: 'string', example: 'QR-KC-2026-F9A83B1C' },
                  verifiedWeight: { type: 'number', example: 24.8 },
                  verifiedMaterialId: { type: 'string', nullable: true },
                  notes: { type: 'string', example: 'Physical scale verified, material grade A verified' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Handover verified and transaction completed',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Handover successfully verified and transaction completed.',
                  data: {
                    verified: true,
                    auditTrail: {
                      handoverId: 'ho-001',
                      qrIdentifier: 'QR-KC-2026-F9A83B1C',
                      handoverStatus: 'VERIFIED',
                      pickupTime: '2026-09-04T10:30:00.000Z',
                      verifiedWeight: 24.8,
                      transaction: {
                        id: 'tx-001',
                        transactionStatus: 'COMPLETED',
                        paymentStatus: 'PAID',
                        totalAmount: 13640.00,
                        completedAt: '2026-09-04T10:30:00.000Z'
                      },
                      lot: {
                        id: 'lot-001',
                        status: 'COMPLETED'
                      }
                    }
                  }
                }
              }
            }
          },
          400: { description: 'Repeated scan or transaction already completed' },
          403: { description: 'Forbidden: Recycler mismatch - you are not the designated recycler' },
          404: { description: 'Invalid QR handover code' }
        }
      }
    },

    '/handover/{id}': {
      get: {
        tags: ['Handover'],
        summary: 'Get handover details and audit trail',
        security: [{ BearerAuth: [] }],
        description: 'Lookup handover details by UUID or QR code string. Accessible to participants and admin.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Handover details and audit record retrieved' },
          403: { description: 'Forbidden: Not a transaction participant' },
          404: { description: 'Handover record not found' }
        }
      }
    },

    // -------------------------------------------------------------------------
    // Earnings
    // -------------------------------------------------------------------------
    '/earnings/me': {
      get: {
        tags: ['Earnings'],
        summary: 'Get real-time collector earnings dashboard (Collector only)',
        security: [{ BearerAuth: [] }],
        description: 'Dynamically computes earnings from completed transactions. Returns today, this week, this month, total earnings, completed transactions count, total e-waste weight sold (verified scale readings), material breakdown, and recent transactions.',
        responses: {
          200: {
            description: 'Collector earnings analytics calculated successfully',
            content: {
              'application/json': {
                example: {
                  success: true,
                  message: 'Collector earnings calculated successfully',
                  data: {
                    collector: {
                      id: 'col-001',
                      name: 'Ramesh Collector',
                      email: 'ramesh@kconnect.demo'
                    },
                    currency: 'INR',
                    summary: {
                      todayEarnings: 3000.00,
                      thisWeekEarnings: 15000.00,
                      thisMonthEarnings: 24000.00,
                      totalEarnings: 85000.00,
                      completedTransactionsCount: 14,
                      totalWeightSoldKg: 325.50,
                      averageEarningPerTransaction: 6071.43,
                      averagePricePerKg: 261.14
                    },
                    materialBreakdown: [
                      {
                        materialName: 'Printed Circuit Boards (Grade A)',
                        totalEarnings: 52000.00,
                        weightSoldKg: 100.00,
                        transactionCount: 8
                      }
                    ],
                    recentTransactions: [
                      {
                        id: 'tx-001',
                        lotNumber: 'LOT-2026-89214',
                        materialName: 'Printed Circuit Boards (Grade A)',
                        weightKg: 24.8,
                        totalAmount: 13640.00,
                        recyclerName: 'EcoGreen E-Waste Recyclers Pvt Ltd',
                        completedAt: '2026-09-04T10:30:00.000Z'
                      }
                    ]
                  }
                }
              }
            }
          },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden: Collector role required' }
        }
      }
    }
  }
};

module.exports = swaggerDocument;
