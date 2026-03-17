import { Injectable } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { buildPaginationResponse } from '../common/utils/pagination.util';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const customer = this.customerRepository.create(createCustomerDto);
    return this.customerRepository.save(customer);
  }

  async findAll(search?: string, page: number = 1, limit: number = 10) {
    const query = this.customerRepository.createQueryBuilder('customer');
    if (search) {
      query.where(
        'customer.name LIKE :search OR customer.email LIKE :search OR customer.phone LIKE :search',
        { search: `%${search}%` },
      );
    }
    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginationResponse(data, total, page, limit);
  }

  async findOne(id: number): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id } });
  }

  async update(
    id: number,
    updateCustomerDto: CreateCustomerDto,
  ): Promise<Customer | null> {
    await this.customerRepository.update(id, updateCustomerDto);
    return this.customerRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.customerRepository.delete(id);
  }
}
