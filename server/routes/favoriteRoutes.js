const express = require("express");
const { addFavorite, removeFavorite, getFavorites } = require("../controllers/favoritesController");
const { requireSession } = require("../middleware/requireSession");

const router = express.Router();

// All favorites routes are session-protected;
// userId is read from the signed cookie, not the URL or body.
router.post("/favorite", requireSession, addFavorite);
router.delete("/favorite", requireSession, removeFavorite);
router.get("/favorites", requireSession, getFavorites);

module.exports = router;
