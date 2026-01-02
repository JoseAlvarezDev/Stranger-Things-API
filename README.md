# 🔦 Stranger Things API

<div align="center">

![Stranger Things API](./public/logotransparente.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-red.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-blue.svg)](https://expressjs.com/)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0-orange.svg)](https://swagger.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**A free, open-source RESTful API providing comprehensive data about the Stranger Things universe.**

[🚀 Live Demo](https://strangerthingsapi.com) • [📚 Documentation](https://strangerthingsapi.com/api/docs) • [🐛 Report Bug](https://github.com/JoseAlvarezDev/Stranger-Things-API/issues)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Rich Dataset** | Characters, Creatures, Episodes, Locations, and Quotes |
| 🖼️ **High-Quality Images** | Character portraits and creature images (WebP format) |
| 🔍 **Powerful Filtering** | Search and filter across all endpoints |
| 📄 **Pagination** | Efficient data retrieval with built-in pagination |
| 🛡️ **Secure** | Rate limiting, input validation, and security headers |
| 📚 **Well Documented** | Interactive Swagger documentation |
| ⚡ **Fast & Reliable** | Optimized responses with compression |
| 🆓 **No Authentication** | Completely free and open access |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v16 or higher
- **npm** v7 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/JoseAlvarezDev/Stranger-Things-API.git

# Navigate to the project
cd Stranger-Things-API

# Install dependencies
npm install

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 📚 API Documentation

### Base URL

```
https://strangerthingsapi.com/api
```

### Interactive Documentation

Visit `/api/docs` for the interactive Swagger documentation.

### Available Endpoints

#### Characters

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/characters` | Get all characters (paginated) |
| `GET` | `/api/characters/:id` | Get character by ID |
| `GET` | `/api/characters/random` | Get a random character |
| `GET` | `/api/characters/:id/quotes` | Get quotes by character |

**Filters:** `name`, `status`, `gender`, `occupation`, `season`

#### Creatures

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/creatures` | Get all creatures (paginated) |
| `GET` | `/api/creatures/:id` | Get creature by ID |
| `GET` | `/api/creatures/random` | Get a random creature |

**Filters:** `name`, `origin`, `status`, `threat_level`

#### Episodes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/episodes` | Get all episodes (paginated) |
| `GET` | `/api/episodes/:id` | Get episode by ID |
| `GET` | `/api/episodes/random` | Get a random episode |
| `GET` | `/api/seasons/:season/episodes` | Get episodes by season |

**Filters:** `season`, `title`, `directed_by`

#### Locations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/locations` | Get all locations (paginated) |
| `GET` | `/api/locations/:id` | Get location by ID |
| `GET` | `/api/locations/random` | Get a random location |

**Filters:** `name`, `type`, `status`

#### Quotes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/quotes` | Get all quotes (paginated) |
| `GET` | `/api/quotes/:id` | Get quote by ID |
| `GET` | `/api/quotes/random` | Get a random quote |

**Filters:** `character`, `season`

#### Utility

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api` | API information |
| `GET` | `/api/stats` | API statistics |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/docs` | Swagger documentation |
| `GET` | `/api/openapi.json` | OpenAPI specification |

---

## 📖 Usage Examples

### JavaScript (Fetch)

```javascript
// Get all characters
const response = await fetch('https://strangerthingsapi.com/api/characters');
const data = await response.json();
console.log(data.results);

// Get a specific character
const eleven = await fetch('https://strangerthingsapi.com/api/characters/1');
const character = await eleven.json();
console.log(character.name); // "Eleven"

// Filter characters by status
const alive = await fetch('https://strangerthingsapi.com/api/characters?status=Alive');
const aliveChars = await alive.json();
```

### Python

```python
import requests

# Get all creatures
response = requests.get('https://strangerthingsapi.com/api/creatures')
creatures = response.json()

# Get random quote
quote = requests.get('https://strangerthingsapi.com/api/quotes/random').json()
print(f'"{quote["quote"]}" - {quote["character"]}')
```

### cURL

```bash
# Get all episodes
curl https://strangerthingsapi.com/api/episodes

# Get character by ID
curl https://strangerthingsapi.com/api/characters/1

# Get paginated results
curl "https://strangerthingsapi.com/api/characters?page=2&limit=10"

# Filter by status
curl "https://strangerthingsapi.com/api/characters?status=Deceased"
```

---

## ⚡ Rate Limiting

To ensure fair usage and API stability, rate limits are enforced:

| Limit Type | Requests | Window |
|------------|----------|--------|
| **General** | 100 | 15 minutes |
| **Random Endpoints** | 30 | 1 minute |
| **Heavy Usage** | 1000 | 1 hour |

Rate limit information is included in response headers:
- `RateLimit-Limit`: Maximum requests allowed
- `RateLimit-Remaining`: Requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit resets

---

## 📊 Response Format

### Paginated Response

```json
{
  "info": {
    "count": 25,
    "pages": 2,
    "current_page": 1,
    "per_page": 20,
    "next": 2,
    "prev": null
  },
  "results": [
    {
      "id": 1,
      "name": "Eleven",
      "real_name": "Jane Hopper",
      "status": "Alive",
      ...
    }
  ]
}
```

### Error Response

```json
{
  "error": "Not Found",
  "message": "Character not found",
  "code": 404
}
```

---

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse and ensures fair usage
- **Input Validation**: All query parameters are validated and sanitized
- **Security Headers**: Helmet.js for enhanced HTTP security
- **CORS**: Configured for cross-origin requests
- **Compression**: Gzip compression for smaller payloads
- **HPP Protection**: Prevents HTTP Parameter Pollution attacks

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **Helmet** | Security headers |
| **Morgan** | Request logging |
| **Swagger** | API documentation |
| **express-rate-limit** | Rate limiting |

---

## 📁 Project Structure

```
Stranger-Things_API/
├── config/
│   └── swagger.js          # Swagger/OpenAPI configuration
├── data/
│   ├── characters.json     # Character data
│   ├── creatures.json      # Creature data
│   ├── episodes.json       # Episode data
│   ├── locations.json      # Location data
│   └── quotes.json         # Quote data
├── middleware/
│   └── security.js         # Security middleware
├── public/
│   ├── images/             # Static images
│   ├── index.html          # Frontend documentation
│   ├── styles.css          # Frontend styles
│   └── script.js           # Frontend scripts
├── server.js               # Main application entry
├── package.json            # Project dependencies
├── README.md               # This file
├── CONTRIBUTING.md         # Contribution guidelines
├── SECURITY.md             # Security policy
└── LICENSE                 # MIT License
```

---

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🎨 Credits & Attributions

- **Development**: [Jose Alvarez Dev](https://github.com/JoseAlvarezDev)
- **Data Source**: [Stranger Things Wiki (Fandom)](https://strangerthings.fandom.com/)
- **Design Inspiration**: Netflix's Stranger Things retro 80s aesthetic

---

## 📞 Contact

**Jose Alvarez Dev**

- GitHub: [@JoseAlvarezDev](https://github.com/JoseAlvarezDev)
- LinkedIn: [josealvarezdev](https://linkedin.com/in/josealvarezdev)

---

<div align="center">

**Made with ❤️ by Jose Alvarez Dev**

*"Friends don't lie."* - Eleven

</div>
