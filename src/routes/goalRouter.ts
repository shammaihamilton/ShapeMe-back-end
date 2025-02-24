import { Router } from "express";
import { createGoal, getGoals, updateGoal, deleteGoal } from "../controllers/goalController";

import jwtAuth from "../middlewares/jwtAuth";

const router = Router();

router.use(jwtAuth);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
