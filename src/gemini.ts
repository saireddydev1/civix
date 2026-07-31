const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

const buildApiUrl = (path: string) => `${apiBaseUrl}${path}`;

interface TriageResult {
  category: string;
  priority: string;
  departmentId: string;
  reasoning: string;
}

const fallbackTriageResult: TriageResult = {
  category: 'other',
  priority: 'Medium',
  departmentId: 'municipal',
  reasoning: 'AI triage was unavailable. Please review the issue manually.'
};

const isTriageResult = (value: unknown): value is TriageResult => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<TriageResult>;
  return typeof candidate.category === 'string'
    && typeof candidate.priority === 'string'
    && typeof candidate.departmentId === 'string'
    && typeof candidate.reasoning === 'string';
};

export const analyzeIssue = async (title: string, description: string): Promise<TriageResult> => {
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
    const response = await fetch(buildApiUrl('/api/ai/analyze'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, prompt })
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!isTriageResult(data)) {
      throw new Error('AI returned an invalid triage payload');
    }

    return data;
  } catch (error) {
    console.error('AI analysis unavailable:', error);
    return fallbackTriageResult;
  }
};

export const agenticIntelligence = async (query: string, context: unknown[]) => {
  const prompt = `
    You are the CIVIX Agentic Intelligence Engine. 
    Analyze the following city data and answer the user's query.
    
    Data Context:
    ${JSON.stringify(context)}
    
    User Query: ${query}
    
    Provide a detailed analysis, identify trends, and suggest data-driven governance decisions.
  `;

  try {
    const response = await fetch(buildApiUrl('/api/ai/intelligence'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, context, prompt })
    });

    if (!response.ok) {
      throw new Error(`AI intelligence failed with status ${response.status}`);
    }

    const data = await response.json();
    return typeof data?.text === 'string' ? data.text : 'AI intelligence is currently unavailable.';
  } catch (error) {
    console.error('AI intelligence unavailable:', error);
    return 'AI intelligence is currently unavailable. Please try again later.';
  }
};
