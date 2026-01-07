/**
 * Serial Reader - Handles Arduino serial communication
 */

import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { logger } from './errorHandler';

export interface SerialConfig {
  port: string | 'auto'; // 'auto' for automatic detection
  baudRate: number;
  reconnectDelay: number;
}

export class SerialReader {
  private config: SerialConfig;
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private onDataCallback: ((data: string) => void) | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;

  constructor(config: SerialConfig) {
    this.config = config;
  }

  /**
   * Set callback for when data is received
   */
  onData(callback: (data: string) => void): void {
    this.onDataCallback = callback;
  }

  /**
   * Auto-detect Arduino/ESP32 serial port
   */
  private async autoDetectPort(): Promise<string | null> {
    try {
      const ports = await SerialPort.list();
      
      logger.info(`Scanning ${ports.length} available serial ports...`);
      
      // Common patterns for Arduino/ESP32 ports
      const arduinoPatterns = [
        /arduino/i,
        /esp32/i,
        /ch340/i,
        /cp210/i,
        /ftdi/i,
        /usb serial/i,
        /usb-serial/i,
        /usb to serial/i,
      ];
      
      // Priority order: look for ESP32/Arduino keywords first
      for (const port of ports) {
        const portInfo = `${port.path} - ${port.manufacturer || ''} - ${port.productId || ''}`.toLowerCase();
        
        for (const pattern of arduinoPatterns) {
          if (pattern.test(portInfo)) {
            logger.info(`Auto-detected Arduino/ESP32 port: ${port.path} (${port.manufacturer || 'Unknown'})`);
            return port.path;
          }
        }
      }
      
      // If no match found, try common port names
      const commonPorts = ports
        .map(p => p.path)
        .filter(path => {
          // Windows: COM ports
          if (path.match(/^COM\d+$/i)) return true;
          // Linux: USB serial ports
          if (path.match(/\/dev\/tty(USB|ACM)\d+/)) return true;
          // Mac: USB serial ports
          if (path.match(/\/dev\/tty\.usb|usbserial|usbmodem/)) return true;
          return false;
        });
      
      if (commonPorts.length > 0) {
        logger.info(`Auto-selected first available port: ${commonPorts[0]}`);
        logger.info(`Available ports: ${commonPorts.join(', ')}`);
        return commonPorts[0];
      }
      
      logger.warn('No Arduino/ESP32 port detected automatically');
      logger.info(`All available ports: ${ports.map(p => p.path).join(', ')}`);
      return null;
    } catch (error: any) {
      logger.error('Error auto-detecting port:', error);
      return null;
    }
  }

  /**
   * Connect to serial port
   */
  async connect(): Promise<boolean> {
    if (this.isConnecting) {
      return false;
    }

    if (this.port?.isOpen) {
      logger.info('Serial port already connected');
      return true;
    }

    this.isConnecting = true;

    try {
      // Auto-detect port if 'auto' is specified
      let portPath = this.config.port;
      if (portPath === 'auto' || !portPath) {
        logger.info('Auto-detecting serial port...');
        const detectedPort = await this.autoDetectPort();
        if (!detectedPort) {
          logger.error('Failed to auto-detect serial port. Please specify SERIAL_PORT in .env file.');
          this.isConnecting = false;
          this.scheduleReconnect();
          return false;
        }
        portPath = detectedPort;
      }

      logger.info(`Connecting to serial port: ${portPath} at ${this.config.baudRate} baud`);

      this.port = new SerialPort({
        path: portPath,
        baudRate: this.config.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        autoOpen: false,
      });

      // Create parser for reading lines
      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }));

      // Set up event handlers
      this.port.on('open', () => {
        logger.info(`Serial port opened: ${this.config.port}`);
        this.isConnecting = false;
      });

      this.port.on('error', (error) => {
        logger.error('Serial port error:', error);
        this.isConnecting = false;
        this.scheduleReconnect();
      });

      this.port.on('close', () => {
        logger.warn('Serial port closed');
        this.isConnecting = false;
        this.scheduleReconnect();
      });

      // Handle parsed data
      this.parser.on('data', (data: string) => {
        if (this.onDataCallback) {
          this.onDataCallback(data.toString());
        }
      });

      // Open the port
      return new Promise((resolve, reject) => {
        if (!this.port) {
          reject(new Error('Port not initialized'));
          return;
        }

        this.port.open((error) => {
          if (error) {
            logger.error(`Failed to open serial port: ${error.message}`);
            this.isConnecting = false;
            this.scheduleReconnect();
            reject(error);
          } else {
            resolve(true);
          }
        });
      });
    } catch (error: any) {
      logger.error('Error connecting to serial port:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnect from serial port
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.port?.isOpen) {
      this.port.close((error) => {
        if (error) {
          logger.error('Error closing serial port:', error);
        } else {
          logger.info('Serial port closed');
        }
      });
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    logger.info(`Scheduling reconnection in ${this.config.reconnectDelay}ms`);
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect().catch((error) => {
        logger.error('Reconnection failed:', error);
      });
    }, this.config.reconnectDelay);
  }

  /**
   * Check if port is connected
   */
  isConnected(): boolean {
    return this.port?.isOpen || false;
  }
}


