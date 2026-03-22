import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'image/*',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const contentType = res.headers.get('content-type');
    if (!contentType?.startsWith('image/')) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: 'No image provided' });
      return;
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      tools: [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search',
          max_uses: 6,
        },
      ],
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: `Analyze this person's face shape from the selfie. Determine their face shape (oval, round, square, heart, oblong, diamond, etc.) and recommend 6 specific haircut styles that would suit them best.

For each recommended haircut, search the web to find a real reference photo URL showing what that haircut looks like. Look for direct image URLs (ending in .jpg, .png, .webp) from hairstyle blogs, Pinterest CDN (i.pinimg.com), salon websites, or similar sources. The URL must point directly to an image file, not a webpage.

After searching, respond with ONLY this JSON (no other text before or after):
{
  "faceShape": "the detected face shape",
  "confidence": "high/medium/low",
  "description": "A brief 1-2 sentence description of why this face shape was determined",
  "recommendations": [
    {
      "name": "Haircut Style Name",
      "description": "Brief description of why this suits their face shape",
      "gender": "unisex/male/female",
      "imageUrl": "https://direct-url-to-reference-image.jpg"
    }
  ]
}`,
            },
          ],
        },
      ],
    });

    // Handle pause_turn by continuing the conversation
    let finalMessage = message;
    while (finalMessage.stop_reason === 'pause_turn') {
      finalMessage = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        tools: [
          {
            type: 'web_search_20250305' as const,
            name: 'web_search',
            max_uses: 6,
          },
        ],
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType || 'image/jpeg',
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: 'Please continue and provide the final JSON response.',
              },
            ],
          },
          { role: 'assistant', content: finalMessage.content },
        ],
      });
    }

    // Extract the last text block (final answer after all web searches)
    const textBlocks = finalMessage.content.filter(
      (c): c is Anthropic.TextBlock => c.type === 'text'
    );
    const lastText = textBlocks[textBlocks.length - 1];

    if (!lastText) {
      res.status(500).json({ error: 'No text response from Claude' });
      return;
    }

    const jsonMatch = lastText.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: 'Could not parse response' });
      return;
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Proxy-fetch each image URL to base64 to avoid CORS issues on the frontend
    if (analysis.recommendations) {
      const imagePromises = analysis.recommendations.map(
        async (rec: { imageUrl?: string }) => {
          if (rec.imageUrl) {
            const base64 = await fetchImageAsBase64(rec.imageUrl);
            if (base64) {
              rec.imageUrl = base64;
            } else {
              // Keep original URL as fallback — frontend can try or show placeholder
              rec.imageUrl = rec.imageUrl;
            }
          }
        }
      );
      await Promise.all(imagePromises);
    }

    res.json(analysis);
  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const message = error instanceof Error ? error.message : 'Analysis failed';
    res.status(500).json({ error: message });
  }
});

app.post('/api/generate', async (req, res) => {
  try {
    const { imageBase64, mimeType, haircutStyle } = req.body;

    if (!imageBase64 || !haircutStyle) {
      res.status(400).json({ error: 'Image and haircut style required' });
      return;
    }

    const prompt = `Edit this photo of a person to show them with a ${haircutStyle} haircut. Show all 4 angles in a 2x2 grid: front view (top-left), left side view (top-right), right side view (bottom-left), and back view (bottom-right). Keep the person's face and features exactly the same, only change the hair to match a ${haircutStyle} style. Make it look photorealistic and natural. Label each angle.`;

    const response = await genai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imageBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        thinkingConfig: {
          thinkingLevel: 'MEDIUM',
        },
      },
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const images: string[] = [];
    let text = '';

    for (const part of parts) {
      if (part.inlineData) {
        images.push(
          `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
        );
      }
      if (part.text && !part.thought) {
        text += part.text;
      }
    }

    if (images.length === 0) {
      res.status(500).json({ error: 'No images generated' });
      return;
    }

    res.json({ images, text });
  } catch (error: unknown) {
    console.error('Generation error:', error);
    const message =
      error instanceof Error ? error.message : 'Image generation failed';
    res.status(500).json({ error: message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
