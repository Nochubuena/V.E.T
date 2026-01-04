/**
 * Data Parser - Parses Arduino serial output into structured data
 */

export interface ParsedData {
  temperature: number;
  temperatureF: number;
  waveform: number;
  bpm: number | null;
  timestamp: string;
}

/**
 * Parse temperature from serial string
 * Format: "Temperature:38.5C 101.3F"
 */
function parseTemperature(line: string): { tempC: number; tempF: number } | null {
  const tempMatch = line.match(/Temperature:([\d.]+)C\s+([\d.]+)F/);
  if (tempMatch) {
    const tempC = parseFloat(tempMatch[1]);
    const tempF = parseFloat(tempMatch[2]);
    
    // Validate temperature range (reasonable for dogs: 30-45°C)
    if (tempC >= 20 && tempC <= 50 && tempF >= 68 && tempF <= 122) {
      return { tempC, tempF };
    }
  }
  return null;
}

/**
 * Parse waveform and BPM from serial string
 * Format: "Waveform:1850 BPM:72 "
 */
function parseWaveformAndBPM(line: string): { waveform: number; bpm: number | null } | null {
  const waveformMatch = line.match(/Waveform:(\d+)/);
  const bpmMatch = line.match(/BPM:(\d+)/);
  
  let waveform: number | null = null;
  let bpm: number | null = null;
  
  if (waveformMatch) {
    waveform = parseInt(waveformMatch[1], 10);
  }
  
  if (bpmMatch) {
    bpm = parseInt(bpmMatch[1], 10);
    
    // Validate BPM range (reasonable for dogs: 40-200)
    if (bpm < 0 || bpm > 300) {
      bpm = null; // Invalid BPM
    }
  }
  
  if (waveform !== null) {
    return { waveform, bpm };
  }
  
  return null;
}

/**
 * Parse complete Arduino serial output
 * Expected format:
 * "Temperature:38.5C 101.3F\nWaveform:1850 BPM:72 \n"
 */
export function parseSerialData(data: string): ParsedData | null {
  const lines = data.trim().split('\n');
  
  let temperature: { tempC: number; tempF: number } | null = null;
  let waveformData: { waveform: number; bpm: number | null } | null = null;
  
  // Parse each line
  for (const line of lines) {
    // Try to parse temperature
    if (!temperature) {
      temperature = parseTemperature(line);
    }
    
    // Try to parse waveform and BPM
    if (!waveformData) {
      waveformData = parseWaveformAndBPM(line);
    }
  }
  
  // Must have at least temperature to be valid
  if (!temperature) {
    return null;
  }
  
  return {
    temperature: temperature.tempC,
    temperatureF: temperature.tempF,
    waveform: waveformData?.waveform || 0,
    bpm: waveformData?.bpm || null,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Validate parsed data
 */
export function validateParsedData(data: ParsedData): boolean {
  // Temperature validation (dogs: 30-45°C reasonable range)
  if (data.temperature < 20 || data.temperature > 50) {
    return false;
  }
  
  // BPM validation (if present)
  if (data.bpm !== null && (data.bpm < 0 || data.bpm > 300)) {
    return false;
  }
  
  return true;
}


