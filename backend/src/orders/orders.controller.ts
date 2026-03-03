import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    create(@Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.create(createOrderDto);
    }

    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('status') status?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.ordersService.findAll(
            search,
            status,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 10,
        );
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.ordersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        return this.ordersService.update(+id, updateOrderDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ordersService.remove(+id);
    }
}
