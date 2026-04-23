import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');

    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: `You are a real estate expert. Analyze this document and identify all material facts that would affect a buyer's decision or property value.

Return ONLY valid JSON with no markdown, no backticks, no extra text. Use this exact structure:
{
  "documentType": "HOA Document or Inspection Report or Seller Disclosure or Other",
  "risks": [
    {
      "category": "category name",
      "severity": "high or medium or low",
      "description": "what the issue is and why it matters",
      "recommendation": "what to do about it"
    }
  ],
  "summary": "2-3 sentence summary of the most important findings"
}`,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch {
      analysis = { documentType: 'Unknown', risks: [], summary: text };
    }

    return Response.json({ success: true, analysis });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to analyze document' }, { status: 500 });
  }
}
