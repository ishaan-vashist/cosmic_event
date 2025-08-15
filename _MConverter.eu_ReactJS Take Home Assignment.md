## **React JS Take-Home Coding Assignment: \"Cosmic Event Tracker\"**

**Objective:** Build a simple web application that displays information
about Near-Earth Objects (NEOs) and other cosmic events using NASA\'s
Open APIs. The application should allow users to browse upcoming events,
view details, and filter based on certain criteria.

**DEADLINE**: 24 hours. (**Ideal Implementation Duration:** 5-7 hours,
depending on familiarity and styling efforts)

**Deliverable**: GitHub repo link.

#### **IMP**: Please use **Cursor** OR VSCode with **AugmentCode**(or similar coding agent). No need to handcraft your code. Those days are gone.  {#imp-please-use-cursor-or-vscode-with-augmentcodeor-similar-coding-agent.-no-need-to-handcraft-your-code.-those-days-are-gone.}

**Core Concepts to Demonstrate:**

- **Functional Components:** Use React Hooks (useState, useEffect,
  > useCallback where appropriate).

- **Component Structure:** Break down the UI into logical, reusable
  > components (e.g., Header, EventList, EventCard, Filter,
  > LoadingSpinner).

- **State Management:** Manage application state effectively (e.g.,
  > loading states, data from API, filter criteria, selected event
  > details).

- **API Integration:** Fetch data from external APIs using fetch or
  > axios.

- **Conditional Rendering:** Show/hide elements based on data
  > availability, loading, or errors.

- **Component Library:** Please feel free to use ShadCN, MaterialUI,
  > Chakra UI, Tailwind.

- **Event Handling:** Implement user interactions (e.g., button clicks,
  > input changes).

- **Props:** Pass data and functions between components.

- **Basic Styling:** Use CSS Modules, Tailwind CSS, or simple
  > inline/component-level CSS to make it presentable.

- Please feel free to use: ReactJS(JSX), NextJS(TSX), ReactNative(Mobile
  > App)

### **Assignment Details**

**1. Project Setup:**

- Start a new React project using Create React App or Vite:

- Bash

npx create-react-app cosmic-event-tracker

\# OR

npm create vite@latest cosmic-event-tracker \-- \--template react

cd cosmic-event-tracker

npm install \# or yarn install

- Ensure the project runs successfully with npm start (or npm run dev
  > for Vite).

**2. User/Auth Module Integration :**

- **Supabase/Auth0** React SDK: Add user authentication with
  > login/logout functionality

- **Supabase/Auth0** handles authentication: No custom backend
  > authentication needed - they provides JWT tokens that can be
  > validated client-side for demo purposes

- Supabase is preferred but Auth0 is also fine.

**3. API Integration (NASA Open APIs):**

You will primarily use the following NASA API:

- **NASA Near Earth Object Web Service (NeoWs) - Feed:**

  - **Endpoint:**
    > [[https://api.nasa.gov/neo/rest/v1/feed]{.underline}](https://api.nasa.gov/neo/rest/v1/feed)

  - **Parameters:**

    - start_date (YYYY-MM-DD): Required.

    - end_date (YYYY-MM-DD): Required.

    - api_key: **You MUST get your own API key from NASA.** Go to
      > [[https://api.nasa.gov/]{.underline}](https://api.nasa.gov/) and
      > sign up for a free API key. It\'s usually DEMO_KEY for immediate
      > testing, but for a real assignment, encourage obtaining a
      > personal one.

  - **Example Request:**
    > [[https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-08-04&end_date=2025-08-05&api_key=YOUR_API_KEY]{.underline}](https://api.nasa.gov/neo/rest/v1/feed?start_date=2025-08-04&end_date=2025-08-05&api_key=YOUR_API_KEY)

  - **Data Structure:** The response will contain near_earth_objects,
    > which is an object where keys are dates, and values are arrays of
    > NEOs for that date. Each NEO object contains details like name,
    > nasa_jpl_url, is_potentially_hazardous_asteroid,
    > close_approach_data, etc.

**3. Application Features:**

**A. Event Listing Page (/ - Home View):**

- **Default View:**

  - On initial load, fetch NEO data for the **current date** and the
    > **next 7 days** (or a reasonable range like 3 days for a quick
    > test).

  - Display a list of upcoming Near-Earth Objects, grouped by date.

  - For each NEO, show its:

    - name

    - is_potentially_hazardous_asteroid (clearly indicating if it\'s
      > hazardous, perhaps with a different color/icon)

    - Estimated diameter (you\'ll need to calculate an average from
      > estimated_diameter.kilometers.estimated_diameter_min and
      > estimated_diameter.kilometers.estimated_diameter_max).

    - Closest approach date/time (from close_approach_data).

- **Loading State:** Display a \"Loading\...\" message or a simple
  > spinner while data is being fetched.

- **Error Handling:** Display a user-friendly error message if the API
  > call fails (e.g., network error, invalid API key).

- **\"Load More\" Button:** Implement a button that, when clicked,
  > fetches and displays NEOs for the *next* set of days (e.g.,
  > extending the current date range by another 3-7 days). This
  > demonstrates incremental loading.

- **Date Range Selector (Optional but good to have):** Allow users to
  > select a specific start and end date to fetch NEOs for that range.

**B. Event Detail View (Modal or separate route - /event/:id):**

- When a user clicks on an individual NEO from the list, open a modal or
  > navigate to a detail page.

- Display more comprehensive information for the selected NEO,
  > including:

  - All the fields from the list view.

  - nasa_jpl_url (as a clickable link).

  - Details from close_approach_data (e.g., velocity, orbit ID).

  - Potentially, orbital_data (though this might require a separate API
    > call based on the neo_reference_id, which is a good extra
    > challenge). If orbital_data requires a separate call, demonstrate
    > fetching additional details on demand.

**C. Basic Filtering/Sorting (Optional but enhances the assignment):**

- **Filter by Hazardous:** Add a toggle or checkbox to show only
  > \"Potentially Hazardous\" asteroids.

- **Sort by Approach Date:** Allow sorting the list by closest approach
  > date (ascending/descending).
