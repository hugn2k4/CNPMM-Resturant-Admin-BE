import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('pending_registrations')
export class PendingRegistration {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string; // Already hashed

  @Column()
  otp: string;

  @Column()
  otpExpires: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
