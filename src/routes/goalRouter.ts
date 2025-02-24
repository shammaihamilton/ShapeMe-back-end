import { Router } from "express";
import { createGoal, getGoals, updateGoal, deleteGoal } from "../controllers/goalController.js";

import jwtAuth from "../middlewares/jwtAuth.js";

const router = Router();

router.use(jwtAuth);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
