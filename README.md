# V.E.T App - Veterinary Pet Health Monitoring

A React Native mobile application for monitoring pet vital signs, built with React Native, TypeScript, and React Navigation.

## Features

The app consists of 5 main screens:

1. **Sign In Screen** - Authentication with email, Google, and Apple login options
2. **Home Page** - Overview of your pets with vital status summaries
3. **History Screen** - Historical vital signs records for all pets
4. **Profile Page** - User profile with account management options
5. **Profile Page Vitals** - Detailed vital signs with interactive charts

## Navigation Flow

```
SignIn → Home/History/Profile (Tab Navigator) → ProfilePageVitals
                                      ↓
                              Can switch accounts or log out
```

## Tech Stack

- **Expo** ~49.0.15 - Cross-platform framework
- **React Native** 0.72.6
- **TypeScript** 5.1.3
- **React Navigation** 6.x
  - Stack Navigator for screen transitions
  - Bottom Tab Navigator for main navigation
- **React Native SVG** for chart visualizations
- **React Native Vector Icons** for icons

## Project Structure

```
V.E.T/
├── src/
│   └── screens/
│       ├── SignInScreen.tsx
│       ├── HomePage.tsx
│       ├── HistoryScreen.tsx
│       ├── ProfilePage.tsx
│       └── ProfilePageVitals.tsx
├── App.tsx
├── index.js
├── package.json
└── README.md
```

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

## Running the App

### Web (Recommended for Quick Testing)
```bash
npm run web
```
This will open the app in your browser automatically.

### Mobile Development
```bash
# Start Expo development server
npm start

# Then choose:
# - Press 'w' for web
# - Press 'a' for Android
# - Press 'i' for iOS
```

Or run directly:
- **Web**: `npm run web`
- **Android**: `npm run android`
- **iOS**: `npm run ios`

## Screen Navigation

- **Sign In → Main App**: Click "Continue" button
- **Home → Profile Page Vitals**: Navigate from Profile tab or History section
- **Profile → Sign In**: Log out or switch account
- **Tab Navigation**: Navigate between Home, History, and Profile via bottom tabs

## Development Notes

- The app uses emoji icons for simplicity. You can replace with `react-native-vector-icons` for production.
- Sample data is hardcoded for demonstration. Connect to a backend API for real data.
- Charts are built using `react-native-svg` for visualization.

## Documentation

- **[START_HERE.md](START_HERE.md)** ⭐ - Navigation guide for all documentation
- **[CODE_INSTRUCTIONS.md](CODE_INSTRUCTIONS.md)** - Detailed line-by-line explanation of all code
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide for common patterns and concepts
- **[FILE_LIST.md](FILE_LIST.md)** - Complete file listing and structure

## License

MIT License

