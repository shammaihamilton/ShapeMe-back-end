import { Router } from "express";
import jwtAuth from "../middleware/jwtAuth.js";
import { getUser, postUser, putUser, deleteUser, getUsers, } from "../controllers/userController.js";
import { logOut, login, auth, forgotPassword, resetPassword, registerUser, } from "../controllers/authController.js";
const router = Router();
// Public routes
router.post("/login", login);
router.post("/register", registerUser);
router.post("/resetPassword", resetPassword);
router.post("/forgotPassword", forgotPassword);
// Protected routes
router.use(jwtAuth);
router.get("/logout", logOut);
router.get("/auth", auth);
router.get("/get/:id", getUser);
router.get("/getAll", getUsers);
router.post("/add", postUser);
router.put("/update/:id", putUser);
router.delete("/delete/:id", deleteUser);
export default router;
