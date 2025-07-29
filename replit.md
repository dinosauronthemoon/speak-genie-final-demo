# AI English Tutor Application

## Overview

This is a full-stack language learning application focused on helping children (ages 6-16) practice English through conversational AI powered by Google Gemini. The application features both free chat and roleplay scenarios, with speech synthesis and recognition capabilities for immersive language practice.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API endpoints under `/api` prefix
- **Development Server**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Migration Management**: Drizzle Kit for schema migrations
- **Development Storage**: In-memory storage implementation for development/testing

## Key Components

### Database Schema
The application uses four main tables:
- **Users**: Store user credentials, preferences, and Gemini API keys
- **Conversations**: Track chat sessions with language, mode, and scenario settings
- **Messages**: Store individual messages with role, content, and voice settings
- **Session Stats**: Track usage metrics like message count and session duration

### AI Integration
- **Primary AI Service**: Google Gemini API for conversation generation
- **Language-Specific Responses**: AI responds in user's selected language (English, Hindi, Tamil, Gujarati) for authentic learning experience
- **Roleplay Scenarios**: Pre-configured prompts for school, store, home, and restaurant scenarios with language-appropriate responses
- **Multi-language Support**: English, Hindi, Tamil, and Gujarati language interfaces with native script support
- **Educational Focus**: Responses include English translations and meanings when teaching in native languages
- **Context-Aware Responses**: Maintains conversation history for coherent interactions

### Speech Features
- **Text-to-Speech**: Web Speech API for audio output in multiple languages
- **Speech Recognition**: Web Speech Recognition API for voice input
- **Voice Settings**: Customizable rate, pitch, and voice selection
- **Language-Specific Voices**: Automatic voice selection based on selected language

### User Interface Components
- **Chat Interface**: Real-time messaging with user and AI responses
- **Language Selector**: Dropdown for choosing interface and conversation language
- **Roleplay Scenarios**: Card-based scenario selection (school, store, home, restaurant)
- **Voice Controls**: Speech input/output controls with visual feedback
- **Session Statistics**: Real-time display of usage metrics

## Data Flow

1. **User Authentication**: Basic username/password authentication (development phase)
2. **Conversation Creation**: Users create conversations with language and mode selection
3. **Message Processing**: 
   - User input (text or speech) → API validation → Gemini processing with language-specific prompts → AI response in selected language
   - Responses stored in database with conversation context
4. **Language-Specific AI Responses**: 
   - English: Full English responses for immersive practice
   - Hindi/Tamil/Gujarati: Native language responses with English translations and explanations
5. **Real-time Updates**: TanStack Query manages cache invalidation and UI updates
6. **Statistics Tracking**: Session metrics updated after each interaction

## External Dependencies

### Core Dependencies
- **Database**: `@neondatabase/serverless` for PostgreSQL connections
- **ORM**: `drizzle-orm` and `drizzle-zod` for database operations and validation
- **AI Service**: `@google/genai` for Gemini API integration
- **UI Components**: Extensive use of Radix UI primitives via shadcn/ui
- **Form Management**: React Hook Form with Zod validation

### Development Tools
- **Build System**: Vite with React plugin and custom error overlay
- **Type Checking**: TypeScript with strict configuration
- **Code Quality**: ESLint and Prettier (configured through toolchain)
- **Development Experience**: Replit-specific plugins for enhanced development

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express API integration
- **Hot Reloading**: Full-stack hot module replacement
- **Environment Variables**: DATABASE_URL and GEMINI_API_KEY required

### Production Build
- **Frontend**: Vite build outputs to `dist/public`
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Static Assets**: Served directly by Express in production
- **Database Migrations**: Drizzle migrations applied via `npm run db:push`

### Environment Configuration
- **Development**: In-memory storage fallback when database unavailable
- **Production**: Requires PostgreSQL database and Gemini API key
- **Deployment Platform**: Optimized for Replit deployment with custom banners and cartographer integration

The application is designed as a monorepo with clear separation between client, server, and shared code, making it easy to maintain and extend with additional features like user authentication, progress tracking, and advanced AI capabilities.