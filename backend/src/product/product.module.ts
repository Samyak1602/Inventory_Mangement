import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product]), // ✅ This registers the Product repository
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService], // Export if other modules need it
})
export class ProductModule {}
