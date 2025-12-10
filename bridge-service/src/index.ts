/**
 * Main Entry Point - Bridge Service
 * Connects Arduino collar hardware to V.E.T backend API
 */

import dotenv from 'dotenv';
import { SerialReader } from './serialReader';
import { ApiClient } from './apiClient';
import { parseSerialData, validateParsedData } from './dataParser';
import { logger } from './errorHandler';

// Load environment variables
dotenv.config();

// Configuration from environment variables
const config = {
  serial: {
    port: process.env.SERIAL_PORT || 'COM3',
    baudRate: parseInt(process.env.BAUD_RATE || '115200', 10),
    reconnectDelay: parseInt(process.env.SERIAL_RECONNECT_DELAY || '5000', 10),
  },
  api: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3000/api',
    dogId: process.env.DOG_ID || '',
    authToken: process.env.AUTH_TOKEN || '',
    maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '2000', 10),
  },
  updateInterval: parseInt(process.env.UPDATE_INTERVAL || '5000', 10),
};

// Validate configuration
if (!config.api.dogId) {
  logger.error('DOG_ID is required in .env file');
  process.exit(1);
}

if (!config.api.authToken) {
  logger.error('AUTH_TOKEN is required in .env file');
  process.exit(1);
}

// Initialize components
const serialReader = new SerialReader(config.serial);
const apiClient = new ApiClient(config.api, config.updateInterval);

// Buffer for accumulating serial data
let dataBuffer = '';

/**
 * Handle serial data received from Arduino
 */
serialReader.onData((data: string) => {
  try {
    // Accumulate data until we have a complete reading
    dataBuffer += data;
    
    // Check if we have a complete reading (contains both Temperature and Waveform)
    if (dataBuffer.includes('Temperature:') && dataBuffer.includes('Waveform:')) {
      // Parse the data
      const parsedData = parseSerialData(dataBuffer);
      
      if (parsedData && validateParsedData(parsedData)) {
        logger.debug('Parsed data:', {
          temperature: parsedData.temperature,
          bpm: parsedData.bpm,
          waveform: parsedData.waveform,
        });

        // Send to API (only if we have BPM)
        if (parsedData.bpm !== null) {
          apiClient.sendVitalData(parsedData).catch((error) => {
            logger.error('Error sending data to API:', error);
          });
        } else {
          logger.warn('Skipping update - no BPM data available');
        }
      } else {
        logger.warn('Invalid or incomplete data received:', dataBuffer);
      }
      
      // Clear buffer for next reading
      dataBuffer = '';
    }
  } catch (error: any) {
    logger.error('Error processing serial data:', error);
    dataBuffer = ''; // Clear buffer on error
  }
});

/**
 * Start the service
 */
async function start() {
  logger.info('=== V.E.T Collar Bridge Service Starting ===');
  logger.info(`Serial Port: ${config.serial.port}`);
  logger.info(`Baud Rate: ${config.serial.baudRate}`);
  logger.info(`API URL: ${config.api.baseURL}`);
  logger.info(`Dog ID: ${config.api.dogId}`);
  logger.info(`Update Interval: ${config.updateInterval}ms`);

  // Connect to serial port
  try {
    await serialReader.connect();
    logger.info('Bridge service started successfully');
  } catch (error: any) {
    logger.error('Failed to start bridge service:', error);
    logger.error('Make sure:');
    logger.error('1. Arduino is connected via USB');
    logger.error(`2. Serial port ${config.serial.port} exists`);
    logger.error('3. No other program is using the serial port');
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
function shutdown() {
  logger.info('Shutting down bridge service...');
  serialReader.disconnect();
  process.exit(0);
}

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start the service
start().catch((error) => {
  logger.error('Fatal error starting service:', error);
  process.exit(1);
});

