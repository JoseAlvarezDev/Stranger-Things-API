/**
 * Swagger/OpenAPI Configuration for Stranger Things API
 * Provides interactive API documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Stranger Things API',
            version: '1.0.0',
            description: `
# 🔦 Welcome to the Stranger Things API

A **free, open-source RESTful API** providing comprehensive data about the Stranger Things universe.

## Features
- 📊 **Rich Dataset**: Characters, Creatures, Episodes, Locations, and Quotes
- 🖼️ **High-Quality Images**: Character portraits and creature images
- 🔍 **Powerful Filtering**: Search and filter across all endpoints
- 📄 **Pagination**: Efficient data retrieval with built-in pagination
- ⚡ **Fast & Reliable**: Optimized responses with compression

## Rate Limiting
- **General**: 100 requests per 15 minutes
- **Random Endpoints**: 30 requests per minute
- **Heavy Usage**: 1000 requests per hour

## Getting Started
All endpoints are accessible without authentication. Simply make GET requests to the endpoints listed below.

---
*Developed by [Jose Alvarez Dev](https://github.com/JoseAlvarezDev)*
            `,
            contact: {
                name: 'Jose Alvarez Dev',
                url: 'https://github.com/JoseAlvarezDev',
                email: 'contact@josealvarezdev.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            },
            termsOfService: 'https://github.com/JoseAlvarezDev/Stranger-Things-API/blob/main/LICENSE'
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://strangerthingsapi.com',
                description: 'Production server'
            }
        ],
        tags: [
            {
                name: 'Characters',
                description: 'Operations related to Stranger Things characters'
            },
            {
                name: 'Creatures',
                description: 'Operations related to creatures from the Upside Down'
            },
            {
                name: 'Episodes',
                description: 'Operations related to TV episodes'
            },
            {
                name: 'Locations',
                description: 'Operations related to locations in Hawkins and beyond'
            },
            {
                name: 'Quotes',
                description: 'Operations related to memorable quotes'
            },
            {
                name: 'Utility',
                description: 'Utility endpoints for API info and statistics'
            }
        ],
        components: {
            schemas: {
                Character: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique identifier',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Character name',
                            example: 'Eleven'
                        },
                        real_name: {
                            type: 'string',
                            description: 'Character\'s real name',
                            example: 'Jane Hopper'
                        },
                        nickname: {
                            type: 'string',
                            description: 'Character nickname',
                            example: 'El'
                        },
                        age: {
                            type: 'integer',
                            description: 'Character age',
                            example: 15
                        },
                        gender: {
                            type: 'string',
                            enum: ['Male', 'Female', 'Unknown'],
                            example: 'Female'
                        },
                        occupation: {
                            type: 'string',
                            description: 'Character occupation',
                            example: 'Student'
                        },
                        portrayed_by: {
                            type: 'string',
                            description: 'Actor who portrays the character',
                            example: 'Millie Bobby Brown'
                        },
                        powers: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'List of powers/abilities',
                            example: ['Telekinesis', 'Remote Viewing']
                        },
                        status: {
                            type: 'string',
                            enum: ['Alive', 'Deceased', 'Unknown'],
                            example: 'Alive'
                        },
                        portrait_path: {
                            type: 'string',
                            description: 'URL path to character portrait',
                            example: '/images/characters/eleven.webp'
                        },
                        quotes: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Notable quotes from the character'
                        },
                        seasons: {
                            type: 'array',
                            items: { type: 'integer' },
                            description: 'Seasons the character appears in',
                            example: [1, 2, 3, 4]
                        }
                    }
                },
                Creature: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique identifier',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Creature name',
                            example: 'Demogorgon'
                        },
                        origin: {
                            type: 'string',
                            description: 'Creature origin',
                            example: 'The Upside Down'
                        },
                        description: {
                            type: 'string',
                            description: 'Detailed description of the creature'
                        },
                        abilities: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Creature abilities'
                        },
                        weaknesses: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Creature weaknesses'
                        },
                        threat_level: {
                            type: 'string',
                            enum: ['Low', 'Medium', 'High', 'Extreme'],
                            example: 'Extreme'
                        },
                        status: {
                            type: 'string',
                            enum: ['Active', 'Defeated', 'Unknown'],
                            example: 'Defeated'
                        },
                        image_path: {
                            type: 'string',
                            description: 'URL path to creature image'
                        }
                    }
                },
                Episode: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique identifier',
                            example: 1
                        },
                        title: {
                            type: 'string',
                            description: 'Episode title',
                            example: 'Chapter One: The Vanishing of Will Byers'
                        },
                        season: {
                            type: 'integer',
                            description: 'Season number',
                            example: 1
                        },
                        episode: {
                            type: 'integer',
                            description: 'Episode number within season',
                            example: 1
                        },
                        air_date: {
                            type: 'string',
                            format: 'date',
                            description: 'Original air date',
                            example: '2016-07-15'
                        },
                        synopsis: {
                            type: 'string',
                            description: 'Episode synopsis'
                        },
                        directed_by: {
                            type: 'string',
                            description: 'Episode director',
                            example: 'The Duffer Brothers'
                        },
                        written_by: {
                            type: 'string',
                            description: 'Episode writer(s)'
                        },
                        duration: {
                            type: 'string',
                            description: 'Episode duration',
                            example: '48 min'
                        }
                    }
                },
                Location: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique identifier',
                            example: 1
                        },
                        name: {
                            type: 'string',
                            description: 'Location name',
                            example: 'Hawkins National Laboratory'
                        },
                        type: {
                            type: 'string',
                            description: 'Type of location',
                            example: 'Government Facility'
                        },
                        description: {
                            type: 'string',
                            description: 'Location description'
                        },
                        status: {
                            type: 'string',
                            enum: ['Active', 'Destroyed', 'Abandoned', 'Unknown'],
                            example: 'Abandoned'
                        },
                        first_appearance: {
                            type: 'string',
                            description: 'First episode appearance'
                        }
                    }
                },
                Quote: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Unique identifier',
                            example: 1
                        },
                        quote: {
                            type: 'string',
                            description: 'The quote text',
                            example: 'Friends don\'t lie.'
                        },
                        character: {
                            type: 'string',
                            description: 'Character who said the quote',
                            example: 'Eleven'
                        },
                        character_id: {
                            type: 'integer',
                            description: 'ID of the character',
                            example: 1
                        },
                        season: {
                            type: 'integer',
                            description: 'Season the quote is from',
                            example: 1
                        },
                        episode: {
                            type: 'integer',
                            description: 'Episode number',
                            example: 3
                        },
                        context: {
                            type: 'string',
                            description: 'Context of the quote'
                        }
                    }
                },
                PaginatedResponse: {
                    type: 'object',
                    properties: {
                        info: {
                            type: 'object',
                            properties: {
                                count: {
                                    type: 'integer',
                                    description: 'Total number of items'
                                },
                                pages: {
                                    type: 'integer',
                                    description: 'Total number of pages'
                                },
                                current_page: {
                                    type: 'integer',
                                    description: 'Current page number'
                                },
                                per_page: {
                                    type: 'integer',
                                    description: 'Items per page'
                                },
                                next: {
                                    type: 'integer',
                                    nullable: true,
                                    description: 'Next page number'
                                },
                                prev: {
                                    type: 'integer',
                                    nullable: true,
                                    description: 'Previous page number'
                                }
                            }
                        },
                        results: {
                            type: 'array',
                            description: 'Array of results'
                        }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        code: {
                            type: 'integer',
                            description: 'HTTP status code'
                        }
                    }
                },
                Stats: {
                    type: 'object',
                    properties: {
                        total_characters: {
                            type: 'integer',
                            description: 'Total number of characters'
                        },
                        total_creatures: {
                            type: 'integer',
                            description: 'Total number of creatures'
                        },
                        total_episodes: {
                            type: 'integer',
                            description: 'Total number of episodes'
                        },
                        total_locations: {
                            type: 'integer',
                            description: 'Total number of locations'
                        },
                        total_quotes: {
                            type: 'integer',
                            description: 'Total number of quotes'
                        },
                        seasons: {
                            type: 'object',
                            description: 'Season statistics'
                        },
                        characters_by_status: {
                            type: 'object',
                            description: 'Character count by status'
                        }
                    }
                },
                HealthCheck: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'healthy'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time'
                        },
                        uptime: {
                            type: 'number',
                            description: 'Server uptime in seconds'
                        },
                        version: {
                            type: 'string',
                            example: '1.0.0'
                        }
                    }
                }
            },
            responses: {
                NotFound: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Not Found',
                                message: 'The requested resource was not found.',
                                code: 404
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Bad request',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Bad Request',
                                message: 'Invalid request parameters.',
                                code: 400
                            }
                        }
                    }
                },
                TooManyRequests: {
                    description: 'Rate limit exceeded',
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/Error'
                            },
                            example: {
                                error: 'Too Many Requests',
                                message: 'You have exceeded the rate limit. Please try again later.',
                                code: 429,
                                retryAfter: '15 minutes'
                            }
                        }
                    }
                }
            },
            parameters: {
                pageParam: {
                    name: 'page',
                    in: 'query',
                    description: 'Page number for pagination',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        default: 1
                    }
                },
                limitParam: {
                    name: 'limit',
                    in: 'query',
                    description: 'Number of items per page (max: 50)',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 50,
                        default: 20
                    }
                },
                idParam: {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Unique identifier',
                    schema: {
                        type: 'integer',
                        minimum: 1
                    }
                }
            }
        },
        externalDocs: {
            description: 'GitHub Repository',
            url: 'https://github.com/JoseAlvarezDev/Stranger-Things-API'
        }
    },
    apis: ['./routes/*.js', './server.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
