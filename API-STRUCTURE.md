# Restaurant Backend API Documentation

## 📁 Cấu trúc thư mục

```
src/
├── common/               # Code dùng chung
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── guards/          # Guards (auth, roles...)
│   ├── interceptors/    # Response interceptors
│   └── pipes/           # Custom pipes
├── config/              # Cấu hình
│   └── database.config.ts
├── modules/             # Feature modules
│   └── dishes/         # Module món ăn
│       ├── dto/        # Data Transfer Objects
│       ├── entities/   # Database entities
│       ├── dishes.controller.ts
│       ├── dishes.service.ts
│       └── dishes.module.ts
├── app.module.ts
└── main.ts
```

## 🎯 Cấu trúc Module mẫu (Dishes)

### 1. Entity (entities/dish.entity.ts)

Định nghĩa cấu trúc bảng database

### 2. DTOs (dto/)

- `create-dish.dto.ts`: Validation cho create
- `update-dish.dto.ts`: Validation cho update

### 3. Service (dishes.service.ts)

Business logic và thao tác database

### 4. Controller (dishes.controller.ts)

Định nghĩa các endpoints API

### 5. Module (dishes.module.ts)

Kết nối tất cả lại với nhau

## 🔌 API Endpoints (Dishes Module)

| Method | Endpoint                         | Mô tả                |
| ------ | -------------------------------- | -------------------- |
| POST   | `/api/dishes`                    | Tạo món ăn mới       |
| GET    | `/api/dishes`                    | Lấy danh sách món ăn |
| GET    | `/api/dishes?category=appetizer` | Lọc theo loại        |
| GET    | `/api/dishes/:id`                | Chi tiết món ăn      |
| PATCH  | `/api/dishes/:id`                | Cập nhật món ăn      |
| DELETE | `/api/dishes/:id`                | Xóa món ăn           |
| PATCH  | `/api/dishes/:id/availability`   | Cập nhật trạng thái  |

## 📝 Ví dụ Request/Response

### Tạo món ăn mới

```json
POST /api/dishes
{
  "name": "Phở bò",
  "description": "Phở bò truyền thống Hà Nội",
  "price": 50000,
  "category": "main-course",
  "image": "https://example.com/pho.jpg",
  "isAvailable": true
}

Response:
{
  "statusCode": 201,
  "message": "Success",
  "data": {
    "id": 1,
    "name": "Phở bò",
    "description": "Phở bò truyền thống Hà Nội",
    "price": "50000.00",
    "category": "main-course",
    "image": "https://example.com/pho.jpg",
    "isAvailable": true,
    "createdAt": "2025-12-18T10:00:00.000Z",
    "updatedAt": "2025-12-18T10:00:00.000Z"
  }
}
```

## 🚀 Cách tạo module mới

### Bước 1: Tạo cấu trúc thư mục

```
src/modules/[module-name]/
├── dto/
│   ├── create-[entity].dto.ts
│   └── update-[entity].dto.ts
├── entities/
│   └── [entity].entity.ts
├── [module-name].controller.ts
├── [module-name].service.ts
└── [module-name].module.ts
```

### Bước 2: Tạo Entity

```typescript
@Entity('table_name')
export class EntityName {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  field: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Bước 3: Tạo DTOs

```typescript
export class CreateDto {
  @IsString()
  @MinLength(3)
  field: string;
}

export class UpdateDto extends PartialType(CreateDto) {}
```

### Bước 4: Tạo Service

```typescript
@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Entity)
    private readonly repository: Repository<Entity>,
  ) {}

  async create(dto: CreateDto): Promise<Entity> {
    const entity = this.repository.create(dto);
    return await this.repository.save(entity);
  }

  async findAll(): Promise<Entity[]> {
    return await this.repository.find();
  }

  // ... các methods khác
}
```

### Bước 5: Tạo Controller

```typescript
@Controller('endpoint')
export class ModuleController {
  constructor(private readonly service: ModuleService) {}

  @Post()
  create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ... các endpoints khác
}
```

### Bước 6: Tạo Module

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [ModuleController],
  providers: [ModuleService],
  exports: [ModuleService],
})
export class ModuleNameModule {}
```

### Bước 7: Import vào AppModule

```typescript
@Module({
  imports: [
    // ... các imports khác
    ModuleNameModule,
  ],
})
export class AppModule {}
```

## 📦 Dependencies cần cài

```bash
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/config class-validator class-transformer
npm install @nestjs/mapped-types
```

## ⚙️ Chạy ứng dụng

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

Server sẽ chạy tại: http://localhost:3000/api
