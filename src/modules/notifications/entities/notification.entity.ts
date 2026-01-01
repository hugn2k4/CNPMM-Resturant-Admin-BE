import {
  Entity,
  ObjectIdColumn,
  ObjectId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ type: 'string' })
  userId: ObjectId;

  @Column({ type: 'string' })
  type: string;

  @Column({ type: 'string' })
  title: string;

  @Column({ type: 'string' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'date', nullable: true })
  readAt: Date;

  @Column({ type: 'boolean', default: false })
  emailSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
