import { Global, Module, Provider } from '@nestjs/common';
const short = require('short-uuid');

const shortUUIDProvider: Provider = {
  provide: 'ShortUUID', // Provide token
  useValue: short, // Initialize ShortUUID instance
};

@Global()
@Module({
  providers: [shortUUIDProvider], // Register the ShortUUID provider
  exports: [shortUUIDProvider], // Export the ShortUUID provider for dependency injection
})
export class ShortUUIDModule {}
