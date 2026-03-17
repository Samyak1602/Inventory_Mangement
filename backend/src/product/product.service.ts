import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { buildPaginationResponse } from '../common/utils/pagination.util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const sku = await this.generateUniqueSKU(createProductDto);

    const product = this.productRepository.create({
      ...createProductDto,
      sku,
    });

    return await this.productRepository.save(product);
  }

  private async generateUniqueSKU(productData: any): Promise<string> {
    const prefix = productData.category?.substring(0, 3).toUpperCase() || 'PRD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `${prefix}-${timestamp}-${random}`;
  }

  async findAll(search?: string, page: number = 1, limit: number = 10) {
    const query = this.productRepository.createQueryBuilder('product');

    if (search) {
      query.where(
        'product.name LIKE :search OR product.sku LIKE :search OR product.category LIKE :search',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return buildPaginationResponse(data, total, page, limit);
  }

  async findOne(id: number) {
    return this.findProductOrFail(id);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findProductOrFail(id);
    await this.productRepository.update(id, updateProductDto);
    return this.productRepository.findOne({ where: { id } });
  }

  async remove(id: number) {
    await this.findProductOrFail(id);
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }

  private async findProductOrFail(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }
}
