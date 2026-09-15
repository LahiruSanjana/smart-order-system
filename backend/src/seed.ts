import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { connectDB } from "./infrastructure/db";
import { User } from "./infrastructure/entities/User";
import { Product } from "./infrastructure/entities/Product";
import { Branch } from "./infrastructure/entities/Branch";
import { OrderItems } from "./infrastructure/entities/Order";

dotenv.config();

const seedUsers = [
  {
    firstName: "System",
    lastName: "Admin",
    email: "superadmin@smartorder.com",
    password: "SuperAdmin123!",
    role: "SUPER_ADMIN" as const,
    address: "Head Office",
    phone: "0770000001",
  },
  {
    firstName: "Branch",
    lastName: "Manager",
    email: "admin@smartorder.com",
    password: "Admin123!",
    role: "ADMIN" as const,
    address: "Colombo 03",
    phone: "0770000002",
  },
  {
    firstName: "Nimal",
    lastName: "Perera",
    email: "customer1@smartorder.com",
    password: "Customer123!",
    role: "CUSTOMER" as const,
    address: "Kandy",
    phone: "0770000003",
  },
  {
    firstName: "Saman",
    lastName: "Silva",
    email: "customer2@smartorder.com",
    password: "Customer123!",
    role: "CUSTOMER" as const,
    address: "Galle",
    phone: "0770000004",
  },
];

const seedProducts = [
  {
    name: "Rice Pack",
    description: "1kg rice pack",
    price: 360,
    category: "Groceries",
    stock: 120,
    sku: "RICE-001",
  },
  {
    name: "Milk Powder",
    description: "Family milk powder 500g",
    price: 890,
    category: "Groceries",
    stock: 80,
    sku: "MILK-001",
  },
  {
    name: "Soap",
    description: "Bath soap bar",
    price: 120,
    category: "Household",
    stock: 200,
    sku: "SOAP-001",
  },
  {
    name: "Biscuits",
    description: "Crispy biscuit pack",
    price: 240,
    category: "Snacks",
    stock: 150,
    sku: "BISC-001",
  },
  {
    name: "Orange Juice",
    description: "Fresh orange juice 1L",
    price: 430,
    category: "Beverages",
    stock: 90,
    sku: "JUICE-001",
  },
];

const seedBranches = [
  {
    name: "Colombo Central Branch",
    code: "BR-001",
    address: "Colombo 01",
    location: { lat: 6.9271, lng: 79.8612 },
    maxCapacity: 30,
  },
  {
    name: "Kandy City Branch",
    code: "BR-002",
    address: "Kandy",
    location: { lat: 7.2906, lng: 80.6337 },
    maxCapacity: 25,
  },
  {
    name: "Galle Outlet",
    code: "BR-003",
    address: "Galle",
    location: { lat: 6.0535, lng: 80.2210 },
    maxCapacity: 20,
  },
];

const createUsers = async () => {
  for (const user of seedUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await User.findOneAndUpdate(
      { email: user.email.toLowerCase() },
      {
        $set: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email.toLowerCase(),
          password: hashedPassword,
          role: user.role,
          address: user.address,
          phone: user.phone,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

const createProducts = async () => {
  const createdProducts = [] as any[];

  for (const product of seedProducts) {
    const savedProduct = await Product.findOneAndUpdate(
      { sku: product.sku },
      {
        $set: {
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          stock: product.stock,
          sku: product.sku,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    createdProducts.push(savedProduct);
  }

  return createdProducts;
};

const createBranches = async (products: any[]) => {
  const branchRecords = [] as any[];

  for (const branch of seedBranches) {
    const branchStock = products.map((product, index) => ({
      productId: product._id,
      quantity: 50 + (index + 1) * 10,
    }));

    const savedBranch = await Branch.findOneAndUpdate(
      { code: branch.code },
      {
        $set: {
          name: branch.name,
          code: branch.code,
          address: branch.address,
          location: branch.location,
          stock: branchStock,
          currentWorkload: 0,
          maxCapacity: branch.maxCapacity,
          isActive: true,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    branchRecords.push(savedBranch);
  }

  return branchRecords;
};

const createOrders = async (customer: any, branch: any, products: any[]) => {
  const items = [
    { productId: products[0]._id, quantity: 2, price: products[0].price },
    { productId: products[2]._id, quantity: 1, price: products[2].price },
  ];

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  await OrderItems.findOneAndUpdate(
    { customerId: customer._id, deliveryAddress: "Kandy" },
    {
      $set: {
        customerId: customer._id,
        items,
        totalAmount,
        deliveryAddress: "Kandy",
        deliveryLocation: { lat: 7.2906, lng: 80.6337 },
        assignedBranchId: branch._id,
        status: "PENDING",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const seedSampleData = async () => {
  try {
    await connectDB();
    await createUsers();
    const products = await createProducts();
    const branches = await createBranches(products);

    const customer = await User.findOne({ email: "customer1@smartorder.com" });
    const mainBranch = branches[0];

    if (customer && mainBranch) {
      await createOrders(customer, mainBranch, products);
    }

    console.log("Sample data seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedSampleData();
