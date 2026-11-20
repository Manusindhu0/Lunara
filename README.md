# 🌕 LUNAR — 3D Virtual Moon Civilization & Citizen Identity System

An immersive, explorable 3D lunar colony civilization built with **React**, **Three.js**, **React Three Fiber (R3F)**, **Drei**, **TypeScript**, and **Tailwind CSS**.

---

## 🚀 Overview

**LUNAR** is a virtual Moon civilization situated at **Selenia Prime**. Real users explore a living colony surface, discover specialized districts, inspect architecture and subsystems, and obtain verified citizen identities with 3D astronaut representations.

### Key Highlights
- **Realistic 3D Lunar Environment**: Procedural lunar terrain, regolith surface textures, realistic craters, deep space sky with Earth visible in the lunar horizon, and cinematic lighting.
- **Six Identifiable Colony Districts**:
  - **NEXUS** — Central Command & Colony Hub
  - **FORGE** — Engineering, Manufacturing & Solar Grid
  - **EDEN** — Bioscience, Biodomes & Life Support
  - **AETHER** — Research, Science & Lunar Observatory
  - **BEACON** — Earth Deep-Space Communications & Quantum Relay
  - **HAVEN** — Pressurized Residential Habitats & Pioneer Quarters
- **Interactive Architecture**: Inspect individual buildings, solar panel fields, rovers, pressurized transit corridors, and real-time telemetry (power, structural integrity, radiation shielding, temperature).
- **Citizen Identity & Directory**:
  - Permanent, immutable Citizen IDs (`LUN-XXXXX`).
  - Citizen Directory with real-time search, multi-department filtering, career ranks, and stats banner.
  - Interactive Astronaut Dossier (`/citizen/:id`) with Level, XP progress bar, Colony Credits (`CC`), and commendations/achievements showcase.
  - Stationed Personnel / Occupants lists inside building inspection panels.
  - **"LOCATE IN 3D WORLD"** camera tracking that focuses directly on any citizen's astronaut avatar in the 3D scene.
- **8-Step Enlistment Wizard (`/join`)**:
  - Live username and callsign availability verification.
  - Department and specialization selection.
  - EVA suit customizer (6 astronaut classes, 8 suit color palettes).
  - Holographic ID preview before submission.
  - Atmospheric descent and touchdown arrival sequence.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **3D Graphics & Canvas**: Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **Routing**: React Router DOM (`react-router-dom` v6)
- **Styling & UI**: Tailwind CSS, Lucide React icons, Chakra Petch & JetBrains Mono typography

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Manusindhu0/Lunara.git
cd Lunara

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to launch the 3D Lunar Colony.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🗺️ Application Routes

- `/world` — Interactive 3D Lunar Colony with cinematic camera controls, district HUD, building inspections, and citizen overlays. Supports deep-linking: `/world?focus=LUN-XXXXX`.
- `/citizens` — Colony Citizen Directory with filtering, sorting, search, and live population statistics.
- `/citizen/:citizenId` — Citizen Dossier & Identity record.
- `/join` — 8-step civilian onboarding & astronaut enlistment wizard.

---

## 📜 License

MIT License. Designed & Developed for the LUNAR Civilization Initiative.
