// services/GeminiService.js
import axios from 'axios';
import dotenv from 'dotenv';
import { response } from 'express';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const callGeminiAPI = async (message) => {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: message
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Gemini API Error:', error.response?.data || error.message);
        return error;
    }
};

export default callGeminiAPI;