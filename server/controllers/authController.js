cloudinary = require("../lib/cloudinary");

const { generateToken } = require("../lib/generateToken");
const user = require("../models/user");
const bcrypt = require("bcryptjs");

exports.postLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const checkUser = await user.findOne({ email });
  if (!checkUser) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  // Check if user has a password (email/password login)
  if (!checkUser.password) {
    return res.status(400).json({
      message:
        "Please login with Google. This account was created with Google.",
    });
  }

  const isCorrectPassword = await bcrypt.compare(password, checkUser.password);
  if (!isCorrectPassword) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }

  generateToken(checkUser._id, res);
  return res.status(201).json({
    _id: checkUser._id,
    fullname: checkUser.fullname,
    email: checkUser.email,
    profilePicture: checkUser.profilePicture,
  });
};

exports.postSignup = async (req, res) => {
  console.log(req.body);
  const { fullname, email, password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  const checkUser = await user.findOne({ email });
  if (checkUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  const newUser = new user({
    fullname,
    email,
    password: hashedPassword,
    loginSource: "chit-chat", // Set login source as email
  });
  if (newUser) {
    generateToken(newUser._id, res);
    await newUser.save();
    return res.status(201).json({
      _id: newUser._id,
      fullname: newUser.fullname,
      email: newUser.email,
      profilePicture: newUser.profilePicture,
      loginSource: newUser.loginSource,
    });
  } else {
    return res.status(500).json({ message: "Error creating user" });
  }
};

exports.postLogout = (req, res) => {
  res.cookie("token", "", {
    maxAge: 0,
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// At top of the file
// …


exports.checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getGoogle = (req, res) => {
  try {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();
    const url = google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);

    res.cookie("google_oath_state", state, {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Always use lax for OAuth (strict breaks OAuth flow)
      path: "/",
    });
    res.cookie("google_code_verifier", codeVerifier, {
      maxAge: 10 * 60 * 1000, // 10 minutes
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Always use lax for OAuth (strict breaks OAuth flow)
      path: "/",
    });

    res.redirect(url.toString());
  } catch (error) {
    console.error("Error in getGoogle:", error);
    res.status(500).json({ message: "Failed to initiate Google OAuth" });
  }
};

exports.getGoogleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;
    const {
      google_oath_state: storedState,
      google_code_verifier: codeVerifier,
    } = req.cookies;

    // Get the correct redirect URL based on environment
    const frontendURL =
      process.env.NODE_ENV === "production"
        ? "https://chit-chat-realtime-chat-app-2.onrender.com"
        : "http://localhost:5173";

    // More detailed validation with logging
    if (!code) {
      return res.redirect(`${frontendURL}/?login=error&reason=no_code`);
    }

    if (!state) {
      return res.redirect(`${frontendURL}/?login=error&reason=no_state`);
    }

    if (!storedState) {
      // Log for debugging
      console.log(
        "Missing stored state. Available cookies:",
        Object.keys(req.cookies)
      );
      return res.redirect(`${frontendURL}/?login=error&reason=no_stored_state`);
    }

    if (!codeVerifier) {
      return res.redirect(`${frontendURL}/?login=error&reason=no_verifier`);
    }

    if (state !== storedState) {
      console.log(
        "State mismatch - Expected:",
        storedState,
        "Received:",
        state
      );
      return res.redirect(`${frontendURL}/?login=error&reason=state_mismatch`);
    }

    let tokens;
    try {
      tokens = await google.validateAuthorizationCode(code, codeVerifier);
    } catch (error) {
      console.error("Error validating authorization code:", error);
      return res.redirect(
        `${frontendURL}/?login=error&reason=token_exchange_failed`
      );
    }

    const claims = decodeIdToken(tokens.idToken());
    const { sub: googleUserId, email, name } = claims;

    // Check if user already exists with Google ID
    let userData = await user.findOne({ googleId: googleUserId });

    if (!userData) {
      // Check if user exists with same email but different login source
      userData = await user.findOne({ email: email });

      if (userData) {
        // User exists with email login, ADD Google without changing login source
        userData.googleId = googleUserId;
        await userData.save();
      } else {
        // Create new user for Google login
        userData = new user({
          fullname: name,
          email: email,
          googleId: googleUserId,
          loginSource: "google",
          profilePicture: "/images/defaultProfilePic",
        });
        await userData.save();
      }
    }

    // Clear OAuth cookies
    res.clearCookie("google_oath_state");
    res.clearCookie("google_code_verifier");

    // Generate JWT token
    generateToken(userData._id, res);

    // Redirect to frontend with success
    res.redirect(`${frontendURL}/?login=success`);
  } catch (error) {
    console.error("Error in Google callback:", error);
    res.redirect(`${frontendURL}/?login=error&reason=server_error`);
  }
};
