
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { createTransport } from "npm:nodemailer@6.9.10";
import { randomBytes } from "https://deno.land/std@0.110.0/node/crypto.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configure SMTP transporter
const transporter = createTransport({
  host: Deno.env.get("SMTP_HOST"),
  port: parseInt(Deno.env.get("SMTP_PORT") || "587"),
  secure: parseInt(Deno.env.get("SMTP_PORT") || "587") === 465,
  auth: {
    user: Deno.env.get("SMTP_USER"),
    pass: Deno.env.get("SMTP_PASSWORD"),
  },
});

// Helper function to generate a random token
function generateToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

// Helper function to send emails
async function sendEmail(to: string, subject: string, html: string) {
  return transporter.sendMail({
    from: Deno.env.get("EMAIL_FROM"),
    to,
    subject,
    html,
  });
}

// Helper function to create admin user
async function createAdminUserIfNotExists() {
  try {
    const adminEmail = "admin@examprep.com";
    
    console.log("Checking for admin user existence...");
    
    // First, check if admin user exists in auth.users
    const { data: authUser, error: authCheckError } = await supabase.auth.admin.getUserByEmail(adminEmail);
    
    let authUserId: string | null = null;
    
    if (authCheckError) {
      console.error("Error checking auth user:", authCheckError);
    }
    
    if (!authUser) {
      console.log("Admin auth user does not exist, creating...");
      // Create admin in auth.users
      const { data: newAuthUser, error: authCreateError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: "Admin@123456",
        email_confirm: true,
      });
      
      if (authCreateError) {
        console.error("Error creating auth user:", authCreateError);
        return null;
      }
      
      if (newAuthUser?.user?.id) {
        authUserId = newAuthUser.user.id;
        console.log("Created auth user with ID:", authUserId);
      } else {
        console.error("Failed to create auth user: No user ID returned");
        return null;
      }
    } else {
      authUserId = authUser.user.id;
      console.log("Admin auth user exists with ID:", authUserId);
    }
    
    if (!authUserId) {
      console.error("No auth user ID available");
      return null;
    }
    
    // Now check if admin user exists in public.users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, is_active')
      .eq('email', adminEmail)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error("Error checking for admin in users table:", checkError);
      return null;
    }
    
    if (existingUser) {
      console.log("Admin user exists in users table, checking if active...");
      
      // If admin exists but is not active, activate it
      if (!existingUser.is_active) {
        console.log("Activating existing admin user...");
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_active: true })
          .eq('id', existingUser.id);
          
        if (updateError) {
          console.error("Error activating admin user:", updateError);
          return null;
        } else {
          console.log("Admin user activated successfully");
        }
      } else {
        console.log("Admin user is already active");
      }
      
      return existingUser.id;
    } else {
      console.log("Admin user does not exist in users table, creating...");
      
      // Insert admin user into users table
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert({
          id: authUserId,
          email: adminEmail,
          name: "Admin User",
          username: "admin",
          role: "admin",
          is_active: true,
          password_hash: 'managed_by_supabase',
        })
        .select();

      if (insertError) {
        console.error("Error inserting admin user:", insertError);
        return null;
      }
      
      if (!insertData || insertData.length === 0) {
        console.error("Failed to create admin user in users table");
        return null;
      }

      console.log("Admin user created successfully in users table");
      return authUserId;
    }
  } catch (error) {
    console.error("Error in createAdminUserIfNotExists:", error);
    return null;
  }
}

// Generate activation email
function generateActivationEmail(name: string, activationUrl: string) {
  return `
    <h1>Activate your ExamPrep account</h1>
    <p>Hello ${name},</p>
    <p>Thank you for signing up for ExamPrep. Please click the button below to activate your account:</p>
    <p>
      <a href="${activationUrl}" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
        Activate Account
      </a>
    </p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${activationUrl}</p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
    <p>Best regards,<br>The ExamPrep Team</p>
  `;
}

// Generate password reset email
function generateResetPasswordEmail(name: string, resetUrl: string) {
  return `
    <h1>Reset your ExamPrep password</h1>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Please click the button below to set a new password:</p>
    <p>
      <a href="${resetUrl}" style="display:inline-block; background-color:#4F46E5; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">
        Reset Password
      </a>
    </p>
    <p>Or copy and paste this URL into your browser:</p>
    <p>${resetUrl}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>Best regards,<br>The ExamPrep Team</p>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    console.log(`Handling request for path: ${path}, method: ${req.method}`);

    // Handle admin user creation (for development purposes)
    if (req.method === "GET" && path === "create-admin") {
      console.log("Attempting to create/activate admin user...");
      const adminId = await createAdminUserIfNotExists();
      
      if (adminId) {
        return new Response(
          JSON.stringify({ 
            message: "Admin user created or already exists and is activated", 
            credentials: { 
              email: "admin@examprep.com", 
              password: "Admin@123456" 
            } 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      } else {
        return new Response(
          JSON.stringify({ error: "Failed to create admin user" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    }

    // Handle signup
    if (req.method === "POST" && path === "signup") {
      const { name, email, username, password } = await req.json();

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('email, username')
        .or(`email.eq.${email},username.eq.${username}`)
        .maybeSingle();

      if (checkError) {
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (existingUser) {
        if (existingUser.email === email) {
          return new Response(
            JSON.stringify({ error: "Email already in use" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        if (existingUser.username === username) {
          return new Response(
            JSON.stringify({ error: "Username already taken" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
      }

      // Create user in Supabase auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
      });

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authData || !authData.user || !authData.user.id) {
        throw new Error("Failed to create user: No user ID returned");
      }

      // Generate activation token
      const activationToken = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      // Insert user into users table
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          username,
          password_hash: 'managed_by_supabase',
          role: 'student',
          is_active: false,
        });

      if (insertError) {
        throw new Error(`Insert error: ${insertError.message}`);
      }

      // Store activation token
      const { error: tokenError } = await supabase
        .from('activation_tokens')
        .insert({
          user_id: authData.user.id,
          token: activationToken,
          expires_at: expiresAt.toISOString(),
        });

      if (tokenError) {
        throw new Error(`Token error: ${tokenError.message}`);
      }

      // Send activation email
      const activationUrl = `${url.origin.replace('/functions/v1/auth', '')}/auth/activate?token=${activationToken}`;
      await sendEmail(email, "Activate your ExamPrep account", generateActivationEmail(name, activationUrl));

      return new Response(
        JSON.stringify({ message: "User created successfully. Please check your email to activate your account." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle account activation
    if (req.method === "GET" && path === "activate") {
      const token = url.searchParams.get('token');
      
      if (!token) {
        return new Response(
          JSON.stringify({ error: "Invalid activation link" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Verify token
      const { data: tokenData, error: tokenError } = await supabase
        .from('activation_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired activation token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        return new Response(
          JSON.stringify({ error: "Activation link has expired" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Activate user
      const { error: updateError } = await supabase
        .from('users')
        .update({ is_active: true })
        .eq('id', tokenData.user_id);

      if (updateError) {
        throw new Error(`Update error: ${updateError.message}`);
      }

      // Delete used token
      await supabase
        .from('activation_tokens')
        .delete()
        .eq('token', token);

      // Redirect to login page with success message
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: `${url.origin.replace('/functions/v1/auth', '')}/login?activated=true`,
        },
      });
    }

    // Handle login
    if (req.method === "POST" && path === "login") {
      console.log("Processing login request...");
      const { email, password } = await req.json();

      // Check if user is active
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_active')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        console.error(`User check error: ${userError.message}`);
        throw new Error(`User check error: ${userError.message}`);
      }

      if (!userData) {
        return new Response(
          JSON.stringify({ error: "Account not found. Please sign up first." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      if (!userData.is_active) {
        return new Response(
          JSON.stringify({ error: "Account not active. Please check your email for the activation link." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Attempt to sign in
      console.log("Attempting to sign in with Supabase auth...");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

      console.log("Login successful");
      return new Response(
        JSON.stringify({ user: data.user, session: data.session }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle forgot password
    if (req.method === "POST" && path === "forgot-password") {
      const { email } = await req.json();

      // Check if user exists and is active
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, is_active')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        throw new Error(`User check error: ${userError.message}`);
      }

      if (!userData) {
        // We don't want to reveal if an email exists for security reasons
        return new Response(
          JSON.stringify({ message: "If your email is registered, you will receive a password reset link." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
        );
      }

      if (!userData.is_active) {
        return new Response(
          JSON.stringify({ error: "Account not active. Please activate your account first." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Generate reset token
      const resetToken = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

      // Store reset token
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .insert({
          user_id: userData.id,
          token: resetToken,
          expires_at: expiresAt.toISOString(),
        });

      if (tokenError) {
        throw new Error(`Token error: ${tokenError.message}`);
      }

      // Send reset email
      const resetUrl = `${url.origin.replace('/functions/v1/auth', '')}/auth/reset-password?token=${resetToken}`;
      await sendEmail(email, "Reset your ExamPrep password", generateResetPasswordEmail(userData.name, resetUrl));

      return new Response(
        JSON.stringify({ message: "If your email is registered, you will receive a password reset link." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Handle password reset
    if (req.method === "POST" && path === "reset-password") {
      const { token, password } = await req.json();

      if (!token || !password) {
        return new Response(
          JSON.stringify({ error: "Token and new password are required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Verify token
      const { data: tokenData, error: tokenError } = await supabase
        .from('password_reset_tokens')
        .select('user_id, expires_at')
        .eq('token', token)
        .maybeSingle();

      if (tokenError || !tokenData) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired reset token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        return new Response(
          JSON.stringify({ error: "Reset link has expired" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        tokenData.user_id,
        { password }
      );

      if (updateError) {
        throw new Error(`Password update error: ${updateError.message}`);
      }

      // Delete used token
      await supabase
        .from('password_reset_tokens')
        .delete()
        .eq('token', token);

      return new Response(
        JSON.stringify({ message: "Password reset successful. You can now log in with your new password." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // If no matching endpoint
    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
