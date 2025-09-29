# Fortune Frontend

A modern, beautiful React frontend for the Fortune financial services platform.

## Features

- 🎨 **Beautiful UI** - Modern design with Tailwind CSS
- 🔐 **Authentication** - Secure login/register with JWT
- 📊 **Dashboard** - Real-time stats and data visualization
- 💳 **M-PESA Integration** - Seamless mobile payments
- 📱 **Responsive** - Works perfectly on all devices
- ⚡ **Fast** - Optimized performance with React

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 16+ 
- Backend server running on port 4000

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Open browser**
   Navigate to `http://localhost:3000`

### Backend Connection

The frontend connects to the backend API at `http://localhost:4000/api`

Make sure your backend server is running before starting the frontend.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   └── dashboard/      # Dashboard-specific components
├── context/            # React Context providers
├── pages/              # Page components
├── services/           # API service layer
└── App.tsx            # Main application component
```

## Key Features

### 🏠 **Homepage**
- Hero section with call-to-action
- Feature highlights
- Statistics showcase
- Customer testimonials
- Professional design inspired by modern fintech platforms

### 🔐 **Authentication**
- Secure user registration
- Login with email/password
- JWT token management
- Protected routes
- Automatic redirects

### 📊 **Dashboard**
- Real-time statistics
- Order management
- Payment processing
- M-PESA integration
- Interactive modals

### 💳 **Payment Processing**
- Multiple payment methods
- M-PESA STK Push integration
- Real-time payment status
- Order tracking

## API Integration

The frontend integrates with these backend endpoints:

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User authentication
- `GET /api/orders` - Fetch orders
- `POST /api/orders` - Create new order
- `GET /api/pay` - Fetch payments
- `POST /api/pay` - Create payment
- `POST /api/pay/stk` - M-PESA STK Push

## Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:4000/api
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `build` folder** to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.