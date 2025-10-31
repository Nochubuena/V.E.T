# Web App Setup Guide

Your V.E.T app is now configured to run as a web application!

## ✅ Already Done

1. ✅ Expo SDK installed (~49.0.15)
2. ✅ @expo/webpack-config installed for web support
3. ✅ Web dependencies configured
4. ✅ Babel configured for web
5. ✅ App.json configured for multi-platform

## ⚠️ Important Note

**Don't use `"bundler": "metro"` and `"output": "static"` in app.json** - This requires expo-router which we're not using. Keep the simple config.

## 🚀 Running the Web App

### Quick Start
```bash
npm run web
```

This command will:
1. Start the Expo development server
2. Open your browser automatically
3. Serve the app at `http://localhost:19006` or similar port

### Alternative Methods

**Method 1: Expo Start Menu**
```bash
npm start
```
Then press `w` to open in web browser

**Method 2: Direct URL**
After running `npm start`, look for the web URL in terminal and open it in your browser

## 📱 All Platforms

This app now works on:
- ✅ **Web Browser** - Chrome, Firefox, Safari, Edge
- ✅ **iOS** - iPhone and iPad
- ✅ **Android** - Phones and tablets

## 🌐 Web-Specific Features

### What Works on Web
- All navigation (Stack & Tab navigators)
- All 5 screens (SignIn, Home, History, Profile, Vitals)
- SVG charts and visualizations
- Forms and inputs
- Touch interactions (click events)
- Scrolling and layout
- Styling and themes

### Platform Differences
- **Mobile**: Native components, gestures
- **Web**: Browser HTML/CSS rendering
- Both use the same React Native code!

## 🛠️ Development Tips

### Hot Reload
Changes automatically refresh in the browser. Just save your files!

### Console Logs
Open browser DevTools (F12) to see console output

### Debugging
- React DevTools work in Chrome/Firefox
- Network tab shows API calls
- Elements tab shows rendered structure

### Performance
- Web bundle is separate from mobile
- Optimizations handled by Expo
- Use Lighthouse for web performance testing

## 📦 Build for Production

### Web Production Build
```bash
npx expo build:web
```

This creates an optimized production build in the `web-build/` folder

### Deploy to Web
You can deploy to:
- **Netlify**: Drag & drop `web-build/` folder
- **Vercel**: Connect your repo
- **GitHub Pages**: Upload `web-build/` folder
- **Any static hosting**: Upload `web-build/` folder

## 🔍 Troubleshooting

### Port Already in Use
If port 19006 is busy:
```bash
# Expo will auto-select next available port
npm run web
```

### Browser Won't Open
Manually navigate to the URL shown in terminal

### Styles Look Different
Some mobile styles adapt differently on web. Check:
- SafeAreaView behavior
- Platform-specific spacing
- Font rendering

### SVG Charts Not Displaying
Make sure `react-native-svg` is installed:
```bash
npm install react-native-svg
```

## 📚 Learn More

- [Expo Web Docs](https://docs.expo.dev/workflow/web/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Expo Deployment](https://docs.expo.dev/distribution/publishing-websites/)

## 🎉 You're Ready!

Your app is now a fully functional web application. Run `npm run web` to see it in action!

