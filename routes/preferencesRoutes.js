const express = require("express");
const { getPreferences, savePreferences } = require("../controllers/preferencesController");

const router = express.Router();

router.post("/preferences", savePreferences);
router.get("/preferences/:userId", getPreferences);

module.exports = router;