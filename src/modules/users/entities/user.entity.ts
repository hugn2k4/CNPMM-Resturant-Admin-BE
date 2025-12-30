import * as bcrypt from 'bcryptjs';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Hide password by default
  password?: string;

  @Column()
  firstName?: string;

  @Column()
  lastName?: string;

  @Column()
  fullName?: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ default: 'local' })
  authProvider: string;

  @Column({ nullable: true })
  image?: string;

  // OTP for Forgot Password
  @Column({ nullable: true })
  otp?: string;

  @Column({ nullable: true })
  otpExpires?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
