# Troubleshooting Guide

This document summarizes issues encountered and their solutions.

## Issues Fixed

### Issue 1: "Project is not setup correctly for static rendering"
**Error:** `A version of expo-router with Node.js support is not installed`

**Root Cause:** 
- The `app.json` had `"bundler": "metro"` and `"output": "static"` configuration
- These settings require expo-router which we're not using

**Solution:**
```json
// app.json - REMOVED these lines:
"web": {
  "bundler": "metro",
  "output": "static"
}

// KEPT simple config:
"platforms": ["web", "ios", "android"]
```

---

### Issue 2: Web Dependencies Missing
**Error:** `Please install @expo/webpack-config@^19.0.0`

**Root Cause:** 
- Expo web support requires @expo/webpack-config

**Solution:**
```bash
npx expo install @expo/webpack-config@^19.0.0
```

---

### Issue 3: Package Version Mismatches
**Error:** 
```
Some dependencies are incompatible:
  react-native@0.72.6 - expected: 0.72.10
  react-native-safe-area-context@4.14.1 - expected: 4.6.3
  react-native-screens@3.37.0 - expected: ~3.22.0
  react-native-svg@13.14.1 - expected: 13.9.0
```

**Root Cause:** 
- Package versions were incompatible with Expo SDK 49

**Solution:**
```bash
npx expo install --fix
```
This auto-corrects all package versions to match Expo SDK requirements.

---

### Issue 4: Webpack Warning About Named Export
**Error:** 
```
WARNING in ./index.js:9:30
Should not import the named export 'name' (imported as 'appName') 
from default-exporting module
```

**Root Cause:** 
- Webpack doesn't like importing named exports from JSON files

**Solution:**
Changed `index.js` from:
```javascript
import {name as appName} from './app.json';
AppRegistry.registerComponent(appName, () => App);
```

To:
```javascript
AppRegistry.registerComponent('V.E.T', () => App);
```

---

### Issue 5: Port Already in Use
**Error:** `Port 8081 is being used by another process`

**Root Cause:** 
- Previous Expo processes didn't fully shut down

**Solution:**
```powershell
Stop-Process -Name "node" -Force
# Wait a few seconds, then restart
npm run web
```

---

## Current Working Configuration

### app.json
```json
{
  "name": "V.E.T",
  "displayName": "V.E.T",
  "expo": {
    "name": "V.E.T",
    "slug": "vet-app",
    "version": "1.0.0",
    "platforms": ["web", "ios", "android"]
  }
}
```

### index.js
```javascript
import {AppRegistry} from 'react-native';
import App from './App';

AppRegistry.registerComponent('V.E.T', () => App);
```

### package.json Dependencies (Fixed Versions)
```json
{
  "dependencies": {
    "@expo/webpack-config": "^19.0.0",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "expo": "~49.0.15",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-native": "0.72.10",
    "react-native-gesture-handler": "~2.12.0",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",
    "react-native-svg": "13.9.0",
    "react-native-vector-icons": "^10.0.3",
    "react-native-web": "~0.19.6"
  }
}
```

---

## Verification

After all fixes, the app should:
1. ✅ Start without errors on `npm run web`
2. ✅ Open in browser at http://localhost:19006
3. ✅ Display SignIn screen correctly
4. ✅ Navigate between all screens
5. ✅ Show charts and visualizations
6. ✅ No webpack warnings or errors

---

## If You Still Have Issues

1. **Clear all caches:**
   ```bash
   rm -rf node_modules
   rm -rf .expo
   npm install
   ```

2. **Check Expo version:**
   ```bash
   npx expo --version
   ```

3. **Rebuild dependencies:**
   ```bash
   npx expo install --fix
   ```

4. **Check for port conflicts:**
   ```powershell
   Get-NetTCPConnection -State Listen | Where-Object {$_.LocalPort -in 19006,8081}
   ```

5. **Start fresh:**
   ```bash
   Stop-Process -Name "node" -Force
   npm run web
   ```

---

## Common Mistakes to Avoid

❌ **DON'T** add `"bundler": "metro"` to app.json
❌ **DON'T** add `"output": "static"` to app.json  
❌ **DON'T** import named exports from JSON in index.js
❌ **DON'T** use package versions not compatible with Expo SDK
❌ **DON'T** skip running `npx expo install --fix`

✅ **DO** use simple `"platforms"` array in app.json
✅ **DO** hardcode app name in index.js
✅ **DO** run `npx expo install --fix` after adding packages
✅ **DO** check that all ports are free before starting
✅ **DO** kill old node processes before restarting













