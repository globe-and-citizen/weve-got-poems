const spec = {
  openapi: '3.0.1',
  info: {
    description: "This is the API documentation for We've Got Poems.",
    version: '1.0.0',
    title: "We've Got Poems API"
  },
  servers: [
    { url: 'https://weve-got-poems-server.onrender.com/v1', description: 'Production server' },
    { url: 'http://localhost:5432/v1', description: 'Local server' }
  ],
  paths: {
    '/poem': {
      post: {
        tags: ['Poems'],
        summary: 'Add a poem to the database',
        operationId: 'addPoem',
        security: [{ JWTAuth: [] }],
        requestBody: {
          description: 'The poem to add',
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PoemInput' } } }
        },
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/PoemResponse' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/poems': {
      get: {
        tags: ['Poems'],
        summary: 'Get all poems from the database',
        operationId: 'getPoems',
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Poem' } } } }
          },
          404: { $ref: '#/components/responses/NotFound' }
        }
      }
    },
    '/poem/{id}': {
      put: {
        tags: ['Poems'],
        summary: 'Update a poem in the database',
        operationId: 'updatePoem',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The ID of the poem to update',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          description: 'The poem to update',
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PoemInput' } } }
        },
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Poems'],
        summary: 'Delete a poem from the database',
        operationId: 'deletePoem',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The ID of the poem to delete',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/user': {
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        operationId: 'createUser',
        requestBody: {
          description: 'The user to create',
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } }
        },
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/UserResponse' } } } },
          400: { description: 'Bad Request', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          500: { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Get all users from the database',
        operationId: 'getUsers',
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }
          },
          500: { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/user/{id}': {
      put: {
        tags: ['Users'],
        summary: 'Update a user in the database',
        operationId: 'updateUser',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The ID of the user to update',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        requestBody: {
          description: 'The user to update',
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UserInput' } } }
        },
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete a user and associated poems from the database',
        operationId: 'deleteUser',
        parameters: [
          {
            name: 'id',
            in: 'path',
            description: 'The ID of the user to delete',
            required: true,
            schema: { type: 'integer' }
          }
        ],
        responses: {
          200: { description: 'Success', content: { 'application/json': { schema: { $ref: '#/components/schemas/MessageResponse' } } } },
          404: { $ref: '#/components/responses/NotFound' },
          500: { description: 'Internal Server Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    },
    '/login': {
      post: {
        tags: ['Authentication'],
        summary: 'User login',
        operationId: 'loginUser',
        requestBody: {
          description: 'User login credentials',
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } }
        },
        responses: {
          200: {
            description: 'Success',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginResponse' } } }
          },
          401: { description: 'Unauthorized', $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          500: { description: 'Internal server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      JWTAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Poem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          user_id: { type: 'int', example: 1 },
          content: {
            type: 'string',
            example:
              "In lines of code, we weave our art,\nA digital symphony from mind to chart.\nWith functions, loops, and logic clear,\nWe conquer problems, quelling fear.\n\nIn bytes and bits, our thoughts take flight,\nCreating programs that shine so bright.\nFrom bugs we learn, and errors mend,\nIn the world of code, there's no real end.\n\nSo, let us code with passion and grace,\nCreating software in this boundless space.\nWith every keystroke, we write our story,\nIn the language of machines, we find our glory."
          },
          created_at: { type: 'string', format: 'timestamp', example: '2020-07-01T00:00:00.000Z' },
          title: { type: 'string', example: 'Coding Chronicles' }
        }
      },
      PoemInput: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            example:
              "In lines of code, we weave our art,\nA digital symphony from mind to chart.\nWith functions, loops, and logic clear,\nWe conquer problems, quelling fear.\n\nIn bytes and bits, our thoughts take flight,\nCreating programs that shine so bright.\nFrom bugs we learn, and errors mend,\nIn the world of code, there's no real end.\n\nSo, let us code with passion and grace,\nCreating software in this boundless space.\nWith every keystroke, we write our story,\nIn the language of machines, we find our glory."
          },
          title: { type: 'string', example: 'Coding Chronicles' }
        }
      },
      PoemResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          message: { type: 'string' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'johndoe@example.com' },
          created_at: { type: 'string', format: 'timestamp', example: '2022-01-01T00:00:00.000Z' }
        }
      },
      UserInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'johndoe@example.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      UserResponse: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          message: { type: 'string' }
        }
      },
      LoginInput: {
        type: 'object',
        properties: {
          email: { type: 'string', example: 'johndoe@example.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: { type: 'string', example: 'your_jwt_token_here' },
          message: { type: 'string', example: 'Login successful' }
        }
      },
      MessageResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' }
        }
      }
    },
    responses: {
      NotFound: { description: 'Not found' }
    }
  },
  tags: [{ name: 'Poems' }, { name: 'Users' }]
}

window.onload = function () {
  SwaggerUIBundle({
    spec: spec,
    dom_id: '#swagger-ui'
  })
}
