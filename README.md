# CIVIX

CIVIX is an AI-powered civic issue management platform designed to help cities respond faster, smarter, and more transparently to public problems. It brings citizens, officials, and city systems into one intelligent workflow for reporting, triaging, tracking, and resolving civic issues.

## Problem Statement

Urban communities often face delays in reporting and resolving civic problems such as broken street lights, potholes, garbage overflow, water leakage, drainage issues, and poor public services. Traditional complaint systems are fragmented, slow, and difficult for citizens to trust.

CIVIX addresses this by creating a simple, public-facing platform where citizens can report issues, AI can assist in categorizing and routing them, and officials can monitor progress in a structured way.

## Problem -> Impact -> Solution -> USP

- Problem: Civic complaints are often unstructured, delayed, and hard to route to the relevant department.
- Impact: Delayed service leads to public frustration, unresolved infrastructure issues, and low trust in local governance.
- Solution: CIVIX combines citizen reporting, real-time city visibility, and AI-assisted issue triage in one unified experience.
- USP: A complete smart-city workflow that feels practical, intelligent, and easy to demonstrate in a hackathon setting.

## Why This Solution Matters

CIVIX is built to improve public service delivery by making civic engagement faster and more accountable. It reduces friction for citizens, helps officials prioritize issues, and gives cities a clearer operational picture of recurring problems.

## Core Features

### AI Integration
- AI-assisted issue analysis for category, urgency, and department suggestion
- Civic assistant for public queries related to municipal services and governance
- Intelligent fallback logic to ensure the experience remains functional even when external AI services are unavailable 

### Citizen Experience
- Report civic issues with title, description, location, and supporting details
- Browse issues in a live civic feed
- View issues on an interactive city map
- Engage with public issues through likes and comments
- Track personal contributions and civic progress

### Official & City Operations View
- Department-oriented issue handling workflow
- Status tracking for open, in-progress, and resolved issues
- A dashboard experience designed for oversight, accountability, and operational visibility

## AI Workflow

CIVIX uses AI as a meaningful part of the product experience:

1. A citizen reports a civic issue.
2. The system analyzes the issue text using an AI-driven workflow.
3. The issue is classified into a relevant category and routed toward the most suitable department.
4. The issue becomes visible in the live feed and map for public awareness.
5. Officials can review, resolve, and track the issue with a structured workflow.

This makes AI a core part of the solution rather than a decorative feature.

## Architecture & Implementation

CIVIX is built as a practical full-stack web application with a real-time backend and an active AI layer:

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS and Motion
- Backend / Database: Firebase Firestore for real-time issue storage and updates
- Authentication: Firebase Authentication
- Maps: Google Maps integration
- AI Layer: Express-based backend APIs that connect to AI models for analysis and chat responses

The application uses real-time Firestore listeners, so issues update live as they are created, modified, and resolved.

## Tech Stack

- React
- TypeScript
- Vite
- Firebase Firestore
- Firebase Authentication
- Google Maps API
- Tailwind CSS
- Framer Motion
- Express.js
- AI model APIs for issue analysis and civic assistant responses

## Demo Flow for Judges

A demo can follow this flow:

1. Open the app and show the civic landing experience.
2. Report a realistic issue such as a street light outage or water leakage.
3. Demonstrate AI-based classification and department routing.
4. Show the issue appear in the live feed and city map.
5. Highlight the official workflow and public visibility of the issue.


## Why This Project Stands Out

CIVIX combines three qualities that are highly valued in:

- A real-world social impact problem
- Meaningful AI integration that supports decision-making
- A polished, demo-friendly user experience

It is designed to feel like a practical product that could be adopted by civic-tech teams, municipalities, or smart-city initiatives.

## Local Development

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file by copying [.env.example](.env.example) and filling in the required values.

Required environment variables include:

- Firebase configuration values
- Google Maps API key
- AI backend environment values if using the AI endpoints locally

### Run Locally

```bash
npm run dev
```

## Environment Variables

Example configuration is available in [.env.example](.env.example).

Key values include:

- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_GOOGLE_MAPS_API_KEY`

## Future Scope

The next version of CIVIX can expand into:

- automated department dispatch
- SLA and escalation tracking
- image-based issue validation
- multilingual citizen support
- predictive hotspot analytics for city planning

## License


