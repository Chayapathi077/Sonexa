# Sonexa

**Streamline Your Medical Reporting.**

Sonexa is a modern, full-stack medical reporting web application designed to provide secure, efficient, and streamlined management of medical reports (such as fetal reports) and user profiles. Built with a responsive React frontend and a robust Node.js/Express backend.

## 🚀 Features

- **Secure User Authentication**: Powered by Firebase Authentication to keep data safe.
- **Medical Reporting Hub**: Create, view, and manage specialized medical reports seamlessly.
- **Profile Management**: Profile image uploading with fast, client-side canvas compression.
- **Animated, Premium UI**: Fluid, edge-to-edge modern user interface built with Tailwind CSS and Framer Motion.
- **Edge-Ready Database**: Fast, globally distributed backend database using Turso (SQLite/LibSQL).

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, React Router, Lucide Icons.
- **Backend**: Node.js, Express, TypeScript.
- **Database**: Turso (LibSQL).
- **Authentication**: Firebase Auth.
- **Deployment**: Vercel-ready with an integrated `vercel.json` routing configuration.

## ⚙️ Local Development

### Prerequisites
- Node.js (v18+ recommended)
- Firebase Account (for Authentication)
- Turso Account (for the Database)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/sonexa.git
   cd sonexa
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env` file in the root directory and add your respective API keys:
   ```env
   # Firebase Config (Public for Vite)
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   
   # Turso Database Config (Server-side)
   TURSO_DATABASE_URL=your_turso_db_url
   TURSO_AUTH_TOKEN=your_turso_auth_token
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🚀 Deployment (Vercel)

This project is already pre-configured for Vercel deployment!

1. Push your code to GitHub.
2. Go to Vercel and import your repository.
3. In the project settings, add all the environment variables listed above.
4. Deploy! The included `vercel.json` and backend adjustments natively map the Express API to Vercel Serverless Functions while serving the React frontend.

## 📄 License
© 2026 Sonexa. All rights reserved.
