# Number Nest Frontend

Frontend application for Number Nest, a course management and learning platform built with React and TypeScript.

## Tech Stack

- React 19.2
- TypeScript
- Vite
- React Router DOM
- Zustand (State Management)

## Project Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

The frontend application will be available at `http://localhost:5173`

## Adding a New Page

This guide walks you through creating a new page in the application. We'll use the Profile page as an example.

### Step 1: Create the Component

Create a new component file in `src/components/`. Use the `AppPage` wrapper for consistent layout:

**Example: `src/components/Profile.tsx`**

```tsx
import {useNavigate} from 'react-router-dom';
import {AppPage} from './Common-component/AppPage';
import {AppRoutes} from '../constants/appRoutes';

export default function Profile() {
    const navigate = useNavigate();

    const handleBackButton = () => {
        navigate(AppRoutes.DASHBOARD);
    };

    return (
        <AppPage
            headerButtonText="Back to Dashboard"
            headerOnAction={handleBackButton}
            headerTitle="Profile"
        >
            <h1>Profile</h1>
            {/* Your page content here */}
        </AppPage>
    );
}
```

**Key Features:**
- `AppPage` automatically provides:
  - `AppHeader` with logo
  - White background
  - 2rem padding (1.5rem on mobile)
  - Full viewport height
- Optional header props:
  - `headerButtonText` - Text for action button
  - `headerOnAction` - Button click handler
  - `headerTitle` - Title displayed in header

### Step 2: Add Route Constant

Update `src/constants/appRoutes.ts` with your new route:

```tsx
export const AppRoutes = {
    LOGIN: '/',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    COURSE_DETAILS: '/course/:id',
    PROFILE: '/profile',  // ← Add your route here
    getCoursePath: (id: string) => '/course/' + id
} as const;
```

**Benefits:**
- Centralized route definitions
- Type-safe route references
- Prevents typos in route paths

### Step 3: Register Route in App.tsx

Add the route to `src/App.tsx`:

```tsx
import Profile from "./components/Profile.tsx";  // 1. Import component

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={AppRoutes.LOGIN} element={<Login/>}/>
                <Route path={AppRoutes.REGISTER} element={<Registration/>}/>
                <Route path={AppRoutes.DASHBOARD} element={<Dashboard/>}/>
                <Route path={AppRoutes.COURSE_DETAILS} element={<CourseDetail/>}/>
                <Route path={AppRoutes.PROFILE} element={<Profile/>}/>  {/* 2. Add route */}
            </Routes>
        </BrowserRouter>
    );
}
```

### Step 4: Link to Your New Page

Use the route constant for navigation:

```tsx
import {AppRoutes} from '../constants/appRoutes';
import {useNavigate} from 'react-router-dom';

// In your component:
const navigate = useNavigate();

// Navigate programmatically:
navigate(AppRoutes.PROFILE);

// Or use in onClick handlers:
<button onClick={() => navigate(AppRoutes.PROFILE)}>
    Go to Profile
</button>
```

### Quick Checklist

When adding a new page, ensure you:

- [ ] Create component using `AppPage` wrapper
- [ ] Add route constant to `appRoutes.ts`
- [ ] Import and register route in `App.tsx`
- [ ] Update navigation links to use route constant
- [ ] Test navigation to and from the new page

### Additional Notes

- **Custom Styling**: If you need page-specific styles that override AppPage defaults, pass a `className` prop to AppPage
- **Auth Pages**: Pages like Login/Registration that need custom layouts can use `className="auth-page"` to disable default padding
- **No CSS Required**: For basic pages, AppPage handles all layout styling automatically