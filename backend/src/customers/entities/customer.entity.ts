import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from "typeorm";

@Entity('customers')
export class Customer {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    phone: string;

    @Column()
    city: string;

    @Column()
    address: string;

    @CreateDateColumn()
    createdAt: Date;
}