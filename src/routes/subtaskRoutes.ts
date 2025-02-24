import { Router } from "express";
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtaskController.js";
import jwtAuth from "../middlewares/jwtAuth.js";

const router = Router();

router.use(jwtAuth); 

router.post("/", createSubtask);
router.get("/:taskId", getSubtasks);
router.put("/:id", updateSubtask);
router.delete("/:id", deleteSubtask);

export default router;
