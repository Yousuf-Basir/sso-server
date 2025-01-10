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

2. Handle the callback and tokens:
```javascript
// In your callback route
const token = new URLSearchParams(window.location.search).get('token');
if (token) {
  // Store the token and authenticate the user
  // The refresh token is automatically set as an HTTP-only cookie
}
```

3. Use the API endpoints with automatic token refresh:
```javascript
async function fetchWithTokenRefresh(url, options = {}) {
  // First attempt with current access token
  let response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: needed for cookies
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${getCurrentToken()}`,
      'X-Client-Id': 'your_client_id'
    }
  });

  // If unauthorized, try to refresh the token
  if (response.status === 401) {
    const refreshResponse = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'X-Client-Id': 'your_client_id'
      }
    });

    if (refreshResponse.ok) {
      const { accessToken } = await refreshResponse.json();
      // Store the new access token
      setCurrentToken(accessToken);
      
      // Retry the original request with new token
      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${accessToken}`,
          'X-Client-Id': 'your_client_id'
        }
      });
    } else {
      // Refresh failed - redirect to login
      window.location.href = 'http://localhost:3000/sso/login?client_id=your_client_id&redirect_url=your_callback_url';
    }
  }

  return response;
}

// Example usage
const response = await fetchWithTokenRefresh('http://localhost:3000/api/user');
const userData = await response.json();
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

### POST /api/auth/refresh
Refresh an expired access token
- Headers:
  - X-Client-Id: Client application ID
- Cookies:
  - refreshToken: HTTP-only refresh token cookie
- Returns:
  - accessToken: New access token

## Security Considerations

- All pages are server-side rendered for enhanced security
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- Tokens are signed with a secure key
- CORS is configured to only allow registered client origins
- Sensitive routes are protected with authentication
- Passwords are hashed before storage
- HTTP-only cookies are used for refresh tokens and session management

## TODO

- [x] Implement refresh token mechanism
- [ ] Add rate limiting for API endpoints
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
