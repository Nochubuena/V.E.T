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
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useApp, Dog} from '../context/AppContext';

const SignUpDogScreen = ({navigation}: any) => {
  const [dogName, setDogName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [baseTemperature, setBaseTemperature] = useState<string>('');
  const [baseHeartbeat, setBaseHeartbeat] = useState<string>('');
  const [tempError, setTempError] = useState<string>('');
  const [heartbeatError, setHeartbeatError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {owner, addDog} = useApp();

  // Web-compatible file input handler
  const handleWebFileInput = (event: any) => {
    const file = event.target?.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        Alert.alert('Invalid File', 'Please select an image file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image smaller than 10MB');
        return;
      }
      // Create object URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setImageUri(reader.result as string);
          Alert.alert('Success', 'Image selected successfully');
        }
      };
      reader.onerror = () => {
        Alert.alert('Error', 'Failed to read the image file');
      };
      reader.readAsDataURL(file);
    }
  };

  const requestImagePermissions = async () => {
    if (Platform.OS !== 'web') {
      const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Sorry, we need camera roll permissions to add a photo!');
        return false;
      }
    }
    return true;
  };

  const requestCameraPermissions = async () => {
    if (Platform.OS !== 'web') {
      const {status} = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Sorry, we need camera permissions to take a photo!');
        return false;
      }
    }
    return true;
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      // On web, use expo-image-picker which should work
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0]) {
          setImageUri(result.assets[0].uri);
          Alert.alert('Success', 'Image selected successfully');
        }
      } catch (error: any) {
        console.error('Web image picker error:', error);
        // Fallback: Create a file input programmatically for web
        if (typeof document !== 'undefined') {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.style.display = 'none';
          input.onchange = handleWebFileInput;
          document.body.appendChild(input);
          input.click();
          setTimeout(() => {
            if (document.body.contains(input)) {
              document.body.removeChild(input);
            }
          }, 100);
        } else {
          Alert.alert('Error', 'File selection is not available. Please try on a mobile device or use a browser.');
        }
      }
      return;
    }

    const hasPermission = await requestImagePermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        Alert.alert('Success', 'Image selected successfully');
      }
    } catch (error: any) {
      console.error('Image picker error:', error);
      Alert.alert('Error', `Failed to pick an image: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Web Platform Notice', 'Camera functionality is not available on web. Please use the mobile app or select from photo library.');
      return;
    }

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        Alert.alert('Success', 'Photo taken successfully');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      Alert.alert('Error', `Failed to take a photo: ${error.message || 'Unknown error'}. Please try again.`);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      // On web, directly trigger file input
      pickImage();
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {text: 'Camera', onPress: takePhoto},
        {text: 'Photo Library', onPress: pickImage},
        {text: 'Cancel', style: 'cancel'},
      ],
      {cancelable: true}
    );
  };

  const validateDogName = (name: string): string => {
    if (!name.trim()) {
      return 'Dog\'s name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Name must be less than 50 characters';
    }
    // Check for invalid characters (only letters, spaces, hyphens, apostrophes, numbers)
    const nameRegex = /^[a-zA-Z0-9\s'-]+$/;
    if (!nameRegex.test(name.trim())) {
      return 'Name can only contain letters, numbers, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateTemperature = (temp: string): string => {
    if (!temp.trim()) {
      return 'Base temperature is required';
    }
    const tempValue = parseFloat(temp);
    if (isNaN(tempValue)) {
      return 'Temperature must be a valid number';
    }
    if (tempValue < 35 || tempValue > 42) {
      return 'Temperature must be between 35 and 42°C';
    }
    return '';
  };

  const validateHeartbeat = (heartbeat: string): string => {
    if (!heartbeat.trim()) {
      return 'Base heartbeat is required';
    }
    const heartbeatValue = parseFloat(heartbeat);
    if (isNaN(heartbeatValue)) {
      return 'Heartbeat must be a valid number';
    }
    if (heartbeatValue < 40 || heartbeatValue > 200) {
      return 'Heartbeat must be between 40 and 200 BPM';
    }
    return '';
  };

  const handleDogNameChange = (text: string) => {
    setDogName(text);
    if (touched) {
      const errorMsg = validateDogName(text);
      setError(errorMsg);
      if (errorMsg) {
        Alert.alert('Validation Error', errorMsg);
      }
    }
  };

  const handleSignUp = async () => {
    const nameError = validateDogName(dogName);
    const tempErrorMsg = validateTemperature(baseTemperature);
    const heartbeatErrorMsg = validateHeartbeat(baseHeartbeat);
    
    setTouched(true);
    setError(nameError);
    setTempError(tempErrorMsg);
    setHeartbeatError(heartbeatErrorMsg);

    if (nameError || tempErrorMsg || heartbeatErrorMsg) {
      const errors = [nameError, tempErrorMsg, heartbeatErrorMsg].filter(e => e).join('\n');
      Alert.alert('Validation Error', errors);
      return;
    }

    if (!owner) {
      Alert.alert('Authentication Required', 'Please login first to register a dog.');
      navigation.navigate('Login');
      return;
    }

    const tempValue = parseFloat(baseTemperature);
    const heartbeatValue = parseFloat(baseHeartbeat);

    const newDog: Dog = {
      id: '', // Will be set by backend
      name: dogName.trim(),
      ownerId: owner.id,
      imageUri: imageUri || undefined,
      heartRate: heartbeatValue,
      temperature: tempValue,
      vitalRecords: [
        {
          heartRate: heartbeatValue,
          temperature: tempValue,
          status: 'Normal',
          time: new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true}).toLowerCase(),
        },
      ],
    };

    try {
      setIsSubmitting(true);
      const success = await addDog(newDog);
      if (success) {
        // Show success confirmation message
        Alert.alert(
          'Dog Registered!',
          `Dog registration successful. ${dogName.trim()} has been added to your account.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setDogName('');
                setImageUri(null);
                setBaseTemperature('');
                setBaseHeartbeat('');
                setError('');
                setTempError('');
                setHeartbeatError('');
                setTouched(false);
                // Navigate to home
                navigation.navigate('HomeTab');
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', `A pet named "${dogName.trim()}" already exists. Please choose a different name.`);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register dog. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Register Your Dog</Text>
        </View>

        {/* Section Header */}
        <Text style={styles.sectionHeader}>Add Your Pet</Text>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Enter your dog's information to register them
        </Text>

        {/* Image Selection */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imageContainer} onPress={showImageOptions}>
            {imageUri ? (
              <Image source={{uri: imageUri}} style={styles.dogImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {imageUri && (
            <TouchableOpacity 
              style={styles.removeImageButton} 
              onPress={() => {
                Alert.alert(
                  'Remove Image',
                  'Are you sure you want to remove this image?',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel',
                    },
                    {
                      text: 'Remove',
                      style: 'destructive',
                      onPress: () => {
                        setImageUri(null);
                        Alert.alert('Success', 'Image removed');
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={styles.removeImageText}>Remove</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Dog Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Dog's Name</Text>
          <TextInput
            style={[
              styles.input,
              touched && error && styles.inputError,
            ]}
            placeholder="Enter your dog's name"
            placeholderTextColor="#999999"
            value={dogName}
            onChangeText={handleDogNameChange}
            onBlur={() => {
              setTouched(true);
              const errorMsg = validateDogName(dogName);
              setError(errorMsg);
            }}
            autoCapitalize="words"
          />
          {touched && error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* Base Temperature Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Base Temperature (°C)</Text>
          <TextInput
            style={[
              styles.input,
              tempError && styles.inputError,
            ]}
            placeholder="Enter base temperature (e.g., 38.4)"
            placeholderTextColor="#999999"
            value={baseTemperature}
            onChangeText={(text) => {
              setBaseTemperature(text);
              if (tempError) {
                const errorMsg = validateTemperature(text);
                setTempError(errorMsg);
              }
            }}
            onBlur={() => {
              const errorMsg = validateTemperature(baseTemperature);
              setTempError(errorMsg);
            }}
            keyboardType="decimal-pad"
          />
          {tempError ? <Text style={styles.errorText}>{tempError}</Text> : null}
        </View>

        {/* Base Heartbeat Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Base Heartbeat (BPM)</Text>
          <TextInput
            style={[
              styles.input,
              heartbeatError && styles.inputError,
            ]}
            placeholder="Enter base heartbeat (e.g., 73)"
            placeholderTextColor="#999999"
            value={baseHeartbeat}
            onChangeText={(text) => {
              setBaseHeartbeat(text);
              if (heartbeatError) {
                const errorMsg = validateHeartbeat(text);
                setHeartbeatError(errorMsg);
              }
            }}
            onBlur={() => {
              const errorMsg = validateHeartbeat(baseHeartbeat);
              setHeartbeatError(errorMsg);
            }}
            keyboardType="number-pad"
          />
          {heartbeatError ? <Text style={styles.errorText}>{heartbeatError}</Text> : null}
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity 
          style={[styles.signUpButton, isSubmitting && styles.signUpButtonDisabled]} 
          onPress={handleSignUp}
          disabled={isSubmitting}
        >
          <Text style={styles.signUpButtonText}>
            {isSubmitting ? 'Registering...' : 'Register Dog'}
          </Text>
        </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backArrow: {
    fontSize: 28,
    color: '#000000',
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    marginBottom: 12,
  },
  dogImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  removeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  removeImageText: {
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
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
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
    marginLeft: 4,
  },
  signUpButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.5,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpDogScreen;

