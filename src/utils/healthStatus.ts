// Health status utility functions

export type BreedSize = 'large' | 'small' | 'unknown';

export type HeartRateStatus = 'normal' | 'low' | 'high';
export type TemperatureStatus = 'normal' | 'low' | 'high';

export interface HealthStatus {
  heartRate: {
    status: HeartRateStatus;
    label: string;
  };
  temperature: {
    status: TemperatureStatus;
    label: string;
  };
}

/**
 * Convert Celsius to Fahrenheit
 */
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

/**
 * Convert Fahrenheit to Celsius
 */
export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

/**
 * Check heart rate status based on breed size
 */
export const checkHeartRateStatus = (
  heartRate: number,
  breedSize: BreedSize = 'unknown'
): { status: HeartRateStatus; label: string } => {
  if (breedSize === 'large') {
    if (heartRate < 60) {
      return { status: 'low', label: 'Bradycardic/Low' };
    } else if (heartRate >= 60 && heartRate <= 90) {
      return { status: 'normal', label: 'Normal' };
    } else if (heartRate > 100) {
      return { status: 'high', label: 'Tachycardic/High' };
    } else {
      // Between 90-100 is borderline, treat as normal
      return { status: 'normal', label: 'Normal' };
    }
  } else if (breedSize === 'small') {
    if (heartRate < 80) {
      return { status: 'low', label: 'Bradycardic/Low' };
    } else if (heartRate >= 80 && heartRate <= 120) {
      return { status: 'normal', label: 'Normal' };
    } else if (heartRate > 140) {
      return { status: 'high', label: 'Tachycardic/High' };
    } else {
      // Between 120-140 is borderline, treat as normal
      return { status: 'normal', label: 'Normal' };
    }
  } else {
    // Unknown breed - use average of large and small
    if (heartRate < 70) {
      return { status: 'low', label: 'Bradycardic/Low' };
    } else if (heartRate >= 70 && heartRate <= 105) {
      return { status: 'normal', label: 'Normal' };
    } else if (heartRate > 120) {
      return { status: 'high', label: 'Tachycardic/High' };
    } else {
      return { status: 'normal', label: 'Normal' };
    }
  }
};

/**
 * Check temperature status (expects Celsius, converts to Fahrenheit for comparison)
 */
export const checkTemperatureStatus = (
  temperatureCelsius: number
): { status: TemperatureStatus; label: string } => {
  const temperatureF = celsiusToFahrenheit(temperatureCelsius);
  
  if (temperatureF < 100) {
    return { status: 'low', label: 'Hypothermic/Low' };
  } else if (temperatureF >= 100.5 && temperatureF <= 102.5) {
    return { status: 'normal', label: 'Normal' };
  } else if (temperatureF > 103) {
    return { status: 'high', label: 'Hyperthermic/High/Fever' };
  } else {
    // Between 100-100.5 or 102.5-103 is borderline
    if (temperatureF < 100.5) {
      return { status: 'low', label: 'Hypothermic/Low' };
    } else {
      return { status: 'high', label: 'Hyperthermic/High/Fever' };
    }
  }
};

/**
 * Get color for health status
 */
export const getStatusColor = (status: 'normal' | 'low' | 'high'): string => {
  switch (status) {
    case 'normal':
      return '#34C759'; // Green
    case 'low':
      return '#007AFF'; // Blue
    case 'high':
      return '#FF3B30'; // Red
    default:
      return '#666666'; // Gray
  }
};

/**
 * Get background color for health status (lighter version)
 */
export const getStatusBackgroundColor = (status: 'normal' | 'low' | 'high'): string => {
  switch (status) {
    case 'normal':
      return '#E8F5E9'; // Light green
    case 'low':
      return '#E3F2FD'; // Light blue
    case 'high':
      return '#FFEBEE'; // Light red
    default:
      return '#F5F5F5'; // Light gray
  }
};

/**
 * Get complete health status for a dog
 * Now uses breed-specific temperature checking if breed is provided
 */
export const getHealthStatus = (
  heartRate: number | undefined,
  temperature: number | undefined,
  breedSize: BreedSize = 'unknown',
  breed?: string
): HealthStatus => {
  const heartRateStatus = heartRate !== undefined
    ? checkHeartRateStatus(heartRate, breedSize)
    : { status: 'normal' as HeartRateStatus, label: 'No data' };
  
  // Use breed-specific temperature checking if breed is provided
  const temperatureStatus = temperature !== undefined
    ? (breed ? checkTemperatureStatusByBreed(temperature, breed) : checkTemperatureStatus(temperature))
    : { status: 'normal' as TemperatureStatus, label: 'No data' };
  
  return {
    heartRate: heartRateStatus,
    temperature: temperatureStatus,
  };
};

/**
 * Get base temperature based on dog breed
 * Different breeds have different normal body temperatures
 * Returns temperature in Celsius
 */
export const getBreedBaseTemperature = (breed?: string): number => {
  if (!breed) {
    return 38.5; // Default average temperature
  }

  const breedLower = breed.toLowerCase();
  
  // Large breed dogs typically have slightly lower normal temperatures (38.0-38.5°C)
  const largeBreeds = [
    'great dane', 'mastiff', 'saint bernard', 'newfoundland', 'bernese mountain dog',
    'rottweiler', 'german shepherd', 'labrador', 'golden retriever', 'husky',
    'alaskan malamute', 'doberman', 'boxer', 'bulldog', 'english bulldog',
    'french bulldog', 'poodle', 'standard poodle', 'australian shepherd', 'border collie'
  ];
  
  // Small breed dogs typically have slightly higher normal temperatures (38.5-39.0°C)
  const smallBreeds = [
    'chihuahua', 'yorkie', 'yorkshire terrier', 'pomeranian', 'shih tzu',
    'maltese', 'bichon frise', 'pug', 'beagle', 'dachshund', 'miniature poodle',
    'toy poodle', 'jack russell', 'cocker spaniel', 'boston terrier', 'cavalier',
    'king charles spaniel', 'papillon', 'pomeranian', 'miniature schnauzer'
  ];
  
  // Check if breed matches any in the lists
  const isLargeBreed = largeBreeds.some(lb => breedLower.includes(lb));
  const isSmallBreed = smallBreeds.some(sb => breedLower.includes(sb));
  
  if (isLargeBreed) {
    return 38.2; // Large breeds: 38.0-38.5°C average
  } else if (isSmallBreed) {
    return 38.7; // Small breeds: 38.5-39.0°C average
  } else {
    // Medium breeds or unknown: 38.5°C average
    return 38.5;
  }
};

/**
 * Check temperature status based on breed-specific base temperature
 */
export const checkTemperatureStatusByBreed = (
  temperatureCelsius: number,
  breed?: string
): { status: TemperatureStatus; label: string } => {
  const baseTemp = getBreedBaseTemperature(breed);
  const tolerance = 0.5; // ±0.5°C tolerance
  
  if (temperatureCelsius < baseTemp - tolerance) {
    return { status: 'low', label: 'Hypothermic/Low' };
  } else if (temperatureCelsius > baseTemp + tolerance) {
    return { status: 'high', label: 'Hyperthermic/High/Fever' };
  } else {
    return { status: 'normal', label: 'Normal' };
  }
};

/**
 * Calculate vital status string for API
 * Returns: "normal", "warning", or "critical"
 * This function is used by the bridge service to determine status before sending to API
 */
export function calculateVitalStatusForAPI(
  heartRate: number | undefined,
  temperature: number | undefined,
  breedSize: BreedSize = 'unknown'
): string {
  if (heartRate === undefined || temperature === undefined) {
    return 'normal'; // Default if missing data
  }

  const healthStatus = getHealthStatus(heartRate, temperature, breedSize);
  
  // Determine overall status
  const hrAbnormal = healthStatus.heartRate.status !== 'normal';
  const tempAbnormal = healthStatus.temperature.status !== 'normal';
  
  if (hrAbnormal && tempAbnormal) {
    return 'critical'; // Both abnormal = critical
  } else if (hrAbnormal || tempAbnormal) {
    return 'warning'; // One abnormal = warning
  } else {
    return 'normal'; // Both normal = normal
  }
}

