/**
 * Health Status Calculator
 * Calculates status (normal/warning/critical) based on vital signs
 * This matches the logic from the frontend healthStatus.ts
 */

export type BreedSize = 'large' | 'small' | 'unknown';

/**
 * Check heart rate status based on breed size
 */
function checkHeartRateStatus(heartRate: number, breedSize: BreedSize = 'unknown'): 'normal' | 'low' | 'high' {
  if (breedSize === 'large') {
    if (heartRate < 60) return 'low';
    if (heartRate > 100) return 'high';
    return 'normal';
  } else if (breedSize === 'small') {
    if (heartRate < 80) return 'low';
    if (heartRate > 140) return 'high';
    return 'normal';
  } else {
    // Unknown breed - use average
    if (heartRate < 70) return 'low';
    if (heartRate > 120) return 'high';
    return 'normal';
  }
}

/**
 * Check temperature status (expects Celsius)
 */
function checkTemperatureStatus(temperatureCelsius: number): 'normal' | 'low' | 'high' {
  const temperatureF = (temperatureCelsius * 9/5) + 32;
  
  if (temperatureF < 100) return 'low';
  if (temperatureF > 103) return 'high';
  if (temperatureF >= 100.5 && temperatureF <= 102.5) return 'normal';
  
  // Borderline cases
  if (temperatureF < 100.5) return 'low';
  return 'high';
}

/**
 * Calculate vital status string for API
 * Returns: "normal", "warning", or "critical"
 */
export function calculateVitalStatus(
  heartRate: number,
  temperature: number,
  breedSize: BreedSize = 'unknown'
): string {
  const hrStatus = checkHeartRateStatus(heartRate, breedSize);
  const tempStatus = checkTemperatureStatus(temperature);
  
  // Determine overall status
  const hrAbnormal = hrStatus !== 'normal';
  const tempAbnormal = tempStatus !== 'normal';
  
  if (hrAbnormal && tempAbnormal) {
    return 'critical'; // Both abnormal = critical
  } else if (hrAbnormal || tempAbnormal) {
    return 'warning'; // One abnormal = warning
  } else {
    return 'normal'; // Both normal = normal
  }
}


