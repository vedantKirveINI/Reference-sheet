import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'pg';
import { EventEmitterService } from '../eventemitter/eventemitter.service';
import { ColumnValueDTO } from 'src/features/record/DTO/update-records.dto';

interface NotificationMessage {
  channel: string;
  payload: string;
  processId: number;
}

interface TriggerNotificationPayload {
  schema: string;
  table: string;
  rowId: number;
  column: string;
  value: any;
  field_id: number;
}

@Injectable()
export class PgEventsService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts: number = 100;
  private readonly reconnectDelay: number = 5000; // ms
  private reconnectInProgress: boolean = false;

  constructor(private readonly emitter: EventEmitterService) {}

  private createAndSetupClient(): Client {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    const client = new Client({ connectionString });

    client.on('error', (err) => {
      console.error('PostgreSQL client error:', err);
      this.isConnected = false;
      this.handleReconnect();
    });

    return client;
  }

  private async connectToDatabase(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        this.isConnected = true;
        console.log('Connected to PostgreSQL successfully');
      }
    } catch (error) {
      this.isConnected = false;
      console.error('Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  private async startListening(): Promise<void> {
    try {
      await this.client.query('LISTEN sheet_updates');
      console.log('Listening to PostgreSQL notifications');
    } catch (error) {
      console.error('Failed to start listening:', error);
      throw error;
    }
  }

  private setupNotificationListener(): void {
    this.client.on('notification', (msg: NotificationMessage) => {
      try {
        const payload: TriggerNotificationPayload = JSON.parse(msg.payload);
        console.log('Received notification:', {
          channel: msg.channel,
          payload,
          timestamp: new Date().toISOString(),
        });

        const transformed = this.transformPgNotifyToColumnValue(payload);
        this.emitter.emit('emitUpdatedRecord', transformed, payload.table);
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    });
  }

  private async handleReconnect(): Promise<void> {
    if (this.reconnectInProgress) {
      console.log('Reconnect already in progress. Skipping.');
      return;
    }

    this.reconnectInProgress = true;

    try {
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached.');
        return;
      }

      this.reconnectAttempts++;
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`,
      );

      try {
        await this.client?.end();
      } catch (e) {
        console.warn('Error closing previous client during reconnect:', e);
      }

      this.client = this.createAndSetupClient();
      await this.connectToDatabase();
      this.setupNotificationListener();
      await this.startListening();

      console.log('Reconnected and listening successfully.');
      this.reconnectAttempts = 0;
    } catch (error: any) {
      console.error('Reconnection failed:', error?.stack || error);

      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(`Retrying in ${delay} ms...`);

      setTimeout(() => this.handleReconnect(), delay);
    } finally {
      this.reconnectInProgress = false;
    }
  }

  transformPgNotifyToColumnValue(
    payload: TriggerNotificationPayload,
  ): ColumnValueDTO[] {
    return [
      {
        row_id: payload.rowId,
        fields_info: [
          {
            field_id: payload.field_id,
            data: payload.value,
          },
        ],
      },
    ];
  }

  async onModuleInit(): Promise<void> {
    try {
      this.client = this.createAndSetupClient();
      await this.connectToDatabase();
      this.setupNotificationListener();
      await this.startListening();
    } catch (error) {
      console.error('Failed to initialize PgEventsService:', error);
      this.handleReconnect();
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.end();
        this.isConnected = false;
        console.log('Disconnected from PostgreSQL');
      }
    } catch (error) {
      console.error('Error disconnecting from PostgreSQL:', error);
    }
  }
}
