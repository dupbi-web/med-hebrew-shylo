# med-ivrit

A comprehensive web application for learning medical Hebrew through interactive flashcards, quizzes, games, and personalized progress tracking. Built for healthcare professionals and students who need to master medical terminology in Hebrew.

## 🚀 Tech Stack

### Core Framework
- **React** 18.3.1 - Modern UI library with hooks
- **TypeScript** 5.8.3 - Type-safe development
- **Vite** 7.1.9 - Fast build tool and dev server

### State Management & Data Fetching
- **TanStack Query** 5.90.3 - Server state management and caching
- **React Context API** - Global auth and words state
- **React Hook Form** 7.61.1 - Form state management
- **Zod** 3.25.76 - Schema validation

### Backend & Database
- **Supabase** 2.54.0 - PostgreSQL database, authentication, and real-time features
  - Authentication with email/password
  - Row-level security policies
  - Real-time subscriptions
  - Database functions and triggers

### UI Components & Styling
- **Radix UI** - Accessible, unstyled component primitives
- **Tailwind CSS** 3.4.17 - Utility-first CSS framework
- **shadcn/ui** - Pre-built accessible components
- **Framer Motion** 12.23.24 - Animation library
- **Lucide React** 0.462.0 - Icon library
- **next-themes** 0.4.6 - Dark mode support

### Routing & Navigation
- **React Router DOM** 6.30.1 - Client-side routing
- **React Helmet Async** 2.0.5 - Document head management for SEO

### Additional Libraries
- **i18next** 25.3.6 & **react-i18next** 15.7.4 - Internationalization (English, Hebrew, Russian)
- **Recharts** 2.15.4 - Data visualization
- **date-fns** 3.6.0 - Date utilities
- **Fuse.js** 7.1.0 - Fuzzy search
- **idb** 8.0.3 - IndexedDB wrapper for offline caching

### Testing
- **Vitest** 4.0.6 - Unit testing framework
- **Testing Library** - React component testing
- **Happy DOM** 20.0.10 - DOM implementation for testing

### DevOps
- **Docker** - Containerization for versioned builds
- **GitHub Actions** - CI/CD pipeline
- **Netlify** - Production deployment
- **ESLint** 9.32.0 - Code linting

---

## ✨ Features

### 🎓 Learning Tools
- **Interactive Flashcards** - Flip cards to learn medical terms with Hebrew translations
- **Spaced Repetition** - Smart algorithm to optimize learning retention
- **Dictionary** - Searchable medical term database with fuzzy search
- **Learning Mode** - Structured lessons with progress tracking
- **Typing Practice** *(Coming Soon)* - Practice typing medical terms in Hebrew

### 🎮 Interactive Games
- **Quiz Mode** - Test your knowledge with multiple-choice questions
- **Matching Game** - Match medical terms with their Hebrew translations
- **Timed Challenges** - Race against the clock to improve speed

### 📊 Progress Tracking
- **User Profiles** - Personalized learning dashboard
- **Progress Analytics** - Visual charts showing learning progress over time
- **Mastered Words** - Track which terms you've mastered
- **Category-based Learning** - Organize learning by medical specialties

### 🌐 Multilingual Support
- **English** - Primary interface language
- **Hebrew** - Native medical terminology
- **Russian** - Additional language support
- **RTL Support** - Proper right-to-left text rendering for Hebrew

### 🔐 Authentication & Security
- **Email/Password Authentication** - Secure user registration and login
- **Password Reset** - Email-based password recovery
- **Profile Completion** - Guided onboarding flow
- **Consent Management** - GDPR-compliant terms and privacy acceptance
- **Rate Limiting** - Protection against brute force attacks

### 🎨 User Experience
- **Dark Mode** - System-aware theme switching
- **Responsive Design** - Mobile-first, works on all devices
- **Offline Support** - IndexedDB caching for offline access
- **SEO Optimized** - Meta tags and semantic HTML
- **Accessibility** - WCAG-compliant UI components

---

## 📁 Project Structure

```
dev-med-ivrit/
├── .github/
│   └── workflows/           # CI/CD workflows
│       ├── build-and-deploy.yml
│       ├── deploy-now.yml
│       ├── nightly-supabase-request.yml
│       └── test.yml
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui components (49 components)
│   │   ├── common/         # Shared components
│   │   ├── matching/       # Matching game components
│   │   ├── Layout.tsx      # Main layout wrapper
│   │   ├── Navbar.tsx      # Navigation bar
│   │   ├── ProtectedRoute.tsx  # Route guard
│   │   └── ThemeProvider.tsx   # Theme context
│   ├── context/            # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── WordsContext.tsx    # Words/vocabulary state
│   ├── hooks/              # Custom React hooks
│   │   ├── queries/        # TanStack Query hooks
│   │   │   ├── useCategories.ts
│   │   │   ├── useMedicalTerms.ts
│   │   │   ├── useUserProgressQuery.ts
│   │   │   └── ...
│   │   ├── useMatchingGame.tsx
│   │   ├── useLearningProgress.tsx
│   │   └── useRateLimit.ts
│   ├── integrations/       # External service integrations
│   │   └── supabase/
│   │       ├── client.ts   # Supabase client configuration
│   │       └── types.ts    # Database type definitions
│   ├── pages/              # Route components
│   │   ├── public/         # Public pages (no auth required)
│   │   │   ├── Home.tsx
│   │   │   ├── Quiz.tsx
│   │   │   ├── About.tsx
│   │   │   └── ContactUs.tsx
│   │   ├── Auth.tsx        # Login/Register page
│   │   ├── CompleteProfile.tsx
│   │   ├── Dictionary.tsx
│   │   ├── FlashCards.tsx
│   │   ├── Learning.tsx
│   │   ├── MatchingGame.tsx
│   │   ├── Profile.tsx
│   │   ├── Quiz.tsx
│   │   ├── TypingGame.tsx
│   │   └── ...
│   ├── cache/              # Offline caching utilities
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   ├── __tests__/          # Test files
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── i18n.ts             # Internationalization configuration
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration for Docker
├── vite.config.ts          # Vite build configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

---

## 🔐 Authentication System

### How It Works

The application uses **Supabase Authentication** with a custom React Context wrapper for state management.

#### Authentication Flow

1. **User Registration/Login**
   - Users register via email/password on the `/auth` page
   - Supabase handles password hashing and session management
   - JWT tokens are stored in `localStorage` with auto-refresh enabled

2. **Session Management**
   - `AuthContext` provides global authentication state
   - Uses TanStack Query for efficient caching and automatic refetching
   - Listens to Supabase auth state changes via `onAuthStateChange`

3. **Profile & Consent Tracking**
   - After authentication, user profile is fetched from `profiles` table
   - User consent is tracked in `user_consent` table (GDPR compliance)
   - Both are cached and synced with TanStack Query

4. **Route Protection**
   - `ProtectedRoute` component wraps authenticated routes
   - Checks for valid session and redirects to `/auth` if not authenticated
   - `/complete-profile` route ensures users complete their profile before accessing app

#### Key Components

- **`AuthContext.tsx`** - Single source of truth for auth state
  - Exports: `user`, `profile`, `hasConsent`, `loading`, `signOut()`, `refreshUserData()`
  - Uses TanStack Query with keys: `['session']`, `['profile', userId]`, `['consent', userId]`

- **`ProtectedRoute.tsx`** - Route guard component
  - Redirects unauthenticated users to `/auth`
  - Shows loading spinner while checking auth state

- **`Auth.tsx`** - Login/Register page
  - Handles email/password authentication
  - Includes password reset flow
  - Rate limiting to prevent brute force attacks

#### Supabase Client Configuration

```typescript
// src/integrations/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

---

## 🌐 API Calls & Data Fetching

### Architecture

The application uses **direct Supabase client calls** wrapped in **custom React hooks** with **TanStack Query** for caching and state management.

### Data Fetching Pattern

1. **Custom Query Hooks** (`src/hooks/queries/`)
   - Each data type has a dedicated hook (e.g., `useMedicalTerms`, `useCategories`)
   - Hooks use TanStack Query's `useQuery` for automatic caching and refetching
   - Query keys are structured for efficient invalidation

2. **Direct Supabase Calls**
   - No separate API service layer
   - Supabase client is imported directly in hooks
   - Row-level security (RLS) policies enforce data access control

3. **Caching Strategy**
   - Session data: 5-minute stale time
   - Profile/consent: Infinite stale time (rarely changes)
   - Medical terms: Cached with manual invalidation
   - User progress: Refetched on focus/mount

### Example: Fetching Medical Terms

```typescript
// src/hooks/queries/useMedicalTerms.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useMedicalTerms = () => {
  return useQuery({
    queryKey: ['medical_terms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medical_terms')
        .select('*')
        .order('term');
      
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
```

### When API Calls Are Triggered

- **On Component Mount** - Initial data fetch
- **On Window Focus** - Refetch to ensure fresh data
- **On Network Reconnect** - Automatic retry
- **Manual Invalidation** - After mutations (create/update/delete)
- **Auth State Change** - Refetch user-specific data

### Key Query Hooks

| Hook | Purpose | Query Key |
|------|---------|-----------|
| `useMedicalTerms` | Fetch all medical terms | `['medical_terms']` |
| `useCategories` | Fetch term categories | `['categories']` |
| `useUserProgressQuery` | Fetch user learning progress | `['user_progress', userId]` |
| `useMasteredWords` | Fetch mastered words | `['mastered_words', userId]` |
| `useMedicalSentences` | Fetch example sentences | `['medical_sentences']` |

### Offline Support

- **IndexedDB Caching** - Medical terms cached locally via `idb` library
- **Fallback Data** - App shows cached data when offline
- **Sync on Reconnect** - Automatic sync when connection restored

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 20.x or higher
- **npm** (comes with Node.js)
- **Git**

### Step 1: Clone the Repository

```bash
git clone <REPOSITORY_URL>
cd dev-med-ivrit
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=<SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>

# Optional: Development hostname
VITE_DEV_HOST=<DEV_HOST>
```

> **Note:** Replace placeholders with actual values from your Supabase project dashboard.

### Step 4: Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

### Step 5: Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Additional Commands

```bash
# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐳 Docker Instructions

### Overview

Docker is used to create **versioned images** of the application build. Images are stored in **GitHub Container Registry** (ghcr.io) and can be pulled for local testing.

### Docker Image Location

Images are automatically built and pushed to:

```
ghcr.io/<GITHUB_USERNAME>/dev-med-ivrit:dev-<VERSION>
```

Version tags follow the format: `dev-MAJOR.MINOR.PATCH` (e.g., `dev-0.0.0`)

### Pull and Run Docker Image Locally

#### Step 1: Authenticate with GitHub Container Registry

```bash
echo <GITHUB_TOKEN> | docker login ghcr.io -u <GITHUB_USERNAME> --password-stdin
```

#### Step 2: Pull the Image

```bash
docker pull ghcr.io/<GITHUB_USERNAME>/dev-med-ivrit:dev-<VERSION>
```

#### Step 3: Create Local `.env` File

Create a `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=<SUPABASE_URL>
VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>
```

#### Step 4: Run the Container

```bash
docker run -p 8080:8080 \
  --env-file .env \
  ghcr.io/<GITHUB_USERNAME>/dev-med-ivrit:dev-<VERSION>
```

The application will be available at `http://localhost:8080`

### Dockerfile Explanation

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Build application
COPY . .
RUN npm run build

# Run preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
```

---

## 🚀 Deployment Instructions

### Manual Deployment to Netlify

The application is deployed to **Netlify** by uploading the production build (`dist` folder).

#### Step 1: Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

#### Step 2: Install Netlify CLI (if not already installed)

```bash
npm install -g netlify-cli
```

#### Step 3: Authenticate with Netlify

```bash
netlify login
```

#### Step 4: Deploy to Netlify

```bash
netlify deploy \
  --site <NETLIFY_SITE_ID> \
  --auth <NETLIFY_AUTH_TOKEN> \
  --prod \
  --dir=dist
```

#### Environment Variables on Netlify

Configure the following environment variables in Netlify dashboard:

- `VITE_SUPABASE_URL=<SUPABASE_URL>`
- `VITE_SUPABASE_ANON_KEY=<SUPABASE_ANON_KEY>`

### Automated Deployment

Deployment is also automated via GitHub Actions (see next section).

---

## ⚙️ GitHub Workflow Overview

The project uses **GitHub Actions** for continuous integration and deployment.

### Main Workflow: `build-and-deploy.yml`

Triggered on every push to the `main` branch.

#### Job 1: Build and Test

```yaml
- Checkout code
- Set up Node.js 22
- Install dependencies
- Build the application (npm run build)
- Run tests (npm test)
- Generate version tag (dev-MAJOR.MINOR.PATCH)
- Upload dist folder as artifact
```

#### Job 2: Build and Push Docker Image

```yaml
- Checkout code
- Log in to GitHub Container Registry (ghcr.io)
- Build Docker image with version tag
- Push image to ghcr.io/<owner>/<repo>:dev-<version>
```

#### Job 3: Deploy to Netlify

```yaml
- Checkout code
- Set up Node.js 22
- Install dependencies
- Build the application
- Install Netlify CLI
- Deploy to Netlify production
  - Uses NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN secrets
  - Deploys dist folder
  - Includes commit message and version in deployment message
```

### Other Workflows

- **`test.yml`** - Runs tests on pull requests
- **`deploy-now.yml`** - Manual deployment trigger
- **`nightly-supabase-request.yml`** - Scheduled Supabase maintenance tasks

### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

- `NETLIFY_SITE_ID` - Your Netlify site ID
- `NETLIFY_AUTH_TOKEN` - Your Netlify personal access token
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

---

## 📚 Developer Guide

### Internal Architecture

#### Component Hierarchy

```
App (Providers: Helmet, QueryClient, Tooltip, Router, Auth, Words)
├── Routes
│   ├── Public Routes (no auth)
│   │   ├── /auth - Auth page
│   │   ├── /reset-password - Password reset
│   │   ├── / - Public home (PublicHome)
│   │   ├── /public-quiz - Public quiz
│   │   └── /complete-profile - Profile completion
│   └── Protected Routes (requires auth)
│       ├── Layout (Navbar + children)
│       ├── /home - User dashboard
│       ├── /flash-cards - Flashcard learning
│       ├── /quiz - Quiz mode
│       ├── /matching-game - Matching game
│       ├── /learning - Structured learning
│       ├── /dictionary - Term search
│       └── /profile - User profile
```

#### State Management Flow

1. **Global State** (React Context)
   - `AuthContext` - User, profile, consent, auth methods
   - `WordsContext` - Vocabulary data shared across components

2. **Server State** (TanStack Query)
   - Cached API responses
   - Automatic background refetching
   - Optimistic updates for mutations

3. **Local State** (useState/useReducer)
   - Component-specific UI state
   - Form inputs (via React Hook Form)
   - Game state (matching game, quiz)

#### Data Flow Example: Learning a New Word

```
1. User clicks "Mark as Mastered" in FlashCards component
2. Component calls mutation hook (useMutation)
3. Hook sends request to Supabase (insert into mastered_words)
4. On success, invalidate queries: ['mastered_words', userId], ['user_progress', userId]
5. TanStack Query automatically refetches affected data
6. UI updates with new mastered word count
7. IndexedDB cache updated for offline access
```

#### Internationalization (i18n)

- **Configuration**: `src/i18n.ts`
- **Languages**: English (en), Hebrew (he), Russian (ru)
- **Usage**: `const { t } = useTranslation(); t('key')`
- **Translation Keys**: Defined in `i18n.ts` with nested structure
- **RTL Support**: Automatic text direction switching for Hebrew

#### Routing Strategy

- **Public Routes** - Accessible without authentication
  - Landing page, public quiz, about, contact
- **Protected Routes** - Require authentication
  - Wrapped in `<ProtectedRoute>` component
  - Redirect to `/auth` if not logged in
- **Profile Completion** - Special route
  - Users without complete profile redirected here
  - Cannot access main app until profile completed

#### Performance Optimizations

1. **Code Splitting**
   - Manual chunks in `vite.config.ts`
   - Separate bundles for React, UI components, Supabase, TanStack Query

2. **Caching**
   - TanStack Query caching with smart stale times
   - IndexedDB for offline data persistence
   - Service worker for static asset caching

3. **Build Optimizations**
   - Cache-busting with hashed filenames
   - Tree-shaking unused code
   - Minification and compression

#### Testing Strategy

- **Unit Tests** - Individual functions and hooks
- **Component Tests** - React Testing Library
- **Integration Tests** - User flows (auth, learning)
- **Test Environment** - Happy DOM for fast execution

#### Security Considerations

1. **Authentication**
   - JWT tokens with auto-refresh
   - Secure password hashing (Supabase)
   - Rate limiting on auth endpoints

2. **Data Access**
   - Row-level security (RLS) in Supabase
   - User can only access their own data
   - API keys stored in environment variables

3. **Input Validation**
   - Zod schemas for form validation
   - Sanitization of user inputs
   - XSS protection via React's built-in escaping

#### Common Development Tasks

**Adding a New Page**
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Add to `ProtectedRoute` if auth required
4. Add i18n translations
5. Update navigation in `Navbar.tsx`

**Adding a New API Query**
1. Create hook in `src/hooks/queries/`
2. Define query key and query function
3. Use `useQuery` from TanStack Query
4. Handle loading/error states in component

**Adding a New Feature**
1. Plan component structure
2. Create necessary hooks and contexts
3. Implement UI components
4. Add tests
5. Update documentation

#### Debugging Tips

- **React DevTools** - Inspect component tree and state
- **TanStack Query DevTools** - Monitor cache and queries (add to App.tsx)
- **Supabase Dashboard** - Check database queries and logs
- **Network Tab** - Inspect API calls and responses
- **Console Logs** - Strategic logging in hooks and contexts

---

## 📄 License

This project is private and proprietary.

---

## 🤝 Contributing

This is a development repository. For contribution guidelines, please contact the project maintainer.

---

## 📞 Support

For questions or issues, please contact the development team or open an issue in the repository.

---

**Built with ❤️ for healthcare professionals learning medical Hebrew**
