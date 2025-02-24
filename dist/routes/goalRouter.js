"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goalController_1 = require("../controllers/goalController");
const jwtAuth_1 = __importDefault(require("../middlewares/jwtAuth"));
const router = (0, express_1.Router)();
router.use(jwtAuth_1.default);
router.post("/", goalController_1.createGoal);
router.get("/", goalController_1.getGoals);
router.put("/:id", goalController_1.updateGoal);
router.delete("/:id", goalController_1.deleteGoal);
exports.default = router;
