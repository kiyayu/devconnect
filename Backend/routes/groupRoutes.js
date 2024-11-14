const express = require("express")
const {createGroup, getAllGroups}  = require("../controllers/groupController")  
const auth = require("../middleware/authMiddleware")  

const router = express.Router(); 

// Group routes
router.post("/create", auth, createGroup); // Create a new group
router.get("/groups", auth, getAllGroups); // Get all groups

module.exports =  router; 
