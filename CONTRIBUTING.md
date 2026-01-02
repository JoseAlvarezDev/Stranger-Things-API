# Contributing to Stranger Things API

First off, thank you for considering contributing to the Stranger Things API! 🔦

This document provides guidelines and steps for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Style Guidelines](#style-guidelines)
- [Pull Request Process](#pull-request-process)

---

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## 🤔 How Can I Contribute?

### 🐛 Reporting Bugs

If you find a bug, please create an issue with:

1. **Clear title** describing the bug
2. **Steps to reproduce** the behavior
3. **Expected behavior** vs **actual behavior**
4. **Screenshots** if applicable
5. **Environment details** (Node version, OS, etc.)

### 💡 Suggesting Features

Feature requests are welcome! Please include:

1. **Use case** - Why is this feature needed?
2. **Proposed solution** - How should it work?
3. **Alternatives considered** - Other approaches you've thought of

### 📊 Adding Data

Want to add more characters, creatures, or locations? Follow these steps:

1. Fork the repository
2. Edit the appropriate JSON file in `/data`
3. Follow the existing data structure
4. Include high-quality images (WebP format, max 500KB)
5. Submit a pull request

#### Data Structure Examples

**Character:**
```json
{
  "id": 26,
  "name": "Character Name",
  "real_name": "Real Name (if different)",
  "nickname": "Nickname",
  "age": 18,
  "gender": "Male/Female",
  "occupation": "Occupation",
  "portrayed_by": "Actor Name",
  "powers": [],
  "status": "Alive/Deceased/Unknown",
  "portrait_path": "/images/characters/name.webp",
  "quotes": ["Quote 1", "Quote 2"],
  "seasons": [1, 2, 3, 4],
  "biography": "Character biography..."
}
```

**Creature:**
```json
{
  "id": 11,
  "name": "Creature Name",
  "origin": "The Upside Down",
  "description": "Description...",
  "abilities": ["Ability 1", "Ability 2"],
  "weaknesses": ["Weakness 1"],
  "threat_level": "Low/Medium/High/Extreme",
  "status": "Active/Defeated/Unknown",
  "first_appearance": "Season 1, Episode 1",
  "image_path": "/images/creatures/name.webp"
}
```

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** v16 or higher
- **npm** v7 or higher
- **Git**

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/Stranger-Things-API.git
cd Stranger-Things-API

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with auto-reload |
| `npm test` | Run tests (coming soon) |

---

## 📝 Style Guidelines

### JavaScript

- Use **ES6+** features
- Use **const** and **let** (never var)
- Use **async/await** for asynchronous code
- Follow existing code formatting
- Add JSDoc comments for functions

```javascript
/**
 * Paginate an array of results
 * @param {Array} array - The array to paginate
 * @param {number} page - Page number (1-indexed)
 * @param {number} limit - Items per page
 * @returns {Object} Paginated results with info
 */
const paginate = (array, page = 1, limit = 20) => {
    // Implementation
};
```

### Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new creature data
fix: resolve pagination bug
docs: update README
style: format code
refactor: restructure middleware
test: add unit tests
chore: update dependencies
```

### JSON Data

- Use consistent formatting (2 spaces indentation)
- Sort keys alphabetically where possible
- Validate JSON before committing

---

## 🔄 Pull Request Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the style guidelines

3. **Test your changes** locally:
   ```bash
   npm run dev
   # Test endpoints manually or with curl
   curl http://localhost:3000/api/health
   ```

4. **Commit your changes** with a descriptive message

5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots if applicable

### PR Checklist

- [ ] Code follows project style guidelines
- [ ] All existing tests pass
- [ ] New functionality is tested
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] API endpoints return expected responses

---

## 🏷️ Issue Labels

| Label | Description |
|-------|-------------|
| `bug` | Something isn't working |
| `enhancement` | New feature request |
| `documentation` | Documentation improvements |
| `good first issue` | Good for newcomers |
| `help wanted` | Extra attention needed |
| `data` | Related to JSON data files |

---

## ❓ Questions?

Feel free to open an issue with the `question` label or reach out directly:

- **GitHub**: [@JoseAlvarezDev](https://github.com/JoseAlvarezDev)

---

Thank you for contributing! 🙏

*"Mornings are for coffee and contemplation."* - Jim Hopper
