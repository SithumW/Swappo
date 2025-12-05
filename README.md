# Swappo - Community Marketplace for Trading Goods

Swappo is a full-stack marketplace platform that enables users to trade goods without cash. Built with modern web technologies, it features secure authentication, real-time item management, location-aware trading, and a comprehensive rating system.

![Swappo Logo](swappo-frontend/icons/logohome.png)

## Features

### Core Functionality
- **Item Listings**: Post items with photos, descriptions, categories, and condition status
- **Location-Based Trading**: GPS coordinates for distance-aware item discovery
- **Trade Management**: Request, accept, reject, and complete trades
- **User Ratings**: Post-trade rating system with comments
- **Badge System**: Loyalty points and achievement badges (Bronze, Silver, Gold, Diamond, Ruby)
- **Real-time Filtering**: Search by category, location, condition, and popularity

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Built with Radix UI components and Tailwind CSS
- **Authentication**: Secure user registration and login with Better Auth
- **File Upload**: Multiple image support for item listings
- **Interactive Maps**: Location-based item discovery

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom CSS
- **UI Components**: Radix UI
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Better Auth
- **File Upload**: Multer
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **API Documentation**: Swagger/OpenAPI

### Development Tools
- **Package Manager**: npm/bun
- **Linting**: ESLint with TypeScript support
- **Code Formatting**: Prettier (implied)
- **Database Management**: Prisma Studio

## Project Structure

```
swappo/
├── swappo-backend/              # Node.js/Express API server
│   ├── routes/                  # API route definitions
│   ├── services/                # Business logic layer
│   ├── middleware/              # Auth, validation, rate limiting
│   ├── utils/                   # Helper functions and utilities
│   ├── validation/              # Request validation schemas
│   ├── prisma/                  # Database schema and migrations
│   ├── uploads/                 # File upload storage
│   └── docs/                    # API documentation
│
└── swappo-frontend/             # React/TypeScript client
    ├── src/
    │   ├── components/          # Reusable UI components
    │   ├── pages/               # Route-level components
    │   ├── hooks/               # Custom React hooks
    │   ├── services/            # API client functions
    │   ├── context/             # React context providers
    │   ├── types/               # TypeScript type definitions
    │   ├── utils/               # Helper functions
    │   └── styles/              # Component-specific CSS
    └── public/                  # Static assets and icons
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or bun package manager

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SithumW/Swappo.git
   cd swappo
   ```

2. **Backend Setup**
   ```bash
   cd swappo-backend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Configure your database URL and other environment variables
   
   # Setup database
   npm run db:generate
   npm run db:push
   npm run db:seed  # Optional: seed with sample data
   ```

3. **Frontend Setup**
   ```bash
   cd ../swappo-frontend
   npm install
   
   # Create .env file
   cp .env.example .env
   # Configure API endpoints and other environment variables
   ```

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/swappo"
JWT_SECRET="your-jwt-secret"
BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL="http://localhost:3000"
PORT=3000
NODE_ENV="development"
```

#### Frontend (.env)
```env
VITE_API_URL="http://localhost:3000"
VITE_BETTER_AUTH_URL="http://localhost:3000"
```

### Running the Application

1. **Start the backend server**
   ```bash
   cd swappo-backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd swappo-frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Prisma Studio: `npm run db:studio` (in backend directory)

## API Documentation

The API is documented using Swagger/OpenAPI. Access the interactive documentation at:
```
http://localhost:3000/api-docs
```

### Key Endpoints
- `POST /api/auth/*` - Authentication routes
- `GET/POST /api/items` - Item management
- `GET/POST /api/trades` - Trade operations
- `GET/POST /api/users` - User profiles
- `GET/POST /api/ratings` - Rating system

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities include:

- **Users**: Authentication, profiles, location, badges
- **Items**: Listings with images, categories, conditions
- **TradeRequests**: Pending trade proposals
- **Trades**: Accepted and completed exchanges
- **Ratings**: User feedback and review system
- **SwappedItems**: Historical trade records

## Security Features

- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Joi schema validation
- **CORS Protection**: Cross-origin request security
- **Helmet**: Security headers
- **File Upload Security**: Validated image uploads

## Mobile Responsiveness

The application is fully responsive with:
- Adaptive layouts for mobile, tablet, and desktop
- Touch-optimized buttons and interactions
- Mobile-first CSS approach
- Flexible grid systems
- Optimized typography scaling

## UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Dark/Light Themes**: Consistent theming system
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Success/error feedback
- **Modal Dialogs**: Smooth item and trade management

## Deployment

### Backend Deployment
```bash
npm run build  # If TypeScript compilation is needed
npm start      # Production server
```

### Frontend Deployment
```bash
npm run build    # Creates optimized production build
npm run preview  # Preview production build locally
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Scripts

### Backend Scripts
```json
{
  "dev": "nodemon server.js",
  "start": "node server.js",
  "db:generate": "prisma generate",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:seed": "node prisma/seed.js",
  "db:studio": "prisma studio"
}
```

### Frontend Scripts
```json
{
  "dev": "vite",
  "build": "vite build",
  "build:dev": "vite build --mode development",
  "lint": "eslint .",
  "preview": "vite preview"
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify PostgreSQL is running
   - Check DATABASE_URL in .env
   - Run `npm run db:push` to sync schema

2. **CORS Issues**
   - Ensure frontend and backend URLs match environment variables
   - Check CORS configuration in backend

3. **File Upload Issues**
   - Verify `uploads/` directory exists and has write permissions
   - Check file size limits in multer configuration

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team

- **SithumW** - Lead Developer

## Acknowledgments

- Radix UI for excellent component primitives
- Prisma for database tooling
- Better Auth for authentication solutions
- Lucide React for beautiful icons
- Tailwind CSS for utility-first styling

---

**Swappo** - Empowering communities through sustainable trading