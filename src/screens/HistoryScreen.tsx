import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const HistoryScreen = ({navigation}: any) => {
  // Sample vital status records
  const vitalRecords = [
    {dogName: "Dog name 1", records: [
      {heartRate: 75, temperature: 38.7, status: 'Normal', time: '7:38 am'},
      {heartRate: 73, temperature: 35.7, status: 'Normal', time: '7:37 am'},
      {heartRate: 74, temperature: 36.8, status: 'Normal', time: '7:36 am'},
      {heartRate: 76, temperature: 34.7, status: 'Normal', time: '7:35 am'},
      {heartRate: 75, temperature: 36.4, status: 'Normal', time: '7:34 am'},
    ]},
    {dogName: "Dog name 2", records: [
      {heartRate: 75, temperature: 38.7, status: 'Normal', time: '7:38 am'},
      {heartRate: 73, temperature: 35.7, status: 'Normal', time: '7:37 am'},
      {heartRate: 74, temperature: 36.8, status: 'Normal', time: '7:36 am'},
      {heartRate: 76, temperature: 34.7, status: 'Normal', time: '7:35 am'},
      {heartRate: 75, temperature: 36.4, status: 'Normal', time: '7:34 am'},
    ]},
    {dogName: "Dog name 3", records: [
      {heartRate: 75, temperature: 38.7, status: 'Normal', time: '7:38 am'},
      {heartRate: 73, temperature: 35.7, status: 'Normal', time: '7:37 am'},
    ]},
  ];

  const navigateToVitals = (dogName: string) => {
    navigation.navigate('ProfilePageVitals');
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
        {vitalRecords.map((dog, index) => (
          <View key={index} style={styles.dogSection}>
            {/* Section Title */}
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => navigateToVitals(dog.dogName)}
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
        ))}
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
});

export default HistoryScreen;




