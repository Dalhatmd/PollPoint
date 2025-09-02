# Poll App

Scaffolded initial structure for auth and polls using Next.js App Router and Shadcn-style UI primitives.

## Structure

- `app/(auth)`: Auth routes (`login`, `register`).
- `app/(polls)`: Polls routes (`/polls`, `/polls/[id]`, `/polls/new`).
- `components/ui`: Shadcn-style UI components (`button`, `card`, `input`, `label`).
- `components/site-nav.tsx`: Top navigation.
- `lib`: Shared types and validations placeholders.

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Create a `.env.local` file in the root directory with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Enable Email auth in your Supabase dashboard under Authentication > Providers
5. Configure your site URL in Authentication > URL Configuration
6. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL Editor to create the necessary tables

## Development

Run dev server:

```bash
npm run dev
```

## Features

- User authentication (sign up, sign in, sign out)
- Protected routes with middleware
- Create and vote on polls
- Persistent poll storage with Supabase database
- Server Actions for data mutations
- Responsive UI with Shadcn components

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
