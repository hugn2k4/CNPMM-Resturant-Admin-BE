import {
  Column,
  CreateDateColumn,
  Entity,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
  note?: string;
}

@Entity('orders')
export class Order {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column({ unique: true })
  orderNumber: string;

  @Column()
  items: OrderItem[];

  @Column()
  shippingAddress: ShippingAddress;

  @Column({ default: 'COD' })
  paymentMethod: 'COD' | 'banking' | 'e-wallet';

  @Column({ default: 'pending' })
  paymentStatus: 'pending' | 'paid' | 'failed';

  @Column({ default: 'pending' })
  orderStatus:
    | 'pending'
    | 'confirmed'
    | 'preparing'
    | 'shipping'
    | 'delivered'
    | 'cancelled';

  @Column()
  totalAmount: number;

  @Column({ default: 0 })
  shippingFee: number;

  @Column()
  finalAmount: number;

  @Column({ nullable: true })
  note?: string;

  @Column({ nullable: true })
  estimatedDeliveryTime?: Date;

  @Column({ nullable: true })
  confirmedAt?: Date;

  @Column({ nullable: true })
  preparingAt?: Date;

  @Column({ nullable: true })
  shippingAt?: Date;

  @Column({ nullable: true })
  deliveredAt?: Date;

  @Column({ nullable: true })
  cancelledAt?: Date;

  @Column({ nullable: true })
  cancelReason?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
