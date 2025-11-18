# InsightPlus – Event Analytics Engine

InsightPlus is a lightweight, high-performance event analytics engine built using **NestJS**, **ClickHouse / PostgreSQL**, **Redis Streams**, and a persistent background worker.  
It allows applications to **track events**, **store them efficiently**, and **compute analytics** like DAU, MAU, funnels, feature usage, and more.

# 1. Introduction & Tech Stack

###  What This Engine Does
- Accepts event tracking calls (`/api/v1/capture`)
- Stores events in Redis Stream instantly (non-blocking)
- A background Worker consumes events and writes them to DB
- Database can be switched between **ClickHouse** and **PostgreSQL**( we recommend using clickhouse if you are dealing with milions of events hourly )
- Provides analytics endpoints under `api/v1/analytics/*`

### Tech Stack
| Component | Technology |
|----------|------------|
| Backend Framework | NestJS |
| Queue / Stream | Redis Streams |
| Primary DB | ClickHouse (default) |
| Secondary DB | PostgreSQL |
| Background Worker | Node.js + ioredis |
| Logging | Pino |
| Infra | Docker |

---
# 2. How to Run the Project Locally

### **1️⃣ Clone the repository**
```sh
git clone git@github.com:Shobhnik13/analytics-engine.git
cd server
```

### **2️⃣ Install dependencies**
```sh
npm install
```

### **3️⃣ Start Redis + DB using Docker**
```sh
docker compose up -d
```

### **4️⃣ Start the NestJS server**
```sh
npm run start:dev
```

Your analytics engine is now running:

Backend → http://localhost:7002  
Redis → localhost:6379  
ClickHouse → http://localhost:8123  
PostgreSQL → localhost:5432

# 3. Customization Guide 
This section explains how to customize events and other stuff according to your application:

# A) Add New Events   
Modify the event validation list:  
**src/common/events.config.ts**

export const validEvents = [
  "user_registered",    
  "payment_success",    
  "most_used_feature",  
  "page_view", // new event   
];

**Now the /api/v1/capture endpoint will accept these events**

# C) Customize or Add Analytics Queries
All SQL analytics queries/logic lives inside:    
**src/analytics/analytics.service.ts**

Every function has:
 
Postgres SQL   
ClickHouse SQL

Example: adding your own analytics     

async getButtonClicks() {   
  return this.runQuery(   
   // ADD SQL QUERY HERE,   
   // ADD CLICKHOUSE QUERY HERE,         
)}

Expose it in the controller → new analytics API ready.

# B) Switching Between ClickHouse & PostgreSQL
**In .env file:**   
DATABASE_TYPE=clickhouse  
OR   
DATABASE_TYPE=postgres

The engine dynamically loads the correct DB driver service. 
