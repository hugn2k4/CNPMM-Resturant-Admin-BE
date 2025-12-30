import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('categories')
export class Category {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column('string')
  name: string;

  @Column('string')
  slug: string;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('number', { default: 0 })
  displayOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
