const skillModel = require('../models/Skill.model')
const userModel = require('../models/user.model')
const asyncHandler = require('../utils/asyncHandler')

const createSkill = asyncHandler(async (req, res) => {
    const { title, description, category, level } = req.body
    const owner = req.user._id //req.user._id isliye available hai kyunki tumhara protect middleware pehle chalta hai aur JWT decode karke req.user set karta hai.
    // Rule — owner, userId, ya koi bhi sensitive field kabhi req.body se mat lo. Hamesha req.user se lo.
    const skill = await skillModel.create({
        title, description, level, category, owner
    })

    await userModel.findByIdAndUpdate(owner, {
        $push: { skillsOffered: skill._id }
    })
    res.status(201).json(skill)
})

const getMySkills = asyncHandler(async (req, res) => {
    const skills = await skillModel.find({ owner: req.user._id })
    res.status(200).json({ skills })
})

const getAllSkills = asyncHandler(async (req, res) => {
    const { category, level, search } = req.query
    const filter = {};
    if (category) filter.category = category
    if (level) filter.level = level
    if (search) filter.title = { $regex: search, $options: 'i' }
    const skills = await skillModel.find(filter).populate('owner', 'name role')
    res.status(200).json({ skills })
})

const updateSkill = asyncHandler(async (req, res) => {
    const skill = await skillModel.findById(req.params.id)
    if (!skill) {
        return res.status(404).json({ message: "no such skill found" })
    }

    const owner = req.user._id
    if (skill.owner.toString() === owner.toString()) {
        const updatedSkill = await skillModel.findByIdAndUpdate(req.params.id, req.body, { new: true })
        res.status(200).json(updatedSkill)
    }
    else return res.status(403).json({
        message: "you arent authorised to update"
    })
})

const deleteSkill = asyncHandler(async (req, res) => {
    const skill = await skillModel.findById(req.params.id)
    if (!skill) return res.status(404).json({ message: "no such skill exist" })
    const owner = req.user._id;
    if (owner.toString() !== skill.owner.toString()) {
        return res.status(403).json({
            message: "you arent authorised to delete it "
        })
    }
    await skillModel.findByIdAndDelete(req.params.id)
    await userModel.findByIdAndUpdate(req.user._id, {
        $pull: { skillsOffered: skill._id }
    })
    res.status(200).json({ message: "skills deleted successfully " })
})

// Params vs Query — Difference
// req.params — URL ka part hota hai, kisi specific cheez ko identify karta hai
// /api/skills/abc123
//              ↑ yeh params.id hai — "mujhe YEH specific skill chahiye"
// req.query — URL ke baad ? ke baad aata hai, filtering/searching ke liye hota hai
// /api/skills?category=tech&level=rookie
//              ↑ yeh query hai — "mujhe IN conditions ki skills chahiye"
module.exports = { createSkill, getMySkills, getAllSkills, updateSkill, deleteSkill }