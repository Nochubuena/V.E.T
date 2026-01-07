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
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {useApp, Dog} from '../context/AppContext';
import AnimatedButton from '../components/AnimatedButton';

const SignUpDogScreen = ({navigation}: any) => {
  const [dogName, setDogName] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [touched, setTouched] = useState(false);
  const [breed, setBreed] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [breedError, setBreedError] = useState<string>('');
  const [ageError, setAgeError] = useState<string>('');
  const [genderError, setGenderError] = useState<string>('');
  const [weightError, setWeightError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [addedDogName, setAddedDogName] = useState<string>('');
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

  const validateBreed = (breed: string): string => {
    if (!breed.trim()) {
      return 'Breed is required';
    }
    if (breed.trim().length < 2) {
      return 'Breed must be at least 2 characters';
    }
    return '';
  };

  const validateAge = (age: string): string => {
    if (!age.trim()) {
      return 'Age is required';
    }
    const ageValue = parseFloat(age);
    if (isNaN(ageValue)) {
      return 'Age must be a valid number';
    }
    if (ageValue < 0 || ageValue > 30) {
      return 'Age must be between 0 and 30 years';
    }
    return '';
  };

  const validateGender = (gender: string): string => {
    if (!gender.trim()) {
      return 'Gender is required';
    }
    const genderLower = gender.trim().toLowerCase();
    if (genderLower !== 'male' && genderLower !== 'female' && genderLower !== 'm' && genderLower !== 'f') {
      return 'Gender must be Male or Female';
    }
    return '';
  };

  const validateWeight = (weight: string): string => {
    if (!weight.trim()) {
      return 'Weight is required';
    }
    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) {
      return 'Weight must be a valid number';
    }
    if (weightValue < 0.5 || weightValue > 200) {
      return 'Weight must be between 0.5 and 200 kg';
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
    const breedErrorMsg = validateBreed(breed);
    const ageErrorMsg = validateAge(age);
    const genderErrorMsg = validateGender(gender);
    const weightErrorMsg = validateWeight(weight);
    
    setTouched(true);
    setError(nameError);
    setBreedError(breedErrorMsg);
    setAgeError(ageErrorMsg);
    setGenderError(genderErrorMsg);
    setWeightError(weightErrorMsg);

    if (nameError || breedErrorMsg || ageErrorMsg || genderErrorMsg || weightErrorMsg) {
      const errors = [nameError, breedErrorMsg, ageErrorMsg, genderErrorMsg, weightErrorMsg].filter(e => e).join('\n');
      Alert.alert('Validation Error', errors);
      return;
    }

    if (!owner) {
      Alert.alert('Authentication Required', 'Please login first to register a dog.');
      navigation.navigate('Login');
      return;
    }

    const ageValue = parseFloat(age);
    const weightValue = parseFloat(weight);
    const genderNormalized = gender.trim().toLowerCase() === 'm' || gender.trim().toLowerCase() === 'male' 
      ? 'Male' 
      : 'Female';

    const newDog: Dog = {
      id: '', // Will be set by backend
      name: dogName.trim(),
      ownerId: owner.id,
      imageUri: imageUri || undefined,
      breed: breed.trim(),
      age: ageValue,
      gender: genderNormalized,
      weight: weightValue,
    };

    try {
      setIsSubmitting(true);
      const success = await addDog(newDog);
      if (success) {
        // Store the dog name and show success modal
        setAddedDogName(dogName.trim());
        setSuccessModalVisible(true);
        // Reset form
        setDogName('');
        setImageUri(null);
        setBreed('');
        setAge('');
        setGender('');
        setWeight('');
        setError('');
        setBreedError('');
        setAgeError('');
        setGenderError('');
        setWeightError('');
        setTouched(false);
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

        {/* Breed Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Breed</Text>
          <TextInput
            style={[
              styles.input,
              breedError && styles.inputError,
            ]}
            placeholder="Enter breed (e.g., Golden Retriever)"
            placeholderTextColor="#999999"
            value={breed}
            onChangeText={(text) => {
              setBreed(text);
              if (breedError) {
                const errorMsg = validateBreed(text);
                setBreedError(errorMsg);
              }
            }}
            onBlur={() => {
              const errorMsg = validateBreed(breed);
              setBreedError(errorMsg);
            }}
            autoCapitalize="words"
          />
          {breedError ? <Text style={styles.errorText}>{breedError}</Text> : null}
        </View>

        {/* Age Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Age (years)</Text>
          <TextInput
            style={[
              styles.input,
              ageError && styles.inputError,
            ]}
            placeholder="Enter age (e.g., 5)"
            placeholderTextColor="#999999"
            value={age}
            onChangeText={(text) => {
              setAge(text);
              if (ageError) {
                const errorMsg = validateAge(text);
                setAgeError(errorMsg);
              }
            }}
            onBlur={() => {
              const errorMsg = validateAge(age);
              setAgeError(errorMsg);
            }}
            keyboardType="decimal-pad"
          />
          {ageError ? <Text style={styles.errorText}>{ageError}</Text> : null}
        </View>

        {/* Gender Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Gender</Text>
          <TextInput
            style={[
              styles.input,
              genderError && styles.inputError,
            ]}
            placeholder="Enter gender (Male/Female)"
            placeholderTextColor="#999999"
            value={gender}
            onChangeText={(text) => {
              setGender(text);
              if (genderError) {
                const errorMsg = validateGender(text);
                setGenderError(errorMsg);
              }
            }}
            onBlur={() => {
              const errorMsg = validateGender(gender);
              setGenderError(errorMsg);
            }}
            autoCapitalize="words"
          />
          {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}
        </View>

        {/* Weight Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Weight (kg)</Text>
          <TextInput
            style={[
              styles.input,
              weightError && styles.inputError,
            ]}
            placeholder="Enter weight (e.g., 25.5)"
            placeholderTextColor="#999999"
            value={weight}
            onChangeText={(text) => {
              setWeight(text);
              if (weightError) {
                const errorMsg = validateWeight(text);
                setWeightError(errorMsg);
              }
            }}
            onBlur={() => {
              const errorMsg = validateWeight(weight);
              setWeightError(errorMsg);
            }}
            keyboardType="decimal-pad"
          />
          {weightError ? <Text style={styles.errorText}>{weightError}</Text> : null}
        </View>

        {/* Sign Up Button */}
        <AnimatedButton 
          onPress={handleSignUp}
          disabled={isSubmitting}
          style={[styles.signUpButton, isSubmitting && styles.signUpButtonDisabled]}
        >
          <Text style={styles.signUpButtonText}>
            {isSubmitting ? 'Registering...' : 'Register Dog'}
          </Text>
        </AnimatedButton>
      </ScrollView>

      {/* Success Confirmation Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSuccessModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Success!</Text>
            <Text style={styles.modalMessage}>
              {addedDogName} has been added:
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSuccessModalVisible(false);
                navigation.navigate('HomeTab');
              }}
            >
              <Text style={styles.modalButtonText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SignUpDogScreen;

