import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { EventEmitterService } from 'src/eventemitter/eventemitter.service';

@Injectable()
export class SpaceService {
  // TODO
  constructor(private emitter: EventEmitterService) {
    this.registerEvents();
  }

  registerEvents() {
    const events = [{ name: 'space.createSpace', handler: this.createSpace }];

    events.forEach((event) => {
      this.emitter.onEvent(event.name, event.handler.bind(this));
    });
  }

  async createSpace(createSpacePayload: any, prisma: Prisma.TransactionClient) {
    const { name, createdBy, id } = createSpacePayload;

    const is_existing_space = await prisma.space.findFirst({
      where: {
        id: id,
      },
    });

    if (is_existing_space) {
      return is_existing_space;
    }

    const space = await prisma.space.create({
      data: {
        id: id,
        name: name || 'Untitled Space',
        createdBy: createdBy,
      },
    });

    return space;
  }
}
