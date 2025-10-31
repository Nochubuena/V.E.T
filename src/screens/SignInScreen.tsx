import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

const SignInScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');

  const handleContinue = () => {
    // Navigate to main app
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tailwind test: should render red headline when NativeWind is working */}
      <Text className="text-red-500 text-center">Tailwind active</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Title */}
        <Text style={styles.appTitle}>V.E.T. App</Text>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>Create an account</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Enter your email to sign up for this app
        </Text>

        {/* Email Input */}
        <TextInput
          style={styles.emailInput}
          placeholder="email@domain.com"
          placeholderTextColor="#999999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Continue Button */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>

        {/* Separator */}
        <Text style={styles.separator}>or</Text>

        {/* Social Login Buttons */}
        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialButton}>
          <Text style={styles.socialIcon}>🍎</Text>
          <Text style={styles.socialText}>Continue with Apple</Text>
        </TouchableOpacity>

        {/* Legal Disclaimer */}
        <Text style={styles.disclaimer}>
          By clicking continue, you agree to our{' '}
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
    color: '#000000',
    textAlign: 'center',
    marginBottom: 32,
  },
  emailInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666666',
    marginVertical: 20,
  },
  socialButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  socialIcon: {
    fontSize: 20,
    marginRight: 12,
    fontWeight: 'bold',
  },
  socialText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 12,
    color: '#000000',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
});

export default SignInScreen;


