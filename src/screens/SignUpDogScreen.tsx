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

  const handleSignUp = () => {
    const nameError = validateDogName(dogName);
    setTouched(true);
    setError(nameError);

    if (nameError) {
      Alert.alert('Validation Error', nameError);
      return;
    }

    if (!owner) {
      Alert.alert('Authentication Required', 'Please login first to register a dog.');
      navigation.navigate('Login');
      return;
    }

    const newDog: Dog = {
      id: Date.now().toString(),
      name: dogName.trim(),
      ownerId: owner.id,
      imageUri: imageUri || undefined,
      heartRate: 73, // Default values
      temperature: 38.4,
      vitalRecords: [
        {
          heartRate: 73,
          temperature: 38.4,
          status: 'Normal',
          time: new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true}).toLowerCase(),
        },
      ],
    };

    addDog(newDog);
    Alert.alert('Success', `${dogName.trim()} has been registered successfully!`, [
      {
        text: 'OK',
        onPress: () => navigation.navigate('HomeTab'),
      },
    ]);
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
        <View>
          <TextInput
            style={[
              styles.input,
              touched && error && styles.inputError,
            ]}
            placeholder="Dog's Name"
            placeholderTextColor="#999999"
            value={dogName}
            onChangeText={handleDogNameChange}
            onBlur={() => {
              setTouched(true);
              const errorMsg = validateDogName(dogName);
              setError(errorMsg);
              if (errorMsg) {
                Alert.alert('Validation Error', errorMsg);
              }
            }}
            autoCapitalize="words"
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>Register Dog</Text>
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
  signUpButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpDogScreen;

