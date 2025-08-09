import { Module } from '@nestjs/common';
import { AppController } from './controllers/app.controller';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
})
export class AppModule {}
