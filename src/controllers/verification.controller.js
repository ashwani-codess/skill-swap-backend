const skillModel = require("../models/Skill.model");
const groq = require("../utils/groq");
const asyncHandler = require("../utils/asyncHandler");
const { json } = require("express");

const startVerification = asyncHandler(async (req, res) => {
  const skill = await skillModel.findById(req.params.id);
  if (!skill) return res.status(404).json({ message: "skill not found" });
  if (skill.owner.toString() !== req.user._id.toString()) {
    return res.status(400).json({ message: "you are not owner of this skill" });
  }

  // Groq ko call karo — questions generate karne ke liye
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are a skill verification system. Generate exactly 5 short multiple choice questions to verify if someone truly knows "${skill.title}" at "${skill.level}" level.
                
                Return ONLY a JSON array like this, nothing else:
                [
                    {
                        "question": "question here",
                        "options": ["A", "B", "C", "D"],
                        "answer": "correct option here"
                    }
                ]`,
      },
    ],
    temperature: 0.5,
  });

  // Groq ka response parse karo
  const raw = response.choices[0].message.content;
  const questions = JSON.parse(raw);

  // Answers frontend ko mat bhejo — sirf questions aur options
  const safeQuestions = questions.map(({ question, options }) => ({
    question,
    options,
  }));

  // Answers temporarily store karo — baad mein evaluate karne ke liye
  // Session mein store karna chahte? Ya simple approach — answers model mein temporarily save karo
  skill.tempAnswers = JSON.stringify(questions);
  await skill.save();

  res.status(200).json({ questions: safeQuestions });
});

const submitVerification = asyncHandler(async (req, res) => {
  const skill = await skillModel.findById(req.params.id);
  if (!skill) return res.status(404).json({ message: "skill not found" });

  if (skill.owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "not authorized" });
  }

  // User ke answers lo
  const { answers } = req.body;
  // answers = ["A", "C", "B", "D", "A"] — array of 5 answers

  // Stored questions + correct answers nikalo
  const questions = JSON.parse(skill.tempAnswers);

  // Groq se evaluate karo
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `Evaluate these answers for a skill verification quiz.
                
                Questions and correct answers: ${JSON.stringify(questions)}
                User's answers: ${JSON.stringify(answers)}
                
                Return ONLY a JSON object, nothing else:
                {
                    "score": <number out of 5>,
                    "passed": <true if score >= 3, false otherwise>,
                    "feedback": "<one line feedback>"
                }`,
      },
    ],
    temperature: 0.1,
  });

  const result = JSON.parse(response.choices[0].message.content);

  // Score save karo
  skill.verificationScore = result.score;
  skill.isVerified = result.passed;
  skill.tempAnswers = null; // cleanup
  await skill.save();

  res.status(200).json({
    passed: result.passed,
    score: result.score,
    feedback: result.feedback,
    message: result.passed
      ? "Skill verified!"
      : "Verification failed — try again",
  });
});

module.exports = { startVerification, submitVerification };
