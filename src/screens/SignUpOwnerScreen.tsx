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

const SignUpOwnerScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string; name?: string; general?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean; password?: boolean; name?: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {signUpOwner, error: apiError} = useApp();

  const validateEmail = (email: string): string | undefined => {
    if (!email) {
      return 'Email address is required';
    }
    if (!email.includes('@')) {
      return 'Email must contain @ symbol';
    }
    if (email.split('@').length !== 2) {
      return 'Email can only contain one @ symbol';
    }
    const [localPart, domain] = email.split('@');
    if (!localPart || localPart.length === 0) {
      return 'Email must have text before @ symbol';
    }
    if (!domain || domain.length === 0) {
      return 'Email must have text after @ symbol';
    }
    if (!domain.includes('.')) {
      return 'Email domain must contain a dot (e.g., .com)';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g., user@example.com)';
    }
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return `Password must be at least 6 characters (currently ${password.length})`;
    }
    if (password.length > 100) {
      return 'Password is too long (maximum 100 characters)';
    }
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    // Name is optional, but if provided, validate it
    if (name.trim()) {
      if (name.trim().length < 2) {
        return 'Name must be at least 2 characters';
      }
      if (name.trim().length > 50) {
        return 'Name must be less than 50 characters';
      }
      // Check for invalid characters (only letters, spaces, hyphens, apostrophes)
      const nameRegex = /^[a-zA-Z\s'-]+$/;
      if (!nameRegex.test(name.trim())) {
        return 'Name can only contain letters, spaces, hyphens, and apostrophes';
      }
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

  const handleNameChange = (text: string) => {
    setName(text);
    if (touched.name) {
      setErrors({...errors, name: validateName(text)});
    }
  };

  const handleBlur = (field: 'email' | 'password' | 'name') => {
    setTouched({...touched, [field]: true});
    let error: string | undefined;
    if (field === 'email') {
      error = validateEmail(email);
      setErrors({...errors, email: error});
    } else if (field === 'password') {
      error = validatePassword(password);
      setErrors({...errors, password: error});
    } else if (field === 'name') {
      error = validateName(name);
      setErrors({...errors, name: error});
    }
  };

  const handleSignUp = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    const nameError = validateName(name);
    
    setTouched({email: true, password: true, name: true});
    setErrors({
      email: emailError,
      password: passwordError,
      name: nameError,
    });

    if (emailError || passwordError || nameError) {
      // Errors are now displayed below each field, no need for alert
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({...errors, general: undefined}); // Clear any previous general errors
      const success = await signUpOwner(email, password, name);
      if (success) {
        // Show success message and redirect to login page
        Alert.alert(
          'Account Created!',
          'Account creation successful proceed to login page',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.replace('Login');
              },
            },
          ]
        );
      } else {
        // Handle signup failure - check if it's an email conflict
        const errorMessage = apiError || 'Failed to create account. Please try again.';
        if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exists')) {
          setErrors({
            ...errors,
            email: 'This email is already registered. Please use a different email or try logging in.',
            general: undefined,
          });
          setTouched({...touched, email: true});
        } else {
          setErrors({
            ...errors,
            general: errorMessage,
          });
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred. Please try again.';
      setErrors({
        ...errors,
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Title */}
        <Text style={styles.appTitle}>V.E.T. Web</Text>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>Create an account</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Enter your information to sign up as a pet owner
        </Text>

        {/* Name Input (Optional) */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              touched.name && errors.name && styles.inputError,
            ]}
            placeholder="Name (Optional)"
            placeholderTextColor="#999999"
            value={name}
            onChangeText={handleNameChange}
            onBlur={() => handleBlur('name')}
            autoCapitalize="words"
          />
          {touched.name && errors.name && (
            <Text style={styles.errorText}>{errors.name}</Text>
          )}
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
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
          {touched.email && errors.email && (
            <Text style={styles.errorText}>{errors.email}</Text>
          )}
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              touched.password && errors.password && styles.inputError,
            ]}
            placeholder="Password (min. 6 characters)"
            placeholderTextColor="#999999"
            value={password}
            onChangeText={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          {touched.password && errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* General Error Message */}
        {errors.general && (
          <View style={styles.generalErrorContainer}>
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        )}

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, isSubmitting && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={isSubmitting}
        >
          <Text style={styles.signUpButtonText}>{isSubmitting ? 'Creating...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={navigateToLogin} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginLinkText}>Login</Text>
          </Text>
        </TouchableOpacity>

        {/* Legal Disclaimer */}
        <Text style={styles.disclaimer}>
          By clicking sign up, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
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
  inputContainer: {
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
    marginBottom: 8,
  },
  generalErrorContainer: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  generalErrorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  signUpButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#000000',
  },
  loginLinkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default SignUpOwnerScreen;

