import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('chatmessages')
export class ChatMessage {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column(() => String)
  userId: ObjectId;

  @Column(() => String)
  message: string;

  @Column({ enum: ['user', 'admin'] })
  senderType: 'user' | 'admin';

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  readAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
