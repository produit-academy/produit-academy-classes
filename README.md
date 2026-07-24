# Produit Academy - Classes (Student Portal)

This is the student-facing Next.js application for Produit Academy, specifically designed for 6th-12th grade online tuition. 

## Features
- **Student Dashboard**: Overview of classes, bookings, and payments.
- **Booking System**: Interface for students to book 1:1 live classes based on teacher availability.
- **Payment History**: Tracking of fee payments and outstanding dues.
- **Profile Management**: Student details and academic information.

## Tech Stack
- Next.js (App/Pages router)
- React
- Chart.js & React-Chartjs-2 (for analytics)
- Framer Motion (for animations)
- Lucide React (for icons)

## Getting Started

First, install the dependencies:
```bash
npm install
```

Then, run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Integration
This platform communicates with the centralized `produit_academy_backend` for authentication, booking logic, and student data.
