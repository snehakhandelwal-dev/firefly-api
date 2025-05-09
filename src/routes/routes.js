const express = require("express");
const router = express.Router();

const userController = require("../controllers/userControllers");
const message_controller = require("../controllers/messageControllers");
//-----------Users Controllers----------------

router.post("/users/register", userController.register);
router.post("/users/login", userController.login);
router.post("/users/logout", userController.logout);
router.get("/profile/:userId", userController.getProfile);
router.get("/getOtherUsers/:userId", userController.getOtherUsers);
router.put("/profile/:userId", userController.updateProfile);
router.delete("/profile/:userId", userController.deleteProfile);


//-----------Messages Controllers----------------
router.post("/sendmessage/:userId/:receiverId", message_controller.sendMessage);
router.get("/getmessage/:userId/:receiverId", message_controller.getMessage);

module.exports = router;
