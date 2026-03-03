import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GroupsModule } from './modules/groups/groups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const uri = config.getOrThrow<string>('MONGODB_URI');
        console.log('MongoDB URI:', uri);
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    GroupsModule,
  ],
})
export class AppModule {}
