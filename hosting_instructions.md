
# Hosting Instructions for ExamPrep on Hostinger

This guide provides step-by-step instructions for deploying the ExamPrep application on Hostinger shared hosting.

## Prerequisites

1. A Hostinger shared hosting account
2. Access to Hostinger control panel
3. Domain or subdomain pointed to your hosting account
4. FTP client (like FileZilla) or Hostinger File Manager

## Step 1: Database Setup

1. Log in to your Hostinger control panel
2. Navigate to the MySQL Databases section
3. Create a new database named `examprep_db`
4. Create a new database user with a strong password
5. Assign all privileges to the user for the `examprep_db` database
6. Import the SQL schema:
   - Download the `examprep_db.sql` file from your local environment
   - Use phpMyAdmin to import the SQL file into your database

## Step 2: Backend Configuration

1. Open the file `backend/config/database.php`
2. Update the database configuration:
   ```php
   private $host = "your_hostinger_mysql_host"; // Usually "localhost"
   private $db_name = "your_database_name"; // e.g., "examprep_db"
   private $username = "your_database_username";
   private $password = "your_database_password";
   ```

3. Open `backend/config/config.php` and update the JWT secret:
   ```php
   define('JWT_SECRET', 'your_secure_random_string');
   ```

## Step 3: Upload Files

1. Build the React frontend:
   ```bash
   npm run build
   ```

2. Using FTP or File Manager, upload:
   - All files from the `dist` directory to the `public_html` directory
   - All files from the `backend` directory to `public_html/backend`
   - Make sure to include the `.htaccess` files

## Step 4: File Permissions

Set appropriate permissions for the files and directories:

1. Directories: 755 (rwxr-xr-x)
2. Files: 644 (rw-r--r--)
3. Make sure PHP has write permissions to directories that need to write files (if any)

## Step 5: Testing

1. Access your website through your domain
2. Test the authentication system:
   - Try to create a new account
   - Try to log in with existing credentials
   - Test password reset functionality
3. Check the developer console for any errors

## Step 6: Create Admin User

1. Visit `https://yourdomain.com/backend/auth/create-admin.php` to create the admin user
2. You should see a JSON response with the admin credentials
3. Use these credentials to log in as admin

## Troubleshooting

### Common Issues

1. **500 Server Error**:
   - Check your PHP version (should be 8.1)
   - Check file permissions
   - Review PHP error logs

2. **Database Connection Errors**:
   - Verify database credentials
   - Check if your database user has appropriate permissions

3. **CORS Issues**:
   - Check if the CORS headers are being properly sent
   - Ensure the API endpoint URLs in the frontend are correct

### PHP Error Logs

To check PHP error logs:
1. Log in to Hostinger control panel
2. Navigate to "Files" > "Logs"
3. Check the error log for PHP errors

## Performance Optimization

1. **Enable browser caching**:
   Add to `.htaccess`:
   ```
   <IfModule mod_expires.c>
     ExpiresActive On
     ExpiresByType image/jpg "access plus 1 year"
     ExpiresByType image/jpeg "access plus 1 year"
     ExpiresByType image/gif "access plus 1 year"
     ExpiresByType image/png "access plus 1 year"
     ExpiresByType text/css "access plus 1 month"
     ExpiresByType application/pdf "access plus 1 month"
     ExpiresByType text/javascript "access plus 1 month"
     ExpiresByType application/javascript "access plus 1 month"
     ExpiresByType application/x-javascript "access plus 1 month"
     ExpiresByType application/x-shockwave-flash "access plus 1 month"
     ExpiresByType image/x-icon "access plus 1 year"
     ExpiresDefault "access plus 2 days"
   </IfModule>
   ```

2. **Enable GZIP compression**:
   Add to `.htaccess`:
   ```
   <IfModule mod_deflate.c>
     AddOutputFilterByType DEFLATE text/html
     AddOutputFilterByType DEFLATE text/css
     AddOutputFilterByType DEFLATE text/javascript
     AddOutputFilterByType DEFLATE text/xml
     AddOutputFilterByType DEFLATE text/plain
     AddOutputFilterByType DEFLATE application/javascript
     AddOutputFilterByType DEFLATE application/x-javascript
     AddOutputFilterByType DEFLATE application/json
   </IfModule>
   ```

## Security Considerations

1. Update the JWT secret key in `config.php` to a strong random value
2. Keep your database credentials secure
3. Consider using HTTPS (SSL) for your domain
4. Enable PHP error logging but disable display_errors in production
