# Domlii Dashboard

A modern dashboard application built with Next.js 14.1.4, Prisma, and Tailwind CSS.

## Tech Stack

- **Next.js 14.1.4** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework
- **Prisma** - Database ORM
- **PostgreSQL** - Database (configurable)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Environment Variables

Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

Update the `DATABASE_URL` in your `.env` file with your database connection string.

### 3. Set up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push the schema to your database
npm run db:push

# Or run migrations (recommended for production)
npm run db:migrate
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
