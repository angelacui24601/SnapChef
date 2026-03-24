const express = require("express");
const { syncUser, logoutUser } = require("../controllers/usersController");

const router = express.Router();

// Public — establishes the session cookie
router.post("/users/sync", syncUser);

// Public — clears the session cookie on sign-out
router.post("/auth/logout", logoutUser);

module.exports = router;
