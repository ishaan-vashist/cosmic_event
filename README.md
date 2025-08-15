# Cosmic Event Tracker

A production-quality Next.js 14 application that tracks and displays NASA Near-Earth Objects (NEOs) with a modern, responsive UI featuring a beautiful space-themed design.

![Cosmic Event Tracker](https://via.placeholder.com/800x400?text=Cosmic+Event+Tracker+Space+Theme)

## Features

- 📅 Lists NASA Near-Earth Objects for a configurable date range
- 🔍 Filter by hazardous status and sort by various criteria
- 📊 Group NEOs by date with detailed information
- 🚀 View detailed information about each NEO including orbital data
- 🔄 Load more functionality to see additional dates
- 🌓 Dark mode space-themed design
- 🔒 Authentication via Supabase
- 📱 Fully responsive design
- ✨ Interactive UI with animations and space-themed elements
- 💾 User favorites and personalized feed
- 🔔 Toast notifications for user actions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom animations
- **UI Components**: ShadCN/UI with space-themed customizations
- **Authentication**: Supabase Auth
- **Data Validation**: Zod
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React
- **Toast Notifications**: Custom toast implementation

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A NASA API key (get one at [NASA API Portal](https://api.nasa.gov/))
- Supabase account and project (for authentication)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ishaan-vashist/cosmic_event.git
   cd cosmic_event
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Add your NASA API key and Supabase credentials:
     ```
     NASA_API_KEY=your_nasa_api_key
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### BFF Pattern

The application uses the Backend-for-Frontend pattern with Next.js API routes to:
- Keep API keys secure (server-side only)
- Normalize and transform NASA API data
- Implement caching for better performance
- Handle errors gracefully

### Data Flow

1. Client requests NEO data via custom React hooks
2. Next.js API routes fetch data from NASA APIs
3. Data is normalized, transformed, and cached
4. Normalized data is returned to the client
5. UI components render the data with proper loading/error states

### Authentication

- Supabase Auth UI for login/signup
- Protected routes for authenticated users
- Session management with client-side SDK

## Project Structure

```
/app                  # Next.js App Router pages and layouts
  /(public)           # Public routes (login)
  /api                # API routes (BFF pattern)
    /neos             # NEO API endpoints
  /event              # Event detail pages
  /feed               # User feed page
/components           # Reusable UI components
  /ui                 # ShadCN UI components
/hooks                # Custom React hooks
  useNeoFeed.ts       # Hook for fetching NEO data
  useRequireAuth.ts   # Authentication hook
/lib                  # Utility functions and API clients
  date.ts             # Date formatting utilities
  nasa.ts             # NASA API client
  supabase.ts         # Supabase client
  utils.ts            # General utilities
/public               # Static assets
/types                # TypeScript type definitions
/tests                # Unit and integration tests
```

## API Routes

### GET /api/neos

Fetches NEOs for a date range with optional filtering and sorting.

Query parameters:
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `hazardous`: Filter by hazardous status (boolean)
- `sort`: Sort order (approach_asc, approach_desc, size_asc, size_desc)

### GET /api/neos/[id]

Fetches detailed information about a specific NEO.

Query parameters:
- `orbital`: Include orbital data (boolean)

## Development

### Testing

Run tests with:
```bash
npm test
```

### Linting

Run ESLint with:
```bash
npm run lint
```

## Design Decisions

### Why Next.js 14 App Router?

- Server Components for improved performance
- Built-in API routes for BFF pattern
- Simplified routing and layouts
- TypeScript integration

### Why ShadCN/UI?

- Accessible components out of the box
- Customizable with TailwindCSS
- No runtime overhead (not a component library)
- Dark mode support

### Why Supabase?

- Easy authentication setup
- Client SDK for frontend integration
- No need for custom backend

## Limitations and Future Improvements

- Currently limited to 7 days of data at a time due to NASA API constraints
- Could add more detailed visualizations of NEO orbits
- Potential for push notifications for hazardous NEOs
- User preferences for default filters and sorts
- Enhanced animations and interactive elements
- Mobile app version using React Native
- Social sharing features for interesting NEO discoveries
- Advanced statistics and trend analysis for NEO data

## License

MIT
