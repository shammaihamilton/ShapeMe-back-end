import { Router } from "express";
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  deleteSubtask,
} from "../controllers/subtaskController";
import jwtAuth from "../middlewares/jwtAuth";

const router = Router();

router.use(jwtAuth); 

router.post("/", createSubtask);
router.get("/:taskId", getSubtasks);
router.put("/:id", updateSubtask);
router.delete("/:id", deleteSubtask);

export default router;
