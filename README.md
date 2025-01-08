# SSO Server

A Single Sign-On (SSO) server built with Next.js 15, providing centralized authentication for multiple applications. This server allows users to authenticate once and access multiple applications without needing to log in again.

## Features

- **User Authentication**
  - Email/Password authentication
  - Social login support (Google)
  - Protected user profile pages
  - Server-side rendering for enhanced security

- **SSO Functionality**
  - Centralized authentication for multiple applications
  - JWT-based token management
  - Configurable client applications
  - Secure token validation and verification

- **API Endpoints**
  - User profile management
  - Token validation
  - Sign-out functionality
  - CORS-enabled for cross-origin requests

## Prerequisites

- Node.js 18 or higher
- MongoDB database
- Environment variables configured (see below)

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd sso-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up HTTPS for local development:
```bash
# Install mkcert (macOS)
brew install mkcert

# Install mkcert's root certificate (requires sudo)
sudo mkcert -install

# Generate certificates for localhost
mkdir -p certificates
mkcert -key-file ./certificates/key.pem -cert-file ./certificates/cert.pem localhost 127.0.0.1 ::1
```

4. Create a `.env` file in the root directory with the following variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET_KEY=your-secret-key
MONGODB_URI=mongodb://localhost:27017/sso-server

# OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Configure client applications in `clients.json`:
```json
{
  "clients": [
    {
      "clientId": "client1",
      "clientSecret": "secret1",
      "name": "Application Name",
      "redirectUrls": ["http://localhost:8080/auth/callback"],
      "allowedOrigins": ["http://localhost:8080"]
    }
  ]
}
```

6. Start the development server:
```bash
npm run dev
```

## Client Integration

1. Redirect users to the SSO login page:
```javascript
window.location.href = 'http://localhost:3000/sso/login?client_id=your_client_id&redirect_url=your_callback_url'
```

2. Handle the callback and token:
```javascript
// In your callback route
const token = new URLSearchParams(window.location.search).get('token');
if (token) {
  // Store the token and authenticate the user
}
```

3. Use the API endpoints:
```javascript
// Get user profile
const response = await fetch('http://localhost:3000/api/user', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Client-Id': 'your_client_id'
  }
});

// Validate token
const response = await fetch('http://localhost:3000/api/validate-token', {
  method: 'POST',
  headers: {
    'X-Client-Id': 'your_client_id',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token })
});
```

## API Documentation

### GET /api/user
Get authenticated user's profile
- Headers:
  - Authorization: Bearer token
  - X-Client-Id: Client application ID

### POST /api/validate-token
Validate a JWT token
- Headers:
  - X-Client-Id: Client application ID
- Body:
  - token: JWT token to validate

### POST /api/signout
Sign out the user
- Headers:
  - X-Client-Id: Client application ID

### PUT /api/user/update
Update user profile
- Headers:
  - Authorization: Bearer token
  - X-Client-Id: Client application ID
- Body:
  - name?: string
  - email?: string
  - password?: string

## Security Considerations

- All pages are server-side rendered for enhanced security
- JWT tokens are signed with a secure key
- CORS is configured to only allow registered client origins
- Sensitive routes are protected with authentication
- Passwords are hashed before storage
- HTTP-only cookies are used for session management

## TODO

- [ ] Add rate limiting for API endpoints
- [ ] Implement refresh token mechanism
- [ ] Add more social login providers
- [ ] Add admin dashboard for client management
- [ ] Implement token revocation
- [ ] Add audit logging
- [ ] Add automated tests
- [ ] Add Docker support

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
