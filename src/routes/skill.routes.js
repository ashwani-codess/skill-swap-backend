const express= require("express")
const skillController=require("../controllers/skill.controller")
const {authMiddleware}=require("../middleware/auth.middleware")

const router=express.Router()


router.post('/createSkill',authMiddleware,skillController.createSkill)
router.get('/',skillController.getAllSkills)
router.get("/my", authMiddleware, skillController.getMySkills)
router.put("/:id",authMiddleware,skillController.updateSkill)
router.delete("/:id",authMiddleware, skillController.deleteSkill )
module.exports=router