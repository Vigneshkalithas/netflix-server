import express from "express";
import {
  Login,
  Signup,
  Logout,
  GetUsers,
  //   Auth
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/logout", Logout);
router.get("/getall", GetUsers);
// router.post("/auth", Auth);

export default router;
