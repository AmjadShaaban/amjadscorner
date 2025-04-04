# Amjad's Corner

[![Vercel Deploy](https://vercel.com/button)](https://amjadscorner.us) [![Next.js](https://img.shields.io/badge/Next.js-15-blue)](https://nextjs.org) [![React](https://img.shields.io/badge/React-19-blue)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://typescriptlang.org)

**Amjad's Corner** is my personal portfolio and playground, showcasing my skills through a modular web app. Visit it live at [amjadscorner.us](https://amjadscorner.us), hosted on Vercel with seamless auto-deploys on every push. It features a sleek homepage and three mini-apps in progress: a todo list, an e-commerce store, and a forums platform.

## Features

- **Homepage** (`/`) - A welcoming intro to me and my projects.
- **Todo App** (`/todo`) - A simple task manager (WIP).
- **E-commerce** (`/ecommerce`) - A shop demo with cart features (WIP).
- **Forums** (`/forums`) - A discussion hub for users (WIP).

## Tech Stack

- **Next.js 15** - App Router for modern routing and server components.
- **React 19** - Latest React for dynamic, efficient UIs.
- **TypeScript 5.8** - Strict typing for robust code.
- **TailwindCSS 4** - Utility-first styling for rapid design.
- **Zustand** - Lightweight state management across apps.
- **Mongoose** - MongoDB ORM for forums data.
- **NextAuth** - Authentication framework (planned).
- **Vercel** - Hosting and CI/CD.

## Project Structure

```
amjadscorner/
├── app/              # App Router routes
│   ├── layout.tsx    # Global layout with navigation
│   ├── page.tsx      # Homepage (amjadscorner.us/)
│   ├── todo/         # Todo app
│   ├── ecommerce/    # E-commerce app
│   └── forums/       # Forums app
├── lib/              # Shared utilities (state, DB, auth)
├── public/           # Static assets
└── components/       # Reusable components (optional)
```

## Getting Started

1. Clone the Repository:

```
git clone https://github.com/AmjadShaaban/amjadscorner.git
cd amjadscorner
```

2. Install Dependencies:

```
npm install
```

3. Run Locally:

```
npm run dev
```

Open http://localhost:3000 in your browser..

4. Build for Production:

```
npm run build
npm start
```

## Deployment

Hosted on Vercel each `git push` updates amjadscorner.us instantly.

To deploy your own:

1. Connect your GitHub repo to Vercel.
2. Configure your custom domain (optional).
3. Push changes and watch it deploy!

## Roadmap

- [ ] Add CRUD functionality to the Todo App.
- [ ] Implement product listings and cart in E-commerce.
- [ ] Set up user auth and posting in Forums.
- [ ] Enhance UI with Tailwind and Framer Motion animations.

## About Me

I'm Amjad, a developer who loves crafting practical web solutions with TypeScript and Next.js.
This project is my space to experiment and grow. Find me on:

- [Github](https://github.com/AmjadShaaban/)
- [X](/) (WIP)
- [LinkedIn](/) (WIP)

## License

This project is licensed under the [MIT License](https://mit-license.org) see for details.

Your README.md looks fantastic—clean, professional, and perfectly tailored to amjadscorner.us! I love how you’ve personalized it with your GitHub handle (AmjadShaaban) and adjusted the structure to reflect your project’s current state. The Markdown formatting is spot-on, and it’s great to see you leveraging the cheat sheet to nail it. Let’s review it, address a few minor tweaks, and plan what’s next.
