// Stranger Things API Server - Reload Triggered v2
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

// Import data
const characters = require('./data/characters.json');
const creatures = require('./data/creatures.json');
const episodes = require('./data/episodes.json');
const locations = require('./data/locations.json');
const quotes = require('./data/quotes.json');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));
app.use(compression());
app.use(express.json());

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Helper functions
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

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Stranger Things API',
        version: '1.0.0',
        description: 'Free API providing comprehensive data about Stranger Things characters, episodes, locations, creatures, and quotes.',
        documentation: 'https://strangerthingsapi.com/docs',
        endpoints: {
            characters: '/api/characters',
            creatures: '/api/creatures',
            episodes: '/api/episodes',
            locations: '/api/locations',
            quotes: '/api/quotes',
            random: {
                character: '/api/characters/random',
                creature: '/api/creatures/random',
                quote: '/api/quotes/random',
                episode: '/api/episodes/random',
                location: '/api/locations/random'
            }
        },
        author: {
            name: 'Jose Alvarez Dev',
            github: 'https://github.com/JoseAlvarezDev'
        }
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the Stranger Things API!',
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
        }
    });
});

// ==================== CHARACTERS ====================

// Get all characters
// Get all characters
app.get('/api/characters', (req, res) => {
    try {
        // Reload characters data from disk to ensure we have latest image paths
        const currentCharacters = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/characters.json'), 'utf8'));

        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredCharacters = filterByField(currentCharacters, req.query);
        const result = paginate(filteredCharacters, page, limit);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get random character
app.get('/api/characters/random', (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * characters.length);
        res.json(characters[randomIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get character by ID
app.get('/api/characters/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const character = characters.find(c => c.id === id);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        res.json(character);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ==================== CREATURES ====================

// Get all creatures
app.get('/api/creatures', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredCreatures = filterByField(creatures, req.query);
        const result = paginate(filteredCreatures, page, limit);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get random creature
app.get('/api/creatures/random', (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * creatures.length);
        res.json(creatures[randomIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get creature by ID
app.get('/api/creatures/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const creature = creatures.find(c => c.id === id);

        if (!creature) {
            return res.status(404).json({ error: 'Creature not found' });
        }

        res.json(creature);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ==================== EPISODES ====================

// Get all episodes
app.get('/api/episodes', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredEpisodes = filterByField(episodes, req.query);
        const result = paginate(filteredEpisodes, page, limit);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get random episode
app.get('/api/episodes/random', (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * episodes.length);
        res.json(episodes[randomIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get episode by ID
app.get('/api/episodes/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const episode = episodes.find(e => e.id === id);

        if (!episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }

        res.json(episode);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get episodes by season
app.get('/api/seasons/:season/episodes', (req, res) => {
    try {
        const season = parseInt(req.params.season);
        const seasonEpisodes = episodes.filter(e => e.season === season);

        if (seasonEpisodes.length === 0) {
            return res.status(404).json({ error: 'Season not found' });
        }

        res.json({
            season: season,
            episode_count: seasonEpisodes.length,
            episodes: seasonEpisodes
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ==================== LOCATIONS ====================

// Get all locations
app.get('/api/locations', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredLocations = filterByField(locations, req.query);
        const result = paginate(filteredLocations, page, limit);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get random location
app.get('/api/locations/random', (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * locations.length);
        res.json(locations[randomIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get location by ID
app.get('/api/locations/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const location = locations.find(l => l.id === id);

        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }

        res.json(location);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ==================== QUOTES ====================

// Get all quotes
app.get('/api/quotes', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);

        let filteredQuotes = filterByField(quotes, req.query);
        const result = paginate(filteredQuotes, page, limit);

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get random quote
app.get('/api/quotes/random', (req, res) => {
    try {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        res.json(quotes[randomIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get quote by ID
app.get('/api/quotes/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const quote = quotes.find(q => q.id === id);

        if (!quote) {
            return res.status(404).json({ error: 'Quote not found' });
        }

        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// Get quotes by character ID
app.get('/api/characters/:id/quotes', (req, res) => {
    try {
        const characterId = parseInt(req.params.id);
        const character = characters.find(c => c.id === characterId);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const characterQuotes = quotes.filter(q => q.character_id === characterId);

        res.json({
            character: character.name,
            character_id: characterId,
            quote_count: characterQuotes.length,
            quotes: characterQuotes
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', message: error.message });
    }
});

// ==================== STATS ====================

// Get API stats
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
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist.',
        available_endpoints: ['/api', '/api/characters', '/api/creatures', '/api/episodes', '/api/locations', '/api/quotes']
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong on our end.'
    });
});

// Start server
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
  ║   🌐 Server running on: http://localhost:${PORT}            ║
  ║   📚 Documentation: http://localhost:${PORT}/api            ║
  ╚═══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
