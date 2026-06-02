import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@shop.com',
      password,
      role: 'ADMIN',
    },
  });

  // Clear and re-seed (respect FK dependency order)
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderSequence.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany({ where: { parentId: { not: null } } });
  await prisma.category.deleteMany({ where: { parentId: null } });

  const categoryData = [
    {
      name: '电子产品',
      children: [
        { name: '手机' },
        { name: '笔记本' },
        { name: '平板电脑' },
        { name: '耳机音箱' },
      ],
    },
    {
      name: '服装',
      children: [
        { name: '男装' },
        { name: '女装' },
        { name: '童装' },
        { name: '内衣' },
      ],
    },
    {
      name: '鞋靴箱包',
      children: [
        { name: '运动鞋' },
        { name: '休闲鞋' },
        { name: '箱包' },
        { name: '配饰' },
      ],
    },
    {
      name: '美妆个护',
      children: [
        { name: '面部护肤' },
        { name: '彩妆' },
        { name: '香水' },
        { name: '身体护理' },
      ],
    },
    {
      name: '家居生活',
      children: [
        { name: '家纺' },
        { name: '灯具' },
        { name: '收纳' },
        { name: '香氛' },
      ],
    },
    {
      name: '食品饮料',
      children: [
        { name: '零食' },
        { name: '冲饮' },
        { name: '生鲜' },
        { name: '茗茶' },
      ],
    },
    {
      name: '运动户外',
      children: [
        { name: '健身器材' },
        { name: '户外装备' },
        { name: '骑行' },
        { name: '游泳' },
      ],
    },
    {
      name: '图书文具',
      children: [
        { name: '小说' },
        { name: '教辅' },
        { name: '文具' },
        { name: '绘本' },
      ],
    },
    {
      name: '母婴',
      children: [
        { name: '奶粉' },
        { name: '纸尿裤' },
        { name: '玩具' },
        { name: '童车' },
      ],
    },
    {
      name: '数码配件',
      children: [
        { name: '数据线' },
        { name: '充电器' },
        { name: '保护壳' },
        { name: '屏幕膜' },
      ],
    },
    {
      name: '宠物用品',
      children: [
        { name: '猫粮狗粮' },
        { name: '零食罐头' },
        { name: '猫砂' },
        { name: '玩具服饰' },
      ],
    },
    {
      name: '汽车用品',
      children: [
        { name: '车载电器' },
        { name: '内饰' },
        { name: '安全座椅' },
        { name: '清洁养护' },
      ],
    },
  ];

  for (const cat of categoryData) {
    await prisma.category.create({
      data: {
        name: cat.name,
        children: {
          create: cat.children,
        },
      },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
