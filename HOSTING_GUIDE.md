
# Hosting Guide for ExamPrep on Hostinger

This guide explains how to deploy the ExamPrep application on Hostinger shared hosting.

## Prerequisites

1. A Hostinger shared hosting account
2. Access to Hostinger's cPanel
3. A domain or subdomain to use for the application
4. The ExamPrep application files (React frontend + PHP backend)

## Step 1: Database Setup

1. Log in to your Hostinger cPanel
2. Find and click on the "MySQL Databases" icon
3. Create a new database:
   - Enter a name for your database (e.g., `examprep_db`)
   - Click "Create Database"
4. Create a new database user:
   - Enter a username (e.g., `examprep_user`)
   - Enter a strong password
   - Click "Create User"
5. Add the user to the database:
   - Select the user and database you just created
   - Grant all privileges
   - Click "Add"
6. Import the database schema:
   - Go to phpMyAdmin from your cPanel
   - Select your database
   - Click on the "Import" tab
   - Choose the `db/examprep_db.sql` file from this project
   - Click "Go" to import the schema

## Step 2: Upload Application Files

1. Prepare your application files:
   - Build the React frontend: Run `npm run build` on your local machine
   - This will create a `dist` folder with the built frontend files

2. Upload files using FTP:
   - Connect to your Hostinger hosting using an FTP client (like FileZilla)
   - Use the FTP credentials provided by Hostinger
   - Navigate to the public_html folder (or a subdomain folder if using a subdomain)
   
3. Upload the following files and directories:
   - Upload all files from the `dist` directory to the root of your hosting
   - Create an `api` directory in the root
   - Upload all PHP files from the `api` directory to the `api` directory on your hosting
   - Upload the `.htaccess` file to the root directory

## Step 3: Configure the Application

1. Update database connection details:
   - Open the file `api/config/database.php` on your hosting
   - Update the following lines with your database details:
     ```php
     private $host = "localhost"; // Usually "localhost"
     private $db_name = "examprep_db"; // The database name you created
     private $username = "examprep_user"; // The database user you created
     private $password = "your_password"; // The password you set
     ```

2. Update JWT secret key:
   - Open the file `api/config/config.php` on your hosting
   - Update the following line with a strong random string:
     ```php
     define('JWT_SECRET', 'your_secure_random_string_here');
     ```

## Step 4: Set File Permissions

1. Set the correct file permissions:
   - PHP files: 644
   - Directories: 755
   
2. You can do this via FTP or using the File Manager in cPanel

## Step 5: Test the Application

1. Create an admin user:
   - Navigate to `https://yourdomain.com/auth/create-admin`
   - This will create an admin user with email `admin@examprep.com` and password `Admin@123456`
   
2. Try logging in:
   - Navigate to `https://yourdomain.com/login`
   - Use the admin credentials to log in
   
3. Test the application functionality:
   - Navigate to the admin dashboard
   - Try creating and viewing exams, questions, etc.

## Troubleshooting

If you encounter issues, check the following:

1. **Database Connection**:
   - Verify database credentials in `api/config/database.php`
   - Check if the database and tables exist

2. **API Requests**:
   - Check if the .htaccess file is working properly
   - Check if PHP is properly configured

3. **File Permissions**:
   - Ensure PHP files have correct permissions (644)
   - Ensure directories have correct permissions (755)

4. **PHP Version**:
   - Ensure your hosting is using PHP 8.1 or higher
   - You can change the PHP version in cPanel > PHP Version Manager

## Security Considerations

1. **JWT Secret**: Change the JWT_SECRET in config.php to a strong, random string
2. **Admin Password**: After the first login, change the admin password
3. **Database Password**: Use a strong password for your database user
4. **SSL Certificate**: Consider enabling an SSL certificate for your domain

## Maintenance

1. **Backups**: Regularly back up your database and files
2. **Updates**: Keep the application code updated with the latest security patches
3. **Logs**: Monitor error logs for any issues
4. **Scaling**: If your application grows, consider upgrading to a more powerful hosting plan

## Additional Resources

- Hostinger Documentation: https://www.hostinger.com/tutorials/
- PHP Documentation: https://www.php.net/docs.php
- MySQL Documentation: https://dev.mysql.com/doc/
