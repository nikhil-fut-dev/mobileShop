import { ROLES } from "./roles.js";
import { PERMISSIONS as P } from "./permissions.js";

export const ROLE_PERMISSIONS = Object.freeze({
  // Owner has complete access.
  [ROLES.OWNER]: Object.freeze(["*"]),

  // Admin handles daily shop operations.
  [ROLES.ADMIN]: Object.freeze([
    P.DASHBOARD_VIEW,

    P.USERS_READ,

    P.PRODUCTS_READ,
    P.PRODUCTS_CREATE,
    P.PRODUCTS_UPDATE,
    P.PRODUCTS_DELETE,

    P.INVENTORY_READ,
    P.INVENTORY_MANAGE,

    P.IMEI_READ,
    P.IMEI_MANAGE,

    P.SUPPLIERS_READ,
    P.SUPPLIERS_MANAGE,

    P.PURCHASES_READ,
    P.PURCHASES_MANAGE,

    P.CUSTOMERS_READ,
    P.CUSTOMERS_CREATE,
    P.CUSTOMERS_UPDATE,

    P.POS_ACCESS,
    P.INVOICES_READ,
    P.INVOICES_CREATE,
    P.INVOICES_CANCEL,

    P.ORDERS_READ,
    P.ORDERS_MANAGE,

    P.RETURNS_READ,
    P.RETURNS_MANAGE,

    P.REFUNDS_READ,
    P.REFUNDS_MANAGE,

    P.SETTINGS_READ,
  ]),

  // Cashier has restricted billing access.
  [ROLES.CASHIER]: Object.freeze([
    P.POS_ACCESS,

    P.PRODUCTS_READ,
    P.INVENTORY_READ,
    P.IMEI_READ,

    P.CUSTOMERS_READ,
    P.CUSTOMERS_CREATE,

    P.INVOICES_READ,
    P.INVOICES_CREATE,

    P.ORDERS_READ,
  ]),
});
