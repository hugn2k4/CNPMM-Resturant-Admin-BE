# Seed Database

File seed này dùng để tạo dữ liệu mẫu cho database.

## Chạy seed

```bash
npm run seed
```

## Tài khoản Admin mặc định

Sau khi chạy seed, bạn có thể đăng nhập với tài khoản:

```
📧 Email: admin@restaurant.com
🔑 Password: admin123
```

## Chức năng

- ✅ Tạo tài khoản admin mặc định
- ✅ Kiểm tra tài khoản đã tồn tại trước khi tạo (không tạo trùng)
- ✅ Mã hóa password với bcrypt

## Cấu trúc

```
seed/
├── seed.service.ts  # Service chứa logic seed
├── seed.module.ts   # Module config cho seed
├── seed.ts          # Script chạy seed
└── README.md        # File này
```

## Thêm seed data mới

Để thêm seed cho các entity khác, cập nhật file `seed.service.ts`:

```typescript
async seedAll() {
  console.log('🌱 Starting database seeding...');
  
  await this.seedAdminUser();
  // await this.seedCategories();
  // await this.seedProducts();
  
  console.log('🎉 Seeding completed!');
}
```
