/**
 * API Client - Sends data to backend API
 */

import axios, { AxiosInstance } from 'axios';
import { ParsedData } from './dataParser';
import { calculateVitalStatus } from './healthStatus';
import { logger } from './errorHandler';

export interface ApiConfig {
  baseURL: string;
  dogId: string;
  authToken: string;
  maxRetries: number;
  retryDelay: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private config: ApiConfig;
  private lastUpdateTime: number = 0;
  private updateInterval: number;

  constructor(config: ApiConfig, updateInterval: number = 5000) {
    this.config = config;
    this.updateInterval = updateInterval;
    
    this.client = axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.authToken}`,
      },
      timeout: 10000, // 10 second timeout
    });
  }

  /**
   * Send vital data to API
   */
  async sendVitalData(data: ParsedData): Promise<boolean> {
    // Rate limiting: Don't send if last update was too recent
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateInterval) {
      logger.debug(`Skipping update - too soon (${now - this.lastUpdateTime}ms since last update)`);
      return false;
    }

    // Calculate status
    const status = calculateVitalStatus(data.temperature, data.bpm || 0);

    // Format payload for API
    const payload = {
      heartRate: data.bpm || 0,
      temperature: data.temperature,
      status: status,
      time: data.timestamp,
    };

    // Retry logic
    let lastError: any = null;
    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const response = await this.client.put(
          `/dogs/${this.config.dogId}/vitals`,
          payload
        );

        this.lastUpdateTime = now;
        logger.info(`Successfully sent vital data: HR=${payload.heartRate}, Temp=${payload.temperature}°C, Status=${status}`);
        return true;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.response) {
          const status = error.response.status;
          
          // 401 Unauthorized - token issue, don't retry
          if (status === 401) {
            logger.error('Authentication failed - check AUTH_TOKEN in .env');
            return false;
          }
          
          // 404 Not Found - dog ID issue, don't retry
          if (status === 404) {
            logger.error('Dog not found - check DOG_ID in .env');
            return false;
          }
          
          // 429 Too Many Requests - wait longer before retry
          if (status === 429) {
            const waitTime = this.config.retryDelay * (attempt + 2); // Exponential backoff
            logger.warn(`Rate limited - waiting ${waitTime}ms before retry ${attempt + 1}/${this.config.maxRetries}`);
            await this.sleep(waitTime);
            continue;
          }
        }
        
        // Wait before retry
        if (attempt < this.config.maxRetries - 1) {
          const waitTime = this.config.retryDelay * (attempt + 1);
          logger.warn(`API request failed (attempt ${attempt + 1}/${this.config.maxRetries}) - retrying in ${waitTime}ms`);
          await this.sleep(waitTime);
        }
      }
    }

    // All retries failed
    logger.error('Failed to send vital data after all retries', {
      error: lastError?.message,
      response: lastError?.response?.data,
    });
    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

