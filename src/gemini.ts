import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzeIssue = async (title: string, description: string) => {
  const prompt = `
    Analyze the following civic issue:
    Title: ${title}
    Description: ${description}
    
    Available Departments:
    - municipal: Municipal Administration
    - transport: Road Transport
    - electricity: Electricity Board
    - water: Water Works
    - education: Education Department
    - health: Health Department
    
    Available Categories:
    - pothole
    - garbage
    - water
    - electricity
    - drainage
    - street-light
    - other
    
    Tasks:
    1. Categorize the issue into one of the Available Categories.
    2. Determine the priority (Low, Medium, High, Critical)
    3. Select the most relevant department ID from the list above.
    
    Return the result in JSON format:
    {
      "category": "string",
      "priority": "string",
      "departmentId": "string",
      "reasoning": "string"
    }
  `;

  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, prompt })
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Groq failed, falling back to Gemini", error);
  }
  
  // Fallback to Gemini
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json"
    }
  });
  
  return JSON.parse(response.text);
};

export const agenticIntelligence = async (query: string, context: any[]) => {
  const prompt = `
    You are the CIVIX Agentic Intelligence Engine. 
    Analyze the following city data and answer the user's query.
    
    Data Context:
    ${JSON.stringify(context)}
    
    User Query: ${query}
    
    Provide a detailed analysis, identify trends, and suggest data-driven governance decisions.
  `;

  try {
    const response = await fetch('/api/ai/intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context, prompt })
    });
    if (response.ok) {
      const data = await response.json();
      return data.text;
    }
  } catch (error) {
    console.warn("Groq failed, falling back to Gemini", error);
  }
  
  // Fallback to Gemini
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt
  });
  
  return response.text;
};
