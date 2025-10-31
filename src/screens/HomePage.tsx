import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const HomePage = ({navigation}: any) => {
  const [selectedDog] = useState('Dog name');

  // Sample dog data - in production this would come fromdasad a state management system
  const dogs = [
    {id: 1, name: 'Dog name 1'},
    {id: 2, name: 'Dog name 2'},
    {id: 3, name: 'Dog name 3'},
    {id: 4, name: 'Dog name 4'},
    {id: 4, name: 'Dog name 5'},
    {id: 4, name: 'Dog name 6'},
    {id: 4, name: 'Dog name 7'},
    {id: 4, name: 'Dog name 8'},
  ];

  const navigateToVitals = () => {
    navigation.navigate('ProfilePageVitals');
  };

    const navigateTohistory = () => {
    navigation.navigate('HistoryScreen');
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

          {/* Dog Profile Pictures */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dogList}>
            {dogs.map(dog => (
              <TouchableOpacity key={dog.id} style={styles.dogProfile}>
                <View style={styles.profileImage}>
                  <Text style={styles.dogEmoji}>🐕</Text>
                </View>
                <Text style={styles.dogName}>{dog.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Vital Status Section */}
        <TouchableOpacity style={styles.vitalsSection} onPress={navigateToVitals}>
          <Text style={styles.vitalTitle}>{selectedDog}'s Vital Status</Text>

          <View style={styles.vitalsContainer}>
            {/* Heart Rate */}
            <View style={styles.vitalBox}>
              <Text style={styles.vitalNumber}>73</Text>
              <Text style={styles.vitalLabel}>Beats per minute</Text>
              <Text style={styles.vitalSubLabel}>Heartbeats</Text>
            </View>

            {/* Divider */}
            <View style={styles.vitalDivider} />

            {/* Temperature */}
            <View style={styles.vitalBox}>
              <Text style={styles.vitalNumber}>38.4</Text>
              <Text style={styles.vitalLabel}>Celsius</Text>
              <Text style={styles.vitalSubLabel}>Body Temperature</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Health Cards Section */}
        <View style={styles.cardsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.healthCard} onPress={navigateTohistory}>
              <Text style={styles.cardText}>Temperature History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.healthCard}>
              <Text style={styles.cardText}>Dogs name's Health</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.healthCard}>
              <Text style={styles.cardText}>Heart Rate History</Text>
            </TouchableOpacity>
          </ScrollView>
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
  vitalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
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
  healthCard: {
    width: 200,
    height: 120,
    backgroundColor: '#D8B3FF',
    borderRadius: 16,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomePage;

