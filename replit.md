# Overview

This is a luxury real estate web application called "RUBI IMÓVEIS PRIME" built with React, Express.js, and PostgreSQL. The application allows users to browse premium properties (apartments, houses, and farms) with elegant design and sophisticated user experience. It features a public-facing property listing interface and an admin dashboard for property management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Styling**: Tailwind CSS with custom ruby/gold color palette for luxury branding
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **API Design**: RESTful API with consistent JSON responses
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: JWT-based authentication for admin users with bcrypt password hashing
- **File Uploads**: Multer middleware for handling property image uploads
- **Development Server**: Vite integration for hot module replacement in development

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless connection
- **Schema Management**: Drizzle Kit for database migrations and schema versioning
- **Connection Pooling**: Neon serverless connection pool for efficient database access
- **File Storage**: Local filesystem storage for uploaded property images

## Authentication and Authorization
- **Admin Authentication**: JWT tokens with secure password hashing using bcryptjs
- **Session Management**: Anonymous session IDs stored in localStorage for favorites functionality
- **Protected Routes**: Middleware-based route protection for admin endpoints
- **Token Validation**: Automatic token expiration checking on the frontend

## Key Features and Components
- **Property Management**: CRUD operations for properties with image gallery support
- **Favorites System**: Anonymous user favorites using session-based identification
- **Image Gallery**: Interactive property image viewing with navigation controls
- **Property Filtering**: Multi-criteria search by type, location, price range, and status
- **Responsive Design**: Mobile-first design with elegant desktop layouts
- **Admin Dashboard**: Complete property management interface with statistics

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection**: WebSocket-based connection using @neondatabase/serverless

## UI and Design Libraries
- **Radix UI**: Comprehensive set of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Playfair Display, Inter, and Cormorant Garamond for typography

## Development and Build Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

## Authentication and Security
- **bcryptjs**: Password hashing for secure admin authentication
- **jsonwebtoken**: JWT token generation and validation
- **Zod**: Runtime type validation for API inputs and forms

## File Upload and Processing
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **File System**: Local storage for property images with organized directory structure