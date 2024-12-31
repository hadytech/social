const express = require("express");
const User = require("../models/user.model.js");
const router = express.Router();
const { getUsers, getSingleUser, createUser, editUser, deleteUser } = require("../controllers/user.controller.js");

router.get('/', getUsers);
router.get('/:id', getSingleUser);
router.post('/', createUser);
router.put('/:id', editUser);
router.delete('/:id', deleteUser);

module.exports = router;