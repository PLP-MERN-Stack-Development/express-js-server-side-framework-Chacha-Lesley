# Express.js RESTful API — Product Service

Simple Express.js RESTful API that manages an in-memory "products" resource. The server implementation is in `server.js`.

Table of contents
- Overview
- Requirements
- Setup & run
- Environment variables
- Authentication
- Request/Response validation
- Endpoints (examples)
- Pagination, filtering & search
- Error handling
- Sample data
- Testing & notes
- Extending the service
- License

Overview
This API manages products with these fields:
- id (string UUID)
- name (string)
- description (string)
- price (number)
- category (string)
- inStock (boolean)

Requirements
- Node.js (v14+ recommended)
- npm
- Windows command-line or PowerShell

Setup & run
1. Install dependencies:
    ```
    npm install
    ```
2. Create a `.env` file in the project root with:
    ```
    API_KEY=your_api_key_here
    PORT=3000
    ```
3. Start the server (development):
    ```
    npm start
    ```
   The server listens on `http://localhost:PORT` (default 3000).

Environment variables
- API_KEY — required for all `/api` routes (sent in header `x-api-key`)
- PORT — optional, default 3000

Authentication
- All routes under `/api` are protected by an API key.
- Provide header: `x-api-key: <API_KEY>`.
- Missing/invalid key returns 401 Unauthorized.

Request / Response validation
- JSON bodies parsed via `bodyParser.json()`.
- Product creation and updates are validated by `validateProduct` middleware.
- Required product fields:
  - name: string
  - description: string
  - price: number
  - category: string
  - inStock: boolean
- Validation failures return 400 Bad Request with a message.

Endpoints (base URL: http://localhost:PORT)

- GET /
  - Returns a simple welcome message.
  - Response: 200 text

- GET /api/products
  - List products with optional filtering and pagination.
  - Query params:
    - category (optional) — case-insensitive filter
    - page (optional, default 1)
    - limit (optional, default 10)
  - Response: 200 JSON:
    ```
    {
      "data": [ /* products */ ],
      "total": <number>,
      "page": <number>,
      "limit": <number>
    }
    ```
  - Example:
    ```
    curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/products?page=1&limit=5&category=electronics"
    ```

- GET /api/products/search?q=term
  - Search products by name (case-insensitive substring).
  - `q` is required. Missing `q` returns 400.
  - Example:
    ```
    curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/products/search?q=laptop"
    ```

- GET /api/products/stats
  - Returns counts per category:
    ```
    { "electronics": 2, "kitchen": 1 }
    ```
  - Example:
    ```
    curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/products/stats"
    ```

- GET /api/products/:id
  - Get a product by id.
  - 200 product object or 404 { message: 'Product not found' }.
  - Example:
    ```
    curl -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/products/1"
    ```

- POST /api/products
  - Create a product. Body (application/json) must include all required fields.
  - Success: 201 created product (id is UUID).
  - Example:
    ```
    curl -X POST -H "Content-Type: application/json" -H "x-api-key: YOUR_KEY" \
      -d "{\"name\":\"Blender\",\"description\":\"Powerful\",\"price\":99.99,\"category\":\"kitchen\",\"inStock\":true}" \
      http://localhost:3000/api/products
    ```

- PUT /api/products/:id
  - Replace product by id. Body must pass same validation as POST.
  - 200 updated product or 404 not found.
  - Example:
    ```
    curl -X PUT -H "Content-Type: application/json" -H "x-api-key: YOUR_KEY" \
      -d "{\"name\":\"Updated\",\"description\":\"Updated\",\"price\":10,\"category\":\"home\",\"inStock\":false}" \
      http://localhost:3000/api/products/<id>
    ```

- DELETE /api/products/:id
  - Delete a product by id.
  - Success: 204 No Content or 404 if not found.
  - Example:
    ```
    curl -X DELETE -H "x-api-key: YOUR_KEY" "http://localhost:3000/api/products/<id>"
    ```

Pagination, filtering & search
- Use `page` and `limit` to paginate.
- Use `category` to filter (case-insensitive).
- Use `/api/products/search?q=term` for name search.

Error handling
- Global error handler returns JSON: `{ "message": "<error message>" }`.
- Custom errors:
  - `ValidationError` => 400
  - `NotFoundError` => 404
- Unexpected errors => 500

Sample data
server.js contains an in-memory dataset with three sample products:
- id: '1' — Laptop (electronics)
- id: '2' — Smartphone (electronics)
- id: '3' — Coffee Maker (kitchen)

Testing & notes
- The Express app is exported (`module.exports = app`) for unit/integration tests.
- Use Postman, Insomnia, or curl to test endpoints.
- For Windows PowerShell, wrap JSON payloads in single quotes or escape double quotes as shown above.

Extending the service
- Persist products to a database (MongoDB, PostgreSQL).
- Move routes/controllers to separate modules.
- Add PATCH for partial updates.
- Replace ad-hoc validation with Joi or express-validator.
- Add proper authentication/authorization.