# EstateFlow — Real Estate Sales Management System

> **BACSE202 Lab Component Project — Review -0 | Assessment -8**  
> **School of Computer Science and Engineering (SCOPE)**  
> **Vellore Institute of Technology (VIT)**  
> **Academic Year: 2026–27 | B. Tech [CSE & CSE-With Specialization]**

---

### Student & Project Credentials
* **Student Name**: Hardik Jain
* **Registration Number**: `25BBS0002`
* **Project Title**: Real Estate Sales Management System (EstateFlow)
* **Project Guide**: Dr. Kavitha G.
* **Head of Department (HOD)**: Dr. Mythili T.
* **Document Reference**: Appendix 1 — A Project Report (Pages 1–28)

---

## Table of Contents

1. [Abstract of the Project](#1-abstract-of-the-project)
2. [Acknowledgement](#2-acknowledgement)
3. [Introduction & Project Objectives](#3-introduction--project-objectives)
4. [Background & Relational Theory](#4-background--relational-theory)
5. [Hardware & Software Requirements](#5-hardware--software-requirements)
6. [E-R Diagram & Relationship Cardinalities](#6-e-r-diagram--relationship-cardinalities)
7. [Database Design & Data Dictionary (8 Tables)](#7-database-design--data-dictionary-8-tables)
8. [Comprehensive SQL Execution Catalogue & Output Verification](#8-comprehensive-sql-execution-catalogue--output-verification)
   * 8.1 [Table Creation with All Constraints (DDL)](#81-table-creation-with-all-constraints-ddl)
   * 8.2 [Sample Data Insertion (5 Core Rows per Table)](#82-sample-data-insertion-5-core-rows-per-table)
   * 8.3 [Schema Evolution (ALTER TABLE Queries)](#83-schema-evolution-alter-table-queries)
   * 8.4 [Data Maintenance (DELETE & UPDATE with Cascades)](#84-data-maintenance-delete--update-with-cascades)
   * 8.5 [Data Retrieval (SELECT with Condition Filters)](#85-data-retrieval-select-with-condition-filters)
   * 8.6 [Single Row SQL Functions](#86-single-row-sql-functions)
   * 8.7 [Aggregate (Group) Functions](#87-aggregate-group-functions)
   * 8.8 [GROUP BY Queries](#88-group-by-queries)
   * 8.9 [HAVING Clause Queries](#89-having-clause-queries)
   * 8.10 [Subquery Operations](#810-subquery-operations)
   * 8.11 [Multi-Table JOIN Queries](#811-multi-table-join-queries)
9. [Full-Stack System Architecture & Extensions](#9-full-stack-system-architecture--extensions)
   * 9.1 [Role-Based Access Control (RBAC)](#91-role-based-access-control-rbac)
   * 9.2 [Explicit SQL Demonstration UI Controls](#92-explicit-sql-demonstration-ui-controls)
   * 9.3 [Standalone Desktop GUI Application (Electron)](#93-standalone-desktop-gui-application-electron)
   * 9.4 [REST API Specifications](#94-rest-api-specifications)
10. [Execution & Deployment Guide](#10-execution--deployment-guide)
11. [Project Repository File Map](#11-project-repository-file-map)

---

## 1. Abstract of the Project

The **Real Estate Sales Management System (EstateFlow)** is a relational database application designed to streamline the day-to-day operations of a modern real estate agency, covering agents, property listings, buyer and seller clients, property showings, purchase offers, and final sale transactions. Manually tracking these interconnected records using spreadsheets or paper files is error-prone and does not scale as an agency's portfolio expands.

This project resolves this operational vulnerability by modelling the domain using seven primary relational entities — **`AGENT`**, **`PROPERTY`**, **`CATEGORY`**, **`CLIENT`**, **`SHOWING`**, **`OFFER`**, and **`TRANSACTION`** — plus an authentication entity **`APP_USERS`**, connected through primary key and foreign key relationships that enforce referential integrity. Each agent is linked to the properties they manage, each property belongs to a category and may be shown to multiple prospective clients, and each accepted offer is followed by an atomic transaction record capturing the final sale price and closing date.

The system was initially implemented in Oracle Database (11g XE / 12c+) using SQL*Plus and SQL Developer, and subsequently engineered into a full-stack desktop application using Node.js, Express.js, React, and Electron. The project demonstrates the complete lifecycle of relational database design and SQL query execution:
* Table creation with primary key, foreign key, NOT NULL, UNIQUE, and CHECK constraints.
* Controlled, idempotent sample data insertion.
* Schema evolution through `ALTER TABLE` statements (adding, renaming, modifying, and dropping columns).
* Data maintenance through `UPDATE` and `DELETE` statements, including cascading deletions (`ON DELETE CASCADE`).
* Comprehensive data retrieval including `SELECT` queries with filters, single-row string and math functions, aggregate functions, `GROUP BY` and `HAVING` clauses, subqueries, and multi-table `JOIN` operations.

---

## 2. Acknowledgement

> I would like to express my sincere gratitude to **Dr. Mythili T.** (Head of Department, SCOPE) for reviewing the entire project, providing strategic direction, and coordinating academic resources.
>
> I express my deepest gratitude to my project guide, **Dr. Kavitha G.**, whose rigorous guidance, mentorship, and constructive feedback guided me thoroughly throughout the development and documentation of this relational database system.
>
> Heartfelt appreciation is also extended to the faculty members and peers of the School of Computer Science and Engineering at Vellore Institute of Technology for their encouragement and support.

---

## 3. Introduction & Project Objectives

### 3.1 Domain Context & Motivation
Real estate agencies coordinate a large number of moving parts on a daily basis:
* Licensed agents manage listings across residential, commercial, luxury, land, and industrial sectors.
* Prospective clients schedule property showings to inspect spaces.
* Buyers submit formal offers that transition through states (`Pending`, `Accepted`, `Rejected`).
* Accepted offers mature into finalized transactions with agreed settlement prices and closing dates.

When tracked using spreadsheets or physical ledgers, fundamental problems emerge:
1. **Data Duplication & Redundancy**: Client and property details are re-entered multiple times, wasting storage and causing divergence.
2. **Lack of Referential Integrity**: Offers can accidentally be entered for non-existent properties, or transactions recorded without a corresponding offer.
3. **Orphaned Records**: Deleting a property does not clean up showings or offers, cluttering historical logs.
4. **Inefficient Analytics**: Calculating agent commission totals, average listing prices, or category distributions requires manual counting rather than automated indexing.

### 3.2 Objectives of the Project
* **Normalized Relational Schema**: Design a normalized schema consisting of seven core entities accurately reflecting the real estate domain.
* **Integrity Enforcement**: Enforce data integrity via `PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, and `CHECK` constraints, including cascading delete rules (`ON DELETE CASCADE`).
* **Representative Population**: Populate all tables with consistent sample records (initially 5 benchmark records from the report, expandable to 30+ records).
* **Schema Evolution**: Demonstrate schema modification using `ALTER TABLE` (adding columns, renaming columns, modifying data type precision, dropping columns).
* **Data Maintenance**: Execute controlled `UPDATE` and `DELETE` operations, verifying cascade propagations.
* **Advanced Query Retrieval**: Demonstrate data retrieval using `SELECT` clauses, single-row scalar functions, aggregate functions, `GROUP BY`, `HAVING`, subqueries, and multi-table relational `JOIN` operations.
* **Full-Stack Engineering**: Wrap the database engine in an Express.js REST API with Oracle Connection Pooling, a React frontend, and a standalone Electron desktop container.

---

## 4. Background & Relational Theory

A relational database organizes data into **relations (tables)**, where each row represents a distinct entity instance and each column represents an attribute. Relationships between tables are formed by storing the **Primary Key (PK)** of one table as a **Foreign Key (FK)** in another.

### Domain Modeling Principles
1. **Agents and Portfolios**: Storing agents in a dedicated `AGENT` table ensures an agent's contact and branch details are stored once and referenced by multiple listings, avoiding update anomalies.
2. **Property Listings & Validation**: The `PROPERTY` table enforces a `CHECK (listing_price > 0)` constraint, preventing negative or zero prices at the database engine level.
3. **Property Categorization**: The `CATEGORY` table normalizes property classifications (Residential, Commercial, Luxury, Land, Industrial), allowing new market sectors to be added without modifying property schemas.
4. **Client Registry**: The `CLIENT` table enforces a `UNIQUE` constraint on phone numbers, preventing duplicate client profiles.
5. **Showings & Appointments**: The `SHOWING` table serves as an associative record connecting a property, a client, and an appointment date.
6. **Offer Management**: The `OFFER` table captures bids, binding a property and buyer client with an offer amount and status (`Accepted`, `Rejected`, `Pending`).
7. **Final Transactions**: The `TRANSACTION` table records completed sales, linking the property, the accepted offer, the closing sale price, and the completion date.
8. **Cascading Referrals (`ON DELETE CASCADE`)**: Declared on `SHOWING`, `OFFER`, and `TRANSACTION` foreign keys referencing `PROPERTY`. Deleting a property removes all associated dependent child rows automatically, preventing orphaned records.

---

## 5. Hardware & Software Requirements

| Component | Minimum Specification | Project Development Environment |
|---|---|---|
| **Processor** | Intel Core i3 or above | Intel Core i5 / i7 / Multi-core x64 |
| **RAM** | 4 GB or above | 8 GB / 16 GB RAM |
| **Storage** | 20 GB free space | SSD with NTFS Storage |
| **Input Devices** | Standard Keyboard & Mouse | Keyboard & Optical Mouse |
| **Display** | Standard Display (1024x768) | Full HD 1920x1080 Monitor |
| **Operating System** | Windows 10 / 11 | Windows 10 / 11 64-bit |
| **Database Engine** | Oracle Database | Oracle Database 11g Express Edition (XE) / 12c+ |
| **SQL Interface** | SQL\*Plus / SQL Developer | Oracle SQL\*Plus & SQL Developer |
| **Backend Runtime** | Node.js (v18+) | Node.js v20.x, Express.js, `oracledb` Thick Mode |
| **Frontend Framework** | Modern Browser / React | React 18, Vite, React Router 6, Axios |
| **Desktop Wrapper** | Native Process Host | Electron v31+ Standalone Native Window |

---

## 6. E-R Diagram & Relationship Cardinalities

### 6.1 Relationship Cardinalities
* **AGENT (1) — manages — (N) PROPERTY**: One agent manages multiple properties; each property is managed by exactly one agent.
* **CATEGORY (1) — classifies — (N) PROPERTY**: One category groups multiple properties; each property belongs to one category.
* **PROPERTY (1) — viewed in — (N) SHOWING**: One property can have multiple client showings; each showing is for one property.
* **CLIENT (1) — attends — (N) SHOWING**: One client can attend multiple property showings; each showing involves one client.
* **PROPERTY (1) — receives — (N) OFFER**: One property can receive multiple bids; each offer targets one property.
* **CLIENT (1) — places — (N) OFFER**: One client can place multiple offers; each offer is submitted by one client.
* **PROPERTY (1) — finalized in — (1) TRANSACTION**: A property transitions into a final transaction record once closed.
* **OFFER (1) — accepted in — (1) TRANSACTION**: Exactly one accepted offer produces the closing transaction record.
* **APP_USERS (1) — authenticates — (0..1) AGENT / CLIENT**: An application login account maps to an optional `agent_id` or `client_id` via `reference_id` for Role-Based Access Control.

### 6.2 Conceptual Entity-Relationship Diagram (Mermaid)

```mermaid
erDiagram
    AGENT ||--o{ PROPERTY : "manages (1:N)"
    CATEGORY ||--o{ PROPERTY : "classifies (1:N)"
    PROPERTY ||--o{ SHOWING : "viewed in (1:N)"
    CLIENT ||--o{ SHOWING : "attends (1:N)"
    PROPERTY ||--o{ OFFER : "receives (1:N)"
    CLIENT ||--o{ OFFER : "submits (1:N)"
    PROPERTY ||--o| TRANSACTION : "concludes in (1:1)"
    OFFER ||--o| TRANSACTION : "finalized into (1:1)"
    APP_USERS ||--o| AGENT : "references role"
    APP_USERS ||--o| CLIENT : "references role"

    AGENT {
        NUMBER(4) agent_id PK
        VARCHAR2(50) agent_name
        VARCHAR2(50) office_name
    }

    CATEGORY {
        NUMBER(4) category_id PK
        VARCHAR2(30) category_name
        VARCHAR2(100) description
    }

    PROPERTY {
        VARCHAR2(10) property_id PK
        VARCHAR2(100) address
        NUMBER(14,2) listing_price
        VARCHAR2(20) status
        NUMBER(4) category_id FK
        NUMBER(4) agent_id FK
        NUMBER square_feet
    }

    CLIENT {
        NUMBER(4) client_id PK
        VARCHAR2(50) client_name
        VARCHAR2(15) phone UK
        VARCHAR2(20) client_type
    }

    SHOWING {
        NUMBER(4) showing_id PK
        VARCHAR2(10) property_id FK
        NUMBER(4) client_id FK
        DATE showing_date
    }

    OFFER {
        NUMBER(4) offer_id PK
        VARCHAR2(10) property_id FK
        NUMBER(4) client_id FK
        NUMBER(12,2) offer_amount
        VARCHAR2(20) offer_status
    }

    TRANSACTION {
        NUMBER(4) transaction_id PK
        VARCHAR2(10) property_id FK
        NUMBER(4) offer_id FK
        NUMBER(12,2) sale_price
        DATE sale_date
    }

    APP_USERS {
        NUMBER user_id PK
        VARCHAR2(50) username UK
        VARCHAR2(255) password_hash
        VARCHAR2(20) role
        NUMBER reference_id
    }
```

---

## 7. Database Design & Data Dictionary (8 Tables)

### Table 1: AGENT
*Stores licensed real estate agents managing listings.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `agent_id` | `NUMBER(4)` | `PRIMARY KEY` | — | Unique identifier for each agent |
| `agent_name` | `VARCHAR2(50)` | `NOT NULL` | — | Full legal name of the agent |
| `office_name` | `VARCHAR2(50)` | `NOT NULL` | — | Office branch location (renamed from `agency_branch`) |
| `commission_rate` | `NUMBER(4,3)` | — | — | Initial commission rate (dropped during schema evolution) |

### Table 2: CATEGORY
*Classifies property inventory into market segments.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `category_id` | `NUMBER(4)` | `PRIMARY KEY` | — | Unique identifier for each category |
| `category_name` | `VARCHAR2(30)` | `NOT NULL` | — | Category name (e.g., Residential, Luxury) |
| `description` | `VARCHAR2(100)` | — | — | Descriptive scope of the category |

### Table 3: PROPERTY
*Core inventory entity holding listings, prices, and status.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `property_id` | `VARCHAR2(10)` | `PRIMARY KEY` | — | Unique identifier for each property (e.g., `'P5501'`) |
| `address` | `VARCHAR2(100)` | `NOT NULL` | — | Physical street address |
| `listing_price` | `NUMBER(14,2)` | `CHECK (> 0)` | — | Listed asking price (expanded precision via ALTER) |
| `status` | `VARCHAR2(20)` | — | — | Listing status (`'Active'`, `'Pending'`, `'Sold'`) |
| `category_id` | `NUMBER(4)` | `FOREIGN KEY` | `category(category_id)` | Category to which the property belongs |
| `agent_id` | `NUMBER(4)` | `FOREIGN KEY` | `agent(agent_id)` | Agent managing the listing |
| `square_feet` | `NUMBER` | — | — | Built-up floor area (added via ALTER TABLE) |

### Table 4: CLIENT
*Maintains registered buyer, seller, and investor profiles.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `client_id` | `NUMBER(4)` | `PRIMARY KEY` | — | Unique identifier for each client |
| `client_name` | `VARCHAR2(50)` | `NOT NULL` | — | Full name of the client |
| `phone` | `VARCHAR2(15)` | `UNIQUE` | — | Contact telephone number |
| `client_type` | `VARCHAR2(20)` | — | — | Role classification (`'Buyer'`, `'Seller'`, `'Investor'`) |

### Table 5: SHOWING
*Logs viewing appointments between prospective buyers and properties.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `showing_id` | `NUMBER(4)` | `PRIMARY KEY` | — | Unique identifier for each showing |
| `property_id` | `VARCHAR2(10)` | `FOREIGN KEY` | `property(property_id) ON DELETE CASCADE` | Property shown |
| `client_id` | `NUMBER(4)` | `FOREIGN KEY` | `client(client_id)` | Prospective buyer attending |
| `showing_date` | `DATE` | `NOT NULL` | — | Calendar date of scheduled showing |

### Table 6: OFFER
*Records financial purchase proposals submitted by clients.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `offer_id` | `NUMBER(4)` | `PRIMARY KEY` | — | Unique identifier for each offer |
| `property_id` | `VARCHAR2(10)` | `FOREIGN KEY` | `property(property_id) ON DELETE CASCADE` | Property receiving the offer |
| `client_id` | `NUMBER(4)` | `FOREIGN KEY` | `client(client_id)` | Client placing the offer |
| `offer_amount` | `NUMBER(12,2)` | `CHECK (> 0)` | — | Proposed monetary purchase price |
| `offer_status` | `VARCHAR2(20)` | — | — | Offer state (`'Accepted'`, `'Rejected'`, `'Pending'`) |

### Table 7: TRANSACTION
*Maintains finalized closing contracts and financial audit data.*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `transaction_id`| `NUMBER(4)` | `PRIMARY KEY` | — | Unique identifier for each transaction |
| `property_id` | `VARCHAR2(10)` | `FOREIGN KEY` | `property(property_id) ON DELETE CASCADE` | Sold property |
| `offer_id` | `NUMBER(4)` | `FOREIGN KEY` | `offer(offer_id)` | Accepted offer that originated the sale |
| `sale_price` | `NUMBER(12,2)` | `CHECK (> 0)` | — | Final settled sale price |
| `sale_date` | `DATE` | — | — | Settlement and closing date |

### Table 8: APP_USERS
*Database-backed user authentication and Role-Based Access Control (RBAC).*
| Attribute | Data Type | Constraint | References | Description |
|---|---|---|---|---|
| `user_id` | `NUMBER` | `PRIMARY KEY` | — | Unique user record identifier |
| `username` | `VARCHAR2(50)` | `UNIQUE NOT NULL` | — | Unique login username |
| `password_hash`| `VARCHAR2(255)`| `NOT NULL` | — | Salted bcrypt password hash |
| `role` | `VARCHAR2(20)` | `DEFAULT 'admin'` | — | Authorization level (`'admin'`, `'agent'`, `'client'`) |
| `reference_id` | `NUMBER` | — | — | Foreign linkage to `agent_id` or `client_id` |

---

## 8. Comprehensive SQL Execution Catalogue & Output Verification

This section reproduces the complete, sequential SQL execution flow matching Pages 13–28 of the project report, along with actual command outputs verified via SQL\*Plus.

### 8.1 Table Creation with All Constraints (DDL)

```sql
CREATE TABLE agent (
    agent_id NUMBER(4) PRIMARY KEY,
    agent_name VARCHAR2(50) NOT NULL,
    agency_branch VARCHAR2(50) NOT NULL,
    commission_rate NUMBER(4,3)
);

CREATE TABLE category (
    category_id NUMBER(4) PRIMARY KEY,
    category_name VARCHAR2(30) NOT NULL,
    description VARCHAR2(100)
);

CREATE TABLE property (
    property_id VARCHAR2(10) PRIMARY KEY,
    address VARCHAR2(100) NOT NULL,
    listing_price NUMBER(12,2) CHECK (listing_price > 0),
    status VARCHAR2(20),
    category_id NUMBER(4),
    agent_id NUMBER(4),
    CONSTRAINT fk_property_category FOREIGN KEY (category_id)
        REFERENCES category(category_id),
    CONSTRAINT fk_property_agent FOREIGN KEY (agent_id)
        REFERENCES agent(agent_id)
);

CREATE TABLE client (
    client_id NUMBER(4) PRIMARY KEY,
    client_name VARCHAR2(50) NOT NULL,
    phone VARCHAR2(15) UNIQUE,
    client_type VARCHAR2(20)
);

CREATE TABLE showing (
    showing_id NUMBER(4) PRIMARY KEY,
    property_id VARCHAR2(10),
    client_id NUMBER(4),
    showing_date DATE NOT NULL,
    CONSTRAINT fk_showing_property FOREIGN KEY (property_id)
        REFERENCES property(property_id) ON DELETE CASCADE,
    CONSTRAINT fk_showing_client FOREIGN KEY (client_id)
        REFERENCES client(client_id)
);

CREATE TABLE offer (
    offer_id NUMBER(4) PRIMARY KEY,
    property_id VARCHAR2(10),
    client_id NUMBER(4),
    offer_amount NUMBER(12,2) CHECK (offer_amount > 0),
    offer_status VARCHAR2(20),
    CONSTRAINT fk_offer_property FOREIGN KEY (property_id)
        REFERENCES property(property_id) ON DELETE CASCADE,
    CONSTRAINT fk_offer_client FOREIGN KEY (client_id)
        REFERENCES client(client_id)
);

CREATE TABLE transaction (
    transaction_id NUMBER(4) PRIMARY KEY,
    property_id VARCHAR2(10),
    offer_id NUMBER(4),
    sale_price NUMBER(12,2) CHECK (sale_price > 0),
    sale_date DATE,
    CONSTRAINT fk_transaction_property FOREIGN KEY (property_id)
        REFERENCES property(property_id) ON DELETE CASCADE,
    CONSTRAINT fk_transaction_offer FOREIGN KEY (offer_id)
        REFERENCES offer(offer_id)
);
```

**SQL\*Plus Execution Transcript (Pages 14–15):**
```text
SQL> CREATE TABLE agent (
  2      agent_id NUMBER(4) PRIMARY KEY,
  3      agent_name VARCHAR2(50) NOT NULL,
  4      agency_branch VARCHAR2(50) NOT NULL,
  5      commission_rate NUMBER(4,3)
  6  );
Table created.

SQL> CREATE TABLE category ( ... );
Table created.

SQL> CREATE TABLE property ( ... );
Table created.

SQL> CREATE TABLE client ( ... );
Table created.

SQL> CREATE TABLE showing ( ... );
Table created.

SQL> CREATE TABLE offer ( ... );
Table created.

SQL> CREATE TABLE transaction ( ... );
Table created.
```

---

### 8.2 Sample Data Insertion (5 Core Rows per Table)

```sql
-- 1. AGENT
INSERT INTO agent VALUES (9001, 'Sarah Jenkins', 'Downtown Luxury', 0.030);
INSERT INTO agent VALUES (9002, 'David Miller', 'Westside Suburban', 0.025);
INSERT INTO agent VALUES (9003, 'Michael Chang', 'Coastal Prime', 0.035);
INSERT INTO agent VALUES (9004, 'Amanda Ross', 'Downtown Luxury', 0.030);
INSERT INTO agent VALUES (9005, 'Robert Vance', 'East Valley', 0.020);

-- 2. CATEGORY
INSERT INTO category VALUES (101, 'Residential', 'Single family homes and townhouses');
INSERT INTO category VALUES (102, 'Commercial', 'Office spaces and retail');
INSERT INTO category VALUES (103, 'Luxury', 'High-end premium real estate');
INSERT INTO category VALUES (104, 'Land', 'Empty plots for development');
INSERT INTO category VALUES (105, 'Industrial', 'Warehouses and factories');

-- 3. PROPERTY
INSERT INTO property VALUES ('P5501', '123 Maple St', 450000.00, 'Sold', 101, 9002);
INSERT INTO property VALUES ('P5502', '789 Ocean Blvd', 1250000.00, 'Active', 103, 9003);
INSERT INTO property VALUES ('P5503', '456 Pine Ave', 380000.00, 'Pending', 101, 9001);
INSERT INTO property VALUES ('P5504', '222 Palm Dr', 2100000.00, 'Sold', 103, 9003);
INSERT INTO property VALUES ('P5505', '555 Cedar Rd', 620000.00, 'Active', 101, 9004);

-- 4. CLIENT
INSERT INTO client VALUES (2001, 'John Smith', '9123456780', 'Buyer');
INSERT INTO client VALUES (2002, 'Emily Davis', '9123456781', 'Seller');
INSERT INTO client VALUES (2003, 'Mark Johnson', '9123456782', 'Buyer');
INSERT INTO client VALUES (2004, 'Sophia Brown', '9123456783', 'Investor');
INSERT INTO client VALUES (2005, 'James Wilson', '9123456784', 'Buyer');

-- 5. SHOWING
INSERT INTO showing VALUES (3001, 'P5502', 2001, TO_DATE('10-AUG-2026','DD-MON-YYYY'));
INSERT INTO showing VALUES (3002, 'P5503', 2003, TO_DATE('11-AUG-2026','DD-MON-YYYY'));
INSERT INTO showing VALUES (3003, 'P5505', 2005, TO_DATE('12-AUG-2026','DD-MON-YYYY'));
INSERT INTO showing VALUES (3004, 'P5502', 2004, TO_DATE('13-AUG-2026','DD-MON-YYYY'));
INSERT INTO showing VALUES (3005, 'P5505', 2001, TO_DATE('14-AUG-2026','DD-MON-YYYY'));

-- 6. OFFER
INSERT INTO offer VALUES (4001, 'P5502', 2001, 1200000.00, 'Rejected');
INSERT INTO offer VALUES (4002, 'P5503', 2003, 380000.00, 'Accepted');
INSERT INTO offer VALUES (4003, 'P5505', 2005, 600000.00, 'Pending');
INSERT INTO offer VALUES (4004, 'P5502', 2004, 1225000.00, 'Pending');
INSERT INTO offer VALUES (4005, 'P5501', 2001, 450000.00, 'Accepted');

-- 7. TRANSACTION
INSERT INTO transaction VALUES (5001, 'P5501', 4005, 450000.00, TO_DATE('01-AUG-2026','DD-MON-YYYY'));
INSERT INTO transaction VALUES (5002, 'P5504', 4002, 2100000.00, TO_DATE('05-AUG-2026','DD-MON-YYYY'));
INSERT INTO transaction VALUES (5003, 'P5503', 4002, 380000.00, TO_DATE('15-AUG-2026','DD-MON-YYYY'));
INSERT INTO transaction VALUES (5004, 'P5502', 4004, 1225000.00, TO_DATE('20-AUG-2026','DD-MON-YYYY'));
INSERT INTO transaction VALUES (5005, 'P5505', 4003, 600000.00, TO_DATE('25-AUG-2026','DD-MON-YYYY'));
```

**SQL\*Plus Verification Transcript (Pages 17–18):**
```text
SQL> INSERT INTO agent VALUES (9001, 'Sarah Jenkins', 'Downtown Luxury', 0.030);
1 row created.
... [Repeated for all 35 records]
SQL> COMMIT;
Commit complete.
```

---

### 8.3 Schema Evolution (ALTER TABLE Queries)

```sql
-- 1. Add a new column square_feet to the property table
ALTER TABLE property ADD (square_feet NUMBER);

-- 2. Rename agency_branch to office_name in the agent table
ALTER TABLE agent RENAME COLUMN agency_branch TO office_name;

-- 3. Modify listing_price column of property to larger precision
ALTER TABLE property MODIFY (listing_price NUMBER(14,2));

-- 4. Drop the commission_rate column from the agent table
ALTER TABLE agent DROP COLUMN commission_rate;
```

**SQL\*Plus Transcript (Page 19):**
```text
SQL> ALTER TABLE property ADD (square_feet NUMBER);
Table altered.

SQL> ALTER TABLE agent RENAME COLUMN agency_branch TO office_name;
Table altered.

SQL> ALTER TABLE property MODIFY (listing_price NUMBER(14,2));
Table altered.

SQL> ALTER TABLE agent DROP COLUMN commission_rate;
Table altered.
```

---

### 8.4 Data Maintenance (DELETE & UPDATE with Cascades)

```sql
-- 1. Cascading Delete: Delete all properties marked as 'Sold'
-- (ON DELETE CASCADE automatically removes child rows in SHOWING, OFFER, and TRANSACTION)
DELETE FROM property WHERE status = 'Sold';

-- 2. Bulk Price Reduction: Reduce listing price by 5% for all 'Active' properties
UPDATE property
SET listing_price = listing_price * 0.95
WHERE status = 'Active';

-- 3. Update agent office location
UPDATE agent
SET office_name = 'Downtown Luxury'
WHERE agent_name = 'David Miller';

-- 4. Standard UPDATEs on remaining tables
UPDATE category
SET description = 'Independent houses, villas and townhouses'
WHERE category_id = 101;

UPDATE client
SET phone = '9123456799'
WHERE client_id = 2002;

UPDATE showing
SET showing_date = TO_DATE('16-AUG-2026','DD-MON-YYYY')
WHERE showing_id = 3005;

UPDATE offer
SET offer_status = 'Accepted'
WHERE offer_id = 4004;

UPDATE transaction
SET sale_price = sale_price + 5000
WHERE transaction_id = 5005;
```

**SQL\*Plus Transcript (Pages 19–20):**
```text
SQL> DELETE FROM property WHERE status = 'Sold';
2 rows deleted.

SQL> UPDATE property
  2  SET listing_price = listing_price * 0.95
  3  WHERE status = 'Active';
2 rows updated.

SQL> UPDATE agent
  2  SET office_name = 'Downtown Luxury'
  3  WHERE agent_name = 'David Miller';
1 row updated.
```

---

### 8.5 Data Retrieval (SELECT with Condition Filters)

```sql
-- Retrieve active property listings
SELECT address, listing_price FROM property WHERE status = 'Active';

-- Retrieve all registered buyers
SELECT client_name, phone FROM client WHERE client_type = 'Buyer';

-- Retrieve accepted purchase offers
SELECT offer_id, offer_amount FROM offer WHERE offer_status = 'Accepted';
```

**SQL\*Plus Output (Pages 23–24):**
```text
SQL> SELECT address, listing_price FROM property WHERE status = 'Active';

ADDRESS                                  LISTING_PRICE
---------------------------------------- -------------
789 Ocean Blvd                                 1187500
555 Cedar Rd                                    589000

SQL> SELECT client_name, phone FROM client WHERE client_type = 'Buyer';

CLIENT_NAME                              PHONE
---------------------------------------- ---------------
John Smith                               9123456780
Mark Johnson                             9123456782
James Wilson                             9123456784

SQL> SELECT offer_id, offer_amount FROM offer WHERE offer_status = 'Accepted';

  OFFER_ID OFFER_AMOUNT
---------- ------------
      4002       380000
      4004      1225000
```

---

### 8.6 Single Row SQL Functions

```sql
-- 1. UPPER: Convert agent names to uppercase
SELECT UPPER(agent_name) AS agent_name_upper FROM agent;

-- 2. LOWER: Convert client names to lowercase
SELECT LOWER(client_name) AS client_name_lower FROM client;

-- 3. LENGTH: Compute character count of street addresses
SELECT address, LENGTH(address) AS address_length FROM property;

-- 4. ROUND: Round numerical offer amounts
SELECT offer_id, ROUND(offer_amount) AS rounded_amount FROM offer;

-- 5. INITCAP: Capitalize initial letters of category names
SELECT INITCAP(category_name) AS category_title_case FROM category;
```

**SQL\*Plus Output (Pages 24–25):**
```text
SQL> SELECT UPPER(agent_name) AS agent_name_upper FROM agent;
AGENT_NAME_UPPER
--------------------------------------------------
SARAH JENKINS
DAVID MILLER
MICHAEL CHANG
AMANDA ROSS
ROBERT VANCE

SQL> SELECT address, LENGTH(address) AS address_length FROM property;
ADDRESS                                  ADDRESS_LENGTH
---------------------------------------- --------------
789 Ocean Blvd                                       14
456 Pine Ave                                         12
555 Cedar Rd                                         12
```

---

### 8.7 Aggregate (Group) Functions

```sql
SELECT COUNT(*) AS total_properties FROM property;
SELECT SUM(listing_price) AS total_listing_value FROM property;
SELECT AVG(listing_price) AS average_listing_price FROM property;
SELECT MAX(offer_amount) AS highest_offer FROM offer;
SELECT MIN(offer_amount) AS lowest_offer FROM offer;
```

**SQL\*Plus Output (Pages 25–26):**
```text
SQL> SELECT COUNT(*) AS total_properties FROM property;
TOTAL_PROPERTIES
----------------
               3

SQL> SELECT SUM(listing_price) AS total_listing_value FROM property;
TOTAL_LISTING_VALUE
-------------------
            2156500

SQL> SELECT AVG(listing_price) AS average_listing_price FROM property;
AVERAGE_LISTING_PRICE
---------------------
           718833.333

SQL> SELECT MAX(offer_amount) AS highest_offer FROM offer;
HIGHEST_OFFER
-------------
      1225000

SQL> SELECT MIN(offer_amount) AS lowest_offer FROM offer;
LOWEST_OFFER
------------
      380000
```

---

### 8.8 GROUP BY Queries

```sql
-- Distribution of properties grouped by listing status
SELECT status, COUNT(property_id) AS total_properties
FROM property
GROUP BY status;

-- Average listing price grouped by managing agent
SELECT agent_id, AVG(listing_price) AS avg_price
FROM property
GROUP BY agent_id;
```

**SQL\*Plus Output (Page 26):**
```text
SQL> SELECT status, COUNT(property_id) AS total_properties
  2  FROM property
  3  GROUP BY status;

STATUS               TOTAL_PROPERTIES
-------------------- ----------------
Active                              2
Pending                             1

SQL> SELECT agent_id, AVG(listing_price) AS avg_price
  2  FROM property
  3  GROUP BY agent_id;

  AGENT_ID  AVG_PRICE
---------- ----------
      9003    1187500
      9001     380000
      9004     589000
```

---

### 8.9 HAVING Clause Queries

```sql
-- Find agents managing more than one property
SELECT agent_id, COUNT(property_id) AS total_properties
FROM property
GROUP BY agent_id
HAVING COUNT(property_id) > 1;
```

**SQL\*Plus Output (Page 27):**
```text
SQL> SELECT agent_id, COUNT(property_id) AS total_properties
  2  FROM property
  3  GROUP BY agent_id
  4  HAVING COUNT(property_id) > 1;

no rows selected
```
*(Note: Following the deletion of sold properties, remaining properties each map to single agents, accurately yielding "no rows selected".)*

---

### 8.10 Subquery Operations

```sql
-- Retrieve all properties listed above the overall average listing price
SELECT address, listing_price
FROM property
WHERE listing_price > (SELECT AVG(listing_price) FROM property);
```

**SQL\*Plus Output (Page 27):**
```text
SQL> SELECT address, listing_price
  2  FROM property
  3  WHERE listing_price > (SELECT AVG(listing_price) FROM property);

ADDRESS                                  LISTING_PRICE
---------------------------------------- -------------
789 Ocean Blvd                                 1187500
```

---

### 8.11 Multi-Table JOIN Queries

```sql
-- 1. Two-Table Inner Join: Property + Agent
SELECT p.address, a.agent_name, p.listing_price
FROM property p
JOIN agent a ON p.agent_id = a.agent_id;

-- 2. Three-Table Inner Join: Property + Agent + Category
SELECT p.address, a.agent_name, c.category_name, p.listing_price
FROM property p
JOIN agent a ON p.agent_id = a.agent_id
JOIN category c ON p.category_id = c.category_id;
```

**SQL\*Plus Output (Pages 27–28):**
```text
SQL> SELECT p.address, a.agent_name, p.listing_price
  2  FROM property p
  3  JOIN agent a ON p.agent_id = a.agent_id;

ADDRESS                                  AGENT_NAME           LISTING_PRICE
---------------------------------------- -------------------- -------------
456 Pine Ave                             Sarah Jenkins               380000
789 Ocean Blvd                           Michael Chang              1187500
555 Cedar Rd                             Amanda Ross                 589000

SQL> SELECT p.address, a.agent_name, c.category_name, p.listing_price
  2  FROM property p
  3  JOIN agent a ON p.agent_id = a.agent_id
  4  JOIN category c ON p.category_id = c.category_id;

ADDRESS              AGENT_NAME           CATEGORY_NAME        LISTING_PRICE
-------------------- -------------------- -------------------- -------------
555 Cedar Rd         Amanda Ross          Residential                 589000
456 Pine Ave         Sarah Jenkins        Residential                 380000
789 Ocean Blvd       Michael Chang        Luxury                     1187500
```

---

## 9. Full-Stack System Architecture & Extensions

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Desktop Application (Electron Host)                  │
│                                                                        │
│  ┌─────────────────────────────────┐   ┌────────────────────────────┐  │
│  │   React 18 Frontend (Port 3000) │   │ Express API (Port 5000)    │  │
│  │   • Bootstrap Engineering UI    │   │ • JWT RBAC Auth Middleware │  │
│  │   • Live Recharts & Modals      │──▶│ • RESTful CRUD Endpoints   │  │
│  │   • Interactive SQL Demo UI     │◀──│ • Thick Driver Pool        │  │
│  │   • CSV Export Engine           │   │ • Auto Transaction Rollback│  │
│  └─────────────────────────────────┘   └─────────────┬──────────────┘  │
└──────────────────────────────────────────────────────┼─────────────────┘
                                                       │ Connection Pool
                                                       ▼ (localhost:1521/XE)
                                         ┌────────────────────────────┐
                                         │  Oracle Database (SYSTEM)  │
                                         │  • 7 Normalized Relations  │
                                         │  • APP_USERS Auth Table    │
                                         │  • ON DELETE CASCADE       │
                                         │  • CHECK Constraints       │
                                         └────────────────────────────┘
```

### 9.1 Role-Based Access Control (RBAC)

The authentication system supports three roles, each tailored to a specific user entity:

| Username | Password | Role | Reference Linkage | Landing Page & Access Rights |
|---|---|---|---|---|
| `admin` | `password123` | `admin` | `null` | **Executive Dashboard**: Unrestricted access to all 7 tables, seeder tools, and analytical reports. |
| `agent1` | `password123` | `agent` | `agent_id = 9001` (Sarah Jenkins) | **Agent Portal**: Filtered view displaying only their assigned properties, appointments, offers, and commission metrics. |
| `client1` | `password123` | `client` | `client_id = 2001` (John Smith) | **Client Hub**: Buyer view allowing browsing of active listings, tracking personal bids, and viewing upcoming showings. |

### 9.2 Explicit SQL Demonstration UI Controls

To demonstrate SQL clause implementation to professors and evaluators, explicit UI controls are integrated into the application interface:
1. **`SELECT DISTINCT`**: A dropdown filter on the Properties page dynamically fetches unique property categories via `SELECT DISTINCT category_name FROM category`.
2. **`GROUP BY` & `HAVING`**: A dedicated card on the Reports page titled **Top Performing Agents** executes:
   ```sql
   SELECT a.agent_id, a.agent_name, COUNT(t.transaction_id) AS deals, SUM(t.sale_price) AS total_volume
   FROM agent a
   JOIN property p ON a.agent_id = p.agent_id
   JOIN transaction t ON p.property_id = t.property_id
   GROUP BY a.agent_id, a.agent_name
   HAVING SUM(t.sale_price) > 500000;
   ```
3. **`SUBQUERY`**: A button on the Properties page titled **Show Above Average Properties** triggers:
   ```sql
   SELECT * FROM property WHERE listing_price > (SELECT AVG(listing_price) FROM property);
   ```
4. **`ORDER BY`**: Clickable column headers across all data tables append dynamic `ORDER BY <column> ASC|DESC` clauses to the Oracle query.

### 9.3 Standalone Desktop GUI Application (Electron)
* Packaged via [main.js](file:///e:/DB%20Project/main.js).
* Spawns the Express backend as a background child process automatically upon startup.
* Opens a native, frameless/clean-menu desktop window (1320x860) hosting the React interface.
* Listens for window close events and gracefully terminates the Node.js server child process.

### 9.4 REST API Specifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend server health check |
| `GET` | `/api/health/db` | Direct Oracle DB ping query (`SELECT 1 FROM dual`) |
| `POST` | `/api/auth/login` | User authentication returning JWT token & role metadata |
| `GET` | `/api/dashboard` | Aggregated metrics for Recharts & summary widgets |
| `GET` | `/api/reports` | Analytical summaries (Value by Category, Top Agents, Price Variance) |
| `GET`, `POST` | `/api/agents` | Retrieve all agents / Insert new agent |
| `GET`, `PUT`, `DELETE` | `/api/agents/:id` | Read single agent / Update agent / Delete agent |
| `GET`, `POST` | `/api/categories` | Retrieve all categories / Insert new category |
| `GET`, `PUT`, `DELETE` | `/api/categories/:id` | Read single category / Update category / Delete category |
| `GET`, `POST` | `/api/properties` | Retrieve all properties / Insert new property |
| `GET`, `PUT`, `DELETE` | `/api/properties/:id` | Read single property / Update property / Delete property |
| `GET`, `POST` | `/api/clients` | Retrieve all clients / Insert new client |
| `GET`, `PUT`, `DELETE` | `/api/clients/:id` | Read single client / Update client / Delete client |
| `GET`, `POST` | `/api/showings` | Retrieve all showings / Schedule new showing |
| `GET`, `PUT`, `DELETE` | `/api/showings/:id` | Read single showing / Reschedule / Cancel showing |
| `GET`, `POST` | `/api/offers` | Retrieve all offers / Submit new offer |
| `GET`, `PUT`, `DELETE` | `/api/offers/:id` | Read single offer / Update status / Retract offer |
| `GET`, `POST` | `/api/transactions` | Retrieve transactions / Finalize sale contract |
| `GET`, `PUT`, `DELETE` | `/api/transactions/:id` | Read transaction / Audit / Update transaction |

---

## 10. Execution & Deployment Guide

### Option 1: Standalone Desktop GUI (Recommended)
Double-click [run-desktop.bat](file:///e:/DB%20Project/run-desktop.bat) or run from Windows Command Prompt:
```bat
cd "E:\DB Project"
npm run desktop
```
*Spawns the backend service, connects to Oracle DB, and opens the native desktop application.*

---

### Option 2: Running via Batch Scripts

The root directory provides automated Windows batch scripts:
* [run-desktop.bat](file:///e:/DB%20Project/run-desktop.bat): Launches the complete desktop app.
* [run-backend.bat](file:///e:/DB%20Project/run-backend.bat): Starts Express server on `http://localhost:5000`.
* [run-frontend.bat](file:///e:/DB%20Project/run-frontend.bat): Starts Vite dev server on `http://localhost:3000`.
* [seed-db.bat](file:///e:/DB%20Project/seed-db.bat): Runs the safe, idempotent database seeder.
* [inspect-db.bat](file:///e:/DB%20Project/inspect-db.bat): Inspects Oracle connection status, schema structures, and table counts.

---

### Option 3: Manual Command Prompt Execution

#### Step 1: Inspect Database Status & Tables
```bat
cd "E:\DB Project\backend"
npm run inspect
```

#### Step 2: Seed the Database
```bat
cd "E:\DB Project\backend"
npm run seed
```
> **Safety Guarantee**: The seeder in [seed.js](file:///e:/DB%20Project/backend/scripts/seed.js) checks for existing records, prevents duplicate key collisions, enforces foreign key insertion order (`AGENT` → `CATEGORY` → `PROPERTY` → `CLIENT` → `SHOWING` → `OFFER` → `TRANSACTION`), seeds RBAC users in `APP_USERS`, and executes in an atomic transaction that rolls back on any error.

#### Step 3: Launch Backend Server
```bat
cd "E:\DB Project\backend"
npm start
```
* Server URL: `http://localhost:5000`
* Health Check: `http://localhost:5000/api/health/db`

#### Step 4: Launch Frontend Interface (In a separate terminal)
```bat
cd "E:\DB Project\frontend"
npm run dev
```
* Web Access URL: `http://localhost:3000`

---

### Oracle Configuration (`backend/.env`)

Located at [backend/.env](file:///e:/DB%20Project/backend/.env):
```env
PORT=5000
DB_USER=SYSTEM
DB_PASSWORD=your_oracle_password
DB_CONNECT_STRING=localhost:1521/XE
DB_SCHEMA=SYSTEM
ORACLE_CLIENT_LIB_DIR=C:\oraclexe\app\oracle\product\11.2.0\server\bin
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_INCREMENT=2
DB_POOL_TIMEOUT=60
```
> **Windows Local OS Auth Support**: The backend automatically falls back to Windows Local OS Authentication (`SYSDBA`) if password authentication fails.

---

## 11. Project Repository File Map

* **Desktop Application Wrapper**:
  * [main.js](file:///e:/DB%20Project/main.js): Electron desktop main process lifecycle manager.
  * [package.json](file:///e:/DB%20Project/package.json): Root configuration and Electron scripts.
* **Batch Execution Scripts**:
  * [run-desktop.bat](file:///e:/DB%20Project/run-desktop.bat): One-click desktop launcher.
  * [run-backend.bat](file:///e:/DB%20Project/run-backend.bat): Backend launcher.
  * [run-frontend.bat](file:///e:/DB%20Project/run-frontend.bat): Frontend launcher.
  * [seed-db.bat](file:///e:/DB%20Project/seed-db.bat): One-click database seeder.
  * [inspect-db.bat](file:///e:/DB%20Project/inspect-db.bat): Database inspector.
* **Backend (`backend/`)**:
  * [backend/src/server.js](file:///e:/DB%20Project/backend/src/server.js): Express server entry point.
  * [backend/src/config/db.js](file:///e:/DB%20Project/backend/src/config/db.js): Oracle connection pool configuration.
  * [backend/src/controllers/dashboardController.js](file:///e:/DB%20Project/backend/src/controllers/dashboardController.js): Analytics controller.
  * [backend/src/controllers/categoryController.js](file:///e:/DB%20Project/backend/src/controllers/categoryController.js): Category controller.
  * [backend/scripts/seed.js](file:///e:/DB%20Project/backend/scripts/seed.js): Idempotent database seeder.
  * [backend/scripts/inspect-db.js](file:///e:/DB%20Project/backend/scripts/inspect-db.js): Database schema inspector.
  * [backend/sql/seed.sql](file:///e:/DB%20Project/backend/sql/seed.sql): Pure SQL seed script.
* **Frontend (`frontend/`)**:
  * [frontend/src/App.jsx](file:///e:/DB%20Project/frontend/src/App.jsx): Main router and role protection.
  * [frontend/src/components/Navbar.jsx](file:///e:/DB%20Project/frontend/src/components/Navbar.jsx): Navigation header.
  * [frontend/src/pages/PropertiesPage.jsx](file:///e:/DB%20Project/frontend/src/pages/PropertiesPage.jsx): Property management with SQL filters.
  * [frontend/src/pages/ReportsPage.jsx](file:///e:/DB%20Project/frontend/src/pages/ReportsPage.jsx): Analytical reports with GROUP BY & HAVING.
  * [frontend/src/pages/LoginPage.jsx](file:///e:/DB%20Project/frontend/src/pages/LoginPage.jsx): RBAC authentication login page.
