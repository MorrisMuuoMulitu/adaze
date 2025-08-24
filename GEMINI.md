
# GEMINI.md - adaze-marketplace

## Project Overview

This is a Next.js 13 project for a marketplace application called "adaze-marketplace". The application is designed to be a platform for buying and selling second-hand fashion (mitumba) in Africa. It features a rich user interface with a variety of components, including authentication, live chat, notifications, and a product catalog.

The project is built with the following technologies:

- **Framework:** Next.js 13 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with shadcn/ui
- **Animations:** Framer Motion
- **Forms:** React Hook Form with Zod for validation
- **Real-time:** Socket.IO Client

## Building and Running

To get the project up and running, use the following commands:

- **Install dependencies:** `npm install`
- **Run the development server:** `npm run dev`
- **Build the project for production:** `npm run build`
- **Run the production server:** `npm run start`
- **Lint the code:** `npm run lint`

## Development Conventions

- **Component-Based Architecture:** The project follows a component-based architecture, with components organized in the `components/` directory. UI components from shadcn/ui are located in `components/ui`.
- **Styling:** Styling is done using Tailwind CSS. The configuration is in `tailwind.config.ts`. Colors and other theme-related properties are defined as CSS variables.
- **State Management:** Client-side state is managed using React hooks (`useState`, `useEffect`).
- **Types:** TypeScript types are used throughout the project. The main `User` type is defined in `types/index.ts`.
- **Path Aliases:** The project uses path aliases for easier imports (e.g., `@/components`, `@/lib`). These are configured in `components.json` and `tsconfig.json`.
