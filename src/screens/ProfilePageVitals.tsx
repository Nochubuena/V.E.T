import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useApp} from '../context/AppContext';
import {getHealthStatus, getStatusColor, getStatusBackgroundColor, BreedSize} from '../utils/healthStatus';

const {width} = Dimensions.get('window');

const ProfilePageVitals = ({navigation, route}: any) => {
  const {dogs} = useApp();
  const dogId = route?.params?.dogId;
  
  const dog = dogId ? dogs.find(d => d.id === dogId) : dogs[0];
  const dogName = dog?.name || "Dog Name";
  
  // If no dog found, show error message
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

  // Get heart rate data from dog's vital records or use sample data
  const heartRateData = dog?.vitalRecords 
    ? dog.vitalRecords.map(r => r.heartRate)
    : [72, 73, 74, 73, 75, 73, 74, 76, 73];
  
  const temperatureData = dog?.vitalRecords
    ? dog.vitalRecords.map(r => r.temperature)
    : [38.0, 38.2, 38.4, 38.3, 38.5, 38.3, 38.4, 38.6, 38.3];

  const maxHeartRate = heartRateData.length > 0 ? Math.max(...heartRateData) : 80;
  const maxTemperature = temperatureData.length > 0 ? Math.max(...temperatureData) : 40;
  const chartWidth = width - 80;
  const chartHeight = 150;

  const getChartPath = (data: number[], maxValue: number) => {
    if (data.length === 0 || maxValue === 0) return '';
    // Handle single data point case
    if (data.length === 1) {
      const y = chartHeight - ((data[0] / maxValue) * chartHeight);
      return `M 0,${y} L ${chartWidth},${y}`;
    }
    const stepX = chartWidth / (data.length - 1);
    const points = data.map((value, index) => {
      const x = index * stepX;
      const y = chartHeight - ((value / maxValue) * chartHeight);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

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
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImage}>
            {dog?.imageUri ? (
              <Image source={{uri: dog.imageUri}} style={styles.dogProfileImage} />
            ) : (
              <Text style={styles.dogEmoji}>🐕</Text>
            )}
          </View>
          <Text style={styles.dogName}>{dogName}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Vital Status Summary */}
        <View style={styles.vitalsSection}>
          <Text style={styles.vitalTitle}>{dogName}'s Vital Status</Text>

          <View style={styles.vitalsContainer}>
            {/* Heart Rate */}
            {(() => {
              const breedSize: BreedSize = 'unknown';
              const healthStatus = getHealthStatus(dog?.heartRate, dog?.temperature, breedSize);
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
                    {dog?.heartRate || 73}
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
              const healthStatus = getHealthStatus(dog?.heartRate, dog?.temperature, breedSize);
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
                    {dog?.temperature || 38.4}
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
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Heart Rate Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Heartbeats per minute as of today</Text>
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
              {/* Y-axis labels */}
              <Text x="0" y="10" fontSize="12" fill="#666">
                100
              </Text>
              <Text x="0" y="75" fontSize="12" fill="#666">
                80
              </Text>
              <Text x="0" y="140" fontSize="12" fill="#666">
                60
              </Text>
              
              {/* Grid lines */}
              <Path
                d={`M 0 0 L 0 ${chartHeight}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <Path
                d={`M 0 ${chartHeight * 0.4} L ${chartWidth} ${chartHeight * 0.4}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <Path
                d={`M 0 ${chartHeight * 0.5} L ${chartWidth} ${chartHeight * 0.5}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <Path
                d={`M 0 ${chartHeight} L ${chartWidth} ${chartHeight}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              
              {/* Data line */}
              <Path
                d={getChartPath(heartRateData, maxHeartRate)}
                stroke="#007AFF"
                strokeWidth="2"
                fill="none"
              />
              
              {/* Data points */}
              {heartRateData.map((value, index) => {
                const x = heartRateData.length === 1 
                  ? chartWidth / 2 
                  : (index / (heartRateData.length - 1)) * chartWidth;
                const y = chartHeight - ((value / maxHeartRate) * chartHeight);
                return (
                  <Circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#007AFF"
                  />
                );
              })}
            </Svg>
          </View>
        </View>

        {/* Temperature Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Temperature per 2 seconds as of today</Text>
          <View style={styles.chartContainer}>
            <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
              {/* Y-axis labels */}
              <Text x="0" y="10" fontSize="12" fill="#666">
                40
              </Text>
              <Text x="0" y="75" fontSize="12" fill="#666">
                38
              </Text>
              <Text x="0" y="140" fontSize="12" fill="#666">
                36
              </Text>
              
              {/* Grid lines */}
              <Path
                d={`M 0 0 L 0 ${chartHeight}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <Path
                d={`M 0 ${chartHeight * 0.4} L ${chartWidth} ${chartHeight * 0.4}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <Path
                d={`M 0 ${chartHeight * 0.5} L ${chartWidth} ${chartHeight * 0.5}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              <Path
                d={`M 0 ${chartHeight} L ${chartWidth} ${chartHeight}`}
                stroke="#E0E0E0"
                strokeWidth="1"
              />
              
              {/* Data line */}
              <Path
                d={getChartPath(temperatureData, maxTemperature)}
                stroke="#34C759"
                strokeWidth="2"
                fill="none"
              />
              
              {/* Data points */}
              {temperatureData.map((value, index) => {
                const x = temperatureData.length === 1 
                  ? chartWidth / 2 
                  : (index / (temperatureData.length - 1)) * chartWidth;
                const y = chartHeight - ((value / maxTemperature) * chartHeight);
                return (
                  <Circle
                    key={index}
                    cx={x}
                    cy={y}
                    r="4"
                    fill="#34C759"
                  />
                );
              })}
            </Svg>
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  dogProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  dogEmoji: {
    fontSize: 60,
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  vitalsSection: {
    marginBottom: 20,
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
  vitalStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  vitalDivider: {
    width: 1,
    height: 80,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  chartSection: {
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chart: {
    backgroundColor: '#FFFFFF',
  },
});

export default ProfilePageVitals;





