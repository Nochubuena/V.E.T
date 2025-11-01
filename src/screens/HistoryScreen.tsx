import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useApp} from '../context/AppContext';

const HistoryScreen = ({navigation}: any) => {
  const {dogs} = useApp();

  // Transform dogs data into vital records format
  const vitalRecords = dogs
    .filter(dog => dog.vitalRecords && dog.vitalRecords.length > 0)
    .map(dog => ({
      dogId: dog.id,
      dogName: dog.name,
      records: dog.vitalRecords || [],
    }));

  const navigateToVitals = (dogId: string) => {
    navigation.navigate('ProfilePageVitals', {dogId});
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.content}>
        {vitalRecords.length === 0 ? (
          <View style={styles.noRecordsContainer}>
            <Text style={styles.noRecordsText}>No vital records yet.</Text>
            <Text style={styles.noRecordsSubText}>Add your dogs and start tracking their health!</Text>
          </View>
        ) : (
          vitalRecords.map((dog, index) => (
            <View key={dog.dogId || index} style={styles.dogSection}>
              {/* Section Title */}
              <TouchableOpacity 
                style={styles.sectionHeader}
                onPress={() => navigateToVitals(dog.dogId)}
              >
                <Text style={styles.sectionTitle}>{dog.dogName}'s Vital Status</Text>
                <Text style={styles.sectionArrow}>›</Text>
              </TouchableOpacity>

            {/* Records List */}
            {dog.records.map((record, recordIndex) => (
              <View key={recordIndex} style={styles.recordRow}>
                <Text style={[styles.recordText, styles.heartRate]}>
                  {record.heartRate} bpm
                </Text>
                <Text style={[styles.recordText, styles.temperature]}>
                  {record.temperature} C
                </Text>
                <Text style={[styles.recordText, styles.status]}>
                  {record.status}
                </Text>
                <Text style={[styles.recordText, styles.time]}>
                  {record.time}
                </Text>
              </View>
            ))}
          </View>
          ))
        )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  dogSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  sectionArrow: {
    fontSize: 20,
    color: '#000000',
  },
  recordRow: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordText: {
    fontSize: 14,
  },
  heartRate: {
    color: '#007AFF',
    fontWeight: '600',
  },
  temperature: {
    color: '#34C759',
    fontWeight: '600',
  },
  status: {
    color: '#000000',
  },
  time: {
    color: '#000000',
  },
  noRecordsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noRecordsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
    textAlign: 'center',
  },
  noRecordsSubText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});

export default HistoryScreen;





