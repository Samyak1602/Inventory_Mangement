import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Product } from '../product/entities/product.entity';
import { Customer } from '../customers/entities/customer.entity';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Customer)
        private customerRepository: Repository<Customer>,
    ) { }

    async create(createOrderDto: CreateOrderDto) {
        // Validate customer exists
        const customer = await this.customerRepository.findOne({
            where: { id: createOrderDto.customerId },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // Validate product exists
        const product = await this.productRepository.findOne({
            where: { id: createOrderDto.productId },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        // Auto-generate order number
        const orderNumber = await this.generateOrderNumber();

        // Auto-calculate total price
        const totalPrice = parseFloat((Number(product.price) * createOrderDto.quantity).toFixed(2));

        const order = this.orderRepository.create({
            ...createOrderDto,
            orderNumber,
            totalPrice,
        });

        const savedOrder = await this.orderRepository.save(order);

        // Return with populated relations
        return this.orderRepository.findOne({
            where: { id: savedOrder.id },
            relations: ['customer', 'product'],
        });
    }

    private async generateOrderNumber(): Promise<string> {
        const count = await this.orderRepository.count();
        const num = (count + 1).toString().padStart(3, '0');
        return `ORD-${num}`;
    }

    async findAll(
        search?: string,
        status?: string,
        page: number = 1,
        limit: number = 10,
    ) {
        const query = this.orderRepository
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.customer', 'customer')
            .leftJoinAndSelect('order.product', 'product');

        if (search) {
            query.where(
                'order.orderNumber LIKE :search OR customer.name LIKE :search OR product.name LIKE :search',
                { search: `%${search}%` },
            );
        }

        if (status) {
            if (search) {
                query.andWhere('order.status = :status', { status });
            } else {
                query.where('order.status = :status', { status });
            }
        }

        const [data, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('order.createdAt', 'DESC')
            .getManyAndCount();

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'product'],
        });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        return order;
    }

    async update(id: number, updateOrderDto: UpdateOrderDto) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // If quantity is being updated, recalculate totalPrice
        if (updateOrderDto.quantity) {
            const product = await this.productRepository.findOne({
                where: { id: updateOrderDto.productId || order.productId },
            });
            if (product) {
                (updateOrderDto as any).totalPrice =
                    parseFloat((Number(product.price) * updateOrderDto.quantity).toFixed(2));
            }
        }

        await this.orderRepository.update(id, updateOrderDto);
        return this.orderRepository.findOne({
            where: { id },
            relations: ['customer', 'product'],
        });
    }

    async remove(id: number) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new NotFoundException('Order not found');
        }
        await this.orderRepository.delete(id);
        return { message: 'Order deleted successfully' };
    }
}
