const express = require("express")
const {createGroup, getAllGroups , deleteGroup, getGroupById, joinGroup,}  = require("../controllers/groupController")  
const auth = require("../middleware/authMiddleware")  
const upload = require("../middleware/groupIcon")
const router = express.Router(); 

// Group routes
router.post("/create", auth,  upload.single("groupIcon") ,  createGroup); // Create a new group
router.get("/groups", auth,getAllGroups); // Get all groups
router.delete("/group/:id", auth, deleteGroup); // Get all groups
router.get("/group/:id", auth, getGroupById)
router.post("/group/join/:groupId", auth, joinGroup);
module.exports =  router;  
