import { Injectable } from '@nestjs/common';
import { EventEmitter2, ListenerFn } from 'eventemitter2';

@Injectable()
export class EventEmitterService {
  private eventEmitter: EventEmitter2;

  constructor() {
    this.eventEmitter = new EventEmitter2();
  }

  emit(name: string, ...args: any) {
    this.eventEmitter.emit(name, ...args);
  }

  async emitAsync(name: string, ...args: any) {
    return await this.eventEmitter.emitAsync(name, ...args);
  }

  onEvent(name: string, listener: ListenerFn) {
    this.eventEmitter.on(name, listener);
  }
}
