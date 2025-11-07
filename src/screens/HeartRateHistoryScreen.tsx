import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Svg, {Path, Circle} from 'react-native-svg';
import {useApp} from '../context/AppContext';
import {checkHeartRateStatus, getStatusColor, getStatusBackgroundColor, BreedSize} from '../utils/healthStatus';

const {width} = Dimensions.get('window');

const HeartRateHistoryScreen = ({navigation, route}: any) => {
  const {dogs} = useApp();
  const dogId = route?.params?.dogId;
  
  const dog = dogId ? dogs.find(d => d.id === dogId) : dogs[0];
  const dogName = dog?.name || "Dog Name";
  
  // For now, assume unknown breed size (can be added to Dog interface later)
  const breedSize: BreedSize = 'unknown';
  
  // Get heart rate data from dog's vital records
  const heartRateData = dog?.vitalRecords 
    ? dog.vitalRecords.map(r => r.heartRate)
    : [];
  
  const maxHeartRate = heartRateData.length > 0 ? Math.max(...heartRateData, 200) : 200;
  const minHeartRate = heartRateData.length > 0 ? Math.min(...heartRateData, 0) : 0;
  const chartWidth = width - 80;
  const chartHeight = 200;

  const getChartPath = (data: number[], maxValue: number, minValue: number) => {
    if (data.length === 0 || maxValue === minValue) return '';
    if (data.length === 1) {
      const y = chartHeight - (((data[0] - minValue) / (maxValue - minValue)) * chartHeight);
      return `M 0,${y} L ${chartWidth},${y}`;
    }
    const stepX = chartWidth / (data.length - 1);
    const points = data.map((value, index) => {
      const x = index * stepX;
      const y = chartHeight - (((value - minValue) / (maxValue - minValue)) * chartHeight);
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // Get status for each data point
  const getDataPointStatus = (heartRate: number) => {
    return checkHeartRateStatus(heartRate, breedSize);
  };

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
        <Text style={styles.title}>Heart Rate History</Text>
        <Text style={styles.subtitle}>{dogName}</Text>

        {/* Current Heart Rate */}
        {dog?.heartRate !== undefined && (
          <View style={styles.currentVitalSection}>
            <Text style={styles.currentVitalLabel}>Current Heart Rate</Text>
            <View style={[
              styles.currentVitalBox,
              {backgroundColor: getStatusBackgroundColor(getDataPointStatus(dog.heartRate).status)}
            ]}>
              <Text style={[
                styles.currentVitalNumber,
                {color: getStatusColor(getDataPointStatus(dog.heartRate).status)}
              ]}>
                {dog.heartRate}
              </Text>
              <Text style={styles.currentVitalUnit}>BPM</Text>
              <Text style={[
                styles.currentVitalStatus,
                {color: getStatusColor(getDataPointStatus(dog.heartRate).status)}
              ]}>
                {getDataPointStatus(dog.heartRate).label}
              </Text>
            </View>
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Heart Rate Trend</Text>
          {heartRateData.length > 0 ? (
            <View style={styles.chartContainer}>
              <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
                {/* Y-axis labels */}
                <Text x="0" y="10" fontSize="12" fill="#666">
                  {Math.round(maxHeartRate)}
                </Text>
                <Text x="0" y={chartHeight / 2} fontSize="12" fill="#666">
                  {Math.round((maxHeartRate + minHeartRate) / 2)}
                </Text>
                <Text x="0" y={chartHeight - 5} fontSize="12" fill="#666">
                  {Math.round(minHeartRate)}
                </Text>
                
                {/* Grid lines */}
                <Path
                  d={`M 0 0 L 0 ${chartHeight}`}
                  stroke="#E0E0E0"
                  strokeWidth="1"
                />
                <Path
                  d={`M 0 ${chartHeight / 2} L ${chartWidth} ${chartHeight / 2}`}
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
                  d={getChartPath(heartRateData, maxHeartRate, minHeartRate)}
                  stroke="#FF3B30"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Data points with color coding */}
                {heartRateData.map((value, index) => {
                  const status = getDataPointStatus(value);
                  const x = heartRateData.length === 1 
                    ? chartWidth / 2 
                    : (index / (heartRateData.length - 1)) * chartWidth;
                  const y = chartHeight - (((value - minHeartRate) / (maxHeartRate - minHeartRate)) * chartHeight);
                  return (
                    <Circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="5"
                      fill={getStatusColor(status.status)}
                    />
                  );
                })}
              </Svg>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No heart rate data available</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* History List */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>History</Text>
          {dog?.vitalRecords && dog.vitalRecords.length > 0 ? (
            <View style={styles.historyList}>
              {dog.vitalRecords.map((record, index) => {
                const status = getDataPointStatus(record.heartRate);
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.historyItem,
                      {backgroundColor: getStatusBackgroundColor(status.status)}
                    ]}
                  >
                    <View style={styles.historyItemLeft}>
                      <Text style={[
                        styles.historyItemValue,
                        {color: getStatusColor(status.status)}
                      ]}>
                        {record.heartRate} BPM
                      </Text>
                      <Text style={styles.historyItemTime}>{record.time}</Text>
                    </View>
                    <View style={[
                      styles.historyItemStatus,
                      {backgroundColor: getStatusColor(status.status)}
                    ]}>
                      <Text style={styles.historyItemStatusText}>{status.label}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No history records available</Text>
            </View>
          )}
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
    marginBottom: 24,
  },
  currentVitalSection: {
    marginBottom: 20,
  },
  currentVitalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  currentVitalBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  currentVitalNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  currentVitalUnit: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  currentVitalStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
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
  noDataContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666666',
  },
  historySection: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  historyItemLeft: {
    flex: 1,
  },
  historyItemValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyItemTime: {
    fontSize: 14,
    color: '#666666',
  },
  historyItemStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  historyItemStatusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dogName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default HeartRateHistoryScreen;

