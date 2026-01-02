/**
 * Stranger Things API Server
 * A free, open-source RESTful API providing data about the Stranger Things universe
 * 
 * @author Jose Alvarez Dev
 * @version 1.0.0
 * @license MIT
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

// Import configurations and middleware
const swaggerSpec = require('./config/swagger');
const security = require('./middleware/security');

// Import data
const characters = require('./data/characters.json');
const creatures = require('./data/creatures.json');
const episodes = require('./data/episodes.json');
const locations = require('./data/locations.json');
const quotes = require('./data/quotes.json');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = '1.0.0';
const START_TIME = Date.now();

// ==================== MIDDLEWARE SETUP ====================

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Request logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(security.hpp); // Prevent HTTP Parameter Pollution
app.use(security.securityHeaders);

// CORS configuration
app.use(cors(security.corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate limiting
app.use('/api', security.generalLimiter);
app.use('/api', security.heavyUsageLimiter);

// Optional API key tracking
app.use('/api', security.optionalApiKey);

// Input sanitization
app.use(security.sanitizeQuery);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// ==================== SWAGGER DOCUMENTATION ====================

// Swagger UI custom options
const swaggerUiOptions = {
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info { margin: 30px 0; }
        .swagger-ui .info .title { color: #ff1744; }
        .swagger-ui .scheme-container { background: #1a1a1a; padding: 15px; }
        .swagger-ui .opblock.opblock-get { border-color: #61affe; background: rgba(97, 175, 254, 0.1); }
        .swagger-ui .opblock-summary-method { background: #ff1744; }
    `,
    customSiteTitle: "Stranger Things API - Documentation",
    customfavIcon: "/favicon.png",
    explorer: true
};

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Serve raw OpenAPI spec
app.get('/api/openapi.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Paginate an array of results
 * @param {Array} array - The array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated results with info
 */
const paginate = (array, page = 1, limit = 20) => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const results = {};

    results.info = {
        count: array.length,
        pages: Math.ceil(array.length / limit),
        current_page: page,
        per_page: limit,
        next: endIndex < array.length ? page + 1 : null,
        prev: startIndex > 0 ? page - 1 : null
    };

    results.results = array.slice(startIndex, endIndex);
    return results;
};

/**
 * Filter an array by query parameters
 * @param {Array} array - The array to filter
 * @param {Object} query - Query parameters
 * @returns {Array} Filtered array
 */
const filterByField = (array, query) => {
    return array.filter(item => {
        return Object.keys(query).every(key => {
            if (key === 'page' || key === 'limit') return true;

            const itemValue = item[key];
            const queryValue = query[key];

            if (itemValue === undefined) return true;

            if (Array.isArray(itemValue)) {
                return itemValue.some(v =>
                    String(v).toLowerCase().includes(String(queryValue).toLowerCase())
                );
            }

            return String(itemValue).toLowerCase().includes(String(queryValue).toLowerCase());
        });
    });
};

// ==================== UTILITY ENDPOINTS ====================

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the current health status of the API
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.floor((Date.now() - START_TIME) / 1000),
        version: API_VERSION,
        environment: process.env.NODE_ENV || 'development'
    });
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API welcome endpoint
 *     description: Returns basic API information and available endpoints
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: API information
 */
app.get('/', (req, res) => {
    res.json({
        name: 'Stranger Things API',
        version: API_VERSION,
        description: 'Free API providing comprehensive data about Stranger Things characters, episodes, locations, creatures, and quotes.',
        documentation: {
            interactive: '/api/docs',
            openapi_spec: '/api/openapi.json',
            readme: 'https://github.com/JoseAlvarezDev/Stranger-Things-API#readme'
        },
        endpoints: {
            characters: '/api/characters',
            creatures: '/api/creatures',
            episodes: '/api/episodes',
            locations: '/api/locations',
            quotes: '/api/quotes',
            stats: '/api/stats',
            health: '/api/health',
            random: {
                character: '/api/characters/random',
                creature: '/api/creatures/random',
                quote: '/api/quotes/random',
                episode: '/api/episodes/random',
                location: '/api/locations/random'
            }
        },
        rate_limits: {
            general: '100 requests per 15 minutes',
            random_endpoints: '30 requests per minute',
            heavy_usage: '1000 requests per hour'
        },
        author: {
            name: 'Jose Alvarez Dev',
            github: 'https://github.com/JoseAlvarezDev'
        }
    });
});

/**
 * @swagger
 * /api:
 *   get:
 *     summary: API information
 *     description: Returns detailed API information including all available endpoints and their descriptions
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Detailed API information
 */
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the Stranger Things API!',
        version: API_VERSION,
        documentation: '/api/docs',
        available_endpoints: [
            {
                endpoint: '/api/characters',
                description: 'Get all characters',
                methods: ['GET'],
                filters: ['name', 'status', 'gender', 'occupation', 'season']
            },
            {
                endpoint: '/api/characters/:id',
                description: 'Get character by ID',
                methods: ['GET']
            },
            {
                endpoint: '/api/characters/random',
                description: 'Get a random character',
                methods: ['GET']
            },
            {
                endpoint: '/api/creatures',
                description: 'Get all creatures from the Upside Down',
                methods: ['GET'],
                filters: ['name', 'origin', 'status', 'threat_level']
            },
            {
                endpoint: '/api/creatures/:id',
                description: 'Get creature by ID',
                methods: ['GET']
            },
            {
                endpoint: '/api/creatures/random',
                description: 'Get a random creature',
                methods: ['GET']
            },
            {
                endpoint: '/api/episodes',
                description: 'Get all episodes',
                methods: ['GET'],
                filters: ['season', 'title', 'directed_by']
            },
            {
                endpoint: '/api/episodes/:id',
                description: 'Get episode by ID',
                methods: ['GET']
            },
            {
                endpoint: '/api/episodes/random',
                description: 'Get a random episode',
                methods: ['GET']
            },
            {
                endpoint: '/api/locations',
                description: 'Get all locations',
                methods: ['GET'],
                filters: ['name', 'type', 'status']
            },
            {
                endpoint: '/api/locations/:id',
                description: 'Get location by ID',
                methods: ['GET']
            },
            {
                endpoint: '/api/locations/random',
                description: 'Get a random location',
                methods: ['GET']
            },
            {
                endpoint: '/api/quotes',
                description: 'Get all quotes',
                methods: ['GET'],
                filters: ['character', 'season']
            },
            {
                endpoint: '/api/quotes/:id',
                description: 'Get quote by ID',
                methods: ['GET']
            },
            {
                endpoint: '/api/quotes/random',
                description: 'Get a random quote',
                methods: ['GET']
            }
        ],
        pagination: {
            description: 'All list endpoints support pagination',
            parameters: {
                page: 'Page number (default: 1)',
                limit: 'Items per page (default: 20, max: 50)'
            }
        },
        rate_limits: {
            general: '100 requests per 15 minutes',
            random_endpoints: '30 requests per minute',
            heavy_usage: '1000 requests per hour'
        }
    });
});

// ==================== GLOBAL SEARCH ====================

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Global search across all data
 *     description: Search for characters, creatures, episodes, locations, and quotes in a single query
 *     tags: [Utility]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search query (minimum 2 characters)
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, characters, creatures, episodes, locations, quotes]
 *         description: Filter by data type (default all)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 20
 *           default: 5
 *         description: Results per category (default 5, max 20)
 *     responses:
 *       200:
 *         description: Search results grouped by type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 query:
 *                   type: string
 *                 total_results:
 *                   type: integer
 *                 results:
 *                   type: object
 *       400:
 *         description: Invalid search query
 */
app.get('/api/search', security.validatePagination, (req, res) => {
    const { q, type = 'all', limit = 5 } = req.query;

    // Validate query
    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'Search query must be at least 2 characters',
            code: 400
        });
    }

    const searchTerm = q.toLowerCase().trim();
    const maxResults = Math.min(parseInt(limit) || 5, 20);
    const searchType = type.toLowerCase();

    // Search functions for each data type
    const searchCharacters = () => {
        return characters.filter(char =>
            char.name?.toLowerCase().includes(searchTerm) ||
            char.real_name?.toLowerCase().includes(searchTerm) ||
            char.nickname?.toLowerCase().includes(searchTerm) ||
            char.description?.toLowerCase().includes(searchTerm) ||
            char.occupation?.toLowerCase().includes(searchTerm) ||
            char.portrayed_by?.toLowerCase().includes(searchTerm)
        ).slice(0, maxResults).map(char => ({
            id: char.id,
            name: char.name,
            type: 'character',
            status: char.status,
            portrayed_by: char.portrayed_by,
            portrait_path: char.portrait_path
        }));
    };

    const searchCreatures = () => {
        return creatures.filter(creature =>
            creature.name?.toLowerCase().includes(searchTerm) ||
            creature.description?.toLowerCase().includes(searchTerm) ||
            creature.origin?.toLowerCase().includes(searchTerm) ||
            creature.classification?.toLowerCase().includes(searchTerm)
        ).slice(0, maxResults).map(creature => ({
            id: creature.id,
            name: creature.name,
            type: 'creature',
            threat_level: creature.threat_level,
            origin: creature.origin,
            image_path: creature.image_path
        }));
    };

    const searchEpisodes = () => {
        return episodes.filter(ep =>
            ep.title?.toLowerCase().includes(searchTerm) ||
            ep.synopsis?.toLowerCase().includes(searchTerm) ||
            ep.directed_by?.toLowerCase().includes(searchTerm)
        ).slice(0, maxResults).map(ep => ({
            id: ep.id,
            title: ep.title,
            type: 'episode',
            season: ep.season,
            episode: ep.episode,
            air_date: ep.air_date
        }));
    };

    const searchLocations = () => {
        return locations.filter(loc =>
            loc.name?.toLowerCase().includes(searchTerm) ||
            loc.description?.toLowerCase().includes(searchTerm) ||
            loc.type?.toLowerCase().includes(searchTerm) ||
            loc.significance?.toLowerCase().includes(searchTerm)
        ).slice(0, maxResults).map(loc => ({
            id: loc.id,
            name: loc.name,
            type: 'location',
            location_type: loc.type,
            status: loc.status
        }));
    };

    const searchQuotes = () => {
        return quotes.filter(quote =>
            quote.quote?.toLowerCase().includes(searchTerm) ||
            quote.character?.toLowerCase().includes(searchTerm) ||
            quote.context?.toLowerCase().includes(searchTerm)
        ).slice(0, maxResults).map(quote => ({
            id: quote.id,
            quote: quote.quote,
            type: 'quote',
            character: quote.character,
            season: quote.season
        }));
    };

    // Build results based on search type
    const results = {};
    let totalResults = 0;

    if (searchType === 'all' || searchType === 'characters') {
        results.characters = searchCharacters();
        totalResults += results.characters.length;
    }

    if (searchType === 'all' || searchType === 'creatures') {
        results.creatures = searchCreatures();
        totalResults += results.creatures.length;
    }

    if (searchType === 'all' || searchType === 'episodes') {
        results.episodes = searchEpisodes();
        totalResults += results.episodes.length;
    }

    if (searchType === 'all' || searchType === 'locations') {
        results.locations = searchLocations();
        totalResults += results.locations.length;
    }

    if (searchType === 'all' || searchType === 'quotes') {
        results.quotes = searchQuotes();
        totalResults += results.quotes.length;
    }

    res.json({
        query: q,
        type: searchType,
        total_results: totalResults,
        results_per_category: maxResults,
        results
    });
});

// ==================== CHARACTERS ====================

/**
 * @swagger
 * /api/characters:
 *   get:
 *     summary: Get all characters
 *     description: Retrieve a paginated list of all Stranger Things characters
 *     tags: [Characters]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: name
 *         in: query
 *         description: Filter by character name
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: Filter by status (Alive, Deceased, Unknown)
 *         schema:
 *           type: string
 *           enum: [Alive, Deceased, Unknown]
 *       - name: gender
 *         in: query
 *         description: Filter by gender
 *         schema:
 *           type: string
 *           enum: [Male, Female]
 *     responses:
 *       200:
 *         description: Paginated list of characters
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Character'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
app.get('/api/characters', security.validatePagination, (req, res) => {
    try {
        const currentCharacters = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/characters.json'), 'utf8'));
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredCharacters = filterByField(currentCharacters, req.query);
        const result = paginate(filteredCharacters, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching characters:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/characters/random:
 *   get:
 *     summary: Get a random character
 *     description: Retrieve a random character from the database
 *     tags: [Characters]
 *     responses:
 *       200:
 *         description: A random character
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
app.get('/api/characters/random', security.randomEndpointLimiter, (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * characters.length);
        res.json(characters[randomIndex]);
    } catch (error) {
        console.error('Error fetching random character:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     summary: Get character by ID
 *     description: Retrieve a specific character by their unique ID
 *     tags: [Characters]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Character details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/characters/:id', security.validateId, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const character = characters.find(c => c.id === id);

        if (!character) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Character not found',
                code: 404
            });
        }

        res.json(character);
    } catch (error) {
        console.error('Error fetching character:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

// ==================== CREATURES ====================

/**
 * @swagger
 * /api/creatures:
 *   get:
 *     summary: Get all creatures
 *     description: Retrieve a paginated list of all creatures from the Upside Down
 *     tags: [Creatures]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: name
 *         in: query
 *         description: Filter by creature name
 *         schema:
 *           type: string
 *       - name: threat_level
 *         in: query
 *         description: Filter by threat level
 *         schema:
 *           type: string
 *           enum: [Low, Medium, High, Extreme]
 *     responses:
 *       200:
 *         description: Paginated list of creatures
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
app.get('/api/creatures', security.validatePagination, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredCreatures = filterByField(creatures, req.query);
        const result = paginate(filteredCreatures, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching creatures:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/creatures/random:
 *   get:
 *     summary: Get a random creature
 *     description: Retrieve a random creature from the database
 *     tags: [Creatures]
 *     responses:
 *       200:
 *         description: A random creature
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creature'
 */
app.get('/api/creatures/random', security.randomEndpointLimiter, (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * creatures.length);
        res.json(creatures[randomIndex]);
    } catch (error) {
        console.error('Error fetching random creature:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/creatures/{id}:
 *   get:
 *     summary: Get creature by ID
 *     description: Retrieve a specific creature by their unique ID
 *     tags: [Creatures]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Creature details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Creature'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/creatures/:id', security.validateId, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const creature = creatures.find(c => c.id === id);

        if (!creature) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Creature not found',
                code: 404
            });
        }

        res.json(creature);
    } catch (error) {
        console.error('Error fetching creature:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

// ==================== EPISODES ====================

/**
 * @swagger
 * /api/episodes:
 *   get:
 *     summary: Get all episodes
 *     description: Retrieve a paginated list of all Stranger Things episodes
 *     tags: [Episodes]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: season
 *         in: query
 *         description: Filter by season number
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4]
 *       - name: title
 *         in: query
 *         description: Filter by episode title
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of episodes
 */
app.get('/api/episodes', security.validatePagination, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredEpisodes = filterByField(episodes, req.query);
        const result = paginate(filteredEpisodes, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching episodes:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/episodes/random:
 *   get:
 *     summary: Get a random episode
 *     description: Retrieve a random episode from the database
 *     tags: [Episodes]
 *     responses:
 *       200:
 *         description: A random episode
 */
app.get('/api/episodes/random', security.randomEndpointLimiter, (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * episodes.length);
        res.json(episodes[randomIndex]);
    } catch (error) {
        console.error('Error fetching random episode:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/episodes/{id}:
 *   get:
 *     summary: Get episode by ID
 *     description: Retrieve a specific episode by its unique ID
 *     tags: [Episodes]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Episode details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Episode'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/episodes/:id', security.validateId, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const episode = episodes.find(e => e.id === id);

        if (!episode) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Episode not found',
                code: 404
            });
        }

        res.json(episode);
    } catch (error) {
        console.error('Error fetching episode:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/seasons/{season}/episodes:
 *   get:
 *     summary: Get episodes by season
 *     description: Retrieve all episodes from a specific season
 *     tags: [Episodes]
 *     parameters:
 *       - name: season
 *         in: path
 *         required: true
 *         description: Season number (1-4)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *     responses:
 *       200:
 *         description: List of episodes in the season
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/seasons/:season/episodes', (req, res) => {
    try {
        const season = parseInt(req.params.season);

        if (isNaN(season) || season < 1 || season > 4) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Invalid season parameter. Must be between 1 and 4.',
                code: 400
            });
        }

        const seasonEpisodes = episodes.filter(e => e.season === season);

        if (seasonEpisodes.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Season not found',
                code: 404
            });
        }

        res.json({
            season: season,
            episode_count: seasonEpisodes.length,
            episodes: seasonEpisodes
        });
    } catch (error) {
        console.error('Error fetching season episodes:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

// ==================== LOCATIONS ====================

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Get all locations
 *     description: Retrieve a paginated list of all locations in Hawkins and beyond
 *     tags: [Locations]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: name
 *         in: query
 *         description: Filter by location name
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         description: Filter by location type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated list of locations
 */
app.get('/api/locations', security.validatePagination, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredLocations = filterByField(locations, req.query);
        const result = paginate(filteredLocations, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/locations/random:
 *   get:
 *     summary: Get a random location
 *     description: Retrieve a random location from the database
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: A random location
 */
app.get('/api/locations/random', security.randomEndpointLimiter, (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * locations.length);
        res.json(locations[randomIndex]);
    } catch (error) {
        console.error('Error fetching random location:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     description: Retrieve a specific location by its unique ID
 *     tags: [Locations]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Location details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Location'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/locations/:id', security.validateId, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const location = locations.find(l => l.id === id);

        if (!location) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Location not found',
                code: 404
            });
        }

        res.json(location);
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

// ==================== QUOTES ====================

/**
 * @swagger
 * /api/quotes:
 *   get:
 *     summary: Get all quotes
 *     description: Retrieve a paginated list of all memorable quotes
 *     tags: [Quotes]
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - name: character
 *         in: query
 *         description: Filter by character name
 *         schema:
 *           type: string
 *       - name: season
 *         in: query
 *         description: Filter by season number
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated list of quotes
 */
app.get('/api/quotes', security.validatePagination, (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredQuotes = filterByField(quotes, req.query);
        const result = paginate(filteredQuotes, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching quotes:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/quotes/random:
 *   get:
 *     summary: Get a random quote
 *     description: Retrieve a random quote from the database
 *     tags: [Quotes]
 *     responses:
 *       200:
 *         description: A random quote
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 */
app.get('/api/quotes/random', security.randomEndpointLimiter, (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        res.json(quotes[randomIndex]);
    } catch (error) {
        console.error('Error fetching random quote:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/quotes/{id}:
 *   get:
 *     summary: Get quote by ID
 *     description: Retrieve a specific quote by its unique ID
 *     tags: [Quotes]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Quote details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/quotes/:id', security.validateId, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const quote = quotes.find(q => q.id === id);

        if (!quote) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Quote not found',
                code: 404
            });
        }

        res.json(quote);
    } catch (error) {
        console.error('Error fetching quote:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

/**
 * @swagger
 * /api/characters/{id}/quotes:
 *   get:
 *     summary: Get quotes by character
 *     description: Retrieve all quotes from a specific character
 *     tags: [Quotes, Characters]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Character's quotes
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
app.get('/api/characters/:id/quotes', security.validateId, (req, res) => {
    try {
        const characterId = parseInt(req.params.id);
        const character = characters.find(c => c.id === characterId);

        if (!character) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Character not found',
                code: 404
            });
        }

        const characterQuotes = quotes.filter(q => q.character_id === characterId);

        res.json({
            character: character.name,
            character_id: characterId,
            quote_count: characterQuotes.length,
            quotes: characterQuotes
        });
    } catch (error) {
        console.error('Error fetching character quotes:', error);
        res.status(500).json({ error: 'Internal server error', message: error.message, code: 500 });
    }
});

// ==================== STATS ====================

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Get API statistics
 *     description: Retrieve comprehensive statistics about all API data
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: API statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Stats'
 */
app.get('/api/stats', (req, res) => {
    res.json({
        total_characters: characters.length,
        total_creatures: creatures.length,
        total_episodes: episodes.length,
        total_locations: locations.length,
        total_quotes: quotes.length,
        seasons: {
            total: 4,
            episodes_per_season: {
                1: episodes.filter(e => e.season === 1).length,
                2: episodes.filter(e => e.season === 2).length,
                3: episodes.filter(e => e.season === 3).length,
                4: episodes.filter(e => e.season === 4).length
            }
        },
        characters_by_status: {
            alive: characters.filter(c => c.status === 'Alive').length,
            deceased: characters.filter(c => c.status === 'Deceased').length,
            unknown: characters.filter(c => !['Alive', 'Deceased'].includes(c.status)).length
        },
        api_version: API_VERSION,
        last_updated: new Date().toISOString()
    });
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist.',
        code: 404,
        documentation: '/api/docs',
        available_endpoints: ['/api', '/api/characters', '/api/creatures', '/api/episodes', '/api/locations', '/api/quotes']
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'Something went wrong on our end.'
            : err.message,
        code: 500
    });
});

// ==================== SERVER START ====================

app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════╗
  ║                                                           ║
  ║   ███████╗████████╗██████╗  █████╗ ███╗   ██╗ ██████╗    ║
  ║   ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗████╗  ██║██╔════╝    ║
  ║   ███████╗   ██║   ██████╔╝███████║██╔██╗ ██║██║  ███╗   ║
  ║   ╚════██║   ██║   ██╔══██╗██╔══██║██║╚██╗██║██║   ██║   ║
  ║   ███████║   ██║   ██║  ██║██║  ██║██║ ╚████║╚██████╔╝   ║
  ║   ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝    ║
  ║                                                           ║
  ║           THINGS API - The Upside Down Awaits            ║
  ║                                                           ║
  ╠═══════════════════════════════════════════════════════════╣
  ║   🌐 Server:      http://localhost:${PORT}                   ║
  ║   📚 Docs:        http://localhost:${PORT}/api/docs          ║
  ║   🔧 OpenAPI:     http://localhost:${PORT}/api/openapi.json  ║
  ║   ❤️  Health:     http://localhost:${PORT}/api/health        ║
  ╠═══════════════════════════════════════════════════════════╣
  ║   🛡️  Security: Rate limiting enabled                      ║
  ║   📊 Version: ${API_VERSION}                                      ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
