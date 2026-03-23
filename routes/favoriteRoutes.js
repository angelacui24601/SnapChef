const express = require("express");
const { addFavorite, removeFavorite, getFavorites } = require("../controllers/favoritesController");

const router = express.Router();

router.post("/favorite", addFavorite);
router.delete("/favorite", removeFavorite);
router.get("/favorites/:userId", getFavorites);

module.exports = router;