# Contributing to SentimentAnalysisMobile

Thank you for your interest in contributing to this project! This guide will help you get started as a new developer.

## Project Structure

```
SentimentAnalysisMobile/
├── assets/             # Images and icons
├── components/         # Reusable UI components
│   ├── SentimentAnalytics.js
│   ├── SentimentPost.js
│   └── ...
├── context/           # React context providers
│   └── ThemeContext.js
├── screens/           # Main app screens
│   ├── PostHistoryScreen.js
│   ├── SentimentReportsScreen.js
│   └── ...
├── utils/             # Utility functions and services
│   └── supabaseClient.js
├── .env.example       # Example environment variables (DO NOT add actual credentials)
├── App.js             # Main application entry point
└── ...
```

## Getting Started

1. Follow the setup instructions in README.md
2. Make sure you've correctly configured your environment variables
3. Run the project to verify your setup is working:
   ```bash
   npm start
   ```

## Development Workflow

1. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test them thoroughly

3. **Commit your changes** with meaningful commit messages:
   ```bash
   git commit -m "Add feature: your feature description"
   ```

4. **Push your branch** to GitHub:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

## Important Guidelines

### Security

- Never commit API keys, secrets, or credentials
- Read the SECURITY.md file for detailed security guidelines

### Code Style

- Follow the existing code style in the project
- Use meaningful variable and function names
- Add comments for complex logic

### Testing

- Test your changes on both Android and iOS if possible
- Ensure your changes don't break existing functionality

## Working with Supabase

If you're using the project owner's Supabase:
- Do not modify table structures without coordination
- Use appropriate RLS policies for any new tables

If you're using your own Supabase instance:
- Refer to SECURITY.md for setup requirements
- Document any database structure changes you make

## Need Help?

If you have questions or need clarification, please:
- Reach out to the project owner
- Create an issue on GitHub with your question
