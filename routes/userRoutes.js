const express = require("express");
const { syncUser } = require("../controllers/usersController");

const router = express.Router();

router.post("/users/sync", syncUser);

module.exports = router;