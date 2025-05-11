
# Setting Up Your PHP Backend for ExamPrep

## Introduction

This guide will help you set up your PHP backend on a web server that can run PHP. The Lovable preview environment only serves static files and cannot execute PHP scripts, so you'll need to deploy your PHP backend to a hosting service that supports PHP (like Hostinger, cPanel hosts, DigitalOcean, etc.).

## Step 1: Choose a PHP Hosting Provider

Choose a hosting provider that supports:
- PHP 8.1 or higher
- MySQL or MariaDB
- .htaccess file support
- CORS configuration

Some options include:
- Shared hosting (Hostinger, Namecheap, Bluehost)
- VPS (DigitalOcean, Linode, Vultr)
- Managed PHP hosting (Kinsta, WP Engine)

## Step 2: Set Up Your Database

1. Access your hosting control panel
2. Create a new MySQL database
3. Create a database user with appropriate permissions
4. Import the database schema provided in `backend/db/examprep_db.sql`

## Step 3: Upload Backend Files

1. Using FTP or your hosting file manager, upload all files from the `backend` directory to your hosting
   - Typically to a directory like `public_html/backend` or similar
   - Make sure to include the `.htaccess` file

2. Set the correct permissions:
   - Directories: 755
   - PHP files: 644

## Step 4: Configure Backend Settings

1. Update database connection settings in `backend/config/database.php`:
   ```php
   private $host = "your_db_host"; // Usually "localhost"
   private $db_name = "your_db_name";
   private $username = "your_db_user";
   private $password = "your_db_password";
   ```

2. Update JWT secret in `backend/config/config.php`:
   ```php
   define('JWT_SECRET', 'your_secure_random_string');
   ```

## Step 5: Configure React Frontend

1. Update `src/config.ts` with your PHP backend URL:
   ```typescript
   const DEV_API_URL = 'https://your-domain.com/backend/api';
   const PROD_API_URL = 'https://your-domain.com/backend/api';
   ```

2. Build the React app:
   ```bash
   npm run build
   ```

3. Deploy the built app to your static hosting or to the root of your PHP hosting

## Step 6: Test Your Setup

1. Visit your application URL
2. Try to register a new user
3. Try logging in with the created user
4. Check network requests in browser dev tools to ensure they're reaching your PHP backend

## Step 7: Create Admin User

Visit `https://your-domain.com/backend/api/auth/create-admin.php` to create the default admin user:
- Email: admin@examprep.com
- Password: Admin@123456

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Ensure your PHP backend is sending the appropriate CORS headers
   - Check `backend/config/config.php` for CORS configuration

2. **Database Connection Issues**:
   - Verify database credentials are correct
   - Check if the database server is accessible from your PHP hosting

3. **404 Errors for API Endpoints**:
   - Check if .htaccess is properly uploaded and working
   - Verify URL paths in both frontend and backend code

4. **JWT Issues**:
   - Make sure the JWT secret is consistent
   - Check if token expiration time is appropriate

### Debugging Techniques

1. Add logging to your PHP files:
   ```php
   error_log('Debug: ' . print_r($variable, true));
   ```

2. Check the PHP error logs on your hosting

3. Add detailed console logging in your frontend services

## Production Considerations

1. Use HTTPS for all communication between frontend and backend
2. Set up proper security headers
3. Consider implementing rate limiting for API endpoints
4. Regularly backup your database
