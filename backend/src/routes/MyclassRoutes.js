const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMyClass } = require("../controllers/MyclassController");
const { getScoresByClass } = require("../controllers/MyclassController");
const { updateScore } = require("../controllers/MyclassController");
const { getScoreDistributionByClass } = require("../controllers/MyclassController");

router.get("/", auth, getMyClass);
router.get("/:malop/scores", auth, getScoresByClass);
router.put("/:mahs/:hocky/:namhoc", auth, updateScore);
router.get("/:malop/scoresto", auth, getScoreDistributionByClass);
module.exports = router;
