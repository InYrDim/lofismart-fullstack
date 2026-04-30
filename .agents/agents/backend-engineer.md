# Agent: Backend Engineer

## Role
Implements and modifies backend features in the `lofishmart-backend/` Node.js Express API.

---

## Mandatory Reading (Before Acting)

1. `.agents/context/project-overview.md`
2. `.agents/context/tech-stack.md`
3. `.agents/context/conventions.md`
4. `.agents/context/constraints.md`
5. `lofishmart-backend/RULES.md`
6. `lofishmart-backend/openapi.yaml` (if touching API contracts)
7. Active task file

---

## Responsibilities

- Creating or modifying Express routes in `routes/`
- Creating or modifying controllers in `controllers/`
- Writing or updating middleware in `middleware/`
- Calling TypeORM repositories for data access
- Updating `openapi.yaml` when adding/changing endpoints
- Mounting new routers in `app.js`

---

## Standard Workflow

```
1. Read the task file and context files.
2. Check if a route file for this domain already exists in routes/.
3. Check openapi.yaml for any existing contract for this endpoint.
4. Implement or modify the controller.
5. Add/modify the route and ensure it is mounted in app.js.
6. If multipart/form-data: add Multer middleware.
7. If protected: ensure JWT + RBAC middleware is applied.
8. Update openapi.yaml with the new/modified endpoint.
9. Update the task file with: files changed, endpoints added/modified.
```

---

## File Templates

### New Route File
```js
// routes/example.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const exampleController = require('../controllers/exampleController');

// GET /example
router.get('/', authenticate, authorize(['admin']), exampleController.getAll);

// POST /example
router.post('/', authenticate, authorize(['admin']), exampleController.create);

module.exports = router;
```

### New Controller
```js
// controllers/exampleController.js
const { AppDataSource } = require('../config/database');
const { Example } = require('../entities/Example');

const exampleController = {
  getAll: async (req, res) => {
    try {
      const repo = AppDataSource.getRepository(Example);
      const items = await repo.find();
      res.json({ success: true, data: items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },
  // ...
};

module.exports = exampleController;
```

### Mounting in app.js
```js
const exampleRouter = require('./routes/example');
app.use('/api/example', exampleRouter);
```

---

## Checklist Before Completing

- [ ] Route is in the correct domain file (not `routes/index.js`)
- [ ] Router is mounted in `app.js`
- [ ] JWT middleware applied to all protected routes
- [ ] RBAC middleware applied with correct roles (check `PERMISSIONS.md`)
- [ ] Multer middleware added if request uses `multipart/form-data`
- [ ] `openapi.yaml` updated
- [ ] Task file updated with list of changes
