const express = require("express");
const { getPreferences, savePreferences } = require("../controllers/preferencesController");
const { requireSession } = require("../middleware/requireSession");

const router = express.Router();

// All preference routes are session-protected;
// userId is read from the signed cookie, not the URL or body.
router.post("/preferences", requireSession, savePreferences);
router.get("/preferences", requireSession, getPreferences);

module.exports = router;
