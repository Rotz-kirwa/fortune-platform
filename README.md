# Fortune Investment Platform 💰

A modern investment platform built with React and Node.js, featuring daily returns, M-PESA integration, and real-time portfolio tracking.

## 📁 Project Structure

```
fortune-investment-platform/
├── frontend/                 # React TypeScript Frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── common/      # Shared components (Header, Charts)
│   │   │   ├── dashboard/   # Dashboard specific components
│   │   │   └── investment/  # Investment related components
│   │   ├── context/         # React Context (Auth, etc.)
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.tsx          # Main App component
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── tsconfig.json        # TypeScript configuration
│
├── backend/                 # Node.js Express Backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware (auth, etc.)
│   ├── models/              # Database models
│   ├── routes/              # API routes
│   ├── migrations/          # Database migrations
│   ├── lib/                 # Utility libraries (M-PESA)
│   ├── server.js            # Main server file
│   ├── package.json         # Backend dependencies
│   └── docker-compose.yml   # Database setup
│
├── scripts/                 # Utility scripts
│   ├── start-all.sh         # Start both frontend & backend
│   └── stop-all.sh          # Stop all services
│
└── README.md               # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Rotz-kirwa/fortune-investment-platform.git
cd fortune-investment-platform
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env  # Configure your environment variables
npm run dev
```

3. **Frontend Setup** (New Terminal)
```bash
cd frontend
npm install
npm start
```

4. **Or Start Everything at Once**
```bash
./scripts/start-all.sh
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/health

## 💻 Tech Stack

**Frontend:**
- React 18 + TypeScript
- Chart.js for portfolio visualization
- Responsive CSS design
- Context API for state management

**Backend:**
- Node.js + Express
- PostgreSQL database
- JWT authentication
- M-PESA API integration

## 📱 Features

- **Investment Plans**: 4 tiers with daily returns (1.5% - 4.5%)
- **M-PESA Payments**: Kenyan mobile money integration
- **Live Dashboard**: Real-time portfolio tracking
- **Referral System**: 5% commission structure
- **Mobile Responsive**: Optimized for all devices
- **Live Withdrawals**: Social proof ticker

## 🤝 Development Workflow

### Frontend Development
```bash
cd frontend
npm start          # Development server
npm run build      # Production build
npm test           # Run tests
```

### Backend Development
```bash
cd backend
npm run dev        # Development with nodemon
npm start          # Production server
npm test           # Run tests
```

### Database Management
```bash
cd backend
docker-compose up -d    # Start PostgreSQL
npm run migrate         # Run migrations
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd backend
# Set environment variables
# Deploy backend folder
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes in appropriate folder (frontend/ or backend/)
4. Test your changes
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for the Kenyan investment community**# classic
# fortune-investment-platform
