# Sheet Application (Airtable Clone)

## Overview
This project is a modern spreadsheet/database application, aiming to replicate and enhance functionalities similar to Airtable. Built with React, Vite, and TypeScript, it focuses on high performance, scalability, and an improved user experience, particularly through a canvas-based grid view and a Kanban board. The application offers comprehensive CRUD operations for data management and integrates AI capabilities for natural language data interaction. It seeks to modernize a legacy codebase using current best practices.

## User Preferences
- Legacy folder must remain completely untouched
- Do NOT copy code from legacy - recreate fresh with best practices
- Canvas-based grid rendering (not HTML/CSS) for performance at scale
- Tailwind v4 with CSS-based configuration
- Island design pattern: UI elements float as self-contained, elevated islands (rounded corners, subtle shadows/depth, backdrop blur)
- Brand: TINYTable (green gradient #369B7D → #4FDB95), SVG logo at brand/tiny-sheet.svg, copied to src/assets/
- Brand color tokens: brand-50 through brand-900 defined in src/index.css @theme, primary color is #39A380
- Island CSS utilities: .island, .island-elevated, .island-subtle, .island-focus, .brand-gradient (all with dark mode variants)
- Theme system: Accent color presets (10 colors), dark/light mode toggle, URL param embedding (?theme=dark&accent=hex)
- Theme-aware header/footer with accent gradient tints, branded active view pills, sidebar highlights

## System Architecture

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, shadcn/ui, Radix UI
- **State Management**: Zustand
- **Backend**: NestJS
- **AI Service**: Express/TypeScript
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.IO

### Core Features
- **High-Performance Grid**: Canvas-based rendering supporting 22 cell types, multi-cell selection, keyboard navigation, and rich cell editors.
- **Multiple Views**: Kanban, Calendar, Gantt, Gallery, and Form views with full CRUD for views and tables.
- **AI Chat Panel**: A sliding panel for natural language interaction with data, streaming GPT-4.1 responses, conversation persistence, and action generation (filter, sort, group, conditional formatting, cross-base queries, record CRUD, formula generation).
- **Advanced Field Types**: Link, User, CreatedBy, LastModifiedBy, LastModifiedTime, AutoNumber, Button, Checkbox, Lookup, and Rollup with a dependency and recalculation engine.
- **Server-Side Operations**: Filter, sort, and group operations are processed server-side for scalability with large datasets.
- **Record History/Audit Trail**: Per-table history tracking with `before_value` and `after_value` for changes.
- **Internationalization (i18n)**: Implemented with `react-i18next` for multilingual support.
- **UI/UX Enhancements**: Teable-style layout, overhauled toolbar, redesigned popovers, enhanced search, resizable sidebar, and improved cell editor positioning.

### Data Management
- **Prisma Schema**: Defines models like Space, Base, TableMeta, Field, View, Comment, AiConversation, etc., with camelCase Prisma fields mapped to snake_case DB columns.
- **Seed Data**: Comprehensive seed scripts for demo data, advanced field types, debug tables covering all 29 field types, and enrichment demo tables.
- **WebSocket Data Flow**: Real-time updates for records via Socket.IO, with client-side room management.

## External Dependencies
- **Icons**: lucide-react
- **UI Components**: shadcn/ui (leveraging Radix UI primitives)
- **Kanban DnD**: @hello-pangea/dnd
- **AI Integration**: OpenAI GPT-4.1 via Replit AI Integrations