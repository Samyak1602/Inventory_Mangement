import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  sku: string; //Not confirmed yet

  @Column()
  category: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 }) //precision is total digits, scale is decimal places
  price: number;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  description?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
