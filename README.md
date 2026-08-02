

# CIVIX

CIVIX is an AI-powered civic technology platform that helps citizens report urban issues instantly and enables municipalities to resolve them faster, transparently, and more efficiently. 🌍

Built for smart city innovation, CIVIX bridges the gap between residents and civic departments by turning everyday complaints into actionable, trackable service requests. 🤝

🔗 Live Demo: https://civix-gamma-two.vercel.app/

🎥 Demo Video: https://drive.google.com/file/d/16Jsqx80boVNuuAHr22paprPCnID4pOBp/view?usp=sharing


---

## 🎯 Problem statement

Urban problems such as potholes, waterlogging, garbage accumulation, and streetlight failures often go unreported or unresolved because of:

- Slow and fragmented complaint reporting systems
- Poor categorization of civic issues
- Lack of transparency in resolution progress
- Delayed coordination between citizens and government departments

---

## 💡 Our solution

CIVIX provides a unified platform where citizens and civic authorities can work together seamlessly.

- Citizens can report issues using photos, location, and descriptions 📸
- AI analyzes the complaint and identifies the issue type and urgency 🤖
- Complaints are routed to the correct department automatically 🛣️
- Officials verify completion with proof-of-work images ✅
- Citizens can track progress and see real accountability 📊

---


CIVIX is more than a complaint portal. It is a practical, intelligent civic operations platform that combines AI, transparency, and public service delivery in one experience.

### Impact

| Area         | Impact                                                |
| ------------ | ----------------------------------------------------- |
| Speed        | Faster issue reporting and routing                    |
| Accuracy     | Better classification through AI                      |
| Transparency | Visible progress and verified closure                 |
| Governance   | Stronger accountability for civic departments         |
| Scalability  | Can be expanded to cities, towns, and public services |

---

## ✨ Key features

| Feature                      | What it does                                                    |
| ---------------------------- | --------------------------------------------------------------- |
| AI-powered issue reporting   | Detects issue type and urgency from uploaded photo and location |
| Smart civic routing          | Sends complaints to the correct department or response team     |
| Real-time dashboard          | Lets officials monitor active issues and resolution status      |
| Proof-of-work verification   | Prevents fake or incomplete closures                            |
| Citizen engagement           | Keeps citizens informed and involved                            |
| Analytics & hotspot tracking | Identifies recurring problem areas for better planning          |

---

## 👥 Who can use it

| User                  | Use case                                             |
| --------------------- | ---------------------------------------------------- |
| Citizens              | Report problems quickly and track progress           |
| Municipal departments | Receive, assign, and resolve complaints efficiently  |
| Field teams           | Act on verified service requests with accountability |
| City administrators   | Monitor civic service quality and trend analysis     |

---

## 🆚 How it is different from existing apps

| Existing apps               | CIVIX advantage                                           |
| --------------------------- | --------------------------------------------------------- |
| Basic complaint forms       | AI-assisted triage and smart classification               |
| Manual tracking systems     | Real-time status tracking and verified closure            |
| Department-siloed workflows | Cross-department routing and coordination                 |
| Low transparency            | Proof-of-work submission and citizen visibility           |
| Generic civic apps          | Focused on smart-city readiness and public accountability |

---

## 🛠️ Tech stack

| Layer           | Technology                   |
| --------------- | ---------------------------- |
| Frontend        | React + TypeScript           |
| Styling         | Tailwind CSS                 |
| Routing         | React Router                 |
| Backend support | Express                      |
| Database & auth | Firebase                     |
| AI integration  | Gemini / Groq-based services |
| Maps & location | Google Maps APIs             |

---

## 📁 Project structure

```text
civix/
├── src/
│   ├── components/         # Reusable UI blocks (navbar, AI copilot, widgets)
│   ├── pages/              # Route-level pages (feed, dashboard, report, map, analytics)
│   ├── utils/              # Utility helpers (API config, location, images, seed data)
│   ├── firebase.ts         # Firebase client setup (auth + firestore)
│   ├── gemini.ts           # AI query handling and issue analysis logic
│   └── App.tsx             # Main app routes and layout
├── server.ts               # Express server + AI API endpoints
├── firestore.rules         # Firestore security rules
├── firebase-blueprint.json # Firestore schema/collection blueprint
├── .env.example            # Environment variable template
└── README.md
```

---

## 🧠 How it is built

The application is built as a modern web platform with a responsive interface and AI-enhanced workflows. The frontend offers a seamless experience for citizens and officials, while the backend services support data flow, authentication, and AI-driven request handling.

The platform is designed to be scalable, modular, and suitable for deployment in real civic environments.

---

## 📈 Impact

CIVIX aims to improve:

- Response time for civic complaints ⚡
- Transparency in public service delivery 🔍
- Accountability for issue resolution ✅
- Overall quality of urban life through smarter governance 🏙️

---

## ▶️ Demo flow

1. A citizen reports an issue using a photo and location 📸
2. The platform analyzes the report and routes it intelligently 🤖
3. The responsible department receives and processes the request 🛠️
4. The issue is verified and closed with proof-of-work evidence ✅

---

## ▶️ Run locally

### Prerequisites

- Node.js

### Steps

1. Install dependencies: `npm install`
2. Create a `.env.local` file and add your required environment variables.
3. Start the development server: `npm run dev`

---

## 👥 Contributors

- [saireddydev1](https://github.com/saireddydev1)
- [Megna-pixel](https://github.com/Megna-pixel)
- [Hrushikesh-2006](https://github.com/Hrushikesh-2006)

---

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

The MIT license allows reuse, modification, and distribution while keeping the project open and accessible for hackathon, educational, and community use.

---

## 🏁 Conclusion

CIVIX reimagines civic engagement through intelligent automation, transparency, and public accountability. It is a practical, high-impact solution for modern cities looking to become faster, smarter, and more citizen-focused.
