import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /products - Tạo sản phẩm mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // GET /products - Lấy danh sách sản phẩm
  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.productsService.findByCategory(category);
    }
    return this.productsService.findAll();
  }

  // GET /products/:id - Lấy chi tiết sản phẩm
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  // PATCH /products/:id - Cập nhật sản phẩm
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  // DELETE /products/:id - Xóa sản phẩm
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }

  // PATCH /products/:id/status - Cập nhật trạng thái sản phẩm
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.productsService.updateStatus(id, status);
  }
}
