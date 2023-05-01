const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

router.post('/chat-completion', async (req, res) => {
    console.log("POST /openai/chat-completion");
    const { prompt } = req.body;

    try {
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
        });

        if (completion.status !== 200) {
            console.log("- Request incomplete, Status: ", completion.status);
            res.status(500).json({ error: response });
        }

        if (!completion.data.choices[0].message.content) {
            console.log("- Request incomplete, No text");
            return res.status(500).json({ error: response });
        }

        const data = completion.data.choices[0].message.content.trim();
        res.json(data);
    } catch (err) {
        console.log("- Request incomplete, Error: ", err);
        res.status(500).json({ error: err });
    }
});

module.exports = router;
