# LofishMart — Permissions Reference

> Last updated: April 24, 2026
> Source of truth: `permission` table in MySQL + `routes/*.js`

---

## How Permissions Work

Every API route is gated by `auth([...permissions])` middleware. When a user logs in, their role's permissions are embedded in the JWT. If the user doesn't have **all** of the required permissions for a route, the API returns `403 Do not have permission for this operation`.

```
User → Role → has_permit → Permission → Route access
```

**Permissions are additive** — a user gets all permissions assigned to their role via the `has_permit` table.

---

## All Permissions

| ID | Name | What it allows |
|---|---|---|
| `CATA` | `cat-app` | View app categories |
| `CATE` | `cat-app-edit` | Create/update/delete app categories |
| `CATG` | `category` | View product categories |
| `CAED` | `category-edit` | Create/update/delete product categories |
| `CONF` | `config` | View app config + data-change + data-receive |
| `CNFE` | `config-edit` | Create/update/delete app config |
| `GRAD` | `grade` | View fish grades |
| `GRED` | `grade-edit` | Create/update/delete fish grades |
| `HPMT` | `has-permit` | View role-permission assignments |
| `HPME` | `has-permit-edit` | Modify role-permission assignments |
| `MEMB` | `member` | View members/customers |
| `MEME` | `member-edit` | Create/update/delete/soft-delete members |
| `PERM` | `permission` | View permissions |
| `PEED` | `permission-edit` | Create/update/delete permissions |
| `PRIC` | `price` | View product prices/variants |
| `PRIE` | `price-edit` | Create/update/delete product prices |
| `PROD` | `product` | View products |
| `PRED` | `product-edit` | Create/update/delete/soft-delete products |
| `PROF` | `profile` | View market/outlet profiles |
| `PRFE` | `profile-edit` | Create/update/delete market profiles |
| `PURC` | `purchase` | View purchase history |
| `PUED` | `purchase-edit` | Create/update/delete purchases |
| `REJC` | `reject` | View rejected stock |
| `REJE` | `reject-edit` | Create/update/delete rejected stock |
| `ROLE` | `role` | View roles |
| `ROED` | `role-edit` | Create/update/delete roles |
| `SERV` | `service` | View services (non-stock items) |
| `SEED` | `service-edit` | Create/update/delete services |
| `SESS` | `session` | View auth sessions |
| `SIZE` | `size` | View fish sizes |
| `SIED` | `size-edit` | Create/update/delete fish sizes |
| `SODT` | `so-detail` | View stock opname line items |
| `SODE` | `so-detail-edit` | Create/update/delete stock opname items |
| `STCK` | `stock` | View stock list |
| `STKE` | `stock-edit` | Create/update/delete stock + inventory transfer |
| `STLI` | `stock-list` | View inventory dashboard |
| `STOP` | `stock-opname` | View stock opname sessions |
| `STOE` | `stock-opname-edit` | Create/update/delete stock opname sessions |
| `SUPP` | `supplier` | View suppliers |
| `SUED` | `supplier-edit` | Create/update/delete/soft-delete suppliers |
| `USER` | `user` | View users |
| `USED` | `user-edit` | Create/update/delete/soft-delete users |
| `WHSE` | `warehouse` | View warehouses |
| `WHED` | `warehouse-edit` | Create/update/delete warehouses |
| `WHDL` | `warehouse-delete` | Soft delete warehouses |

---

## Permissions Per Route

### Auth (no permission required)
| Method | Route | Permission |
|---|---|---|
| POST | `/login` | — (public) |
| POST | `/logout` | — (public) |

### User Module (`/user`)
| Method | Route | Permission |
|---|---|---|
| GET | `/user/supplier/list` | `supplier` |
| GET | `/user/supplier/byid/:id` | `supplier` |
| POST | `/user/supplier/create` | `supplier-edit` |
| PATCH | `/user/supplier/update/:id` | `supplier-edit` |
| DELETE | `/user/supplier/delete/:id` | `supplier-edit` |
| DELETE | `/user/supplier/soft-delete/:id` | `supplier-edit` |
| GET | `/user/user/list` | `user` |
| GET | `/user/user/byid/:id` | `user` |
| POST | `/user/user/create` | `user-edit` |
| PATCH | `/user/user/update/:id` | `user-edit` |
| DELETE | `/user/user/delete/:id` | `user-edit` |
| DELETE | `/user/user/soft-delete/:id` | `user-edit` |
| GET | `/user/member/list` | `member` |
| GET | `/user/member/byid/:id` | `member` |
| POST | `/user/member/create` | `member-edit` |
| PATCH | `/user/member/update/:id` | `member-edit` |
| DELETE | `/user/member/delete/:id` | `member-edit` |
| DELETE | `/user/member/soft-delete/:id` | `member-edit` |
| GET | `/user/role/list` | `role` |
| GET | `/user/role/byid/:id` | `role` |
| POST | `/user/role/create` | `role-edit` |
| PATCH | `/user/role/update/:id` | `role-edit` |
| DELETE | `/user/role/delete/:id` | `role-edit` |
| GET | `/user/permission/list` | `permission` |
| GET | `/user/permission/byid/:id` | `permission` |
| POST | `/user/permission/create` | `permission-edit` |
| PATCH | `/user/permission/update/:id` | `permission-edit` |
| DELETE | `/user/permission/delete/:id` | `permission-edit` |
| GET | `/user/has-permit/list` | `has-permit` |
| GET | `/user/has-permit/byid/:id` | `has-permit` |
| POST | `/user/has-permit/edit` | `has-permit-edit` |
| GET | `/user/session/list` | `session` |

### Product Module (`/product`)
| Method | Route | Permission |
|---|---|---|
| GET | `/product/product/list` | `product` |
| GET | `/product/product/byid/:id` | `product` |
| POST | `/product/product/create` | `product-edit` |
| PATCH | `/product/product/update/:id` | `product-edit` |
| DELETE | `/product/product/delete/:id` | `product-edit` |
| DELETE | `/product/product/soft-delete/:id` | `product-edit` |
| GET | `/product/service/list` | `service` |
| GET | `/product/service/byid/:id` | `service` |
| POST | `/product/service/create` | `service-edit` |
| PATCH | `/product/service/update/:id` | `service-edit` |
| DELETE | `/product/service/delete/:id` | `service-edit` |
| DELETE | `/product/service/soft-delete/:id` | `service-edit` |
| GET | `/product/price/list` | `price` |
| GET | `/product/price/byid/:id` | `price` |
| POST | `/product/price/getprice` | `price` |
| GET | `/product/price/byproduct/:id` | `price` |
| POST | `/product/price/create` | `price-edit` |
| PATCH | `/product/price/update/:id` | `price-edit` |
| DELETE | `/product/price/delete/:id` | `price-edit` |
| GET | `/product/stock/list` | `stock` |
| GET | `/product/stock/byid/:id` | `stock` |
| POST | `/product/stock/create` | `stock-edit` |
| PATCH | `/product/stock/update/:id` | `stock-edit` |
| DELETE | `/product/stock/delete/:id` | `stock-edit` |
| GET | `/product/reject/list` | `reject` |
| GET | `/product/reject/byid/:id` | `reject` |
| POST | `/product/reject/create` | `reject-edit` |
| PATCH | `/product/reject/update/:id` | `reject-edit` |
| DELETE | `/product/reject/delete/:id` | `reject-edit` |
| GET | `/product/stock-opname/list` | `stock-opname` |
| GET | `/product/stock-opname/byid/:id` | `stock-opname` |
| POST | `/product/stock-opname/create` | `stock-opname-edit` |
| PATCH | `/product/stock-opname/update/:id` | `stock-opname-edit` |
| DELETE | `/product/stock-opname/delete/:id` | `stock-opname-edit` |
| GET | `/product/so-detail/list` | `so-detail` |
| GET | `/product/so-detail/byid/:id` | `so-detail` |
| POST | `/product/so-detail/create` | `so-detail-edit` |
| PATCH | `/product/so-detail/update/:id` | `so-detail-edit` |
| DELETE | `/product/so-detail/delete/:id` | `so-detail-edit` |
| GET | `/product/grade/list` | `grade` |
| GET | `/product/grade/byid/:id` | `grade` |
| POST | `/product/grade/create` | `grade-edit` |
| PATCH | `/product/grade/update/:id` | `grade-edit` |
| DELETE | `/product/grade/delete/:id` | `grade-edit` |
| GET | `/product/size/list` | `size` |
| GET | `/product/size/byid/:id` | `size` |
| POST | `/product/size/create` | `size-edit` |
| PATCH | `/product/size/update/:id` | `size-edit` |
| DELETE | `/product/size/delete/:id` | `size-edit` |
| GET | `/product/category/list` | `category` |
| GET | `/product/category/byid/:id` | `category` |
| POST | `/product/category/create` | `category-edit` |
| PATCH | `/product/category/update/:id` | `category-edit` |
| DELETE | `/product/category/delete/:id` | `category-edit` |
| **GET** | **`/product/inventory/dashboard`** | **`stock-list`** |
| **POST** | **`/product/inventory/receive`** | **`stock-edit` + `purchase-edit`** |
| **POST** | **`/product/inventory/transfer`** | **`stock-edit`** |

### Feature Module (`/feature`)
| Method | Route | Permission |
|---|---|---|
| GET | `/feature/profile/list` | `profile` |
| GET | `/feature/profile/byid/:id` | `profile` |
| POST | `/feature/profile/create` | `profile-edit` |
| PATCH | `/feature/profile/update/:id` | `profile-edit` |
| DELETE | `/feature/profile/delete/:id` | `profile-edit` |
| DELETE | `/feature/profile/soft-delete/:id` | `profile-edit` |
| GET | `/feature/cat-app/list` | `cat-app` |
| GET | `/feature/cat-app/byid/:id` | `cat-app` |
| POST | `/feature/cat-app/create` | `cat-app-edit` |
| PATCH | `/feature/cat-app/update/:id` | `cat-app-edit` |
| DELETE | `/feature/cat-app/delete/:id` | `cat-app-edit` |
| GET | `/feature/config/list` | `config` |
| GET | `/feature/config/byid/:id` | `config` |
| POST | `/feature/config/create` | `config-edit` |
| PATCH | `/feature/config/update/:id` | `config-edit` |
| DELETE | `/feature/config/delete/:id` | `config-edit` |
| GET | `/feature/data-change/list` | `config` |
| GET | `/feature/data-receive/list` | `config` |

### Warehouse Module (`/warehouse`)
| Method | Route | Permission |
|---|---|---|
| GET | `/warehouse/list` | `warehouse` |
| GET | `/warehouse/byid/:id` | `warehouse` |
| POST | `/warehouse/create` | `warehouse-edit` |
| PATCH | `/warehouse/update/:id` | `warehouse-edit` |
| DELETE | `/warehouse/delete/:id` | `warehouse-delete` |
| GET | `/warehouse/stats/:id` | `warehouse` |

---

## Roles & Their Permissions

### Admin (`ADMN`)
Has all 45 permissions. Full access to everything.

### Manager (`MNGR`)
> ⚠️ No permissions assigned yet.

Suggested permissions to assign:
`product`, `service`, `price`, `stock`, `stock-list`, `reject`, `stock-opname`, `so-detail`, `purchase`, `member`, `supplier`, `profile`, `category`, `grade`, `size`, `config`, `session`, `warehouse`, `warehouse-edit`, `warehouse-delete`

### Gudang (`GDNG`)
> ⚠️ No permissions assigned yet.

Suggested permissions to assign:
`stock`, `stock-list`, `stock-edit`, `purchase`, `purchase-edit`, `reject`, `reject-edit`, `product`, `service`, `supplier`, `warehouse`

### Kasir (`KSR`)
> ⚠️ No permissions assigned yet.

Suggested permissions to assign:
`product`, `service`, `price`, `stock`, `stock-list`, `member`

### Penimbang (`TMBG`)
> ⚠️ No permissions assigned yet.

Suggested permissions to assign:
`stock`, `stock-list`, `stock-edit`, `purchase-edit`, `reject-edit`, `product`, `supplier`

### Kurir (`KURI`)
> ⚠️ No permissions assigned yet.

No inventory or POS permissions needed. Delivery-scope only (future feature).

### User (`USER`)
> ⚠️ No permissions assigned yet.

---

## ⚠️ Known Issues

| Issue | Status |
|---|---|
| `stock-list` permission was missing from the DB | Fixed 2026-03-11 (added manually, ID: `STLI`) |
| Roles other than Admin have zero permissions | Needs to be configured via the `has-permit` UI or directly in DB |
| No migration exists for `stock-list` permission | Should be added to `AddProductPermissions` migration for fresh installs |

---

## How to Assign Permissions to a Role

### Via UI (when has-permit UI is implemented)
Navigate to Settings → Roles → Select Role → Assign Permissions

### Via API
```bash
POST /user/has-permit/edit
Authorization: Bearer <admin_token>

{
  "role_id": "KSR",
  "permissions": ["PROD", "SERV", "PRIC", "STCK", "STLI", "MEMB"]
}
```

### Via MySQL (direct)
```sql
-- First check existing
SELECT * FROM has_permit WHERE role_id = 'KSR';

-- Add single permission
INSERT INTO has_permit (id, role_id, permission_id) VALUES ('HP_XXXX', 'KSR', 'STCK');

-- View all roles and their permissions
SELECT r.name as role, GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') as permissions
FROM role r
LEFT JOIN has_permit hp ON r.id = hp.role_id
LEFT JOIN permission p ON hp.permission_id = p.id
GROUP BY r.id, r.name;
```

---

## Fresh Install Checklist

When setting up a new instance, run these after migrations:

1. ✅ Run all migrations (`npm run migration:run`)
2. ⚠️ Manually add `stock-list` permission (missing from migration):
   ```sql
   INSERT INTO permission (id, name, guard_name, created_at, updated_at)
   VALUES ('STLI', 'stock-list', 'web', NOW(), NOW());
   ```
3. ✅ Seed the Admin role with all permissions (handled by migration)
4. ✅ Warehouse permissions auto-added by `CreateWarehouse` migration
5. ⚠️ Manually assign permissions to Manager, Kasir, Gudang, Penimbang roles
