# Supervisor Stock UI Rebuild - Fix Documentation

## Problem Summary

The supervisor (SPVR role) was unable to see stock counts on the Inventory → Stock page, even though:
- The database had correct stock data (2 EKOR Ikan Layang at LELONGs outlet)
- The supervisor user had `market_id` correctly assigned to `'zEWBvbC7'` (LELONGs)
- The backend API returned correct data when tested directly

## Root Causes Identified

1. **Session Caching Issue**: The backend auth middleware (`auth.js`) caches JWT sessions in an in-memory array (`sessionData = []`). After running the migration to assign `market_id`, the old cached session didn't include the updated market assignment.

2. **Complex UI Flow**: The existing `InventoryMain` component has complex logic for multiple roles (Gudang, Supervisor, Admin, Manager) which made debugging difficult.

## Solutions Implemented

### 1. Database Fix (Already Applied)

Migration file: `db/migrations/1777100000000-AssignSupervisorToLelongOutlet.js`

This migration assigns `supervisor1` user to the 'lelong' outlet by setting `market_id`.

### 2. New Dedicated Supervisor Stock View

Created a new component: `src/components/inventory/SupervisorStockView.tsx`

**Features:**
- ✅ Simple, focused UI for supervisors only
- ✅ Real-time stock count display
- ✅ Summary cards (Total Products, Total Qty, Low Stock, Critical Stock)
- ✅ Detailed stock table with images, batch numbers, and status badges
- ✅ Debug info panel (development mode only)
- ✅ Extensive console logging for troubleshooting
- ✅ Automatic refresh capability

**What it shows:**
- All stock items assigned to the supervisor's outlet (`market_id`)
- Product name, batch, quantity, unit (KG/EKOR)
- Stock status badges (Normal, Rendah, Kritis, Habis)
- Product images when available

### 3. Route Update

Updated: `src/routes/_protected._inventory_group.inventory-stock.tsx`

The route now conditionally renders:
- `SupervisorStockView` for SPVR role
- `InventoryMain` for other roles (Gudang, Admin, Manager)

## Testing Instructions

### Step 1: Restart Backend Server

The backend MUST be restarted to clear the session cache:

```bash
# In your terminal where start-dev.js is running:
# Press Ctrl+C to stop

# Then restart:
cd /home/inyrdim/code/lofishmart
node start-dev.js
```

### Step 2: Clear Browser Session (Important!)

1. Open the browser DevTools (F12)
2. Go to Application → Local Storage
3. Clear all data for `http://localhost:5173`
4. OR simply use Incognito/Private browsing mode

### Step 3: Login as Supervisor

1. Navigate to `http://localhost:5173`
2. Login with:
   - Username: `supervisor1`
   - Password: `supervisor123`

### Step 4: Verify Stock Display

1. Click on **Inventory → Stok Inventaris** in the sidebar
2. You should now see:
   - Summary cards showing stock statistics
   - Stock table with "Ikan Layang: 2 EKOR"
   - Debug info panel (in dev mode) showing your `market_id`

### Step 5: Check Console Logs

Open browser DevTools Console (F12) and verify:
```
[SupervisorStockView] Loading stocks...
[SupervisorStockView] User: { ... market_id: "zEWBvbC7" ... }
[SupervisorStockView] Raw API response: [... ]
[SupervisorStockView] Number of stocks: 2
[SupervisorStockView] Filtered market stocks: [... ]
  - Ikan Layang: 2 EKOR @ LELONGs
```

## API Flow

```
Browser (Supervisor)
    ↓ GET /product/stock/list
    ↓ Header: Authorization: Bearer <token>
Backend (auth.js middleware)
    ↓ Fetch fresh user from DB (includes market_id)
    ↓ Check permission: 'stock' ✓
    ↓ Filter stock by market_id = 'zEWBvbC7'
Backend (productController.js)
    ↓ Query: SELECT * FROM stock 
      WHERE market_id = 'zEWBvbC7' OR werehouse_id = 'zEWBvbC7'
    ↓ Returns: 2 records (Ikan Layang)
Frontend (SupervisorStockView)
    ↓ Display in table
```

## Files Changed/Created

| File | Action | Purpose |
|------|--------|---------|
| `lofishmart-backend/db/migrations/1777100000000-AssignSupervisorToLelongOutlet.js` | Created | Assign supervisor to outlet |
| `lofishmart-backend/scripts/fix-supervisor-market.sql` | Created | SQL script alternative |
| `lofishmart-backend/scripts/test-supervisor-stock.js` | Created | Test script for debugging |
| `lofishmart-frontend/src/components/inventory/SupervisorStockView.tsx` | Created | New dedicated UI component |
| `lofishmart-frontend/src/routes/_protected._inventory_group.inventory-stock.tsx` | Modified | Route to use new component for SPVR |

## Troubleshooting

### Still seeing 0 stocks?

1. **Check backend logs:**
   ```bash
   tail -f lofishmart-backend/backend.log | grep stockList
   ```
   Look for: `[stockList] Role: SPVR, MarketID: zEWBvbC7, Scoped: true, Target: zEWBvbC7`

2. **Verify database:**
   ```bash
   cd lofishmart-backend
   node -e "
   const mysql = require('mysql2/promise');
   require('dotenv').config();
   (async () => {
     const c = await mysql.createConnection({
       host: process.env.DB_HOST, user: process.env.DB_USER,
       password: process.env.DB_PASS, database: process.env.DB_NAME
     });
     const [u] = await c.query('SELECT market_id FROM user WHERE username=?', ['supervisor1']);
     console.log('Supervisor market_id:', u[0]?.market_id);
     const [s] = await c.query('SELECT * FROM stock WHERE market_id=?', [u[0]?.market_id]);
     console.log('Stocks found:', s.length);
     await c.end();
   })();
   "
   ```

3. **Check browser console:**
   - Look for 403 errors (permission denied)
   - Look for 401 errors (authentication failed)
   - Check the API response in Network tab

### Common Issues

| Issue | Solution |
|-------|----------|
| "Token invalid" | Logout and login again |
| 403 Permission denied | Verify SPVR role has 'stock' permission |
| Empty stock list | Check if stock has `market_id` or `werehouse_id` set |
| Old market_id | Clear browser local storage |

## Next Steps

If the supervisor still sees 0 stocks after following all steps:

1. Share the browser console logs (F12 → Console tab)
2. Share the backend logs (`tail -100 lofishmart-backend/backend.log`)
3. Run the test script: `cd lofishmart-backend && node scripts/test-supervisor-stock.js`

## Additional Features to Consider

- [ ] Stock adjustment modal for supervisors (if they have permission)
- [ ] Low stock alerts/notifications
- [ ] Export stock list to CSV/PDF
- [ ] Stock history chart
- [ ] Barcode scanner integration
