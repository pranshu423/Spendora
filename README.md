# Spendora 💸

**Spendora** is a modern, full-stack Subscription Management Dashboard designed to help you track recurring expenses, visualize spending habits, and never miss a renewal date. Built with the **MERN Stack** (MongoDB, Express, React, Node.js) and enhanced with real-time updates.

![Spendora Dashboard]

## 🌟 Key Features

- **Real-time Dashboard**: Updates instantly across devices when subscriptions are added, edited, or removed (powered by Socket.IO).
- **Interactive Analytics**: Visual breakdown of your spending habits with dynamic charts (Recharts).
- **Smart Alerts**: Automatic notifications for subscriptions renewing within the next 7 days.
- **Modern UI**: A sleek, responsive interface featuring Glassmorphism and dark mode (Tailwind CSS).
- **Secure Authentication**: Robust user management with JWT-based authentication.
- **Subscription Management**: Easily add, edit, categorize, and track all your active subscriptions in one place.

## 🛠️ Technology Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.IO
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod Validation

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local installation or Atlas URI)
- [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/spendora.git
    cd spendora
    ```

2.  **Install Application Dependencies**
    Run this command from the root directory to install dependencies for both the client and server:
    ```bash
    npm install
    ```

### Configuration

Create a `.env` file in the `server` directory. You can use the example below as a template.

**Warning:** Never commit your actual `.env` file to version control.

**File:** `server/.env`
```env
# Application Port
PORT=5000

# Database Connection
MONGO_URI=mongodb://...

# Security Secrets (Replace with your own secure random strings)
JWT_SECRET=your_super_secret_jwt_key_here

# Client URL (For CORS and Redirects)
CLIENT_URL=http://localhost:5173
```

### Running the Application

To start both the backend server and the frontend client concurrently, run the following command from the root directory:

```bash
npm start
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
