// ============================================
// API Abstraction Layer
// Currently uses mock data. To connect to real
// backend, replace these function bodies with
// fetch() calls — interfaces stay the same.
// ============================================

import type { Category, MenuItem, Customer, Order, OrderStatus, OrderType, DeliveryAddress, StaffMember, StaffRole, CartItem, TaxRate, Biller, Currency, RolePermissions, RestaurantSettings, Notification, ExpenseCategory, Expense, DailySalesReport, RestaurantTable, TableStatus, Reservation, InventoryItem, Warehouse, StockAdjustment, Supplier, PurchaseOrder, PurchaseOrderStatus, Promotion, Return, ReturnStatus, GiftCard, GiftCardStatus, GiftCardTransaction, Quote, QuoteStatus, CalendarEvent } from './types';
import { categories, menuItems, customers, orders as mockOrders, staffMembers, taxRates, billers, currencies, rolePermissions, restaurantSettings, notifications, expenseCategories, expenses, dailySalesData, restaurantTables, reservations, inventoryItems, warehouses, stockAdjustments, suppliers, purchaseOrders, promotions, returns, giftCards, giftCardTransactions, quotes, calendarEvents } from './mock';

// Simulate network delay
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// In-memory state (mock "database")
let _orders = [...mockOrders];
let _menuItems = [...menuItems];
let _categories = [...categories];
let _customers = [...customers];
let _staffMembers = [...staffMembers];
let _nextOrderNum = 41;

// ---- Menu ----

export async function getCategories(): Promise<Category[]> {
  await delay(100);
  return _categories.filter(c => c.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAllCategories(): Promise<Category[]> {
  await delay(100);
  return [..._categories].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addCategory(data: {
  name: string;
  description?: string;
}): Promise<Category> {
  await delay(200);
  const maxOrder = _categories.reduce((max, c) => Math.max(max, c.sortOrder), 0);
  const cat: Category = {
    id: `cat-${Date.now()}`,
    name: data.name,
    slug: data.name.toLowerCase().replace(/\s+/g, '-'),
    description: data.description,
    sortOrder: maxOrder + 1,
    isActive: true,
  };
  _categories.push(cat);
  return cat;
}

export async function editCategory(id: string, updates: Partial<Category>): Promise<Category> {
  await delay(200);
  const cat = _categories.find(c => c.id === id);
  if (!cat) throw new Error('Category not found');
  Object.assign(cat, updates);
  if (updates.name) cat.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
  return { ...cat };
}

export async function deleteCategory(id: string): Promise<void> {
  await delay(200);
  const idx = _categories.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  _categories.splice(idx, 1);
}

export async function getMenuItems(categoryId?: string): Promise<MenuItem[]> {
  await delay(150);
  const items = categoryId
    ? _menuItems.filter(i => i.categoryId === categoryId)
    : _menuItems;
  return items;
}

export async function getMenuItem(id: string): Promise<MenuItem | undefined> {
  await delay(100);
  return _menuItems.find(i => i.id === id);
}

export async function updateMenuItemAvailability(id: string, isAvailable: boolean): Promise<MenuItem> {
  await delay(200);
  const item = _menuItems.find(i => i.id === id);
  if (!item) throw new Error('Item not found');
  item.isAvailable = isAvailable;
  return { ...item };
}

export async function addMenuItem(data: {
  name: string;
  description: string;
  price: number;
  categoryId: string;
  prepTimeMinutes: number;
  image?: string;
}): Promise<MenuItem> {
  await delay(200);
  const item: MenuItem = {
    id: `item-${Date.now()}`,
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    price: data.price,
    image: data.image,
    isAvailable: true,
    tags: ['new'],
    prepTimeMinutes: data.prepTimeMinutes,
  };
  _menuItems.push(item);
  return item;
}

export async function editMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem> {
  await delay(200);
  const item = _menuItems.find(i => i.id === id);
  if (!item) throw new Error('Item not found');
  Object.assign(item, updates);
  return { ...item };
}

// ---- Orders ----

export async function getOrders(status?: OrderStatus): Promise<Order[]> {
  await delay(150);
  const filtered = status ? _orders.filter(o => o.status === status) : _orders;
  return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrder(id: string): Promise<Order | undefined> {
  await delay(100);
  return _orders.find(o => o.id === id);
}

export async function createOrder(
  customerId: string,
  customerName: string,
  items: CartItem[],
  options?: {
    orderType?: OrderType;
    tableNumber?: string;
    deliveryAddress?: DeliveryAddress;
    notes?: string;
  },
): Promise<Order> {
  await delay(300);
  const orderType = options?.orderType || 'dine-in';
  const deliveryFee = orderType === 'delivery' ? 60 : 0;

  const orderItems = items.map((ci, i) => ({
    id: `oi-new-${Date.now()}-${i}`,
    menuItemId: ci.menuItem.id,
    menuItemName: ci.menuItem.name,
    quantity: ci.quantity,
    unitPrice: ci.menuItem.price,
    notes: ci.notes,
  }));

  const subtotal = orderItems.reduce((sum, oi) => sum + oi.unitPrice * oi.quantity, 0);
  const now = new Date().toISOString();

  const order: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `#${String(_nextOrderNum++).padStart(3, '0')}`,
    customerId,
    customerName,
    orderType,
    tableNumber: options?.tableNumber,
    deliveryAddress: options?.deliveryAddress,
    deliveryFee: deliveryFee || undefined,
    deliveryStatus: orderType === 'delivery' ? 'pending' : undefined,
    items: orderItems,
    status: 'pending',
    subtotal,
    total: subtotal + deliveryFee,
    notes: options?.notes,
    createdAt: now,
    updatedAt: now,
  };

  _orders.unshift(order);
  return order;
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  declineReason?: string,
): Promise<Order> {
  await delay(200);
  const order = _orders.find(o => o.id === id);
  if (!order) throw new Error('Order not found');

  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'accepted') order.acceptedAt = order.updatedAt;
  if (status === 'ready') order.readyAt = order.updatedAt;
  if (status === 'completed') order.completedAt = order.updatedAt;
  if (status === 'declined') order.declineReason = declineReason;

  return { ...order };
}

// ---- Customers ----

export async function getCustomers(): Promise<Customer[]> {
  await delay(150);
  return [..._customers].sort((a, b) => b.totalOrders - a.totalOrders);
}

export async function getCustomer(id: string): Promise<Customer | undefined> {
  await delay(100);
  return _customers.find(c => c.id === id);
}

export async function getCustomerOrders(customerId: string): Promise<Order[]> {
  await delay(150);
  return _orders.filter(o => o.customerId === customerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ---- Staff ----

export async function getStaff(): Promise<StaffMember[]> {
  await delay(150);
  return [..._staffMembers];
}

export async function addStaff(data: {
  name: string;
  phone: string;
  email?: string;
  role: StaffRole;
}): Promise<StaffMember> {
  await delay(200);
  const member: StaffMember = {
    id: `staff-${Date.now()}`,
    name: data.name,
    phone: data.phone,
    email: data.email,
    role: data.role,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  _staffMembers.push(member);
  return member;
}

export async function editStaff(id: string, updates: Partial<StaffMember>): Promise<StaffMember> {
  await delay(200);
  const member = _staffMembers.find(s => s.id === id);
  if (!member) throw new Error('Staff not found');
  Object.assign(member, updates);
  return { ...member };
}

export async function deleteStaff(id: string): Promise<StaffMember> {
  await delay(200);
  const member = _staffMembers.find(s => s.id === id);
  if (!member) throw new Error('Staff not found');
  member.isActive = false;
  return { ...member };
}

// ---- Customer Management ----

export async function editCustomer(id: string, updates: Partial<Customer>): Promise<Customer> {
  await delay(200);
  const customer = _customers.find(c => c.id === id);
  if (!customer) throw new Error('Customer not found');
  Object.assign(customer, updates);
  return { ...customer };
}

export async function deleteCustomer(id: string): Promise<Customer> {
  await delay(200);
  const idx = _customers.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  const [removed] = _customers.splice(idx, 1);
  return removed;
}

// ---- Settings ----

let _taxRates = [...taxRates];
let _billers = [...billers];
let _currencies = [...currencies];
let _rolePermissions = rolePermissions.map(rp => ({ ...rp, permissions: rp.permissions.map(p => ({ ...p })) }));
let _restaurantSettings = { ...restaurantSettings };
let _notifications = [...notifications];

export async function getTaxRates(): Promise<TaxRate[]> {
  await delay(100);
  return [..._taxRates];
}

export async function addTaxRate(data: Omit<TaxRate, 'id'>): Promise<TaxRate> {
  await delay(200);
  const rate: TaxRate = { id: `tax-${Date.now()}`, ...data };
  _taxRates.push(rate);
  return rate;
}

export async function editTaxRate(id: string, updates: Partial<TaxRate>): Promise<TaxRate> {
  await delay(200);
  const rate = _taxRates.find(r => r.id === id);
  if (!rate) throw new Error('Tax rate not found');
  Object.assign(rate, updates);
  return { ...rate };
}

export async function deleteTaxRate(id: string): Promise<void> {
  await delay(200);
  _taxRates = _taxRates.filter(r => r.id !== id);
}

export async function getBillers(): Promise<Biller[]> {
  await delay(100);
  return [..._billers];
}

export async function addBiller(data: Omit<Biller, 'id'>): Promise<Biller> {
  await delay(200);
  const biller: Biller = { id: `biller-${Date.now()}`, ...data };
  if (data.isDefault) _billers.forEach(b => b.isDefault = false);
  _billers.push(biller);
  return biller;
}

export async function editBiller(id: string, updates: Partial<Biller>): Promise<Biller> {
  await delay(200);
  const biller = _billers.find(b => b.id === id);
  if (!biller) throw new Error('Biller not found');
  if (updates.isDefault) _billers.forEach(b => b.isDefault = false);
  Object.assign(biller, updates);
  return { ...biller };
}

export async function deleteBiller(id: string): Promise<void> {
  await delay(200);
  _billers = _billers.filter(b => b.id !== id);
}

export async function getCurrencies(): Promise<Currency[]> {
  await delay(100);
  return [..._currencies];
}

export async function addCurrency(data: Omit<Currency, 'id'>): Promise<Currency> {
  await delay(200);
  const cur: Currency = { id: `cur-${Date.now()}`, ...data };
  if (data.isDefault) _currencies.forEach(c => { c.isDefault = false; });
  _currencies.push(cur);
  return cur;
}

export async function editCurrency(id: string, updates: Partial<Currency>): Promise<Currency> {
  await delay(200);
  const cur = _currencies.find(c => c.id === id);
  if (!cur) throw new Error('Currency not found');
  if (updates.isDefault) _currencies.forEach(c => { c.isDefault = false; });
  Object.assign(cur, updates);
  return { ...cur };
}

export async function deleteCurrency(id: string): Promise<void> {
  await delay(200);
  _currencies = _currencies.filter(c => c.id !== id);
}

export async function getRolePermissions(): Promise<RolePermissions[]> {
  await delay(100);
  return _rolePermissions.map(rp => ({ ...rp, permissions: rp.permissions.map(p => ({ ...p })) }));
}

export async function updateRolePermissions(role: StaffRole, permissions: RolePermissions['permissions']): Promise<RolePermissions> {
  await delay(200);
  const rp = _rolePermissions.find(r => r.role === role);
  if (!rp) throw new Error('Role not found');
  rp.permissions = permissions.map(p => ({ ...p }));
  return { ...rp, permissions: rp.permissions.map(p => ({ ...p })) };
}

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  await delay(100);
  return { ..._restaurantSettings };
}

export async function updateRestaurantSettings(updates: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
  await delay(200);
  Object.assign(_restaurantSettings, updates);
  return { ..._restaurantSettings };
}

export async function getNotifications(): Promise<Notification[]> {
  await delay(100);
  return [..._notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationRead(id: string): Promise<Notification> {
  await delay(100);
  const notif = _notifications.find(n => n.id === id);
  if (!notif) throw new Error('Notification not found');
  notif.isRead = true;
  return { ...notif };
}

export async function markAllNotificationsRead(): Promise<void> {
  await delay(100);
  _notifications.forEach(n => n.isRead = true);
}

// ---- Tables ----

let _tables = [...restaurantTables];
let _reservations = [...reservations];

export async function getTables(): Promise<RestaurantTable[]> {
  await delay(100);
  return [..._tables];
}

export async function addTable(data: Omit<RestaurantTable, 'id'>): Promise<RestaurantTable> {
  await delay(200);
  const table: RestaurantTable = { id: `tbl-${Date.now()}`, ...data };
  _tables.push(table);
  return table;
}

export async function editTable(id: string, updates: Partial<RestaurantTable>): Promise<RestaurantTable> {
  await delay(200);
  const table = _tables.find(t => t.id === id);
  if (!table) throw new Error('Table not found');
  Object.assign(table, updates);
  return { ...table };
}

export async function updateTableStatus(id: string, status: TableStatus): Promise<RestaurantTable> {
  await delay(200);
  const table = _tables.find(t => t.id === id);
  if (!table) throw new Error('Table not found');
  table.status = status;
  if (status === 'available') table.currentOrderId = undefined;
  return { ...table };
}

export async function deleteTable(id: string): Promise<void> {
  await delay(200);
  _tables = _tables.filter(t => t.id !== id);
}

export async function getReservations(): Promise<Reservation[]> {
  await delay(100);
  return [..._reservations].sort((a, b) => {
    const dateA = `${a.date} ${a.time}`;
    const dateB = `${b.date} ${b.time}`;
    return dateB.localeCompare(dateA);
  });
}

export async function addReservation(data: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> {
  await delay(200);
  const res: Reservation = { id: `res-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _reservations.push(res);
  // Mark table as reserved
  const table = _tables.find(t => t.id === data.tableId);
  if (table && table.status === 'available') table.status = 'reserved';
  return res;
}

export async function editReservation(id: string, updates: Partial<Reservation>): Promise<Reservation> {
  await delay(200);
  const res = _reservations.find(r => r.id === id);
  if (!res) throw new Error('Reservation not found');
  Object.assign(res, updates);
  return { ...res };
}

export async function cancelReservation(id: string): Promise<Reservation> {
  await delay(200);
  const res = _reservations.find(r => r.id === id);
  if (!res) throw new Error('Reservation not found');
  res.status = 'cancelled';
  // Free up the table if this reservation was holding it
  const table = _tables.find(t => t.id === res.tableId);
  if (table && table.status === 'reserved') table.status = 'available';
  return { ...res };
}

// ---- Expenses ----

let _expenseCategories = [...expenseCategories];
let _expenses = [...expenses];

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  await delay(100);
  return [..._expenseCategories];
}

export async function addExpenseCategory(data: Omit<ExpenseCategory, 'id'>): Promise<ExpenseCategory> {
  await delay(200);
  const cat: ExpenseCategory = { id: `ecat-${Date.now()}`, ...data };
  _expenseCategories.push(cat);
  return cat;
}

export async function editExpenseCategory(id: string, updates: Partial<ExpenseCategory>): Promise<ExpenseCategory> {
  await delay(200);
  const cat = _expenseCategories.find(c => c.id === id);
  if (!cat) throw new Error('Category not found');
  Object.assign(cat, updates);
  return { ...cat };
}

export async function getExpenses(): Promise<Expense[]> {
  await delay(150);
  return [..._expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function addExpense(data: Omit<Expense, 'id' | 'createdAt'>): Promise<Expense> {
  await delay(200);
  const expense: Expense = { id: `exp-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _expenses.push(expense);
  return expense;
}

export async function editExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
  await delay(200);
  const exp = _expenses.find(e => e.id === id);
  if (!exp) throw new Error('Expense not found');
  Object.assign(exp, updates);
  return { ...exp };
}

export async function deleteExpense(id: string): Promise<void> {
  await delay(200);
  _expenses = _expenses.filter(e => e.id !== id);
}

// ---- Inventory ----

let _warehouses = [...warehouses];
let _inventoryItems = [...inventoryItems];
let _stockAdjustments = [...stockAdjustments];

export async function getWarehouses(): Promise<Warehouse[]> {
  await delay(100);
  return [..._warehouses];
}

export async function addWarehouse(data: Omit<Warehouse, 'id'>): Promise<Warehouse> {
  await delay(200);
  const wh: Warehouse = { id: `wh-${Date.now()}`, ...data };
  _warehouses.push(wh);
  return wh;
}

export async function editWarehouse(id: string, updates: Partial<Warehouse>): Promise<Warehouse> {
  await delay(200);
  const wh = _warehouses.find(w => w.id === id);
  if (!wh) throw new Error('Warehouse not found');
  Object.assign(wh, updates);
  return { ...wh };
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  await delay(150);
  return [..._inventoryItems];
}

export async function addInventoryItem(data: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
  await delay(200);
  const item: InventoryItem = { id: `inv-${Date.now()}`, ...data };
  _inventoryItems.push(item);
  return item;
}

export async function editInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
  await delay(200);
  const item = _inventoryItems.find(i => i.id === id);
  if (!item) throw new Error('Inventory item not found');
  Object.assign(item, updates);
  return { ...item };
}

export async function getStockAdjustments(): Promise<StockAdjustment[]> {
  await delay(100);
  return [..._stockAdjustments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addStockAdjustment(data: Omit<StockAdjustment, 'id' | 'createdAt'>): Promise<StockAdjustment> {
  await delay(200);
  const adj: StockAdjustment = { id: `adj-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _stockAdjustments.push(adj);
  // Update inventory quantity
  const item = _inventoryItems.find(i => i.id === data.inventoryItemId);
  if (item) {
    if (data.type === 'in') item.quantity += data.quantity;
    else if (data.type === 'out') item.quantity -= data.quantity;
    else item.quantity += data.quantity; // adjustment can be +/-
  }
  return adj;
}

// ---- Suppliers ----

let _suppliers = [...suppliers];

export async function getSuppliers(): Promise<Supplier[]> {
  await delay(100);
  return [..._suppliers];
}

export async function addSupplier(data: Omit<Supplier, 'id' | 'createdAt'>): Promise<Supplier> {
  await delay(200);
  const sup: Supplier = { id: `sup-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _suppliers.push(sup);
  return sup;
}

export async function editSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  await delay(200);
  const sup = _suppliers.find(s => s.id === id);
  if (!sup) throw new Error('Supplier not found');
  Object.assign(sup, updates);
  return { ...sup };
}

export async function deleteSupplier(id: string): Promise<void> {
  await delay(200);
  _suppliers = _suppliers.filter(s => s.id !== id);
}

// ---- Purchase Orders ----

let _purchaseOrders = [...purchaseOrders];

export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  await delay(150);
  return [..._purchaseOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addPurchaseOrder(data: Omit<PurchaseOrder, 'id' | 'createdAt'>): Promise<PurchaseOrder> {
  await delay(200);
  const po: PurchaseOrder = { id: `po-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _purchaseOrders.push(po);
  return po;
}

export async function editPurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  await delay(200);
  const po = _purchaseOrders.find(p => p.id === id);
  if (!po) throw new Error('Purchase order not found');
  Object.assign(po, updates);
  return { ...po };
}

export async function updatePurchaseOrderStatus(id: string, status: PurchaseOrderStatus): Promise<PurchaseOrder> {
  await delay(200);
  const po = _purchaseOrders.find(p => p.id === id);
  if (!po) throw new Error('Purchase order not found');
  po.status = status;
  if (status === 'received') po.receivedDate = new Date().toISOString().split('T')[0];
  return { ...po };
}

// ---- Promotions ----

let _promotions = [...promotions];

export async function getPromotions(): Promise<Promotion[]> {
  await delay(100);
  return [..._promotions];
}

export async function addPromotion(data: Omit<Promotion, 'id' | 'createdAt' | 'usedCount'>): Promise<Promotion> {
  await delay(200);
  const promo: Promotion = { id: `promo-${Date.now()}`, ...data, usedCount: 0, createdAt: new Date().toISOString() };
  _promotions.push(promo);
  return promo;
}

export async function editPromotion(id: string, updates: Partial<Promotion>): Promise<Promotion> {
  await delay(200);
  const promo = _promotions.find(p => p.id === id);
  if (!promo) throw new Error('Promotion not found');
  Object.assign(promo, updates);
  return { ...promo };
}

export async function deletePromotion(id: string): Promise<void> {
  await delay(200);
  _promotions = _promotions.filter(p => p.id !== id);
}

// ---- Returns ----

let _returns = [...returns];

export async function getReturns(): Promise<Return[]> {
  await delay(100);
  return [..._returns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addReturn(data: Omit<Return, 'id' | 'createdAt'>): Promise<Return> {
  await delay(200);
  const ret: Return = { id: `ret-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _returns.push(ret);
  return ret;
}

export async function updateReturnStatus(id: string, status: ReturnStatus, processedBy?: string): Promise<Return> {
  await delay(200);
  const ret = _returns.find(r => r.id === id);
  if (!ret) throw new Error('Return not found');
  ret.status = status;
  if (processedBy) ret.processedBy = processedBy;
  ret.processedAt = new Date().toISOString();
  return { ...ret };
}

// ---- Gift Cards ----

let _giftCards = [...giftCards];
let _giftCardTransactions = [...giftCardTransactions];

export async function getGiftCards(): Promise<GiftCard[]> {
  await delay(100);
  return [..._giftCards];
}

export async function addGiftCard(data: Omit<GiftCard, 'id' | 'createdAt'>): Promise<GiftCard> {
  await delay(200);
  const gc: GiftCard = { id: `gc-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _giftCards.push(gc);
  // Add issue transaction
  const txn: GiftCardTransaction = {
    id: `gct-${Date.now()}`,
    giftCardId: gc.id,
    type: 'issue',
    amount: gc.initialBalance,
    balanceAfter: gc.currentBalance,
    note: 'Initial issue',
    createdBy: gc.issuedBy,
    createdAt: gc.createdAt,
  };
  _giftCardTransactions.push(txn);
  return gc;
}

export async function editGiftCard(id: string, updates: Partial<GiftCard>): Promise<GiftCard> {
  await delay(200);
  const gc = _giftCards.find(g => g.id === id);
  if (!gc) throw new Error('Gift card not found');
  Object.assign(gc, updates);
  return { ...gc };
}

export async function getGiftCardTransactions(giftCardId?: string): Promise<GiftCardTransaction[]> {
  await delay(100);
  const txns = giftCardId ? _giftCardTransactions.filter(t => t.giftCardId === giftCardId) : _giftCardTransactions;
  return [...txns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function topupGiftCard(id: string, amount: number, createdBy: string): Promise<GiftCard> {
  await delay(200);
  const gc = _giftCards.find(g => g.id === id);
  if (!gc) throw new Error('Gift card not found');
  gc.currentBalance += amount;
  if (gc.status === 'used') gc.status = 'active';
  const txn: GiftCardTransaction = {
    id: `gct-${Date.now()}`,
    giftCardId: id,
    type: 'topup',
    amount,
    balanceAfter: gc.currentBalance,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  _giftCardTransactions.push(txn);
  return { ...gc };
}

// ---- Quotes ----

let _quotes = [...quotes];

export async function getQuotes(): Promise<Quote[]> {
  await delay(100);
  return [..._quotes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addQuote(data: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> {
  await delay(200);
  const qt: Quote = { id: `qt-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _quotes.push(qt);
  return qt;
}

export async function editQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
  await delay(200);
  const qt = _quotes.find(q => q.id === id);
  if (!qt) throw new Error('Quote not found');
  Object.assign(qt, updates);
  return { ...qt };
}

export async function updateQuoteStatus(id: string, status: QuoteStatus): Promise<Quote> {
  await delay(200);
  const qt = _quotes.find(q => q.id === id);
  if (!qt) throw new Error('Quote not found');
  qt.status = status;
  return { ...qt };
}

// ---- Calendar ----

let _calendarEvents = [...calendarEvents];

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  await delay(100);
  return [..._calendarEvents];
}

export async function addCalendarEvent(data: Omit<CalendarEvent, 'id' | 'createdAt'>): Promise<CalendarEvent> {
  await delay(200);
  const evt: CalendarEvent = { id: `evt-${Date.now()}`, ...data, createdAt: new Date().toISOString() };
  _calendarEvents.push(evt);
  return evt;
}

export async function editCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
  await delay(200);
  const evt = _calendarEvents.find(e => e.id === id);
  if (!evt) throw new Error('Event not found');
  Object.assign(evt, updates);
  return { ...evt };
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await delay(200);
  _calendarEvents = _calendarEvents.filter(e => e.id !== id);
}

// ---- Reports ----

export async function getDailySalesReports(): Promise<DailySalesReport[]> {
  await delay(200);
  return [...dailySalesData];
}

// ---- Stats (for dashboard) ----

export async function getDashboardStats() {
  await delay(200);
  const today = new Date().toDateString();
  const todayOrders = _orders.filter(o => new Date(o.createdAt).toDateString() === today);

  return {
    totalOrdersToday: todayOrders.length,
    revenueToday: todayOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
    pendingOrders: _orders.filter(o => o.status === 'pending').length,
    preparingOrders: _orders.filter(o => o.status === 'preparing').length,
    readyOrders: _orders.filter(o => o.status === 'ready').length,
    totalCustomers: _customers.length,
    avgOrderValue: Math.round(
      _orders.reduce((sum, o) => sum + o.total, 0) / _orders.length
    ),
  };
}
