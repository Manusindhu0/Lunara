# LUNAR — Phase 3 Architecture & Migration Plan

> **Scope:** Read-only architectural audit of `/Users/jaani/Desktop/lunar/src`, `package.json`, `vite.config.ts`, `tsconfig.json`, and `index.html`. No existing source files were modified.

---

## 1. Current Frontend Audit Summary

### 1.1 Build, Tooling & Routing (`package.json`, `vite.config.ts`, `tsconfig.json`, `src/App.tsx`)
- **Stack:** React `^18.3.1`, TypeScript `~5.7.2` (`strict: true`), Vite `^6.1.0`, Tailwind CSS `^3.4.19`, `react-router-dom` `^6.30.6`, `@react-three/fiber` `^8.17.14`, `@react-three/drei` `^9.121.4`, `three` `^0.173.0`, `lucide-react` `^0.475.0`.
- **Dev Server (`vite.config.ts`):** Runs on port `5173` (`host: true`) with no `/api` proxy configured yet. Phase 3 must add a Vite `/api` proxy (or aligned CORS + `credentials: 'include'`) so `HttpOnly` session cookies and CSRF headers work seamlessly in local dev.
- **Routing (`src/App.tsx`):**
  - `BrowserRouter` wraps `CitizenProvider` → `ColonyProvider` → `Routes`:
    - `/` → `<Navigate to="/world" replace />`
    - `/world` → `WorldPage` (supports `?focus=LUN-XXXXX` query param)
    - `/citizens` → `CitizenDirectoryPage`
    - `/citizen/:citizenId` → `CitizenProfilePage`
    - `/join` → `JoinPage` (7-step registration wizard + step 8 arrival sequence)
    - `*` → `<Navigate to="/world" replace />`
- **CSS Layout Caveat (`src/index.css`):** `body` currently sets `width: 100vw; height: 100vh; overflow: hidden;`. `WorldPage` relies on `w-screen h-screen overflow-hidden`, whereas `CitizenDirectoryPage`, `CitizenProfilePage`, `JoinPage`, and future Phase 3 auth/onboarding pages use `min-h-screen`. Ensure non-world pages use an inner scroll container (`h-screen overflow-y-auto`) or scope `overflow-hidden` to `WorldPage` so tall forms remain scrollable.

### 1.2 State, Services & Direct-Coupling Findings
- **`CitizenContext` (`src/context/CitizenContext.tsx`):** Wraps `citizenService` synchronously (`getAll`, `register`, `search`, `getById`, `getByUsername`, `isUsernameTaken`) and subscribes via `citizenService.subscribe`.
- **`ColonyContext` (`src/context/ColonyContext.tsx`):** Manages 3D scene selection, hover, camera targets/presets, graphics quality, time of day, and maintains `citizens: CitizenData[]` adapted from `citizenService.getAll()` via `toCitizenDataArray`.
- **Direct `citizenService` imports bypassing `CitizenContext` (must be refactored in Phase 3):**
  - `src/components/ui/BuildingInfoPanel.tsx` calls `citizenService.getByBuildingId(selectedBuilding.id)`.
  - `src/components/ui/CitizenProfileModal.tsx` calls `citizenService.getById(selectedCitizen.id)`.
  - `src/pages/WorldPage.tsx` calls `citizenService.getById(focusId)` as a fallback for `?focus=`.
  - `src/components/ui/CitizenSearchModal.tsx` imports `citizenService` (unused) while filtering `useColony().citizens`.
- **Phase 1 Legacy File:** `src/data/citizens.ts` (`CITIZENS` with `CIT-1001` IDs) is not used by `citizenService.ts` (which seeds 26 entries from `DEMO_CITIZENS_SEED` with `LUN-00001`..`LUN-00026`). Keep `src/data/citizens.ts` untouched or archived; do not mix it into Phase 3.

---

## 2. What Is Preserved (Phase 1 & Phase 2)

| Layer | Preserved Files & Symbols | Role in Phase 3 |
| :--- | :--- | :--- |
| **Phase 1 3D World** | `ColonyScene.tsx`, `Lighting.tsx`, `SpaceSky.tsx`, `Earth.tsx`, `LunarTerrain.tsx`, `CorridorsAndRoads.tsx`, `DistrictManager.tsx`, `CameraController.tsx`, `SolarArrays.tsx`, `RoverVehicle.tsx`, `src/components/buildings/*`, `Astronaut.tsx` (`AstronautSwarm`) | **100% preserved unchanged.** `AstronautSwarm` reads `useColony().citizens` (`CitizenData[]`), so any backend or demo citizen adapted to `CitizenData` renders identically in 3D. |
| **Canonical World Data** | `src/data/districts.ts` (`DISTRICTS`), `src/data/buildings.ts` (`BUILDINGS`), `src/data/departments.ts` (`DEPARTMENTS`, `CAREER_RANKS`), `src/data/achievements.ts` (`ACHIEVEMENT_LIBRARY`) | **Canonical reference geometry & taxonomy.** Backend seeds and placement logic must match these exact IDs, coordinates, and enums. |
| **Phase 2 Adapter & ID** | `src/lib/citizenAdapter.ts` (`citizenToCitizenData`, `toCitizenDataArray`), `src/lib/citizenId.ts` (`CITIZEN_ID_PREFIX`, `generateCitizenId`, `parseCitizenId`, `isValidCitizenId`) | **Preserved.** `citizenAdapter.ts` continues converting `Citizen → CitizenData` for the 3D scene. `citizenId.ts` format `LUN-XXXXX` becomes server-authoritative in PostgreSQL. |
| **Phase 2 Placement** | `src/lib/citizenPlacement.ts` (`PLACEMENT_SLOTS`, `getDistrictForDepartment`, `assignPlacementSlot`) | **Logic mirrored on backend** so PostgreSQL citizens receive collision-free surface coordinates inside a transaction. |
| **Phase 2 UI & Pages** | `TopBar.tsx`, `DistrictHUD.tsx`, `CameraControlsHUD.tsx`, `BuildingInfoPanel.tsx`, `CitizenProfileModal.tsx`, `CitizenSearchModal.tsx`, `NotificationsModal.tsx`, `SettingsModal.tsx`, `CitizenDirectoryPage.tsx`, `CitizenProfilePage.tsx`, `JoinPage.tsx` | **Visual layout & UX preserved;** wired to `AuthContext` + API-backed `CitizenContext` (with `JoinPage` gated by verified account + Instagram eligibility in live mode). |

---

## 3. Visual Design Tokens (`index.css`, `tailwind.config.js`, `index.html`)

Preserve the dark orbital HUD aesthetic across all new Phase 3 auth, Instagram verification, and account pages:
- **Canvas & Surface Palette:**
  - Root background: `#05070a` (`body` and `ColonyScene` base)
  - Tailwind extended slate tokens: `slate.850` (`#151c28`), `slate.950` (`#070a10`)
  - Glassmorphic panels/modals: `bg-slate-950/80`–`bg-slate-950/95`, `backdrop-blur-md` / `backdrop-blur-xl`, `border-slate-800/80`–`border-slate-800/90`, `rounded-2xl` / `rounded-3xl`, `shadow-2xl`
  - Inputs: `bg-slate-900` / `bg-slate-900/90`, `border-slate-700/80`, `focus:border-cyan-500`
- **Typography (`index.html` Google Fonts + `tailwind.config.js`):**
  - `font-chakra`: `'Chakra Petch', sans-serif` — brand wordmark, headings, card titles, primary CTA buttons
  - `font-sans`: `'Inter', sans-serif` — body copy, descriptions, biographies (`#f8fafc` base text)
  - `font-mono`: `'JetBrains Mono', monospace` — Citizen IDs, telemetry, status pills, filters, metadata
- **Semantic & District/Department Accents:**
  - Primary UI CTA / Telemetry: Cyan (`cyan-400`/`cyan-500`/`cyan-600`, gradient `from-cyan-600 to-blue-600`)
  - Verified / Online: `emerald-400` / `emerald-950/80`
  - Credits / Founding / Caution: `amber-300`–`amber-400` / `amber-950/80`
  - Progression (Level/XP): `indigo-300`–`indigo-500` / `indigo-950`
  - Errors / Revoked / Suspended: `rose-400` / `rose-950/60`
  - District & Department Accents:
    - `NEXUS` / `SECURITY`: `#00f0ff` (district accent `#38bdf8`)
    - `FORGE` / `ENGINEERING`: `#f97316` (district accent `#fb923c`)
    - `EDEN` / `BIOSCIENCE`: `#10b981` (district accent `#34d399`)
    - `AETHER` / `RESEARCH`: `#a855f7` (district accent `#c084fc`)
    - `BEACON` / `COMMUNICATIONS`: `#3b82f6` (district accent `#60a5fa`)
    - `HAVEN` / `CULTURE`: `#eab308` (district accent `#fde047`)
- **Animations:** `.pulse-slow` keyframe in `src/index.css` plus Tailwind `animate-pulse` / `animate-ping` status beacons.

---

## 4. Exact Interface Contracts (Backend ↔ Frontend Parity)

### 4.1 Canonical Enums & Taxonomy
- **`DistrictId`:** `'NEXUS' | 'FORGE' | 'EDEN' | 'AETHER' | 'BEACON' | 'HAVEN'`
- **`DepartmentId`:** `'ENGINEERING' | 'BIOSCIENCE' | 'RESEARCH' | 'SECURITY' | 'COMMUNICATIONS' | 'CULTURE'`
- **`DEPARTMENT_DISTRICT_MAP`:**
  - `ENGINEERING → FORGE`
  - `BIOSCIENCE → EDEN`
  - `RESEARCH → AETHER`
  - `SECURITY → NEXUS`
  - `COMMUNICATIONS → BEACON`
  - `CULTURE → HAVEN`
- **`CareerRank`:** `'Citizen' | 'Specialist' | 'Senior Specialist' | 'Department Lead' | 'Mission Commander' | 'Colony Council'`
- **`CitizenStatus`:** `'ACTIVE' | 'ON DUTY' | 'RESEARCHING' | 'MAINTENANCE' | 'OFF-DUTY' | 'SUSPENDED'`
- **`AstronautType`:** `'engineer' | 'scientist' | 'medic' | 'commander' | 'technician' | 'civilian'`
- **`Department` (`src/data/departments.ts`):**
  ```ts
  interface Department {
    id: DepartmentId;
    name: string;
    primaryDistrictId: DistrictId;
    description: string;
    accentColor: string;
    professions: string[];
  }
  ```
  *(Note: Backend `Department.slug` should match `DepartmentId` or serialize `id: department.slug as DepartmentId`, `primaryDistrictId: department.districtId as DistrictId`.)*

### 4.2 `Citizen` & `CitizenData` Contracts
Backend public citizen endpoints (`GET /api/citizens`, `GET /api/citizens/:citizenId`, `POST /api/citizenship/register`, `GET /api/citizens/me`) must serialize responses matching the frontend `Citizen` contract (while **omitting** private fields such as `userId`, email, and internal `_internalId` on public endpoints):

```ts
export interface CitizenLocation {
  x: number;
  y: number;
  z: number;
  rotationY?: number;
  districtId: DistrictId;
  buildingId: string;
}

export interface Achievement {
  id: string;          // slug, e.g. 'FIRST_ARRIVAL'
  name: string;
  description: string;
  icon: string;        // lucide icon name
  unlockedAt?: string; // ISO-8601 timestamp
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ContributionStats {
  missionsCompleted: number;
  structuresContributed: number;
  totalContribution: number;
  evaSessions?: number;
  discoveryCount?: number;
}

export interface Citizen {
  _internalId?: string;        // Internal UUID; omit on public endpoints (owner /me only if needed)
  citizenId: string;           // "LUN-00001" — immutable, server-generated via CitizenSequence
  username: string;            // unique lowercase slug (3-20 chars, /^[a-z0-9_]{3,20}$/)
  displayName: string;
  avatarUrl: string | null;
  astronautType: AstronautType;
  suitColor: string;
  bio: string;
  department: DepartmentId;
  profession: string;          // validated against DEPARTMENTS[department].professions
  rank: CareerRank;
  districtId: DistrictId;
  buildingId: string;
  location: CitizenLocation;   // DB flat columns (positionX/Y/Z, rotationY, districtId, buildingId) mapped here
  currentActivity: string;
  status: CitizenStatus;
  joinedAt: string;            // ISO-8601
  xp: number;
  level: number;
  colonyCredits: number;
  achievements: Achievement[];
  isFoundingCitizen: boolean;
  contributionStats: ContributionStats;
  isDemo?: boolean;            // Frontend-only runtime tag for demo mode coexistence
}
```

- **3D Scene Adapter (`src/lib/citizenAdapter.ts`):** `citizenToCitizenData(c: Citizen): CitizenData` remains the sole bridge to `AstronautSwarm` and `ColonyContext`:
  - `id ← c.citizenId`
  - `name ← c.displayName`
  - `handle ← '@' + c.username`
  - `position ← [c.location.x, c.location.y, c.location.z]`
  - `rotationY ← c.location.rotationY ?? 0`
  - `role ← DEPARTMENTS[c.department]?.name ?? c.department`
  - `badges ← c.achievements.map(a => a.name)`
  - `avatarSeed ← c.username`
  - `joinDate ← c.joinedAt`
  - `biography ← c.bio`

### 4.3 `DistrictInfo`, `BuildingData` & `PlacementSlot` Contracts
- **`DistrictInfo` (`src/data/districts.ts`):**
  ```ts
  export interface DistrictInfo {
    id: DistrictId;
    name: string;
    tagline: string;
    description: string;
    center: [number, number, number];
    color: string;
    accentColor: string;
    buildingCount: number;
    citizenCount: number;
    lifeSupportLevel: string;
    powerGrid: string;
  }
  ```
  - Canonical centers `[x, y, z]`: `NEXUS [0,0,0]`, `FORGE [-85,0,45]`, `EDEN [75,0,-20]`, `AETHER [50,0,-85]`, `BEACON [-70,0,-75]`, `HAVEN [35,0,80]`.
  - `DistrictHUD` reads static `DISTRICTS` lore/telemetry; real active citizen counts per district can be overlayed from `citizens` without altering 3D geometry.
- **`BuildingData` (`src/data/buildings.ts`):**
  - 18 canonical building IDs across 6 districts (`nexus-core`, `nexus-transit-hub`, `nexus-atmos-dome`, `forge-smelter-alpha`, `forge-fusion-reactor`, `forge-assembly-hangar`, `eden-biodome-main`, `eden-hydroponics-west`, `eden-seed-vault`, `aether-optics-dome`, `aether-quantum-lab`, `aether-seismic-post`, `beacon-main-dish`, `beacon-laser-tower`, `beacon-telecom-relay`, `haven-hab-ring-a`, `haven-civic-center`, `haven-medical-center`).
  - `BuildingInfoPanel` displays `occupants` matched by `c.buildingId === selectedBuilding.id`.
- **`PlacementSlot` (`src/lib/citizenPlacement.ts`):**
  ```ts
  export interface PlacementSlot {
    districtId: DistrictId;
    buildingId: string;
    x: number;
    y: number;
    z: number;
    rotationY: number;
  }
  ```
  - **Server-authoritative placement parity:** Backend registration (`POST /api/citizenship/register`) must ignore any client-supplied coordinates and run the exact `PLACEMENT_SLOTS` (34 predefined slots) + `DEPARTMENT_DISTRICT_MAP` + district-center overflow jitter (`±10` units around `DISTRICTS[districtId].center` at `y = 0`) against currently persisted `Citizen` `(positionX, positionZ)` values inside the registration DB transaction.

### 4.4 Registration Payload Contract (`JoinPage` → Backend)
Matches `RegistrationFormData`:
```ts
export interface RegistrationFormData {
  username: string;      // 3-20 chars, [a-z0-9_], checked via GET /api/citizens/check-username?username=...
  displayName: string;   // >= 2 chars
  bio: string;           // >= 10 chars
  department: DepartmentId;
  profession: string;    // must belong to DEPARTMENTS[department].professions
  astronautType: AstronautType;
  suitColor: string;     // validated hex or preset suit color
}
```

---

## 5. Coexistence Strategy: `localStorage` Demo Mode vs. PostgreSQL Real Citizens

### 5.1 Core Principle: Strict Source Isolation
- **PostgreSQL is the sole source of truth for real citizens (`LUN-XXXXX`).** Phase 2 `DEMO_CITIZENS_SEED` and `localStorage` records (`lunar_citizens_v2`, `lunar_citizen_sequence_v2`) must **never** be migrated into PostgreSQL `User` or `Citizen` tables.
- **`localStorage` demo citizens cannot bypass Phase 3 auth/eligibility:** Local demo registration (`citizenService.register`) must only operate when Demo Mode is explicitly enabled or backend is offline, and never issues real `LUN-XXXXX` IDs or authenticated sessions.

### 5.2 Preventing ID & Coordinate Collisions
In Phase 2, `DEMO_CITIZENS_SEED` generates `LUN-00001`..`LUN-00026`. In Phase 3, PostgreSQL `CitizenSequence` also starts at `1` (`LUN-00001`). Without isolation, rendering both together causes React key collisions (`key={citizen.citizenId}` / `key={citizen.id}`), broken `/citizen/:citizenId` lookups, and colliding `?focus=` deep links.

**Coexistence Rules:**
1. **Live Mode (Default when `/api/health` succeeds):**
   - `CitizenContext` loads real citizens exclusively from `GET /api/citizens`.
   - `localStorage` demo citizens are **not** loaded into the live registry by default.
   - If the PostgreSQL registry has `0` real citizens, `WorldPage` and `CitizenDirectoryPage` can display an optional banner offering to enable **Demo Simulation Crew** so the 3D colony is never mysteriously empty during testing.
2. **Offline Fallback / Explicit Demo Sandbox Toggle (`lunar_demo_mode`):**
   - Users can toggle **"Include Demo Crew"** (or enter **Offline Demo Mode** when backend is unreachable).
   - **Namespace Separation:** When Demo Crew is displayed alongside PostgreSQL citizens (hybrid/sandbox view), demo entries must be re-prefixed in-memory at the adapter/merge boundary from `LUN-XXXXX` → `SIM-XXXXX` (e.g., `SIM-00001`..`SIM-00026`, with `isDemo: true`) so `LUN-XXXXX` belongs strictly to PostgreSQL records.
   - **Route & Lookup Resolution:** `CitizenProfilePage` (`/citizen/:citizenId`) and `WorldPage` (`?focus=`) route `SIM-*` lookups to `citizenService` (when demo mode is active) and `LUN-*` lookups to the PostgreSQL API/store.
   - **3D Coordinate De-confliction:** When merging PostgreSQL citizens with demo crew in `AstronautSwarm`, if a demo citizen's `(x, z)` collides within `1.5` units of a real PostgreSQL citizen, apply a deterministic micro-offset (`+2.2m` radial jitter) to the demo citizen so real citizens always keep their exact DB coordinates.
   - **Visual Distinction:** Demo citizens (`isDemo === true`) render a subtle `SIMULATION` / `DEMO` badge on directory cards, `CitizenProfileModal`, and `CitizenProfilePage`, and `TopBar` indicates `LIVE COLONY` vs. `DEMO SANDBOX` mode.

---

## 6. Recommended Phase 3 Frontend Refactoring Checklist
1. Add `AuthContext` (`user`, `session`, `instagramConnection`, `eligibilityVerification`, `myCitizen`, `login`, `register`, `logout`, `refreshMe`) above `CitizenProvider` in `src/App.tsx`.
2. Upgrade `CitizenContext` to fetch from `/api/citizens` with loading/error states, merged optional `SIM-*` demo crew support, and `refreshCitizens()` triggered after citizenship creation or profile updates.
3. Remove direct `citizenService` imports from `BuildingInfoPanel.tsx`, `CitizenProfileModal.tsx`, `CitizenSearchModal.tsx`, and `WorldPage.tsx`; read from `useCitizen()` / `useColony()` instead.
4. Update `JoinPage.tsx` in Live Mode to require authenticated + email-verified + Instagram-eligible status before Step 7/8 submission to `POST /api/citizenship/register` (with CSRF header + `credentials: 'include'`), while retaining `citizenService.register()` strictly for explicit Offline/Demo Sandbox mode.
5. Add Vite `/api` proxy in `vite.config.ts` and new routes (`/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`, `/account` or `/eligibility`) styled strictly with the existing `#05070a` / `slate-950` / `Chakra Petch` / `JetBrains Mono` / `cyan` design tokens.
