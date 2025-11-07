import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {useApp, Dog} from '../context/AppContext';
import {getHealthStatus, getStatusColor, getStatusBackgroundColor, BreedSize} from '../utils/healthStatus';

const HomePage = ({navigation}: any) => {
  const {owner, dogs} = useApp();
  const [selectedDog, setSelectedDog] = useState<Dog | null>(null);

  useEffect(() => {
    if (dogs.length > 0) {
      // If no dog is selected, select the first one
      if (!selectedDog) {
        setSelectedDog(dogs[0]);
      } else {
        // If selected dog is no longer in the list, select the first one
        const dogStillExists = dogs.find(d => d.id === selectedDog.id);
        if (!dogStillExists) {
          setSelectedDog(dogs[0]);
        }
      }
    } else {
      // No dogs available, clear selection
      setSelectedDog(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogs]);

  const navigateToVitals = () => {
    if (selectedDog) {
      navigation.navigate('ProfilePageVitals', {dogId: selectedDog.id});
    }
  };

  const navigateTohistory = () => {
    navigation.navigate('HistoryScreen');
  };

  const navigateToSignUpDog = () => {
    navigation.navigate('SignUpDog');
  };

  const navigateToHeartRateHistory = () => {
    if (selectedDog) {
      navigation.navigate('HeartRateHistoryScreen', {dogId: selectedDog.id});
    }
  };

  const navigateToDogHealth = () => {
    if (selectedDog) {
      navigation.navigate('DogHealthScreen', {dogId: selectedDog.id});
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Top Section - Your Dogs */}
        <View style={styles.topSection}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Your Dogs</Text>
            <View style={styles.headerIcons}>
              <Text style={styles.arrow}>›</Text>
              <Text style={styles.icon}>⟳</Text>
            </View>
          </View>

          {dogs.length === 0 ? (
            <View style={styles.noDogsContainer}>
              <Text style={styles.noDogsText}>You don't have any dogs registered yet.</Text>
              <TouchableOpacity style={styles.signUpDogButton} onPress={navigateToSignUpDog}>
                <Text style={styles.signUpDogButtonText}>Sign up your dog now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
              {dogs.map(dog => (
                <TouchableOpacity 
                  key={dog.id} 
                  style={[styles.dogProfile, selectedDog?.id === dog.id && styles.selectedDogProfile]}
                  onPress={() => setSelectedDog(dog)}
                >
                  <View style={styles.profileImage}>
                    {dog.imageUri ? (
                      <Image source={{uri: dog.imageUri}} style={styles.dogProfileImage} />
                    ) : (
                      <Text style={styles.dogEmoji}>🐕</Text>
                    )}
                  </View>
                  <Text style={styles.dogName}>{dog.name}</Text>
                </TouchableOpacity>
              ))}
              {/* Add Dog Button beside dog profiles */}
              <TouchableOpacity 
                style={styles.addDogButton}
                onPress={navigateToSignUpDog}
              >
                <View style={styles.addDogButtonIcon}>
                  <Text style={styles.addDogButtonPlus}>+</Text>
                </View>
                <Text style={styles.addDogButtonText}>Add Dog</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Vital Status Section */}
        {selectedDog && (
          <TouchableOpacity style={styles.vitalsSection} onPress={navigateToVitals}>
            <View style={styles.vitalHeader}>
              <View style={styles.vitalDogImageContainer}>
                {selectedDog.imageUri ? (
                  <Image source={{uri: selectedDog.imageUri}} style={styles.vitalDogImage} />
                ) : (
                  <Text style={styles.vitalDogEmoji}>🐕</Text>
                )}
              </View>
              <Text style={styles.vitalTitle}>{selectedDog.name}'s Vital Status</Text>
            </View>

            <View style={styles.vitalsContainer}>
              {/* Heart Rate */}
              {(() => {
                const breedSize: BreedSize = 'unknown';
                const healthStatus = getHealthStatus(selectedDog.heartRate, selectedDog.temperature, breedSize);
                const heartRateStatus = healthStatus.heartRate;
                return (
                  <View style={[
                    styles.vitalBox,
                    {backgroundColor: getStatusBackgroundColor(heartRateStatus.status)}
                  ]}>
                    <Text style={[
                      styles.vitalNumber,
                      {color: getStatusColor(heartRateStatus.status)}
                    ]}>
                      {selectedDog.heartRate || 73}
                    </Text>
                    <Text style={styles.vitalLabel}>Beats per minute</Text>
                    <Text style={styles.vitalSubLabel}>Heartbeats</Text>
                    {heartRateStatus.status !== 'normal' && (
                      <Text style={[
                        styles.vitalStatus,
                        {color: getStatusColor(heartRateStatus.status)}
                      ]}>
                        {heartRateStatus.label}
                      </Text>
                    )}
                  </View>
                );
              })()}

              {/* Divider */}
              <View style={styles.vitalDivider} />

              {/* Temperature */}
              {(() => {
                const breedSize: BreedSize = 'unknown';
                const healthStatus = getHealthStatus(selectedDog.heartRate, selectedDog.temperature, breedSize);
                const temperatureStatus = healthStatus.temperature;
                return (
                  <View style={[
                    styles.vitalBox,
                    {backgroundColor: getStatusBackgroundColor(temperatureStatus.status)}
                  ]}>
                    <Text style={[
                      styles.vitalNumber,
                      {color: getStatusColor(temperatureStatus.status)}
                    ]}>
                      {selectedDog.temperature || 38.4}
                    </Text>
                    <Text style={styles.vitalLabel}>Celsius</Text>
                    <Text style={styles.vitalSubLabel}>Body Temperature</Text>
                    {temperatureStatus.status !== 'normal' && (
                      <Text style={[
                        styles.vitalStatus,
                        {color: getStatusColor(temperatureStatus.status)}
                      ]}>
                        {temperatureStatus.label}
                      </Text>
                    )}
                  </View>
                );
              })()}
            </View>
          </TouchableOpacity>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Health Cards Section */}
        <View style={styles.cardsSection}>
          <Text style={styles.cardsSectionTitle}>Health Information</Text>
          <View style={styles.cardsContainer}>
            <TouchableOpacity style={styles.healthCard} onPress={navigateTohistory}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>📊</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>Temperature History</Text>
                <Text style={styles.cardSubText}>View temperature records</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.healthCard} onPress={navigateToDogHealth}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>💚</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>
                  {selectedDog ? `${selectedDog.name}'s Health` : "Dog's Health"}
                </Text>
                <Text style={styles.cardSubText}>Overall health status</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.healthCard} onPress={navigateToHeartRateHistory}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>💓</Text>
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardText}>Heart Rate History</Text>
                <Text style={styles.cardSubText}>Monitor heart rate trends</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Navigation Bar (handled by Tab Navigator in App.tsx) */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  arrow: {
    fontSize: 24,
    color: '#000000',
  },
  icon: {
    fontSize: 20,
    color: '#000000',
  },
  dogList: {
    marginTop: 8,
  },
  dogProfile: {
    alignItems: 'center',
    marginRight: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  dogProfileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  dogEmoji: {
    fontSize: 40,
  },
  dogName: {
    marginTop: 8,
    fontSize: 14,
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  vitalsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  vitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vitalDogImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  vitalDogImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  vitalDogEmoji: {
    fontSize: 30,
  },
  vitalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  vitalsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  vitalBox: {
    flex: 1,
    alignItems: 'center',
  },
  vitalNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
  },
  vitalLabel: {
    fontSize: 16,
    color: '#000000',
    marginTop: 4,
  },
  vitalSubLabel: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  vitalDivider: {
    width: 1,
    height: 80,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  cardsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 100,
  },
  cardsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  cardsContainer: {
    gap: 12,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubText: {
    fontSize: 13,
    color: '#666666',
  },
  noDogsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noDogsText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  signUpDogButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  signUpDogButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDogProfile: {
    opacity: 1,
  },
  vitalStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  addDogButton: {
    alignItems: 'center',
    marginRight: 20,
    justifyContent: 'center',
  },
  addDogButtonIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  addDogButtonPlus: {
    fontSize: 32,
    color: '#666666',
    fontWeight: '300',
  },
  addDogButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
});

export default HomePage;

