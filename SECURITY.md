# Security Policy

## 🔒 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## 🛡️ Security Measures

This API implements the following security measures:

### Rate Limiting
- **General Limit**: 100 requests per 15 minutes per IP
- **Random Endpoints**: 30 requests per minute per IP
- **Heavy Usage**: 1000 requests per hour per IP

### Input Validation
- All query parameters are validated
- ID parameters must be positive integers
- Pagination limits are enforced (max 50 items per page)
- Input sanitization removes potentially dangerous characters

### Security Headers
- **Helmet.js** is used for secure HTTP headers
- Cross-Origin Resource Policy configured
- No sensitive information in error messages

### Additional Protections
- **HPP** (HTTP Parameter Pollution) protection
- **Compression** with size limits
- Request body size limited to 10KB
- Trust proxy configuration for accurate IP tracking

## 🐛 Reporting a Vulnerability

If you discover a security vulnerability, please follow these steps:

### 1. Do NOT disclose publicly

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Contact us privately

Send an email to: **security@josealvarezdev.com**

Include the following information:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes

### 3. Wait for response

We will acknowledge your email within **48 hours** and aim to:
- Confirm the vulnerability within **7 days**
- Release a fix within **30 days** (depending on complexity)
- Credit you in the security advisory (unless you prefer anonymity)

## 📋 Security Checklist for Contributors

When contributing to this project, please ensure:

- [ ] No hardcoded secrets or API keys
- [ ] No sensitive data in logs
- [ ] Input validation for new endpoints
- [ ] Rate limiting applied where appropriate
- [ ] Error messages don't expose internal details
- [ ] Dependencies are up to date

## 🔄 Dependency Updates

We regularly update dependencies to patch security vulnerabilities:

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## 📜 Best Practices for API Users

### Rate Limiting
Respect the rate limits to ensure fair usage:
- Cache responses when possible
- Implement exponential backoff for rate limit errors
- Use pagination to minimize requests

### Error Handling
- Handle 429 (Too Many Requests) gracefully
- Check `RateLimit-*` headers in responses
- Implement retry logic with appropriate delays

### Example Rate Limit Handling

```javascript
async function fetchWithRetry(url, retries = 3) {
    for (let i = 0; i < retries; i++) {
        const response = await fetch(url);
        
        if (response.status === 429) {
            const retryAfter = response.headers.get('RateLimit-Reset');
            await new Promise(r => setTimeout(r, retryAfter * 1000));
            continue;
        }
        
        return response.json();
    }
    throw new Error('Max retries exceeded');
}
```

## 📞 Contact

For security-related inquiries:
- **Email**: security@josealvarezdev.com
- **GitHub**: [@JoseAlvarezDev](https://github.com/JoseAlvarezDev)

---

*Last updated: January 2026*
