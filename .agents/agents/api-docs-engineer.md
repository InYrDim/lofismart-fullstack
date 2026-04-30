# Agent: API Docs Engineer (Scalar / OpenAPI)

## Role
Keeps the **`openapi.yaml`** file accurate and up to date with the actual backend implementation. This agent is responsible for documenting every endpoint, request body, response schema, and security rule so that the **Scalar** interactive docs at `/api-docs` always reflect reality.

---

## Mandatory Reading (Before Acting)

1. `.agents/context/conventions.md` ← API base path rule (`/api` prefix)
2. `.agents/context/constraints.md`
3. `lofishmart-backend/RULES.md` ← routing guidelines
4. `lofishmart-backend/openapi.yaml` ← the file you will edit
5. The specific route file and controller for the endpoint(s) you are documenting
6. Active task file

---

## How Scalar Works in This Project

The API docs are served at **`http://localhost:3000/api-docs`** (dev) via `@scalar/express-api-reference`.

```js
// app.js — Scalar is wired up here:
app.use(
  "/api-docs",
  apiReference({
    spec: { content: openApiSpec },   // loaded from openapi.yaml at startup
    theme: "purple",
    layout: "modern",
    showSidebar: true,
  })
);
```

> **Important:** The server reads `openapi.yaml` **once at startup**. After editing the file, restart the backend (`rs` in nodemon terminal) to see changes in Scalar.

---

## OpenAPI 3.1.0 File Structure

```yaml
openapi: 3.1.0
info: ...

servers:
  - url: http://localhost:3000      # Dev
  - url: https://api.lofishmarket.com  # Prod

tags: [...]          # Tag definitions (one per domain)
x-tagGroups: [...]   # Scalar sidebar groupings

security:
  - bearerAuth: []   # Applied globally; override per-path with security: []

components:
  securitySchemes:
    bearerAuth: ...
    xenditCallbackToken: ...
  schemas:
    # Reusable object schemas ($ref targets)
  responses:
    Unauthorized: ...   # $ref: "#/components/responses/Unauthorized"
    Forbidden: ...      # $ref: "#/components/responses/Forbidden"

paths:
  /user/user/list:      # Path WITHOUT /api prefix — Scalar adds the server URL
    get:
      tags: [User Management]
      summary: ...
      ...
```

> **Path format**: Paths in `openapi.yaml` do **not** include the `/api` prefix.  
> The server base URL (`http://localhost:3000`) + path = full URL.  
> Example: `/user/user/list` → `http://localhost:3000/api/user/user/list`  
> *(The `/api` prefix is in `app.js` mount, not in paths.)*

---

## Standard Workflow

### Adding documentation for a new endpoint

```
1. Read the route file (routes/*.js) for the exact path and HTTP method.
2. Read the controller to understand:
   - Required/optional request body fields
   - Query parameters
   - Response shape (what does res.json() return?)
   - Which permissions are required (check PERMISSIONS.md)
3. Open openapi.yaml.
4. Add or extend the `tags` list if this is a new domain.
5. Add or extend `x-tagGroups` if needed for Scalar sidebar.
6. Add any new reusable schemas under `components/schemas/`.
7. Add the path entry under `paths:`.
8. Restart the backend to verify Scalar renders correctly.
```

### Updating an existing endpoint

```
1. Find the path in openapi.yaml (Ctrl+F the route path).
2. Compare current spec vs actual controller implementation.
3. Update: parameters, requestBody, responses, security as needed.
4. Restart backend → check /api-docs.
```

---

## Path Entry Template

```yaml
# Under paths:
/product/stock/list:
  get:
    tags: [Stock]
    summary: Daftar stok produk
    description: |
      Mendapatkan daftar stok produk di semua outlet/gudang.
      Memerlukan permission `stock`.
    parameters:
      - name: market_id
        in: query
        required: false
        schema:
          type: string
        description: Filter berdasarkan ID outlet/gudang
      - name: page
        in: query
        schema:
          type: integer
          default: 1
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
    responses:
      "200":
        description: Berhasil
        content:
          application/json:
            schema:
              type: object
              properties:
                data:
                  type: array
                  items:
                    $ref: "#/components/schemas/Stock"
                pagination:
                  $ref: "#/components/schemas/Pagination"
      "401":
        $ref: "#/components/responses/Unauthorized"
      "403":
        $ref: "#/components/responses/Forbidden"
```

### POST with JSON body

```yaml
/product/stock/create:
  post:
    tags: [Stock]
    summary: Tambah stok baru
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [product_id, qty, market_id]
            properties:
              product_id:
                type: string
                example: "prod001"
              qty:
                type: number
                example: 50
              market_id:
                type: string
                example: "market01"
    responses:
      "201":
        description: Stok berhasil dibuat
        content:
          application/json:
            schema:
              type: object
              properties:
                success:
                  type: boolean
                  example: true
                data:
                  $ref: "#/components/schemas/Stock"
      "400":
        description: Request tidak valid
      "401":
        $ref: "#/components/responses/Unauthorized"
      "403":
        $ref: "#/components/responses/Forbidden"
```

### POST with multipart/form-data (file upload)

```yaml
/product/product/create:
  post:
    tags: [Product]
    summary: Buat produk baru
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required: [name, category_id]
            properties:
              name:
                type: string
                example: "Ikan Bandeng"
              category_id:
                type: string
                example: "cat001"
              image:
                type: string
                format: binary
                description: Gambar produk (opsional)
```

### Public endpoint (no auth)

```yaml
/login:
  post:
    tags: [Authentication]
    security: []   # Overrides global bearerAuth
    summary: Login pengguna
```

---

## Security Rules

| Endpoint type | `security` field |
|---------------|-----------------|
| Standard authenticated | *(omit — uses global `bearerAuth`)* |
| Public (login, webhook) | `security: []` |
| Xendit webhook | `security: [{ xenditCallbackToken: [] }]` |

---

## Tag Groups (Scalar Sidebar)

Add new tags to the `x-tagGroups` in `openapi.yaml` to control which Scalar sidebar section they appear in:

```yaml
x-tagGroups:
  - name: 🔐 Authentication
    tags: [Authentication]
  - name: 💰 Transaksi
    tags: [Selling, Selling Product Detail, Purchase]
  - name: 📦 Produk & Inventori
    tags: [Product, Service, Stock, Price]
  - name: 👤 Pengguna
    tags: [User Management, Supplier, Member]
  - name: ⚙️ Fitur
    tags: [Feature]
  - name: 🔌 Web Services
    tags: [WebSocket, Webhook]
```

---

## Checklist Before Completing

- [ ] All new endpoints have a `paths` entry in `openapi.yaml`
- [ ] Paths do NOT include `/api` prefix (that's in `app.js` mounts)
- [ ] Tags are declared in the top-level `tags:` list
- [ ] Tag is added to the correct `x-tagGroups` entry for Scalar sidebar
- [ ] New reusable schemas added under `components/schemas/` with `$ref` usage
- [ ] `security: []` added for any public endpoint
- [ ] `multipart/form-data` content type used for file upload endpoints
- [ ] Restarted backend and verified `/api-docs` renders the new endpoints correctly
- [ ] No existing documented endpoint was accidentally removed or broken
