"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subtaskController_1 = require("../controllers/subtaskController");
const jwtAuth_1 = __importDefault(require("../middlewares/jwtAuth"));
const router = (0, express_1.Router)();
router.use(jwtAuth_1.default);
router.post("/", subtaskController_1.createSubtask);
router.get("/:taskId", subtaskController_1.getSubtasks);
router.put("/:id", subtaskController_1.updateSubtask);
router.delete("/:id", subtaskController_1.deleteSubtask);
exports.default = router;
