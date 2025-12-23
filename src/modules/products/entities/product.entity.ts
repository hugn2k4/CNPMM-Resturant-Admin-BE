import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('products')
export class Product {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('number')
  price: number;

  @Column({ type: 'array', default: [] })
  listProductImage: Array<ObjectId | { url: string }>;

  @Column({ type: 'array', default: [] })
  listReview: any[];

  @Column('string', { default: 'available' })
  status: string; // available, unavailable, out-of-stock

  @Column('objectid')
  categoryId: ObjectId;

  @Column('number', { default: 0 })
  stock: number;

  @Column('string', { nullable: true })
  preparationTime: string; // "25-30 phút"

  @Column('number', { default: 0 })
  calories: number;

  @Column('double', { default: 0 })
  rating: number;

  @Column('number', { default: 0 })
  reviewCount: number;

  @Column('number', { default: 0 })
  viewCount: number;

  @Column('number', { default: 0 })
  soldCount: number;

  @Column('number', { default: 0 })
  discount: number;

  @Column('boolean', { default: false })
  isDeleted: boolean;

  @Column('number', { default: 0 })
  __v: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
