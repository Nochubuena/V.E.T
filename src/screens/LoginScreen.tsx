import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import {useApp} from '../context/AppContext';

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean; password?: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {login} = useApp();

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length > 100) {
      return 'Password must be less than 100 characters';
    }
    return undefined;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (touched.email) {
      setErrors({...errors, email: validateEmail(text)});
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      setErrors({...errors, password: validatePassword(text)});
    }
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched({...touched, [field]: true});
    let error: string | undefined;
    if (field === 'email') {
      error = validateEmail(email);
      setErrors({...errors, email: error});
      if (error) {
        Alert.alert('Validation Error', error);
      }
    } else if (field === 'password') {
      error = validatePassword(password);
      setErrors({...errors, password: error});
      if (error) {
        Alert.alert('Validation Error', error);
      }
    }
  };

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setTouched({email: true, password: true});
    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      // Show the first error in a popup
      const firstError = emailError || passwordError;
      Alert.alert('Validation Error', firstError);
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await login(email, password);
      if (success) {
        navigation.replace('Main');
      } else {
        setErrors({...errors, password: 'Invalid email or password'});
        Alert.alert('Login Error', 'Invalid email or password');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToSignUp = () => {
    navigation.navigate('SignUpOwner');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Title */}
        <Text style={styles.appTitle}>V.E.T. App</Text>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>Welcome back</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Enter your email and password to login
        </Text>

        {/* Email Input */}
        <View>
          <TextInput
            style={[
              styles.input,
              touched.email && errors.email && styles.inputError,
            ]}
            placeholder="email@domain.com"
            placeholderTextColor="#999999"
            value={email}
            onChangeText={handleEmailChange}
            onBlur={() => handleBlur('email')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Password Input */}
        <View>
          <TextInput
            style={[
              styles.input,
              touched.password && errors.password && styles.inputError,
            ]}
            placeholder="Password"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity 
          style={[styles.loginButton, isSubmitting && styles.loginButtonDisabled]} 
          onPress={handleLogin}
          disabled={isSubmitting}
        >
          <Text style={styles.loginButtonText}>{isSubmitting ? 'Logging in...' : 'Login'}</Text>
        </TouchableOpacity>

        {/* Sign Up Section */}
        <View style={styles.signUpSection}>
          <Text style={styles.signUpPrompt}>Don't have an account?</Text>
          <TouchableOpacity onPress={navigateToSignUp} style={styles.signUpButton}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  loginButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  signUpPrompt: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  signUpButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 200,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;

