
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

      // Generate activation token
      const activationToken = generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

      // Insert user into users table with activation token
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
      const { email, password } = await req.json();

      // Check if user is active
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_active')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        throw new Error(`User check error: ${userError.message}`);
      }

      if (!userData || !userData.is_active) {
        return new Response(
          JSON.stringify({ error: "Account not active or does not exist. Please check your email for the activation link." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return new Response(
          JSON.stringify({ error: "Invalid credentials" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
        );
      }

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
