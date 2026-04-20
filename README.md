# 🌐 WebLinks

WebLinks is an intelligent, personal web library that allows you to save, organize, and effortlessly search your favorite websites. Powered by Firebase and Google Gemini AI, WebLinks goes beyond traditional bookmark managers by offering automated metadata extraction and semantic AI search, ensuring you can always find what you need—even if you don't remember the exact title.

## ✨ Features

- **Google Authentication:** Secure and seamless sign-in via Firebase Google Auth.
- **Smart Add:** Simply paste a URL and WebLinks automatically fetches the website's title, description, and favicon using the Microlink API.
- **AI Semantic Search:** Can't remember a website's exact name? Search by concepts or topics! (e.g., search "color theory" to find design websites) powered by Gemini 2.5 Flash.
- **Custom Categories:** Organize your bookmarks into fully customizable categories. Deleting a category automatically safely moves its nested websites to "Other".
- **Real-Time Sync:** All bookmarks and categories are instantly synced across your devices using Firestore's real-time listeners.
- **Sleek UI/UX:** A modern, ambient design built with Tailwind CSS, featuring smooth transitions, modals, and zero-scrollbar app-like interfaces.

## 🛠️ Tech Stack

- **Frontend:** React (Vite), React Router v6
- **Styling:** Tailwind CSS, React Icons
- **Backend & Database:** Firebase Authentication, Firestore
- **AI Integration:** Google Gemini API (`gemini-2.5-flash`) via `@google/generative-ai`
- **Metadata APIs:** Microlink API (for unfurling), Google S2 (for Favicons)

## 📁 Project Structure

```text
web-links/
├── public/                 # Static assets
├── src/
│   ├── components/         
│   │   ├── layout/         # Sidebar, AppLayout
│   │   ├── modals/         # AddWebsiteModal, ManageCategoriesModal
│   │   └── ui/             # WebsiteCard
│   ├── context/            # AuthContext (Firebase User session)
│   ├── pages/              # Login, Home (AI Search), Websites (Library)
│   ├── services/           # Services (aiService, categoryService, firebase, metadataService)
│   ├── App.jsx             # Main routing & layout wrappers
│   ├── main.jsx            # React root entry
│   └── index.css           # Global CSS and custom animation keyframes
├── .env                    # Environment variables (Firebase + Gemini Keys)
├── index.html              # HTML entry point
├── package.json            # Project dependencies
└── tailwind.config.js      # Tailwind configuration & theme
```

## 🗺️ Routing Structure

WebLinks uses `react-router-dom` to enforce route protection:

- `/` **(Public)** - Login Page. Redirects to `/home` if already authenticated.
- `/home` **(Protected)** - The main dashboard featuring AI Semantic Search and a snapshot of your library.
- `/websites` **(Protected)** - The complete bookmark library where you can filter by categories and manage links.

*Invalid routes (`/*`) automatically redirect to the login page.*

## 🗄️ Firebase Database Structure

WebLinks uses **Cloud Firestore** structured efficiently around the User ID to ensure strict data privacy and fast queries.

```text
users (collection)
  └── {userId} (document)
      │
      ├── websites (subcollection)
      │   └── {websiteId} (document)
      │       ├── url: string (e.g., "https://github.com")
      │       ├── title: string 
      │       ├── description: string
      │       ├── faviconUrl: string
      │       ├── categoryName: string (e.g., "Development")
      │       └── createdAt: timestamp
      │
      └── categories (subcollection)
          └── {categoryId} (document)
              ├── name: string (e.g., "Development")
              └── isDeletable: boolean (e.g., true. "Other" is false)
```
