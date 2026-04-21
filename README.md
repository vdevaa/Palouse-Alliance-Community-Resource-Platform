# Palouse Alliance Community Resource Platform

## Project Summary
The Palouse Alliance Community Resource Platform is a React + Vite web application built to make local health, wellness, and community event resources easier to find and use across the Palouse region. It centralizes event and organization information, offers search and category-based discovery, and helps local organizations share updates through a community-facing platform.

The platform is intended to support a range of community members, including students, families, seniors, veterans, and individuals seeking housing support, food assistance, mental health services, or community programs. The app emphasizes accessibility, responsive layout, and a clean search-driven experience so people can quickly find relevant events and organizations.

### One-sentence description
A community-focused React application that organizes Palouse area events, organizations, and volunteer opportunities into a searchable, accessible hub.

## What’s Included
- React 19 application with Vite-powered development and build tooling.
- Supabase client integration for authentication and data access.
- A public events calendar with category filtering and event search.
- Organization directory with search and contact summaries.
- Login/logout flow using Supabase authentication.
- A protected dashboard area for authenticated users.
- A multi-step event posting experience.
- Mobile-friendly navigation and responsive layout.

## Repo Structure
- `code` - main web application source code.
- `code/src/` - React components, pages, and Supabase client setup.
- `Reports/` - project reports and documentation.
- `Sprints/` - sprint plans, meeting minutes, and sprint reports.

## Technology Stack
- React 19
- Vite
- React Router DOM
- Supabase JavaScript client
- ESLint
- Vitest

## Key Pages and Routes
- `/` - Home page with searchable event listings, calendar, filters, and user-specific event tracking.
- `/login` - Login form using Supabase password authentication.
- `/register` - Registration page placeholder for future signup flow.
- `/dashboard` - Protected dashboard route for authenticated users.
- `/organizations` - Community organization directory with search filtering.
- `/post-event` - Multi-step event posting form.
- `/admin` - Admin page placeholder.

## Installation
### Prerequisites
- Node.js 20 or newer
- npm or yarn
- Git

### Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-directory>
   ```
2. Change into the application folder:
   ```bash
   cd code
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create environment variables:
    - Copy the example file and fill in your values:
       ```bash
       cp .env.example .env
       ```
    - Required frontend variables:
       - `VITE_SUPABASE_URL`
       - `VITE_SUPABASE_ANON_KEY`
    - Required backend variables (used by admin API endpoints):
       - `SUPABASE_URL`
       - `SUPABASE_SERVICE_ROLE_KEY`
    - Optional frontend API override:
       - `VITE_API_BASE` (leave blank for same-origin API calls)

5. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The app will be available at `http://localhost:5173` by default.

### Build and Preview
From `code/`:
```bash
npm run build
npm run preview
```

## Available Scripts
From `code/`:
- `npm run dev` - start Vite development server
- `npm run build` - build production assets
- `npm run preview` - preview built app locally
- `npm run lint` - run ESLint
- `npm run test` - run Vitest once
- `npm run test:watch` - run Vitest in watch mode
- `npm run test:coverage` - generate test coverage report

## Supabase Configuration
The project currently uses Supabase through `code/src/lib/supabase.js`.
The client reads configuration from:
- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

If you want to connect to your own Supabase instance, update those variables in `code/.env`.

## Vercel Deployment
1. Import the repository into Vercel and set the project root to `code/`.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add these environment variables in Vercel Project Settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Optional: `VITE_API_BASE` (defaults to same-origin)

The included `code/vercel.json` routes `/api/*` to the serverless backend and all other routes to the SPA entrypoint.

## Application Behavior
- The home page loads approved events from the `events` table and displays them in a calendar, with search and category filters.
- Logged-in users can see their submitted events in the `My Events` sidebar.
- The organization page loads organization records from the `organizations` table and displays searchable cards.
- Login uses `supabase.auth.signInWithPassword()`.
- Event posting is implemented as a three-step form, with fields for title, description, date/time/location, and an optional flyer upload.
- The dashboard and admin routes are available but currently serve as placeholders for expanded functionality.

## Notes
- The active application is in `code/`.
- Keep `.env` out of source control and commit only `.env.example`.

## Additional Documentation
- [Sprint Documents](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/tree/main/Sprints)
- [Sprint Reports](https://github.com/vdevaa/Palouse-Alliance-Community-Resource-Platform/tree/main/Reports)

## Known Problems
There are no known problems documented in this repository at this time.
