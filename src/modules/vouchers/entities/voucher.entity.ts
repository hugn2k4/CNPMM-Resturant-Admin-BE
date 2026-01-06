import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ObjectId,
  ObjectIdColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vouchers')
@Index('code_unique', ['code'], { unique: true })
export class Voucher {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('string') // PERCENTAGE or FIXED_AMOUNT
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Column('number')
  discountValue: number;

  @Column('number', { nullable: true })
  maxDiscountAmount: number | null;

  @Column('number', { default: 0 })
  minOrderAmount: number;

  @Column('number', { nullable: true })
  maxUsage: number | null;

  @Column('number', { default: 1 })
  maxUsagePerUser: number;

  @Column('number', { default: 0 })
  usageCount: number;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('array', { default: [] })
  applicableProducts: ObjectId[];

  @Column('array', { default: [] })
  applicableCategories: ObjectId[];

  @Column('boolean', { default: true })
  isPublic: boolean;

  @Column('string', { nullable: true })
  createdBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Virtual property to check if voucher is currently valid
  get isValid(): boolean {
    const now = new Date();
    return (
      this.isActive &&
      this.startDate <= now &&
      this.endDate >= now &&
      (this.maxUsage === null || this.usageCount < this.maxUsage)
    );
  }

  // Calculate discount amount for a given order total
  calculateDiscount(orderAmount: number): number {
    let discount = 0;

    if (this.discountType === 'PERCENTAGE') {
      discount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
        discount = this.maxDiscountAmount;
      }
    } else if (this.discountType === 'FIXED_AMOUNT') {
      discount = this.discountValue;
    }

    // Discount cannot exceed order amount
    return Math.min(discount, orderAmount);
  }
}
