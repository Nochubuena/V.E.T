# Quick Reference Guide

## File Structure
```
App.tsx                    → Main navigation setup
src/screens/
  ├── SignInScreen.tsx     → Login/Authentication
  ├── HomePage.tsx         → Dashboard with pet overview
  ├── HistoryScreen.tsx    → Historical vital records
  ├── ProfilePage.tsx      → User settings & logout
  └── ProfilePageVitals.tsx → Detailed charts
```

## Key Concepts Explained

### 1. React Hooks (useState)
```typescript
const [email, setEmail] = useState('');
```
- **useState**: Creates a variable that re-renders component when changed
- First value: current state (email)
- Second value: function to update state (setEmail)
- '' is the initial/default value

### 2. Navigation Props
```typescript
const Screen = ({navigation}: any) => {
  navigation.navigate('OtherScreen');     // Go to new screen
  navigation.goBack();                    // Go back
  navigation.replace('OtherScreen');      // Replace current screen
  navigation.reset({...});                // Reset whole stack
}
```

### 3. Mapping Arrays
```typescript
{dogs.map(dog => (
  <View key={dog.id}>
    <Text>{dog.name}</Text>
  </View>
))}
```
- **.map()**: Creates a new array by transforming each item
- For each dog, creates a View with Text showing name
- **key**: Required for React to track items efficiently

### 4. Styling
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,              // Take up full space
    backgroundColor: '#FFFFFF',  // White background
    padding: 20,          // Space inside
    margin: 10,           // Space outside
    borderRadius: 12,     // Rounded corners
  }
});
```

### 5. TouchableOpacity
```typescript
<TouchableOpacity onPress={() => doSomething()}>
  <Text>Click Me</Text>
</TouchableOpacity>
```
- Makes its children pressable
- onPress: Function called when pressed
- Provides touch feedback (opacity change)

### 6. ScrollView
```typescript
<ScrollView>
  <View>Content that might overflow screen</View>
</ScrollView>
```
- Allows content to scroll when it exceeds screen height
- **horizontal**: Makes it scroll left/right instead

### 7. SafeAreaView
```typescript
<SafeAreaView>
  <Text>Content</Text>
</SafeAreaView>
```
- Prevents content from overlapping with status bar or notches
- Always wrap top-level screens in SafeAreaView

### 8. SVG Charts
```typescript
<Svg width={300} height={150}>
  <Path d="M 0,50 L 50,30 L 100,70" stroke="#007AFF" />
  <Circle cx={50} cy={30} r="4" fill="#007AFF" />
</Svg>
```
- SVG: Scalable Vector Graphics for charts
- Path: Draws lines (d = path data string)
- Circle: Draws points (cx, cy = center, r = radius)

## Common Patterns

### Conditional Rendering
```typescript
{isLoggedIn ? <Dashboard /> : <SignIn />}
```

### Passing Data Between Screens
```typescript
navigation.navigate('Details', {dogId: 5});
```

### Arrow Functions
```typescript
const handlePress = () => navigation.goBack();
// Same as:
const handlePress = function() { navigation.goBack(); }
```

### Template Literals
```typescript
`${dogName}'s Vital Status`
// "Dog Name 1's Vital Status" (if dogName = "Dog Name 1")
```

## Color Scheme
- Primary: #007AFF (blue links/active)
- Success: #34C759 (green temperature)
- Danger: #FF3B30 (red logout)
- Text: #000000 (black), #666666 (gray)
- Background: #FFFFFF (white), #F5F5F5 (light gray)

## Navigation Flow
```
SignIn → [Continue] → Main App (Tabs)
                              ↓
                    ┌─────────┼─────────┐
                    ↓         ↓         ↓
                 Home     History    Profile
                    ↓         ↓         ↓
                    └─────────┴─────────┘
                             ↓
                      Vitals Detail
```

## Quick Commands
```bash
npm install          # Install dependencies
npm start           # Start Metro bundler
npm run android     # Run on Android
npm run ios         # Run on iOS
```





