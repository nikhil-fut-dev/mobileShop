export const PERMISSIONS = Object.freeze({
  // Dashboard
  DASHBOARD_VIEW: "dashboard:view",

  // User and access management
  USERS_READ: "users:read",
  USERS_CREATE: "users:create",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  ROLES_MANAGE: "roles:manage",

  // Products
  PRODUCTS_READ: "products:read",
  PRODUCTS_CREATE: "products:create",
  PRODUCTS_UPDATE: "products:update",
  PRODUCTS_DELETE: "products:delete",

  // Inventory and IMEI
  INVENTORY_READ: "inventory:read",
  INVENTORY_MANAGE: "inventory:manage",
  IMEI_READ: "imei:read",
  IMEI_MANAGE: "imei:manage",

  // Suppliers and purchases
  SUPPLIERS_READ: "suppliers:read",
  SUPPLIERS_MANAGE: "suppliers:manage",
  PURCHASES_READ: "purchases:read",
  PURCHASES_MANAGE: "purchases:manage",

  // Customers
  CUSTOMERS_READ: "customers:read",
  CUSTOMERS_CREATE: "customers:create",
  CUSTOMERS_UPDATE: "customers:update",

  // POS and invoices
  POS_ACCESS: "pos:access",
  INVOICES_READ: "invoices:read",
  INVOICES_CREATE: "invoices:create",
  INVOICES_CANCEL: "invoices:cancel",

  // Orders
  ORDERS_READ: "orders:read",
  ORDERS_MANAGE: "orders:manage",

  // Returns and refunds
  RETURNS_READ: "returns:read",
  RETURNS_MANAGE: "returns:manage",
  REFUNDS_READ: "refunds:read",
  REFUNDS_MANAGE: "refunds:manage",

  // Expenses and accounting
  EXPENSES_READ: "expenses:read",
  EXPENSES_MANAGE: "expenses:manage",
  ACCOUNTING_READ: "accounting:read",
  ACCOUNTING_MANAGE: "accounting:manage",

  // Reports
  REPORTS_VIEW: "reports:view",
  FINANCIAL_REPORTS_VIEW: "financial-reports:view",

  // Business configuration
  SETTINGS_READ: "settings:read",
  SETTINGS_MANAGE: "settings:manage",
  BRANCHES_MANAGE: "branches:manage",

  // Audit logs
  AUDIT_LOGS_READ: "audit-logs:read",
});
