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
import { DishesService } from './dishes.service';
import { CreateDishDto } from './dto/create-dish.dto';
import { UpdateDishDto } from './dto/update-dish.dto';

@Controller('dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  // POST /dishes - Tạo món ăn mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDishDto: CreateDishDto) {
    return this.dishesService.create(createDishDto);
  }

  // GET /dishes - Lấy danh sách món ăn
  @Get()
  findAll(@Query('category') category?: string) {
    if (category) {
      return this.dishesService.findByCategory(category);
    }
    return this.dishesService.findAll();
  }

  // GET /dishes/:id - Lấy chi tiết món ăn
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  // PATCH /dishes/:id - Cập nhật món ăn
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDishDto: UpdateDishDto) {
    return this.dishesService.update(id, updateDishDto);
  }

  // DELETE /dishes/:id - Xóa món ăn
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.dishesService.remove(id);
  }

  // PATCH /dishes/:id/availability - Cập nhật trạng thái món ăn
  @Patch(':id/availability')
  updateAvailability(
    @Param('id') id: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.dishesService.updateAvailability(id, isAvailable);
  }
}
