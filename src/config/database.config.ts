import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'mongodb',
  url: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/siupo',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Disable auto-sync to avoid index conflicts with Mongoose
  logging: process.env.NODE_ENV === 'development',
};
