# QuickCourt Frontend

A modern, production-ready React frontend for the QuickCourt sports booking platform.

## Features

- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development
- 🔐 **Authentication** - Complete login/signup system with Redux state management
- 🎭 **Animations** - Smooth animations with Framer Motion
- 📱 **Responsive** - Mobile-first design that works on all devices
- 🎯 **Type Safety** - Full TypeScript support
- 🧩 **Reusable Components** - Modular component architecture
- 🎨 **Material UI Integration** - Professional UI components

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Material UI** - UI component library
- **React Hook Form** - Form handling with validation
- **Yup** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file (.env):**
   ```bash
   VITE_API_URL=http://localhost:5001/api
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Component Architecture

### UI Components

- **Button** - Reusable button with variants (primary, secondary, outline, ghost)
- **Input** - Form input with validation and password toggle
- **Card** - Container component with hover animations

### Pages

- **LandingPage** - Home page with hero section and features
- **LoginPage** - User authentication with form validation
- **SignupPage** - User registration with password requirements

### State Management

- **Redux Toolkit** - Centralized state management
- **Auth Slice** - Authentication state and actions
- **API Integration** - Axios with interceptors for token management

## Styling

The project uses Tailwind CSS with custom design tokens:

- **Primary Color**: `#0B6B63` (Teal)
- **Accent Color**: `#FFB020` (Orange)
- **Background**: `#F6F9FA` (Light Gray)
- **Text**: `#0F1724` (Dark Blue)

## Authentication Flow

1. User visits login/signup page
2. Form validation with Yup schemas
3. API call to backend authentication endpoints
4. Token storage in localStorage
5. Redux state update
6. Automatic redirect to dashboard

## Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment.

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5001/api/auth)

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript for all new code
3. Add proper error handling
4. Test components thoroughly
5. Update documentation as needed

## License

This project is part of the QuickCourt platform.
