import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Customer } from '../../customers/entities/customer.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    orderNumber: string;

    @Column()
    customerId: number;

    @Column()
    productId: number;

    @Column()
    quantity: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ default: 'pending' })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Customer, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customerId' })
    customer: Customer;

    @ManyToOne(() => Product, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'productId' })
    product: Product;
}
