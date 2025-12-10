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
import {
  getHealthStatus,
  getStatusColor,
  getStatusBackgroundColor,
  BreedSize,
} from '../utils/healthStatus';

const DogHealthScreen = ({navigation, route}: any) => {
  const {dogs} = useApp();
  const dogId = route?.params?.dogId;
  
  const dog = dogId ? dogs.find(d => d.id === dogId) : dogs[0];
  const dogName = dog?.name || "Dog Name";
  
  // For now, assume unknown breed size (can be added to Dog interface later)
  const breedSize: BreedSize = 'unknown';
  
  const healthStatus = getHealthStatus(
    dog?.heartRate,
    dog?.temperature,
    breedSize
  );

  if (!dog && dogs.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <View style={styles.backButton}>
              <Text style={styles.backArrow}>‹</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.scrollContent}>
          <Text style={styles.dogName}>No dog found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={styles.title}>{dogName}'s Health</Text>
        <Text style={styles.subtitle}>Overall health status</Text>
        
        {/* Last Update Time */}
        {dog?.vitalRecords && dog.vitalRecords.length > 0 && (
          <View style={styles.updateInfo}>
            <Text style={styles.updateLabel}>
              Last updated: {new Date(dog.vitalRecords[dog.vitalRecords.length - 1].time).toLocaleString()}
            </Text>
            {(() => {
              const lastUpdateTime = new Date(dog.vitalRecords[dog.vitalRecords.length - 1].time);
              const minutesSinceUpdate = Math.floor((Date.now() - lastUpdateTime.getTime()) / 60000);
              return minutesSinceUpdate > 1 && (
                <Text style={styles.staleWarning}>
                  Data is {minutesSinceUpdate} minute{minutesSinceUpdate !== 1 ? 's' : ''} old
                </Text>
              );
            })()}
          </View>
        )}

        {/* Health Status Overview */}
        <View style={styles.overviewSection}>
          <View style={[
            styles.overviewCard,
            {
              backgroundColor: 
                healthStatus.heartRate.status === 'normal' && 
                healthStatus.temperature.status === 'normal'
                  ? '#E8F5E9'
                  : '#FFEBEE'
            }
          ]}>
            <Text style={styles.overviewTitle}>Overall Status</Text>
            <Text style={[
              styles.overviewStatus,
              {
                color:
                  healthStatus.heartRate.status === 'normal' && 
                  healthStatus.temperature.status === 'normal'
                    ? '#34C759'
                    : '#FF3B30'
              }
            ]}>
              {healthStatus.heartRate.status === 'normal' && 
               healthStatus.temperature.status === 'normal'
                ? 'Healthy'
                : 'Attention Needed'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Heart Rate Status */}
        <View style={styles.vitalSection}>
          <Text style={styles.vitalSectionTitle}>Heart Rate</Text>
          <View style={[
            styles.vitalCard,
            {backgroundColor: getStatusBackgroundColor(healthStatus.heartRate.status)}
          ]}>
            <View style={styles.vitalCardHeader}>
              <Text style={styles.vitalCardLabel}>Current Heart Rate</Text>
              <View style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(healthStatus.heartRate.status)}
              ]}>
                <Text style={styles.statusBadgeText}>
                  {healthStatus.heartRate.label}
                </Text>
              </View>
            </View>
            {dog?.heartRate !== undefined ? (
              <Text style={[
                styles.vitalCardValue,
                {color: getStatusColor(healthStatus.heartRate.status)}
              ]}>
                {dog.heartRate} BPM
              </Text>
            ) : (
              <Text style={styles.vitalCardValue}>No data</Text>
            )}
            <Text style={styles.vitalCardDescription}>
              {healthStatus.heartRate.status === 'normal' 
                ? 'Heart rate is within normal range'
                : healthStatus.heartRate.status === 'low'
                ? 'Heart rate is below normal. Please consult a veterinarian.'
                : 'Heart rate is above normal. Please consult a veterinarian.'}
            </Text>
          </View>
        </View>

        {/* Temperature Status */}
        <View style={styles.vitalSection}>
          <Text style={styles.vitalSectionTitle}>Body Temperature</Text>
          <View style={[
            styles.vitalCard,
            {backgroundColor: getStatusBackgroundColor(healthStatus.temperature.status)}
          ]}>
            <View style={styles.vitalCardHeader}>
              <Text style={styles.vitalCardLabel}>Current Temperature</Text>
              <View style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(healthStatus.temperature.status)}
              ]}>
                <Text style={styles.statusBadgeText}>
                  {healthStatus.temperature.label}
                </Text>
              </View>
            </View>
            {dog?.temperature !== undefined ? (
              <View style={styles.temperatureDisplay}>
                <Text style={[
                  styles.vitalCardValue,
                  {color: getStatusColor(healthStatus.temperature.status)}
                ]}>
                  {dog.temperature}°C
                </Text>
                <Text style={styles.temperatureFahrenheit}>
                  ({(dog.temperature * 9/5 + 32).toFixed(1)}°F)
                </Text>
              </View>
            ) : (
              <Text style={styles.vitalCardValue}>No data</Text>
            )}
            <Text style={styles.vitalCardDescription}>
              {healthStatus.temperature.status === 'normal' 
                ? 'Body temperature is within normal range'
                : healthStatus.temperature.status === 'low'
                ? 'Body temperature is below normal. Please consult a veterinarian.'
                : 'Body temperature is above normal (fever). Please consult a veterinarian immediately.'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Reference Ranges */}
        <View style={styles.referenceSection}>
          <Text style={styles.referenceTitle}>Normal Ranges</Text>
          
          <View style={styles.referenceCard}>
            <Text style={styles.referenceCardTitle}>Heart Rate</Text>
            <Text style={styles.referenceText}>• Large Breed: 60-90 BPM</Text>
            <Text style={styles.referenceText}>• Small Breed: 90-120 BPM</Text>
            <Text style={styles.referenceText}>• Low: Below 60-80 BPM (depending on breed)</Text>
            <Text style={styles.referenceText}>• High: Above 100-140 BPM (depending on breed)</Text>
          </View>

          <View style={styles.referenceCard}>
            <Text style={styles.referenceCardTitle}>Body Temperature</Text>
            <Text style={styles.referenceText}>• Normal: 100.5-102.5°F (38.1-39.2°C)</Text>
            <Text style={styles.referenceText}>• Low: Below 100°F (37.8°C)</Text>
            <Text style={styles.referenceText}>• High/Fever: Above 103°F (39.4°C)</Text>
          </View>
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: '#000000',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  updateInfo: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  updateLabel: {
    fontSize: 13,
    color: '#666666',
    marginBottom: 4,
  },
  staleWarning: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
  overviewSection: {
    marginBottom: 20,
  },
  overviewCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  overviewTitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  overviewStatus: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  vitalSection: {
    marginBottom: 24,
  },
  vitalSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
  },
  vitalCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  vitalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  vitalCardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  vitalCardValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  temperatureDisplay: {
    marginBottom: 8,
  },
  temperatureFahrenheit: {
    fontSize: 18,
    color: '#666666',
    marginTop: 4,
  },
  vitalCardDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  referenceSection: {
    marginBottom: 20,
  },
  referenceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  referenceCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  referenceCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  referenceText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
    lineHeight: 20,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default DogHealthScreen;

