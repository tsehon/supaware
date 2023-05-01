const express = require('express');
const router = express.Router();
import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();
console.log("OpenAI engines: ", response.data);

import openai from 'openai';
// @ts-ignore
import { OPENAI_API_KEY } from '@env';

async function getHealthInsights() {
    for (const device of getDeviceInstancesArray()) {
        if (device.is_connected) {
            await device.fetchData();
            const prompt = device.createPromptWithData();
        }
    }

    try {
        const response = await openai.Completion.create({
            engine: 'davinci-codex',
            prompt,
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0.5,
        });

        if (response && response.choices && response.choices.length > 0) {
            return response.choices[0].text.trim();
        } else {
            throw new Error('No response from OpenAI API');
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'Failed to get health insights.';
    }
}

router.get('/health-insights', async (req, res) => {
});

module.exports = router;
