# EasyKhata

A MERN (MongoDB, Express, React, Node) web app for tracking payments with your
recovery men — built in the style of DigiKhata's Party ledger, with the
vocabulary adapted:

| DigiKhata term | This app |
|---|---|
| Customer | **Recovery Man** |
| You Gave (money given to customer) | **Expense** (money you gave to a recovery man) |
| You Got (money received from customer) | **Income** (money you received from a recovery man) |

## Features

- Dashboard listing every recovery man with a running balance ("You'll give" / "You'll get"), search, and totals across all of them
- Add / delete recovery men, with an optional opening balance
- Per-recovery-man ledger page: add **Income** or **Expense** entries, each with amount, description and date
- After saving an entry, a popup offers **Send on WhatsApp** / **Send SMS** to the recovery man's saved phone number, with a message containing the amount, your note, and the updated net total (plus a copy-to-clipboard fallback)
- Every entry shows the exact date and time it was added, visible on both desktop and mobile
- Dark theme matched to DigiKhata's look: near-black background, orange/red accent, vivid green for income and red for expense
- Running balance calculated after every entry, exactly like a paper khata book
- Totals for income, expense, and net balance per recovery man and across the whole book
- Clean, responsive, dark-themed UI (mobile-first, works on desktop too)
- REST API built with Express + Mongoose, MongoDB for storage

## Project structure

```
easykhata/
├── backend/            Express + MongoDB API
│   ├── config/db.js
│   ├── models/          RecoveryMan.js, Transaction.js
│   ├── routes/           recoveryMen.js, transactions.js, dashboard.js
│   ├── middleware/       errorHandler.js
│   ├── server.js
│   └── package.json
└── frontend/            React app
    ├── public/index.html
    └── src/
        ├── api/          axios.js, services.js
        ├── components/    Navbar, RecoveryManCard, TransactionRow, Modal, AddRecoveryManModal, AddTransactionModal
        ├── pages/         Dashboard.js, RecoveryManDetail.js
        ├── styles/        index.css, App.css
        ├── utils.js
        ├── App.js
        └── index.js
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [MongoDB](https://www.mongodb.com/) running locally, **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` if needed:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/easykhata
NODE_ENV=development
```

If you're using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection
string, e.g. `mongodb+srv://<user>:<password>@cluster0.mongodb.net/easykhata`.

Start the API:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API runs on `http://localhost:5000`. Check it's alive at
`http://localhost:5000/api/health`.

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm start
```

This opens `http://localhost:3000` in your browser. The dev server proxies
`/api` requests to `http://localhost:5000` (configured via `"proxy"` in
`frontend/package.json`), so both servers need to be running at the same time
during development.

## 3. Using the app

1. Click **+ Add Recovery Man** on the dashboard, enter their name (and
   optionally phone, area, and an opening balance).
2. Open a recovery man to see their ledger.
3. Use **+ Income** to log money you received from them, or **− Expense** to
   log money you gave them.
4. The balance banner and running "Bal." column update automatically after
   every entry, and the dashboard summary rolls all recovery men up into a
   single "You'll give" / "You'll get" total.

## 4. Building for production

```bash
cd frontend
npm run build
```

Then, with `NODE_ENV=production` set in `backend/.env`, the Express server
will serve the built React app directly:

```bash
cd backend
npm start
```

Visit `http://localhost:5000` — the API and the frontend are now served from
one server.

## API reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recoverymen?search=` | List recovery men with computed balances |
| GET | `/api/recoverymen/:id` | Get one recovery man with balance |
| POST | `/api/recoverymen` | Create a recovery man |
| PUT | `/api/recoverymen/:id` | Update a recovery man |
| DELETE | `/api/recoverymen/:id` | Delete a recovery man + their entries |
| GET | `/api/transactions/:recoveryManId` | Full ledger (entries + running balance) |
| POST | `/api/transactions` | Add an income/expense entry |
| PUT | `/api/transactions/:id` | Edit an entry |
| DELETE | `/api/transactions/:id` | Delete an entry |
| GET | `/api/dashboard/summary` | Overall totals + recent entries |

## Notes

- Balances follow ledger logic: an **Expense** (money you gave) increases
  what a recovery man owes you; **Income** (money you received) reduces it.
  An opening balance can be set either way when you add a recovery man.
- Deleting a recovery man also deletes all of their entries.
