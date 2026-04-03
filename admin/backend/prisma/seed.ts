import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Default settings
  const settings = [
    { key: 'store_name', value: 'My Store' },
    { key: 'store_currency', value: 'USD' },
    { key: 'store_country', value: 'US' },
    { key: 'store_timezone', value: 'UTC' },
    { key: 'store_email', value: 'store@example.com' },
    { key: 'tax_inclusive', value: 'false' },
    { key: 'guest_checkout', value: 'true' },
    { key: 'low_stock_threshold', value: '5' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      create: s,
      update: { value: s.value },
    });
  }

  // Default shipping zone
  await prisma.shippingZone.upsert({
    where: { id: 'default-zone' },
    create: {
      id: 'default-zone',
      name: 'Worldwide',
      isDefault: true,
      methods: {
        create: [
          { name: 'Standard Shipping', type: 'FLAT_RATE', cost: 500 },
          { name: 'Free Shipping', type: 'FREE_SHIPPING', cost: 0, minOrderAmount: 5000 },
        ],
      },
    },
    update: {},
  });

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
