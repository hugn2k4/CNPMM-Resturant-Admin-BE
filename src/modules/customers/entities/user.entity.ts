import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  fullName: string;

  @Column()
  phoneNumber: string;

  @Column({ default: 'USER' })
  role: string;

  @Column({ default: 'ACTIVE' })
  status: string;

  @Column({ default: 'Local' })
  authProvider: string;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: 0 })
  __v: number;
}
