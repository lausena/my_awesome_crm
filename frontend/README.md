# My Awesome CRM Frontend

A modern, responsive React frontend for the My Awesome CRM system built with TypeScript, Tailwind CSS, and React Query.

## Features

- **Authentication**: Secure login with JWT token management
- **Dashboard**: Overview with key metrics and recent activity
- **Contact Management**: Full CRUD operations for contacts
- **Lead Management**: Lead pipeline with scoring and status tracking
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Comprehensive error handling and user feedback

## Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **React Hook Form** - Performant form handling
- **React Router** - Client-side routing
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Backend services running on localhost:8000

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm start
```

The application will open at `http://localhost:3000`

### Demo Credentials

- **Username**: `demo`
- **Password**: `demo123`

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── common/         # Reusable UI components
│   ├── contacts/       # Contact management
│   ├── dashboard/      # Dashboard components
│   ├── leads/          # Lead management
│   └── layout/         # Layout components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── services/           # API service layer
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Key Components

### Authentication
- **LoginForm**: User authentication with form validation
- **ProtectedRoute**: Route protection for authenticated users
- **AuthContext**: Authentication state management

### Layout
- **Layout**: Main application layout with sidebar and header
- **Sidebar**: Navigation sidebar with user profile
- **Header**: Top header with search and notifications

### Contact Management
- **ContactList**: Contact listing with search and filtering
- **ContactForm**: Create/edit contact form with validation

### Lead Management
- **LeadList**: Lead listing with table and pipeline views
- **LeadPipeline**: Visual pipeline view with drag-and-drop
- **LeadForm**: Create/edit lead form with BANT qualification

### Common Components
- **Table**: Reusable data table with sorting
- **Modal**: Modal dialog component
- **Badge**: Status and label badges
- **LoadingSpinner**: Loading states

## API Integration

The frontend integrates with the backend through a service layer:

- **apiService**: Base HTTP client with interceptors
- **authService**: Authentication endpoints
- **contactService**: Contact CRUD operations
- **leadService**: Lead management operations
- **dashboardService**: Dashboard data and metrics

## Styling

The application uses Tailwind CSS with custom utility classes:

- **Color Palette**: Primary blue theme with success, warning, danger variants
- **Components**: Pre-built component classes (btn, card, form-input, etc.)
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Ready for dark mode implementation

## State Management

- **React Query**: Server state, caching, and synchronization
- **React Context**: Authentication and global state
- **React Hook Form**: Form state and validation
- **Local Storage**: Token persistence

## Error Handling

- **API Errors**: Centralized error handling with toast notifications
- **Form Validation**: Real-time validation with Yup schemas
- **Loading States**: Loading spinners and skeleton screens
- **Fallbacks**: Error boundaries and fallback UI

## Performance Features

- **Code Splitting**: Route-based code splitting
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large data sets (future)
- **Image Optimization**: Lazy loading and responsive images
- **Bundle Optimization**: Webpack optimization and tree shaking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Include unit tests for new components
4. Update documentation for significant changes
5. Use conventional commit messages

## License

This project is part of the My Awesome CRM system and is proprietary software.