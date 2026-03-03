import { IsNumber, IsOptional, IsPositive, IsString, IsIn } from 'class-validator';

export class CreateOrderDto {
    @IsNumber()
    customerId: number;

    @IsNumber()
    productId: number;

    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsOptional()
    @IsString()
    @IsIn(['pending', 'completed', 'cancelled'])
    status?: string;
}
