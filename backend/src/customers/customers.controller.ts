import { Controller, Post, Body, Get, Param, Patch, Delete, Query } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { Customer } from './entities/customer.entity';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customersService.create(createCustomerDto);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.customersService.findAll(
            search,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 10,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<Customer | null> {
        return this.customersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCustomerDto: CreateCustomerDto): Promise<Customer | null> {
        return this.customersService.update(+id, updateCustomerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string): Promise<void> {
        return this.customersService.remove(+id);
    }
}
