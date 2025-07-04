# AutoLLM - The Intelligent, Open Source AI Chat App

![AutoLLM Demo](https://via.placeholder.com/1200x600.png?text=AutoLLM+Screenshot)

**AutoLLM is an open-source AI chat application built with Next.js, Firebase, and Tailwind CSS. It intelligently routes your prompts to the best open-source language models via OpenRouter, ensuring optimal responses for any task.**

This project is designed to be a powerful, self-hostable alternative to commercial AI chat services. It operates on a "Bring Your Own Key" (BYOK) model, giving you complete control over your API usage and costs.

---

### 👑 Author

Created with ❤️ by **[PAVUN KUMAR R](https://github.com/Pavun57)**.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/pavun-kumar-r-337545299)

---

## ✨ Key Features

*   **🧠 Intelligent Model Routing**: Automatically classifies your prompt (e.g., code, writing, analysis) and selects the most suitable, high-performing open-source model from OpenRouter.
*   **🔑 Bring Your Own Key (BYOK)**: Securely use your own OpenRouter API key. It's stored *only* in your browser's local storage and is never sent to our servers.
*   **💬 Modern Chat Interface**: A clean, responsive, and real-time chat experience built for performance.
*   **🔥 Built with the Best**:
    *   [Next.js](https://nextjs.org/) App Router for a robust and scalable frontend.
    *   [Firebase](https://firebase.google.com/) for authentication and real-time database.
    *   [Tailwind CSS](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/) for a beautiful, customizable UI.
    *   [OpenRouter.ai](https://openrouter.ai/) for access to a wide range of top-tier AI models.
*   **📜 Conversation History**: All your conversations are saved to your Firebase account for easy access.
*   **🌓 Light & Dark Mode**: Beautifully crafted themes that adapt to your system preference.
*   **🚀 Self-Hostable & Open Source**: Deploy it yourself and customize it to your heart's content. Free forever.

---

## 🚀 Getting Started

Follow these steps to get AutoLLM running locally on your machine.

### 1. Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later)
*   [pnpm](https://pnpm.io/) (recommended package manager)
*   A [Firebase](https://firebase.google.com/) project
*   An [OpenRouter.ai](https://openrouter.ai/) account

### 2. Clone the Repository

```bash
git clone https://github.com/Pavun57/autollm
cd autollm
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Set Up Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Firestore**: In your new project, go to the "Firestore Database" section and create a database. Start in **production mode**.
3.  **Enable Authentication**: Go to the "Authentication" section, click "Get started", and enable the **Google** provider.
4.  **Get Web App Credentials**:
    *   In your project settings (click the ⚙️ icon), scroll down to "Your apps".
    *   Click the "</>" icon to create a new Web App.
    *   Register the app and copy the `firebaseConfig` object values. You'll need these for your environment variables.
5.  **Get Service Account Credentials (for Admin SDK)**:
    *   In your project settings, go to the "Service accounts" tab.
    *   Click "Generate new private key". A JSON file will be downloaded. You'll need values from this file.

### 5. Set Up Environment Variables

Create a file named `.env.local` in the root of the project and add the following variables.

```env
# Firebase Public (Web App) Config
NEXT_PUBLIC_FIREBASE_API_KEY=AI...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=1:...

# Firebase Admin (Service Account) Config
# Get these from the JSON file you downloaded
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com"
# Take the private_key from the JSON, replace \n with \\n
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_EMAIL_SIGNIN_URL=http://localhost:3000/auth/email-signin
```

**Important**: To format the `FIREBASE_PRIVATE_KEY`, copy the entire key string from the JSON file and replace every newline character (`\n`) with a literal `\\n`.

### 6. Run the Development Server

```bash
pnpm run dev
```

The app should now be running at [http://localhost:3000](http://localhost:3000).

---

## 🔧 Usage

### Adding Your OpenRouter API Key

AutoLLM uses a "Bring Your Own Key" model. You need to provide your own OpenRouter API key to use the chat.

1.  **Get a Key**: Sign up at [OpenRouter.ai](https://openrouter.ai/) and create an API key.
2.  **Add the Key**:
    *   After logging into the app for the first time, a modal will prompt you to enter your key.
    *   You can also add, edit, or remove your key at any time by clicking your user avatar in the top-right corner and selecting "API Key".

Your key is stored securely in your browser's `localStorage` and is **never** saved in the database or sent to any server other than OpenRouter's.

---

## 🛠️ Technology Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
*   **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
*   **AI Models**: [OpenRouter.ai](https://openrouter.ai/)
*   **Deployment**: Vercel (recommended)

---

## 🤝 Contributing

Contributions are welcome! If you have ideas for new features, bug fixes, or improvements, please open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. 