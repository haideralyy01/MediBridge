# MediBridge Frontend

A modern React-based frontend application for the MediBridge healthcare platform that bridges traditional Indian Medicine (Ayush) with modern medical practices.

## 🚀 Features

### Core Features

- **Patient Health Records Management** - Create, view, and manage comprehensive health records
- **ICD-11 Integration** - Automated disease classification with ICD-11 codes
- **Bilingual Support** - Namaste names for diseases alongside English terminology
- **Disease & Symptom Autocomplete** - Smart two-way autocomplete for diseases and symptoms
- **Document Verification** - Hospital-verified health records with authentication
- **Responsive Design** - Mobile-first approach with full responsiveness

### User Interface

- **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- **Government Theme** - Official Indian government design standards
- **Dark/Light Mode** - Theme switching support
- **Accessibility** - WCAG compliant design patterns
- **Toast Notifications** - Real-time feedback for user actions

### Authentication & Security

- **Google OAuth Integration** - Secure authentication flow
- **Hospital Authentication** - Special login for healthcare providers
- **Role-based Access Control** - Different permissions for patients and hospitals
- **SSL Secured** - All communications encrypted

## 🛠️ Technology Stack

### Core Technologies

- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and development server
- **React Router DOM 6.30.1** - Client-side routing

### UI Framework

- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - High-quality accessible components built on Radix UI
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful SVG icons
- **class-variance-authority** - CVA for component variants

### State Management & Data Fetching

- **TanStack Query 5.83.0** - Powerful data synchronization
- **React Hook Form 7.61.1** - Performant forms with minimal re-renders
- **Zod 3.25.76** - TypeScript-first schema validation

### Additional Libraries

- **Recharts 2.15.4** - Composable charting library
- **date-fns 3.6.0** - Modern JavaScript date utility library
- **Sonner 1.7.4** - Elegant toast notifications
- **cmdk 1.1.1** - Command palette component

## 📁 Project Structure

```
frontend/
├── public/                                               # Static assets
│   ├── Gemini_Generated_Image_p1hresp1hresp1hr.png      # Navbar logo
│   ├── Gemini_Generated_Image_gyk56mgyk56mgyk5.png      # Hero image
│   └── ...                                               # Other static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── Navigation.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── DiseaseAutocomplete.tsx
│   │   └── ...
│   ├── pages/            # Route components
│   │   ├── Index.tsx     # Landing page
│   │   ├── Login.tsx     # Authentication
│   │   ├── Dashboard.tsx # User dashboard
│   │   ├── HealthRecords.tsx # Health records management
│   │   └── ...
│   ├── data/             # Static data
│   │   └── icd11Diseases.ts # ICD-11 disease data
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── assets/           # Images and media
│   └── ...
├── components.json       # shadcn/ui configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── vite.config.ts        # Vite configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd medibridge/frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Build for development environment
npm run build:dev
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend root:

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=MediBridge

# Google OAuth (if using)
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# App Configuration
VITE_APP_ENV=development
```

### Tailwind CSS

The project uses a custom Tailwind configuration with:

- Government of India color scheme
- Custom shadows and animations
- Extended typography scale
- Custom component utilities

### TypeScript

Strict TypeScript configuration with:

- Path aliases (`@/` points to `src/`)
- Strict type checking
- Modern ES modules support

## 📱 Key Components

### Health Records Management

- **HealthRecords.tsx** - Main health records interface
- **DiseaseAutocomplete.tsx** - Smart disease/symptom search
- Form validation with Zod schemas
- Real-time table updates

### Authentication

- Google OAuth integration
- Hospital-specific login flow
- Persistent authentication state
- Role-based route protection

### UI Components

- **shadcn/ui** - Production-ready components
- **Custom Government Theme** - Indian govt design standards
- **Responsive Navigation** - Mobile-optimized header
- **Toast System** - User feedback notifications

## 🎯 Features Deep Dive

### Disease Autocomplete System

- **Two-way Search** - Search by disease name or symptoms
- **ICD-11 Integration** - Automatic code assignment
- **Namaste Names** - Traditional Indian medicine terminology
- **Smart Suggestions** - Context-aware recommendations

### Health Records

- **Comprehensive Forms** - Patient details, diagnosis, symptoms
- **Document Verification** - Hospital verification system
- **Search & Filter** - Find records quickly
- **Export Capabilities** - Download and share records

### Responsive Design

- **Mobile-first** - Optimized for mobile devices
- **Progressive Enhancement** - Works on all screen sizes
- **Touch-friendly** - Large tap targets and gestures
- **Fast Loading** - Optimized assets and code splitting

## 🔒 Security Features

- **Content Security Policy** - XSS protection
- **HTTPS Only** - Secure communication
- **Input Validation** - Client-side and server-side validation
- **Authentication Tokens** - Secure JWT-based auth
- **Role-based Access** - Granular permissions

## 🌐 Browser Support

- **Modern Browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers** - iOS Safari 14+, Chrome Mobile 90+
- **Progressive Web App** - PWA capabilities enabled

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use provided ESLint configuration
- Write meaningful component names
- Include proper TypeScript types
- Test on multiple screen sizes

## 📝 License

This project is part of the Digital India initiative for healthcare modernization.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check existing documentation
- Review component storybook (if available)

## 🔄 Updates

The application follows semantic versioning. Check the changelog for updates and breaking changes.

---

**Built with ❤️ for Digital India Healthcare Initiative**

- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS