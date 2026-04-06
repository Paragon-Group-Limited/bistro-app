// ============================================
// Mock Data Layer
// All mock data lives here. When connecting to
// real SMA MySQL backend, replace the api.ts
// functions — this file becomes unused.
// ============================================

import type { Category, MenuItem, Customer, Order, StaffMember, TaxRate, Biller, Currency, RolePermissions, RestaurantSettings, Notification, ExpenseCategory, Expense, DailySalesReport, RestaurantTable, Reservation, InventoryItem, Warehouse, StockAdjustment, Supplier, PurchaseOrder, Promotion, Return, GiftCard, GiftCardTransaction, Quote, CalendarEvent } from './types';

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Starters',
    slug: 'starters',
    description: 'Begin your meal with something special',
    sortOrder: 1,
    isActive: true,
  },
  {
    id: 'cat-2',
    name: 'Mains',
    slug: 'mains',
    description: 'Hearty dishes to satisfy',
    sortOrder: 2,
    isActive: true,
  },
  {
    id: 'cat-3',
    name: 'Burgers',
    slug: 'burgers',
    description: 'Handcrafted burgers',
    sortOrder: 3,
    isActive: true,
  },
  {
    id: 'cat-4',
    name: 'Pizza',
    slug: 'pizza',
    description: 'Wood-fired and loaded',
    sortOrder: 4,
    isActive: true,
  },
  {
    id: 'cat-5',
    name: 'Pasta',
    slug: 'pasta',
    description: 'Fresh pasta, made in-house',
    sortOrder: 5,
    isActive: true,
  },
  {
    id: 'cat-6',
    name: 'Sides',
    slug: 'sides',
    description: 'Perfect companions',
    sortOrder: 6,
    isActive: true,
  },
  {
    id: 'cat-7',
    name: 'Beverages',
    slug: 'beverages',
    description: 'Refreshments and hot drinks',
    sortOrder: 7,
    isActive: true,
  },
  {
    id: 'cat-8',
    name: 'Desserts',
    slug: 'desserts',
    description: 'Sweet endings',
    sortOrder: 8,
    isActive: true,
  },
];

export const menuItems: MenuItem[] = [
  // Starters
  {
    id: 'item-1',
    categoryId: 'cat-1',
    name: 'Crispy Chicken Wings',
    description: 'Golden fried wings tossed in house buffalo sauce, served with ranch dip',
    price: 450,
    isAvailable: true,
    tags: ['bestseller', 'spicy'],
    prepTimeMinutes: 12,
    calories: 380,
  },
  {
    id: 'item-2',
    categoryId: 'cat-1',
    name: 'Garlic Prawns',
    description: 'Tiger prawns sautéed in garlic butter with herbs and toasted bread',
    price: 580,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 10,
    calories: 290,
  },
  {
    id: 'item-3',
    categoryId: 'cat-1',
    name: 'Loaded Nachos',
    description: 'Tortilla chips with melted cheese, jalapeños, salsa, sour cream and guac',
    price: 390,
    isAvailable: true,
    tags: ['vegetarian'],
    prepTimeMinutes: 8,
    calories: 520,
  },
  {
    id: 'item-4',
    categoryId: 'cat-1',
    name: 'Soup of the Day',
    description: 'Chef\'s daily selection, served with artisan bread',
    price: 280,
    isAvailable: true,
    tags: ['vegetarian'],
    prepTimeMinutes: 5,
    calories: 180,
  },

  // Mains
  {
    id: 'item-5',
    categoryId: 'cat-2',
    name: 'Grilled Ribeye Steak',
    description: '300g ribeye, chargrilled to your preference, served with mashed potato and seasonal veg',
    price: 1450,
    isAvailable: true,
    tags: ['bestseller'],
    prepTimeMinutes: 25,
    calories: 680,
  },
  {
    id: 'item-6',
    categoryId: 'cat-2',
    name: 'Pan-Seared Salmon',
    description: 'Atlantic salmon fillet with lemon dill sauce, asparagus and wild rice',
    price: 980,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 18,
    calories: 450,
  },
  {
    id: 'item-7',
    categoryId: 'cat-2',
    name: 'Chicken Tikka Masala',
    description: 'Tender chicken in rich spiced tomato cream, with garlic naan and basmati',
    price: 720,
    isAvailable: true,
    tags: ['spicy', 'bestseller'],
    prepTimeMinutes: 20,
    calories: 580,
  },
  {
    id: 'item-8',
    categoryId: 'cat-2',
    name: 'Grilled Lamb Chops',
    description: 'New Zealand lamb chops with rosemary jus, roasted potatoes and mint yogurt',
    price: 1280,
    isAvailable: false,
    tags: [],
    prepTimeMinutes: 22,
    calories: 620,
  },

  // Burgers
  {
    id: 'item-9',
    categoryId: 'cat-3',
    name: 'Classic Smash Burger',
    description: 'Double smashed patties, American cheese, pickles, special sauce on brioche',
    price: 550,
    isAvailable: true,
    tags: ['bestseller'],
    prepTimeMinutes: 12,
    calories: 720,
  },
  {
    id: 'item-10',
    categoryId: 'cat-3',
    name: 'BBQ Bacon Burger',
    description: 'Beef patty, crispy bacon, cheddar, onion rings, smoky BBQ sauce',
    price: 620,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 14,
    calories: 850,
  },
  {
    id: 'item-11',
    categoryId: 'cat-3',
    name: 'Mushroom Swiss Burger',
    description: 'Beef patty topped with sautéed mushrooms and melted Swiss cheese',
    price: 580,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 14,
    calories: 780,
  },

  // Pizza
  {
    id: 'item-12',
    categoryId: 'cat-4',
    name: 'Margherita',
    description: 'San Marzano tomato, fresh mozzarella, basil, extra virgin olive oil',
    price: 480,
    isAvailable: true,
    tags: ['vegetarian'],
    prepTimeMinutes: 15,
    calories: 680,
  },
  {
    id: 'item-13',
    categoryId: 'cat-4',
    name: 'Pepperoni Supreme',
    description: 'Loaded pepperoni, mozzarella, oregano on house-made dough',
    price: 580,
    isAvailable: true,
    tags: ['bestseller'],
    prepTimeMinutes: 15,
    calories: 820,
  },
  {
    id: 'item-14',
    categoryId: 'cat-4',
    name: 'BBQ Chicken Pizza',
    description: 'Pulled chicken, red onion, bell pepper, mozzarella, BBQ drizzle',
    price: 620,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 15,
    calories: 760,
  },

  // Pasta
  {
    id: 'item-15',
    categoryId: 'cat-5',
    name: 'Spaghetti Carbonara',
    description: 'Classic Roman style with pancetta, egg yolk, pecorino and black pepper',
    price: 520,
    isAvailable: true,
    tags: ['bestseller'],
    prepTimeMinutes: 12,
    calories: 650,
  },
  {
    id: 'item-16',
    categoryId: 'cat-5',
    name: 'Penne Arrabbiata',
    description: 'Penne in spicy tomato sauce with garlic and fresh chilli',
    price: 420,
    isAvailable: true,
    tags: ['spicy', 'vegetarian'],
    prepTimeMinutes: 10,
    calories: 480,
  },
  {
    id: 'item-17',
    categoryId: 'cat-5',
    name: 'Truffle Mushroom Risotto',
    description: 'Arborio rice with wild mushrooms, truffle oil and parmesan',
    price: 680,
    isAvailable: true,
    tags: ['vegetarian', 'new'],
    prepTimeMinutes: 18,
    calories: 550,
  },

  // Sides
  {
    id: 'item-18',
    categoryId: 'cat-6',
    name: 'Truffle Fries',
    description: 'Crispy fries with truffle oil and parmesan shavings',
    price: 280,
    isAvailable: true,
    tags: ['vegetarian', 'bestseller'],
    prepTimeMinutes: 6,
    calories: 380,
  },
  {
    id: 'item-19',
    categoryId: 'cat-6',
    name: 'Caesar Salad',
    description: 'Romaine, croutons, parmesan, classic Caesar dressing',
    price: 320,
    isAvailable: true,
    tags: ['vegetarian'],
    prepTimeMinutes: 5,
    calories: 220,
  },
  {
    id: 'item-20',
    categoryId: 'cat-6',
    name: 'Onion Rings',
    description: 'Beer-battered onion rings with chipotle mayo',
    price: 250,
    isAvailable: true,
    tags: ['vegetarian'],
    prepTimeMinutes: 6,
    calories: 340,
  },

  // Beverages
  {
    id: 'item-21',
    categoryId: 'cat-7',
    name: 'Fresh Lime Soda',
    description: 'Freshly squeezed lime with soda, sweet or salted',
    price: 120,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 2,
    calories: 60,
  },
  {
    id: 'item-22',
    categoryId: 'cat-7',
    name: 'Mango Smoothie',
    description: 'Blended fresh mango with yogurt and honey',
    price: 180,
    isAvailable: true,
    tags: ['bestseller'],
    prepTimeMinutes: 3,
    calories: 240,
  },
  {
    id: 'item-23',
    categoryId: 'cat-7',
    name: 'Americano',
    description: 'Double shot espresso with hot water',
    price: 160,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 2,
    calories: 10,
  },
  {
    id: 'item-24',
    categoryId: 'cat-7',
    name: 'Iced Latte',
    description: 'Espresso over ice with cold milk',
    price: 200,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 3,
    calories: 120,
  },

  // Desserts
  {
    id: 'item-25',
    categoryId: 'cat-8',
    name: 'Molten Chocolate Cake',
    description: 'Warm chocolate cake with a gooey center, served with vanilla ice cream',
    price: 380,
    isAvailable: true,
    tags: ['bestseller'],
    prepTimeMinutes: 12,
    calories: 520,
  },
  {
    id: 'item-26',
    categoryId: 'cat-8',
    name: 'New York Cheesecake',
    description: 'Classic baked cheesecake with berry compote',
    price: 340,
    isAvailable: true,
    tags: [],
    prepTimeMinutes: 3,
    calories: 440,
  },
  {
    id: 'item-27',
    categoryId: 'cat-8',
    name: 'Tiramisu',
    description: 'Espresso-soaked ladyfingers with mascarpone cream and cocoa',
    price: 360,
    isAvailable: true,
    tags: ['new'],
    prepTimeMinutes: 3,
    calories: 380,
  },
];

export const customers: Customer[] = [
  {
    id: 'cust-0',
    name: 'Mahir Rahman',
    phone: '+8801711824478',
    email: 'mahir@paragon.com.bd',
    createdAt: '2026-01-01T00:00:00Z',
    totalOrders: 15,
    totalSpent: 12500,
    lastOrderAt: '2026-04-02T10:00:00Z',
  },
  {
    id: 'cust-1',
    name: 'Rafiq Ahmed',
    phone: '+8801712345678',
    email: 'rafiq@example.com',
    createdAt: '2026-03-15T10:00:00Z',
    totalOrders: 12,
    totalSpent: 8450,
    lastOrderAt: '2026-04-01T19:30:00Z',
  },
  {
    id: 'cust-2',
    name: 'Nusrat Jahan',
    phone: '+8801898765432',
    createdAt: '2026-03-20T14:00:00Z',
    totalOrders: 5,
    totalSpent: 3200,
    lastOrderAt: '2026-03-30T13:15:00Z',
  },
  {
    id: 'cust-3',
    name: 'Tanvir Hasan',
    phone: '+8801556789012',
    createdAt: '2026-03-28T09:00:00Z',
    totalOrders: 3,
    totalSpent: 2100,
    lastOrderAt: '2026-04-01T20:45:00Z',
  },
  {
    id: 'cust-4',
    name: 'Priya Das',
    phone: '+8801634567890',
    email: 'priya.d@example.com',
    createdAt: '2026-02-10T11:00:00Z',
    totalOrders: 28,
    totalSpent: 21500,
    lastOrderAt: '2026-04-02T12:00:00Z',
  },
  {
    id: 'cust-5',
    name: 'Arif Khan',
    phone: '+8801745678901',
    createdAt: '2026-03-01T16:00:00Z',
    totalOrders: 8,
    totalSpent: 5600,
    lastOrderAt: '2026-03-29T18:30:00Z',
  },
];

const now = new Date().toISOString();
const minutesAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const orders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: '#038',
    customerId: 'cust-4',
    customerName: 'Priya Das',
    orderType: 'dine-in',
    tableNumber: '7',
    items: [
      { id: 'oi-1', menuItemId: 'item-9', menuItemName: 'Classic Smash Burger', quantity: 2, unitPrice: 550 },
      { id: 'oi-2', menuItemId: 'item-18', menuItemName: 'Truffle Fries', quantity: 2, unitPrice: 280 },
      { id: 'oi-3', menuItemId: 'item-22', menuItemName: 'Mango Smoothie', quantity: 2, unitPrice: 180 },
    ],
    status: 'preparing',
    subtotal: 2020,
    total: 2020,
    createdAt: minutesAgo(18),
    updatedAt: minutesAgo(14),
    acceptedAt: minutesAgo(14),
  },
  {
    id: 'ord-2',
    orderNumber: '#039',
    customerId: 'cust-1',
    customerName: 'Rafiq Ahmed',
    orderType: 'dine-in',
    tableNumber: '3',
    items: [
      { id: 'oi-4', menuItemId: 'item-5', menuItemName: 'Grilled Ribeye Steak', quantity: 1, unitPrice: 1450 },
      { id: 'oi-5', menuItemId: 'item-19', menuItemName: 'Caesar Salad', quantity: 1, unitPrice: 320 },
      { id: 'oi-6', menuItemId: 'item-23', menuItemName: 'Americano', quantity: 1, unitPrice: 160 },
    ],
    status: 'pending',
    subtotal: 1930,
    total: 1930,
    createdAt: minutesAgo(3),
    updatedAt: minutesAgo(3),
  },
  {
    id: 'ord-3',
    orderNumber: '#037',
    customerId: 'cust-3',
    customerName: 'Tanvir Hasan',
    orderType: 'dine-in',
    tableNumber: '12',
    items: [
      { id: 'oi-7', menuItemId: 'item-13', menuItemName: 'Pepperoni Supreme', quantity: 1, unitPrice: 580 },
      { id: 'oi-8', menuItemId: 'item-15', menuItemName: 'Spaghetti Carbonara', quantity: 1, unitPrice: 520 },
      { id: 'oi-9', menuItemId: 'item-25', menuItemName: 'Molten Chocolate Cake', quantity: 2, unitPrice: 380 },
    ],
    status: 'ready',
    subtotal: 1860,
    total: 1860,
    createdAt: minutesAgo(35),
    updatedAt: minutesAgo(5),
    acceptedAt: minutesAgo(30),
    readyAt: minutesAgo(5),
  },
  {
    id: 'ord-4',
    orderNumber: '#040',
    customerId: 'cust-2',
    customerName: 'Nusrat Jahan',
    orderType: 'takeaway',
    items: [
      { id: 'oi-10', menuItemId: 'item-7', menuItemName: 'Chicken Tikka Masala', quantity: 1, unitPrice: 720 },
      { id: 'oi-11', menuItemId: 'item-3', menuItemName: 'Loaded Nachos', quantity: 1, unitPrice: 390 },
      { id: 'oi-12', menuItemId: 'item-21', menuItemName: 'Fresh Lime Soda', quantity: 2, unitPrice: 120 },
    ],
    status: 'pending',
    subtotal: 1350,
    total: 1350,
    notes: 'No onions in the tikka please',
    createdAt: minutesAgo(1),
    updatedAt: minutesAgo(1),
  },
  {
    id: 'ord-5',
    orderNumber: '#036',
    customerId: 'cust-5',
    customerName: 'Arif Khan',
    orderType: 'delivery',
    deliveryAddress: {
      fullName: 'Arif Khan',
      phone: '+8801745678901',
      address: 'House 12, Road 5, Block C',
      area: 'Gulshan',
      instructions: 'Ring the bell twice',
    },
    deliveryFee: 60,
    deliveryStatus: 'delivered',
    items: [
      { id: 'oi-13', menuItemId: 'item-12', menuItemName: 'Margherita', quantity: 1, unitPrice: 480 },
      { id: 'oi-14', menuItemId: 'item-24', menuItemName: 'Iced Latte', quantity: 1, unitPrice: 200 },
    ],
    status: 'completed',
    subtotal: 680,
    total: 740,
    createdAt: minutesAgo(55),
    updatedAt: minutesAgo(40),
    acceptedAt: minutesAgo(50),
    readyAt: minutesAgo(42),
    completedAt: minutesAgo(40),
  },
];

export const staffMembers: StaffMember[] = [
  {
    id: 'staff-0',
    name: 'Mahir Rahman',
    phone: '+8801711824478',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'staff-1',
    name: 'Kamal Hossain',
    phone: '+8801712000001',
    role: 'admin',
    isActive: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'staff-2',
    name: 'Rina Begum',
    phone: '+8801712000002',
    role: 'manager',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'staff-3',
    name: 'Jamal Uddin',
    phone: '+8801712000003',
    role: 'kitchen',
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'staff-4',
    name: 'Sadia Akter',
    phone: '+8801712000004',
    role: 'waiter',
    isActive: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'staff-5',
    name: 'Rubel Mia',
    phone: '+8801712000005',
    role: 'kitchen',
    isActive: false,
    createdAt: '2026-03-01T00:00:00Z',
  },
];

// ============================================
// Settings Mock Data
// ============================================

export const taxRates: TaxRate[] = [
  { id: 'tax-1', code: 'VAT15', name: 'VAT 15%', rate: 15, type: 'exclusive', isActive: true },
  { id: 'tax-2', code: 'VAT5', name: 'VAT 5% (Reduced)', rate: 5, type: 'exclusive', isActive: true },
  { id: 'tax-3', code: 'SC10', name: 'Service Charge 10%', rate: 10, type: 'inclusive', isActive: true },
  { id: 'tax-4', code: 'EXEMPT', name: 'Tax Exempt', rate: 0, type: 'exclusive', isActive: false },
];

export const billers: Biller[] = [
  {
    id: 'biller-1',
    companyName: 'Bistro Central Ltd.',
    address: 'House 45, Road 11, Block D',
    city: 'Dhaka',
    country: 'Bangladesh',
    phone: '+8801711824478',
    email: 'accounts@bistrocentral.com',
    taxNumber: 'TIN-1234567890',
    vatNumber: 'VAT-BD-0012345',
    isDefault: true,
  },
  {
    id: 'biller-2',
    companyName: 'Bistro Central — Catering Division',
    address: 'House 45, Road 11, Block D',
    city: 'Dhaka',
    country: 'Bangladesh',
    phone: '+8801711824479',
    email: 'catering@bistrocentral.com',
    taxNumber: 'TIN-1234567891',
    isDefault: false,
  },
];

export const currencies: Currency[] = [
  { id: 'cur-1', code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', exchangeRate: 1, isDefault: true, isActive: true },
  { id: 'cur-2', code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: 0.0091, isDefault: false, isActive: true },
  { id: 'cur-3', code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: 0.0072, isDefault: false, isActive: false },
];

export const rolePermissions: RolePermissions[] = [
  {
    role: 'admin',
    permissions: [
      { module: 'dashboard', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'menu', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'tables', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'customers', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'team', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'reports', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'expenses', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'inventory', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'suppliers', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'purchases', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'quotes', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'gift-cards', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'promotions', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'calendar', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'returns', canView: true, canCreate: true, canEdit: true, canDelete: true },
      { module: 'settings', canView: true, canCreate: true, canEdit: true, canDelete: true },
    ],
  },
  {
    role: 'manager',
    permissions: [
      { module: 'dashboard', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'menu', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'tables', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'customers', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'team', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'reports', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'expenses', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'inventory', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'suppliers', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'purchases', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'quotes', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'gift-cards', canView: true, canCreate: true, canEdit: false, canDelete: false },
      { module: 'promotions', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'calendar', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'returns', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
    ],
  },
  {
    role: 'kitchen',
    permissions: [
      { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'orders', canView: true, canCreate: false, canEdit: true, canDelete: false },
      { module: 'menu', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'tables', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'customers', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'team', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'reports', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'expenses', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'inventory', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'suppliers', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'purchases', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'quotes', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'gift-cards', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'promotions', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'calendar', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'returns', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
    ],
  },
  {
    role: 'waiter',
    permissions: [
      { module: 'dashboard', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'orders', canView: true, canCreate: true, canEdit: true, canDelete: false },
      { module: 'menu', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'tables', canView: true, canCreate: false, canEdit: true, canDelete: false },
      { module: 'customers', canView: true, canCreate: true, canEdit: false, canDelete: false },
      { module: 'team', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'reports', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'expenses', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'inventory', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'suppliers', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'purchases', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'quotes', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'gift-cards', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'promotions', canView: false, canCreate: false, canEdit: false, canDelete: false },
      { module: 'calendar', canView: true, canCreate: false, canEdit: false, canDelete: false },
      { module: 'returns', canView: true, canCreate: true, canEdit: false, canDelete: false },
      { module: 'settings', canView: false, canCreate: false, canEdit: false, canDelete: false },
    ],
  },
];

export const restaurantSettings: RestaurantSettings = {
  restaurantName: 'Bistro Central',
  tagline: 'Order delicious food, effortlessly',
  phone: '+8801711824478',
  email: 'info@bistrocentral.com',
  address: 'House 45, Road 11, Block D, Banani',
  city: 'Dhaka',
  country: 'Bangladesh',
  timezone: 'Asia/Dhaka',
  defaultCurrencyId: 'cur-1',
  defaultTaxRateId: 'tax-1',
  orderPrefix: '#',
  enableDelivery: false,
  enableTableOrdering: true,
  enableOnlinePayment: false,
};

export const notifications: Notification[] = [
  { id: 'notif-1', type: 'order', title: 'New Order #040', message: 'Nusrat Jahan placed an order for Table 5', isRead: false, createdAt: minutesAgo(1) },
  { id: 'notif-2', type: 'order', title: 'Order #038 Ready', message: 'Priya Das order is ready for serving', isRead: false, createdAt: minutesAgo(5) },
  { id: 'notif-3', type: 'inventory', title: 'Low Stock Alert', message: 'Fresh mozzarella is running low (2 units left)', isRead: false, createdAt: minutesAgo(30) },
  { id: 'notif-4', type: 'staff', title: 'Shift Change', message: 'Sadia Akter clocked in for evening shift', isRead: true, createdAt: minutesAgo(60) },
  { id: 'notif-5', type: 'system', title: 'Backup Complete', message: 'Daily database backup completed successfully', isRead: true, createdAt: minutesAgo(120) },
  { id: 'notif-6', type: 'order', title: 'Order #036 Completed', message: 'Arif Khan order has been completed', isRead: true, createdAt: minutesAgo(40) },
];

// ============================================
// Expenses & Reports Mock Data
// ============================================

export const expenseCategories: ExpenseCategory[] = [
  { id: 'ecat-1', code: 'FOOD', name: 'Food & Ingredients', isActive: true },
  { id: 'ecat-2', code: 'UTIL', name: 'Utilities', isActive: true },
  { id: 'ecat-3', code: 'RENT', name: 'Rent', isActive: true },
  { id: 'ecat-4', code: 'SALARY', name: 'Salaries', isActive: true },
  { id: 'ecat-5', code: 'MAINT', name: 'Maintenance', isActive: true },
  { id: 'ecat-6', code: 'MISC', name: 'Miscellaneous', isActive: true },
];

const daysAgo = (d: number) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  return date.toISOString().split('T')[0];
};

export const expenses: Expense[] = [
  { id: 'exp-1', date: daysAgo(0), amount: 12500, categoryId: 'ecat-1', categoryName: 'Food & Ingredients', note: 'Weekly vegetable supply', createdBy: 'Mahir Rahman', createdAt: daysAgo(0) },
  { id: 'exp-2', date: daysAgo(0), amount: 3200, categoryId: 'ecat-2', categoryName: 'Utilities', note: 'Electricity bill - March', createdBy: 'Mahir Rahman', createdAt: daysAgo(0) },
  { id: 'exp-3', date: daysAgo(1), amount: 8500, categoryId: 'ecat-1', categoryName: 'Food & Ingredients', note: 'Meat and seafood delivery', createdBy: 'Rina Begum', createdAt: daysAgo(1) },
  { id: 'exp-4', date: daysAgo(2), amount: 45000, categoryId: 'ecat-3', categoryName: 'Rent', note: 'Monthly rent - April', createdBy: 'Mahir Rahman', createdAt: daysAgo(2) },
  { id: 'exp-5', date: daysAgo(3), amount: 2800, categoryId: 'ecat-5', categoryName: 'Maintenance', note: 'AC filter replacement', createdBy: 'Kamal Hossain', createdAt: daysAgo(3) },
  { id: 'exp-6', date: daysAgo(4), amount: 1500, categoryId: 'ecat-6', categoryName: 'Miscellaneous', note: 'Cleaning supplies', createdBy: 'Rina Begum', createdAt: daysAgo(4) },
  { id: 'exp-7', date: daysAgo(5), amount: 9800, categoryId: 'ecat-1', categoryName: 'Food & Ingredients', note: 'Dairy products', createdBy: 'Rina Begum', createdAt: daysAgo(5) },
  { id: 'exp-8', date: daysAgo(6), amount: 75000, categoryId: 'ecat-4', categoryName: 'Salaries', note: 'Staff salaries - March', createdBy: 'Mahir Rahman', createdAt: daysAgo(6) },
  { id: 'exp-9', date: daysAgo(7), amount: 4200, categoryId: 'ecat-2', categoryName: 'Utilities', note: 'Gas bill', createdBy: 'Kamal Hossain', createdAt: daysAgo(7) },
  { id: 'exp-10', date: daysAgo(8), amount: 6300, categoryId: 'ecat-1', categoryName: 'Food & Ingredients', note: 'Spices and condiments', createdBy: 'Rina Begum', createdAt: daysAgo(8) },
  { id: 'exp-11', date: daysAgo(10), amount: 3500, categoryId: 'ecat-5', categoryName: 'Maintenance', note: 'Kitchen equipment repair', createdBy: 'Kamal Hossain', createdAt: daysAgo(10) },
  { id: 'exp-12', date: daysAgo(12), amount: 11200, categoryId: 'ecat-1', categoryName: 'Food & Ingredients', note: 'Weekly vegetable supply', createdBy: 'Rina Begum', createdAt: daysAgo(12) },
  { id: 'exp-13', date: daysAgo(14), amount: 2100, categoryId: 'ecat-6', categoryName: 'Miscellaneous', note: 'Paper products and packaging', createdBy: 'Rina Begum', createdAt: daysAgo(14) },
  { id: 'exp-14', date: daysAgo(15), amount: 8900, categoryId: 'ecat-1', categoryName: 'Food & Ingredients', note: 'Meat delivery', createdBy: 'Rina Begum', createdAt: daysAgo(15) },
  { id: 'exp-15', date: daysAgo(18), amount: 1800, categoryId: 'ecat-2', categoryName: 'Utilities', note: 'Water bill', createdBy: 'Kamal Hossain', createdAt: daysAgo(18) },
];

// Generate 30 days of sales data for reports
export const dailySalesData: DailySalesReport[] = Array.from({ length: 30 }, (_, i) => {
  const orders = Math.floor(Math.random() * 25) + 10;
  const revenue = orders * (Math.floor(Math.random() * 400) + 600);
  return {
    date: daysAgo(29 - i),
    orders,
    revenue,
    avgOrderValue: Math.round(revenue / orders),
  };
});

// ============================================
// Table Management Mock Data
// ============================================

export const restaurantTables: RestaurantTable[] = [
  { id: 'tbl-1', number: '1', capacity: 2, status: 'available', floor: 'Ground' },
  { id: 'tbl-2', number: '2', capacity: 2, status: 'available', floor: 'Ground' },
  { id: 'tbl-3', number: '3', capacity: 4, status: 'occupied', floor: 'Ground', currentOrderId: 'ord-2' },
  { id: 'tbl-4', number: '4', capacity: 4, status: 'available', floor: 'Ground' },
  { id: 'tbl-5', number: '5', capacity: 4, status: 'occupied', floor: 'Ground', currentOrderId: 'ord-4' },
  { id: 'tbl-6', number: '6', capacity: 6, status: 'available', floor: 'Ground' },
  { id: 'tbl-7', number: '7', capacity: 6, status: 'occupied', floor: 'Ground', currentOrderId: 'ord-1' },
  { id: 'tbl-8', number: '8', capacity: 8, status: 'reserved', floor: 'Ground' },
  { id: 'tbl-9', number: '9', capacity: 4, status: 'cleaning', floor: 'Ground' },
  { id: 'tbl-10', number: '10', capacity: 2, status: 'available', floor: 'Rooftop' },
  { id: 'tbl-11', number: '11', capacity: 4, status: 'available', floor: 'Rooftop' },
  { id: 'tbl-12', number: '12', capacity: 6, status: 'occupied', floor: 'Rooftop', currentOrderId: 'ord-3' },
  { id: 'tbl-13', number: '13', capacity: 8, status: 'reserved', floor: 'Rooftop' },
  { id: 'tbl-14', number: '14', capacity: 4, status: 'available', floor: 'Rooftop' },
  { id: 'tbl-15', number: '15', capacity: 2, status: 'available', floor: 'Rooftop' },
];

export const reservations: Reservation[] = [
  { id: 'res-1', tableId: 'tbl-8', tableNumber: '8', customerName: 'Farid Hassan', customerPhone: '+8801812345000', partySize: 6, date: daysAgo(0), time: '19:00', notes: 'Birthday celebration', status: 'confirmed', createdAt: daysAgo(2) },
  { id: 'res-2', tableId: 'tbl-13', tableNumber: '13', customerName: 'Salma Akter', customerPhone: '+8801912345001', partySize: 8, date: daysAgo(0), time: '20:30', status: 'confirmed', createdAt: daysAgo(1) },
  { id: 'res-3', tableId: 'tbl-6', tableNumber: '6', customerName: 'Imran Hossain', customerPhone: '+8801712345002', partySize: 4, date: daysAgo(1), time: '19:30', status: 'completed', createdAt: daysAgo(3) },
  { id: 'res-4', tableId: 'tbl-11', tableNumber: '11', customerName: 'Nadia Chowdhury', customerPhone: '+8801612345003', partySize: 3, date: daysAgo(1), time: '20:00', notes: 'Allergic to nuts', status: 'cancelled', createdAt: daysAgo(2) },
];

// ============================================
// Inventory Mock Data
// ============================================

export const warehouses: Warehouse[] = [
  { id: 'wh-1', code: 'MAIN', name: 'Main Kitchen Store', address: 'House 45, Road 11, Block D', phone: '+8801711824478', isActive: true },
  { id: 'wh-2', code: 'COLD', name: 'Cold Storage', address: 'Basement Level', isActive: true },
  { id: 'wh-3', code: 'DRY', name: 'Dry Goods Store', address: 'Adjacent building', isActive: true },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'inv-1', name: 'Chicken Breast', sku: 'MEAT-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 25, unit: 'kg', reorderLevel: 10, costPrice: 380, warehouseId: 'wh-2', warehouseName: 'Cold Storage', lastRestockedAt: daysAgo(2) },
  { id: 'inv-2', name: 'Beef Ribeye', sku: 'MEAT-002', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 12, unit: 'kg', reorderLevel: 8, costPrice: 950, warehouseId: 'wh-2', warehouseName: 'Cold Storage', lastRestockedAt: daysAgo(3) },
  { id: 'inv-3', name: 'Fresh Mozzarella', sku: 'DAIRY-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 3, unit: 'kg', reorderLevel: 5, costPrice: 620, warehouseId: 'wh-2', warehouseName: 'Cold Storage', lastRestockedAt: daysAgo(5) },
  { id: 'inv-4', name: 'Olive Oil', sku: 'OIL-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 8, unit: 'litre', reorderLevel: 3, costPrice: 450, warehouseId: 'wh-3', warehouseName: 'Dry Goods Store', lastRestockedAt: daysAgo(10) },
  { id: 'inv-5', name: 'Pasta (Spaghetti)', sku: 'DRY-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 15, unit: 'kg', reorderLevel: 5, costPrice: 180, warehouseId: 'wh-3', warehouseName: 'Dry Goods Store', lastRestockedAt: daysAgo(7) },
  { id: 'inv-6', name: 'Tomatoes', sku: 'VEG-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 18, unit: 'kg', reorderLevel: 10, costPrice: 80, warehouseId: 'wh-1', warehouseName: 'Main Kitchen Store', lastRestockedAt: daysAgo(1) },
  { id: 'inv-7', name: 'Tiger Prawns', sku: 'SEA-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 4, unit: 'kg', reorderLevel: 5, costPrice: 1200, warehouseId: 'wh-2', warehouseName: 'Cold Storage', lastRestockedAt: daysAgo(4) },
  { id: 'inv-8', name: 'Flour (All Purpose)', sku: 'DRY-002', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 30, unit: 'kg', reorderLevel: 10, costPrice: 65, warehouseId: 'wh-3', warehouseName: 'Dry Goods Store', lastRestockedAt: daysAgo(6) },
  { id: 'inv-9', name: 'Coffee Beans', sku: 'BEV-001', categoryId: 'ecat-1', categoryName: 'Food & Ingredients', quantity: 5, unit: 'kg', reorderLevel: 3, costPrice: 850, warehouseId: 'wh-3', warehouseName: 'Dry Goods Store', lastRestockedAt: daysAgo(8) },
  { id: 'inv-10', name: 'Napkins', sku: 'MISC-001', categoryId: 'ecat-6', categoryName: 'Miscellaneous', quantity: 500, unit: 'pcs', reorderLevel: 200, costPrice: 2, warehouseId: 'wh-1', warehouseName: 'Main Kitchen Store', lastRestockedAt: daysAgo(14) },
];

export const stockAdjustments: StockAdjustment[] = [
  { id: 'adj-1', inventoryItemId: 'inv-1', itemName: 'Chicken Breast', type: 'in', quantity: 15, reason: 'Weekly restock delivery', createdBy: 'Rina Begum', createdAt: daysAgo(2) },
  { id: 'adj-2', inventoryItemId: 'inv-3', itemName: 'Fresh Mozzarella', type: 'out', quantity: 4, reason: 'Daily kitchen usage', createdBy: 'Jamal Uddin', createdAt: daysAgo(1) },
  { id: 'adj-3', inventoryItemId: 'inv-7', itemName: 'Tiger Prawns', type: 'adjustment', quantity: -2, reason: 'Spoilage — discarded', createdBy: 'Kamal Hossain', createdAt: daysAgo(3) },
  { id: 'adj-4', inventoryItemId: 'inv-6', itemName: 'Tomatoes', type: 'in', quantity: 10, reason: 'Morning vegetable delivery', createdBy: 'Rina Begum', createdAt: daysAgo(1) },
];

// ============================================
// Supplier Mock Data
// ============================================

export const suppliers: Supplier[] = [
  { id: 'sup-1', companyName: 'Dhaka Fresh Meats', contactName: 'Abdul Karim', phone: '+8801711000001', email: 'orders@dhakameats.com', address: 'Kawran Bazar, Dhaka', city: 'Dhaka', isActive: true, createdAt: daysAgo(90) },
  { id: 'sup-2', companyName: 'Green Valley Produce', contactName: 'Razia Sultana', phone: '+8801811000002', email: 'supply@greenvalley.com', address: 'Mirpur DOHS, Dhaka', city: 'Dhaka', isActive: true, createdAt: daysAgo(60) },
  { id: 'sup-3', companyName: 'Bay of Bengal Seafood', contactName: 'Habibur Rahman', phone: '+8801911000003', email: 'info@bobseafood.com', address: 'Chittagong Port Area', city: 'Chittagong', isActive: true, createdAt: daysAgo(45) },
  { id: 'sup-4', companyName: 'Italian Imports BD', contactName: 'Marco Rossi', phone: '+8801611000004', email: 'marco@italianimports.bd', address: 'Gulshan 2, Dhaka', city: 'Dhaka', isActive: true, createdAt: daysAgo(30) },
  { id: 'sup-5', companyName: 'Bengal Beverages', contactName: 'Shimul Das', phone: '+8801511000005', address: 'Uttara, Dhaka', city: 'Dhaka', isActive: false, createdAt: daysAgo(120) },
];

// ============================================
// Purchase Order Mock Data
// ============================================

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: 'po-1', referenceNo: 'PO-2026-001', supplierId: 'sup-1', supplierName: 'Dhaka Fresh Meats',
    items: [
      { id: 'poi-1', inventoryItemId: 'inv-1', itemName: 'Chicken Breast', quantity: 20, unitCost: 380, receivedQuantity: 20 },
      { id: 'poi-2', inventoryItemId: 'inv-2', itemName: 'Beef Ribeye', quantity: 10, unitCost: 950, receivedQuantity: 10 },
    ],
    status: 'received', subtotal: 17100, orderDate: daysAgo(10), expectedDate: daysAgo(8), receivedDate: daysAgo(7), createdBy: 'Rina Begum', createdAt: daysAgo(10),
  },
  {
    id: 'po-2', referenceNo: 'PO-2026-002', supplierId: 'sup-3', supplierName: 'Bay of Bengal Seafood',
    items: [
      { id: 'poi-3', inventoryItemId: 'inv-7', itemName: 'Tiger Prawns', quantity: 8, unitCost: 1200, receivedQuantity: 6 },
    ],
    status: 'partial', subtotal: 9600, notes: 'Remaining 2kg expected next delivery', orderDate: daysAgo(5), expectedDate: daysAgo(3), createdBy: 'Rina Begum', createdAt: daysAgo(5),
  },
  {
    id: 'po-3', referenceNo: 'PO-2026-003', supplierId: 'sup-4', supplierName: 'Italian Imports BD',
    items: [
      { id: 'poi-4', inventoryItemId: 'inv-3', itemName: 'Fresh Mozzarella', quantity: 10, unitCost: 620, receivedQuantity: 0 },
      { id: 'poi-5', inventoryItemId: 'inv-4', itemName: 'Olive Oil', quantity: 5, unitCost: 450, receivedQuantity: 0 },
    ],
    status: 'ordered', subtotal: 8450, orderDate: daysAgo(1), expectedDate: daysAgo(-2), createdBy: 'Mahir Rahman', createdAt: daysAgo(1),
  },
];

// ============================================
// Promotions Mock Data
// ============================================

export const promotions: Promotion[] = [
  { id: 'promo-1', code: 'WELCOME20', name: 'Welcome Discount', type: 'percentage', value: 20, minOrderAmount: 500, maxDiscount: 300, usageLimit: 100, usedCount: 34, startsAt: daysAgo(30), expiresAt: daysAgo(-30), isActive: true, createdAt: daysAgo(30) },
  { id: 'promo-2', code: 'FLAT100', name: 'Flat 100 Off', type: 'fixed', value: 100, minOrderAmount: 800, usageLimit: 50, usedCount: 12, startsAt: daysAgo(15), expiresAt: daysAgo(-15), isActive: true, createdAt: daysAgo(15) },
  { id: 'promo-3', code: 'BOGO-BURGER', name: 'Buy 1 Get 1 Burger', type: 'bogo', value: 0, usageLimit: 20, usedCount: 8, startsAt: daysAgo(7), expiresAt: daysAgo(-7), isActive: true, createdAt: daysAgo(7) },
  { id: 'promo-4', code: 'SUMMER50', name: 'Summer Special', type: 'percentage', value: 50, maxDiscount: 500, usageLimit: 200, usedCount: 200, startsAt: daysAgo(60), expiresAt: daysAgo(5), isActive: false, createdAt: daysAgo(60) },
];

// ============================================
// Returns Mock Data
// ============================================

export const returns: Return[] = [
  { id: 'ret-1', orderId: 'ord-5', orderNumber: '#036', customerName: 'Arif Khan', items: [{ menuItemName: 'Iced Latte', quantity: 1, unitPrice: 200 }], reason: 'Wrong drink served', status: 'refunded', refundAmount: 200, processedBy: 'Rina Begum', createdAt: daysAgo(1), processedAt: daysAgo(1) },
  { id: 'ret-2', orderId: 'ord-3', orderNumber: '#037', customerName: 'Tanvir Hasan', items: [{ menuItemName: 'Molten Chocolate Cake', quantity: 1, unitPrice: 380 }], reason: 'Item was cold', status: 'approved', refundAmount: 380, processedBy: 'Rina Begum', createdAt: daysAgo(0) },
  { id: 'ret-3', orderId: 'ord-1', orderNumber: '#038', customerName: 'Priya Das', items: [{ menuItemName: 'Mango Smoothie', quantity: 1, unitPrice: 180 }], reason: 'Allergic reaction concern', status: 'requested', refundAmount: 180, createdAt: daysAgo(0) },
];

// ============================================
// Gift Card Mock Data
// ============================================

export const giftCards: GiftCard[] = [
  { id: 'gc-1', cardNumber: 'GC-2026-0001', initialBalance: 2000, currentBalance: 1200, status: 'active', customerId: 'cust-1', customerName: 'Rafiq Ahmed', expiresAt: daysAgo(-180), issuedBy: 'Mahir Rahman', createdAt: daysAgo(30) },
  { id: 'gc-2', cardNumber: 'GC-2026-0002', initialBalance: 5000, currentBalance: 5000, status: 'active', expiresAt: daysAgo(-365), issuedBy: 'Mahir Rahman', createdAt: daysAgo(15) },
  { id: 'gc-3', cardNumber: 'GC-2026-0003', initialBalance: 1000, currentBalance: 0, status: 'used', customerId: 'cust-2', customerName: 'Nusrat Jahan', issuedBy: 'Rina Begum', createdAt: daysAgo(45) },
  { id: 'gc-4', cardNumber: 'GC-2026-0004', initialBalance: 3000, currentBalance: 3000, status: 'inactive', issuedBy: 'Mahir Rahman', createdAt: daysAgo(60) },
  { id: 'gc-5', cardNumber: 'GC-2026-0005', initialBalance: 1500, currentBalance: 800, status: 'active', customerId: 'cust-4', customerName: 'Priya Das', expiresAt: daysAgo(-90), issuedBy: 'Rina Begum', createdAt: daysAgo(20) },
];

export const giftCardTransactions: GiftCardTransaction[] = [
  { id: 'gct-1', giftCardId: 'gc-1', type: 'issue', amount: 2000, balanceAfter: 2000, note: 'Initial issue', createdBy: 'Mahir Rahman', createdAt: daysAgo(30) },
  { id: 'gct-2', giftCardId: 'gc-1', type: 'redeem', amount: 500, balanceAfter: 1500, orderId: 'ord-2', createdBy: 'System', createdAt: daysAgo(20) },
  { id: 'gct-3', giftCardId: 'gc-1', type: 'redeem', amount: 300, balanceAfter: 1200, orderId: 'ord-4', createdBy: 'System', createdAt: daysAgo(5) },
  { id: 'gct-4', giftCardId: 'gc-2', type: 'issue', amount: 5000, balanceAfter: 5000, note: 'Corporate gift', createdBy: 'Mahir Rahman', createdAt: daysAgo(15) },
  { id: 'gct-5', giftCardId: 'gc-3', type: 'issue', amount: 1000, balanceAfter: 1000, createdBy: 'Rina Begum', createdAt: daysAgo(45) },
  { id: 'gct-6', giftCardId: 'gc-3', type: 'redeem', amount: 1000, balanceAfter: 0, orderId: 'ord-3', createdBy: 'System', createdAt: daysAgo(10) },
  { id: 'gct-7', giftCardId: 'gc-5', type: 'issue', amount: 1500, balanceAfter: 1500, createdBy: 'Rina Begum', createdAt: daysAgo(20) },
  { id: 'gct-8', giftCardId: 'gc-5', type: 'redeem', amount: 700, balanceAfter: 800, orderId: 'ord-1', createdBy: 'System', createdAt: daysAgo(3) },
];

// ============================================
// Quotes Mock Data
// ============================================

export const quotes: Quote[] = [
  {
    id: 'qt-1', referenceNo: 'QT-2026-001', customerName: 'Paragon Group', customerPhone: '+8801711824478',
    items: [
      { id: 'qi-1', productName: 'Catering Package (20 pax)', quantity: 1, unitPrice: 15000, total: 15000 },
      { id: 'qi-2', productName: 'Beverage Station', quantity: 1, unitPrice: 3000, total: 3000 },
    ],
    subtotal: 18000, taxAmount: 2700, grandTotal: 20700, status: 'sent', validUntil: daysAgo(-14),
    notes: 'For corporate event', createdBy: 'Mahir Rahman', createdAt: daysAgo(5),
  },
  {
    id: 'qt-2', referenceNo: 'QT-2026-002', customerName: 'Farid Hassan', customerPhone: '+8801812345000',
    items: [
      { id: 'qi-3', productName: 'Birthday Party Menu (10 pax)', quantity: 1, unitPrice: 8000, total: 8000 },
      { id: 'qi-4', productName: 'Custom Birthday Cake', quantity: 1, unitPrice: 2500, total: 2500 },
    ],
    subtotal: 10500, taxAmount: 1575, grandTotal: 12075, status: 'accepted', validUntil: daysAgo(-7),
    createdBy: 'Rina Begum', createdAt: daysAgo(3),
  },
  {
    id: 'qt-3', referenceNo: 'QT-2026-003', customerName: 'Imran Hossain',
    items: [
      { id: 'qi-5', productName: 'Weekly Lunch Box (5 days)', quantity: 4, unitPrice: 500, total: 2000 },
    ],
    subtotal: 2000, taxAmount: 300, grandTotal: 2300, status: 'draft', validUntil: daysAgo(-10),
    createdBy: 'Mahir Rahman', createdAt: daysAgo(1),
  },
  {
    id: 'qt-4', referenceNo: 'QT-2026-004', customerName: 'Salma Akter',
    items: [
      { id: 'qi-6', productName: 'Private Dining (8 pax)', quantity: 1, unitPrice: 12000, total: 12000 },
    ],
    subtotal: 12000, taxAmount: 1800, grandTotal: 13800, status: 'rejected', validUntil: daysAgo(2),
    notes: 'Customer found cheaper option', createdBy: 'Rina Begum', createdAt: daysAgo(10),
  },
];

// ============================================
// Calendar Mock Data
// ============================================

export const calendarEvents: CalendarEvent[] = [
  { id: 'evt-1', title: 'Morning Shift — Kitchen', type: 'shift', startDate: `${daysAgo(0)}T06:00`, endDate: `${daysAgo(0)}T14:00`, allDay: false, color: '#3b82f6', staffId: 'staff-3', staffName: 'Jamal Uddin', createdBy: 'Mahir Rahman', createdAt: daysAgo(7) },
  { id: 'evt-2', title: 'Evening Shift — Service', type: 'shift', startDate: `${daysAgo(0)}T16:00`, endDate: `${daysAgo(0)}T23:00`, allDay: false, color: '#8b5cf6', staffId: 'staff-4', staffName: 'Sadia Akter', createdBy: 'Mahir Rahman', createdAt: daysAgo(7) },
  { id: 'evt-3', title: 'Team Meeting', type: 'meeting', startDate: `${daysAgo(0)}T10:00`, endDate: `${daysAgo(0)}T11:00`, allDay: false, color: '#f59e0b', description: 'Monthly review and planning', createdBy: 'Mahir Rahman', createdAt: daysAgo(5) },
  { id: 'evt-4', title: 'Farid Hassan — Table 8', type: 'reservation', startDate: `${daysAgo(0)}T19:00`, endDate: `${daysAgo(0)}T21:00`, allDay: false, color: '#10b981', description: 'Birthday celebration, 6 guests', createdBy: 'System', createdAt: daysAgo(2) },
  { id: 'evt-5', title: 'Inventory Audit', type: 'reminder', startDate: `${daysAgo(-1)}T09:00`, endDate: `${daysAgo(-1)}T12:00`, allDay: false, color: '#ec4899', description: 'Monthly stock count', createdBy: 'Rina Begum', createdAt: daysAgo(3) },
  { id: 'evt-6', title: 'Public Holiday — Eid', type: 'holiday', startDate: daysAgo(-5), endDate: daysAgo(-5), allDay: true, color: '#ef4444', createdBy: 'Mahir Rahman', createdAt: daysAgo(30) },
  { id: 'evt-7', title: 'Staff Training', type: 'custom', startDate: `${daysAgo(-3)}T14:00`, endDate: `${daysAgo(-3)}T17:00`, allDay: false, color: '#6366f1', description: 'New POS system training', createdBy: 'Kamal Hossain', createdAt: daysAgo(10) },
  { id: 'evt-8', title: 'Morning Shift — Kitchen', type: 'shift', startDate: `${daysAgo(-1)}T06:00`, endDate: `${daysAgo(-1)}T14:00`, allDay: false, color: '#3b82f6', staffId: 'staff-3', staffName: 'Jamal Uddin', createdBy: 'Mahir Rahman', createdAt: daysAgo(7) },
];
