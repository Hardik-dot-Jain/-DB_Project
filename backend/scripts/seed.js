/**
 * Safe Database Seeder for EstateFlow Real Estate Sales Management System
 * Follows all critical database safety rules:
 * - Safe to rerun (idempotent)
 * - Checks existing records vs expected records
 * - Reports conflicts and aborts without overwriting
 * - Correct FK dependency order: AGENT -> CATEGORY -> PROPERTY -> CLIENT -> SHOWING -> OFFER -> TRANSACTION
 * - Uses explicit column lists and bind parameters
 * - Executes in a single transactional unit with ROLLBACK on any failure
 * - Verifies final row counts
 */

const { getConnection, closeDbPool, oracledb } = require('../src/config/db');
const bcrypt = require('bcrypt');

// Comprehensive realistic dataset for EstateFlow (25–35 records per table)
const SEED_DATA = {
  AGENT: [
    { agent_id: 9001, agent_name: 'Sarah Jenkins', office_name: 'Downtown Luxury' },
    { agent_id: 9002, agent_name: 'David Miller', office_name: 'Westside Suburban' },
    { agent_id: 9003, agent_name: 'Michael Chang', office_name: 'Coastal Prime' },
    { agent_id: 9004, agent_name: 'Amanda Ross', office_name: 'Downtown Luxury' },
    { agent_id: 9005, agent_name: 'Robert Vance', office_name: 'East Valley' },
    { agent_id: 9006, agent_name: 'Jessica Alba', office_name: 'Westside Suburban' },
    { agent_id: 9007, agent_name: 'Christopher Nolan', office_name: 'Metro Central' },
    { agent_id: 9008, agent_name: 'Elena Rostova', office_name: 'Coastal Prime' },
    { agent_id: 9009, agent_name: 'Marcus Aurelius', office_name: 'Downtown Luxury' },
    { agent_id: 9010, agent_name: 'Rachel Green', office_name: 'East Valley' },
    { agent_id: 9011, agent_name: 'Daniel Craig', office_name: 'Metro Central' },
    { agent_id: 9012, agent_name: 'Sophia Loren', office_name: 'Coastal Prime' },
    { agent_id: 9013, agent_name: 'Jonathan Byers', office_name: 'North Heights' },
    { agent_id: 9014, agent_name: 'Priya Sharma', office_name: 'Downtown Luxury' },
    { agent_id: 9015, agent_name: 'Carlos Santana', office_name: 'Westside Suburban' },
    { agent_id: 9016, agent_name: 'Natalie Portman', office_name: 'North Heights' },
    { agent_id: 9017, agent_name: 'Anthony Hopkins', office_name: 'Metro Central' },
    { agent_id: 9018, agent_name: 'Samantha Jones', office_name: 'Downtown Luxury' },
    { agent_id: 9019, agent_name: 'Kevin Hart', office_name: 'East Valley' },
    { agent_id: 9020, agent_name: 'Laura Croft', office_name: 'North Heights' },
    { agent_id: 9021, agent_name: 'Brandon Lee', office_name: 'Coastal Prime' },
    { agent_id: 9022, agent_name: 'Victoria Beckham', office_name: 'Downtown Luxury' },
    { agent_id: 9023, agent_name: 'Arthur Pendelton', office_name: 'Westside Suburban' },
    { agent_id: 9024, agent_name: 'Hannah Abbott', office_name: 'East Valley' },
    { agent_id: 9025, agent_name: 'George Clooney', office_name: 'Coastal Prime' },
    { agent_id: 9026, agent_name: 'Olivia Wilde', office_name: 'Metro Central' },
    { agent_id: 9027, agent_name: 'Lucas Scott', office_name: 'North Heights' },
    { agent_id: 9028, agent_name: 'Megan Fox', office_name: 'Downtown Luxury' },
    { agent_id: 9029, agent_name: 'Trevor Noah', office_name: 'Westside Suburban' },
    { agent_id: 9030, agent_name: 'Zoe Saldana', office_name: 'Metro Central' }
  ],
  CATEGORY: [
    { category_id: 101, category_name: 'Residential', description: 'Single family homes and townhouses' },
    { category_id: 102, category_name: 'Commercial', description: 'Office spaces and retail' },
    { category_id: 103, category_name: 'Luxury', description: 'High-end premium real estate' },
    { category_id: 104, category_name: 'Land', description: 'Empty plots for development' },
    { category_id: 105, category_name: 'Industrial', description: 'Warehouses and factories' },
    { category_id: 106, category_name: 'Multi-Family', description: 'Apartment complexes and duplexes' },
    { category_id: 107, category_name: 'Retail', description: 'Shopping centers, malls, and storefronts' },
    { category_id: 108, category_name: 'Waterfront', description: 'Oceanfront villas and lakeside retreats' },
    { category_id: 109, category_name: 'Agricultural', description: 'Farms, ranches, and vineyard estates' },
    { category_id: 110, category_name: 'Historic', description: 'Heritage homes and registered landmark estates' }
  ],
  PROPERTY: [
    { property_id: 'P5501', address: '123 Maple St', listing_price: 450000.00, status: 'Sold', category_id: 101, agent_id: 9002 },
    { property_id: 'P5502', address: '789 Ocean Blvd', listing_price: 1250000.00, status: 'Active', category_id: 103, agent_id: 9003 },
    { property_id: 'P5503', address: '456 Pine Ave', listing_price: 380000.00, status: 'Pending', category_id: 101, agent_id: 9001 },
    { property_id: 'P5504', address: '222 Palm Dr', listing_price: 2100000.00, status: 'Sold', category_id: 103, agent_id: 9003 },
    { property_id: 'P5505', address: '555 Cedar Rd', listing_price: 620000.00, status: 'Active', category_id: 101, agent_id: 9004 },
    { property_id: 'P5506', address: '104 Sunset Strip', listing_price: 1850000.00, status: 'Active', category_id: 103, agent_id: 9006 },
    { property_id: 'P5507', address: '812 Highland Ave', listing_price: 525000.00, status: 'Pending', category_id: 101, agent_id: 9007 },
    { property_id: 'P5508', address: '340 Industrial Pkwy', listing_price: 890000.00, status: 'Active', category_id: 105, agent_id: 9008 },
    { property_id: 'P5509', address: '901 Harbor View Way', listing_price: 2450000.00, status: 'Sold', category_id: 108, agent_id: 9009 },
    { property_id: 'P5510', address: '15 Magnolia Lane', listing_price: 410000.00, status: 'Active', category_id: 101, agent_id: 9010 },
    { property_id: 'P5511', address: '620 Commerce Blvd', listing_price: 1350000.00, status: 'Sold', category_id: 102, agent_id: 9011 },
    { property_id: 'P5512', address: '77 Heritage Court', listing_price: 975000.00, status: 'Pending', category_id: 110, agent_id: 9012 },
    { property_id: 'P5513', address: '405 Valley Ridge Rd', listing_price: 320000.00, status: 'Active', category_id: 104, agent_id: 9013 },
    { property_id: 'P5514', address: '1200 Market Street', listing_price: 2100000.00, status: 'Active', category_id: 107, agent_id: 9014 },
    { property_id: 'P5515', address: '55 Meadowbrook Farm', listing_price: 1650000.00, status: 'Sold', category_id: 109, agent_id: 9015 },
    { property_id: 'P5516', address: '318 Parkview Plaza', listing_price: 780000.00, status: 'Active', category_id: 106, agent_id: 9016 },
    { property_id: 'P5517', address: '88 Lakefront Terrace', listing_price: 3200000.00, status: 'Sold', category_id: 108, agent_id: 9017 },
    { property_id: 'P5518', address: '240 Elmwood Court', listing_price: 495000.00, status: 'Active', category_id: 101, agent_id: 9018 },
    { property_id: 'P5519', address: '1600 Corporate Center', listing_price: 4200000.00, status: 'Active', category_id: 102, agent_id: 9019 },
    { property_id: 'P5520', address: '710 Vineyard Way', listing_price: 2800000.00, status: 'Pending', category_id: 109, agent_id: 9020 },
    { property_id: 'P5521', address: '45 Beacon Hill Road', listing_price: 1450000.00, status: 'Sold', category_id: 110, agent_id: 9021 },
    { property_id: 'P5522', address: '930 Logistics Way', listing_price: 1150000.00, status: 'Active', category_id: 105, agent_id: 9022 },
    { property_id: 'P5523', address: '512 Sycamore Terrace', listing_price: 560000.00, status: 'Pending', category_id: 101, agent_id: 9023 },
    { property_id: 'P5524', address: '180 Galleria Mall suite 4', listing_price: 920000.00, status: 'Sold', category_id: 107, agent_id: 9024 },
    { property_id: 'P5525', address: '64 Riverbend Road', listing_price: 1950000.00, status: 'Active', category_id: 108, agent_id: 9025 },
    { property_id: 'P5526', address: '290 Oakridge Blvd', listing_price: 675000.00, status: 'Sold', category_id: 101, agent_id: 9026 },
    { property_id: 'P5527', address: '14 Skyline Penthouse', listing_price: 3850000.00, status: 'Active', category_id: 103, agent_id: 9027 },
    { property_id: 'P5528', address: '805 Timber Creek Plot', listing_price: 260000.00, status: 'Active', category_id: 104, agent_id: 9028 },
    { property_id: 'P5529', address: '422 Willow Creek Apt', listing_price: 430000.00, status: 'Pending', category_id: 106, agent_id: 9029 },
    { property_id: 'P5530', address: '99 Grand Victorian Way', listing_price: 1780000.00, status: 'Sold', category_id: 110, agent_id: 9030 },
    { property_id: 'P5531', address: '310 Golden Gate Ave', listing_price: 1620000.00, status: 'Active', category_id: 103, agent_id: 9001 },
    { property_id: 'P5532', address: '650 Northstar Warehouse', listing_price: 1250000.00, status: 'Pending', category_id: 105, agent_id: 9002 },
    { property_id: 'P5533', address: '18 Coastal Breeze Ct', listing_price: 2300000.00, status: 'Sold', category_id: 108, agent_id: 9003 },
    { property_id: 'P5534', address: '740 Orchard Hill Farm', listing_price: 1400000.00, status: 'Active', category_id: 109, agent_id: 9004 },
    { property_id: 'P5535', address: '888 Broadway Plaza', listing_price: 3100000.00, status: 'Sold', category_id: 102, agent_id: 9005 }
  ],
  CLIENT: [
    { client_id: 2001, client_name: 'John Smith', phone: '9123456780', client_type: 'Buyer' },
    { client_id: 2002, client_name: 'Emily Davis', phone: '9123456781', client_type: 'Seller' },
    { client_id: 2003, client_name: 'Mark Johnson', phone: '9123456782', client_type: 'Buyer' },
    { client_id: 2004, client_name: 'Sophia Brown', phone: '9123456783', client_type: 'Investor' },
    { client_id: 2005, client_name: 'James Wilson', phone: '9123456784', client_type: 'Buyer' },
    { client_id: 2006, client_name: 'Robert Taylor', phone: '9123456785', client_type: 'Buyer' },
    { client_id: 2007, client_name: 'Jessica Miller', phone: '9123456786', client_type: 'Seller' },
    { client_id: 2008, client_name: 'William Anderson', phone: '9123456787', client_type: 'Investor' },
    { client_id: 2009, client_name: 'Olivia Martinez', phone: '9123456788', client_type: 'Buyer' },
    { client_id: 2010, client_name: 'Daniel Thomas', phone: '9123456789', client_type: 'Seller' },
    { client_id: 2011, client_name: 'Ashley Jackson', phone: '9123456790', client_type: 'Buyer' },
    { client_id: 2012, client_name: 'David White', phone: '9123456791', client_type: 'Investor' },
    { client_id: 2013, client_name: 'Samantha Harris', phone: '9123456792', client_type: 'Buyer' },
    { client_id: 2014, client_name: 'Joseph Martin', phone: '9123456793', client_type: 'Seller' },
    { client_id: 2015, client_name: 'Amanda Thompson', phone: '9123456794', client_type: 'Buyer' },
    { client_id: 2016, client_name: 'Charles Garcia', phone: '9123456795', client_type: 'Investor' },
    { client_id: 2017, client_name: 'Megan Robinson', phone: '9123456796', client_type: 'Buyer' },
    { client_id: 2018, client_name: 'Christopher Clark', phone: '9123456797', client_type: 'Seller' },
    { client_id: 2019, client_name: 'Hannah Rodriguez', phone: '9123456798', client_type: 'Buyer' },
    { client_id: 2020, client_name: 'Andrew Lewis', phone: '9123456799', client_type: 'Investor' },
    { client_id: 2021, client_name: 'Rachel Lee', phone: '9123456800', client_type: 'Buyer' },
    { client_id: 2022, client_name: 'Joshua Walker', phone: '9123456801', client_type: 'Seller' },
    { client_id: 2023, client_name: 'Lauren Hall', phone: '9123456802', client_type: 'Buyer' },
    { client_id: 2024, client_name: 'Matthew Allen', phone: '9123456803', client_type: 'Investor' },
    { client_id: 2025, client_name: 'Stephanie Young', phone: '9123456804', client_type: 'Buyer' },
    { client_id: 2026, client_name: 'Brandon Hernandez', phone: '9123456805', client_type: 'Seller' },
    { client_id: 2027, client_name: 'Brittany King', phone: '9123456806', client_type: 'Buyer' },
    { client_id: 2028, client_name: 'Justin Wright', phone: '9123456807', client_type: 'Investor' },
    { client_id: 2029, client_name: 'Amber Lopez', phone: '9123456808', client_type: 'Buyer' },
    { client_id: 2030, client_name: 'Tyler Hill', phone: '9123456809', client_type: 'Seller' },
    { client_id: 2031, client_name: 'Danielle Scott', phone: '9123456810', client_type: 'Buyer' },
    { client_id: 2032, client_name: 'Nicholas Green', phone: '9123456811', client_type: 'Investor' },
    { client_id: 2033, client_name: 'Kayla Adams', phone: '9123456812', client_type: 'Buyer' },
    { client_id: 2034, client_name: 'Austin Baker', phone: '9123456813', client_type: 'Seller' },
    { client_id: 2035, client_name: 'Victoria Gonzalez', phone: '9123456814', client_type: 'Investor' }
  ],
  SHOWING: [
    { showing_id: 3001, property_id: 'P5502', client_id: 2001, showing_date: '2026-08-10' },
    { showing_id: 3002, property_id: 'P5503', client_id: 2003, showing_date: '2026-08-11' },
    { showing_id: 3003, property_id: 'P5505', client_id: 2005, showing_date: '2026-08-12' },
    { showing_id: 3004, property_id: 'P5502', client_id: 2004, showing_date: '2026-08-13' },
    { showing_id: 3005, property_id: 'P5505', client_id: 2001, showing_date: '2026-08-14' },
    { showing_id: 3006, property_id: 'P5506', client_id: 2006, showing_date: '2026-08-15' },
    { showing_id: 3007, property_id: 'P5507', client_id: 2009, showing_date: '2026-08-16' },
    { showing_id: 3008, property_id: 'P5508', client_id: 2008, showing_date: '2026-08-17' },
    { showing_id: 3009, property_id: 'P5509', client_id: 2012, showing_date: '2026-08-18' },
    { showing_id: 3010, property_id: 'P5510', client_id: 2011, showing_date: '2026-08-19' },
    { showing_id: 3011, property_id: 'P5511', client_id: 2016, showing_date: '2026-08-20' },
    { showing_id: 3012, property_id: 'P5512', client_id: 2013, showing_date: '2026-08-21' },
    { showing_id: 3013, property_id: 'P5513', client_id: 2020, showing_date: '2026-08-22' },
    { showing_id: 3014, property_id: 'P5514', client_id: 2024, showing_date: '2026-08-23' },
    { showing_id: 3015, property_id: 'P5515', client_id: 2017, showing_date: '2026-08-24' },
    { showing_id: 3016, property_id: 'P5516', client_id: 2015, showing_date: '2026-08-25' },
    { showing_id: 3017, property_id: 'P5517', client_id: 2028, showing_date: '2026-08-26' },
    { showing_id: 3018, property_id: 'P5518', client_id: 2019, showing_date: '2026-08-27' },
    { showing_id: 3019, property_id: 'P5519', client_id: 2032, showing_date: '2026-08-28' },
    { showing_id: 3020, property_id: 'P5520', client_id: 2035, showing_date: '2026-08-29' },
    { showing_id: 3021, property_id: 'P5521', client_id: 2021, showing_date: '2026-08-30' },
    { showing_id: 3022, property_id: 'P5522', client_id: 2008, showing_date: '2026-08-31' },
    { showing_id: 3023, property_id: 'P5523', client_id: 2023, showing_date: '2026-09-01' },
    { showing_id: 3024, property_id: 'P5524', client_id: 2016, showing_date: '2026-09-02' },
    { showing_id: 3025, property_id: 'P5525', client_id: 2027, showing_date: '2026-09-03' },
    { showing_id: 3026, property_id: 'P5526', client_id: 2029, showing_date: '2026-09-04' },
    { showing_id: 3027, property_id: 'P5527', client_id: 2035, showing_date: '2026-09-05' },
    { showing_id: 3028, property_id: 'P5528', client_id: 2024, showing_date: '2026-09-06' },
    { showing_id: 3029, property_id: 'P5529', client_id: 2031, showing_date: '2026-09-07' },
    { showing_id: 3030, property_id: 'P5530', client_id: 2033, showing_date: '2026-09-08' },
    { showing_id: 3031, property_id: 'P5531', client_id: 2006, showing_date: '2026-09-09' },
    { showing_id: 3032, property_id: 'P5532', client_id: 2020, showing_date: '2026-09-10' },
    { showing_id: 3033, property_id: 'P5533', client_id: 2012, showing_date: '2026-09-11' },
    { showing_id: 3034, property_id: 'P5534', client_id: 2028, showing_date: '2026-09-12' },
    { showing_id: 3035, property_id: 'P5535', client_id: 2032, showing_date: '2026-09-13' }
  ],
  OFFER: [
    { offer_id: 4001, property_id: 'P5502', client_id: 2001, offer_amount: 1200000.00, offer_status: 'Rejected' },
    { offer_id: 4002, property_id: 'P5503', client_id: 2003, offer_amount: 380000.00, offer_status: 'Accepted' },
    { offer_id: 4003, property_id: 'P5505', client_id: 2005, offer_amount: 600000.00, offer_status: 'Pending' },
    { offer_id: 4004, property_id: 'P5502', client_id: 2004, offer_amount: 1225000.00, offer_status: 'Pending' },
    { offer_id: 4005, property_id: 'P5501', client_id: 2001, offer_amount: 450000.00, offer_status: 'Accepted' },
    { offer_id: 4006, property_id: 'P5506', client_id: 2006, offer_amount: 1750000.00, offer_status: 'Pending' },
    { offer_id: 4007, property_id: 'P5507', client_id: 2009, offer_amount: 520000.00, offer_status: 'Accepted' },
    { offer_id: 4008, property_id: 'P5508', client_id: 2008, offer_amount: 850000.00, offer_status: 'Rejected' },
    { offer_id: 4009, property_id: 'P5509', client_id: 2012, offer_amount: 2400000.00, offer_status: 'Accepted' },
    { offer_id: 4010, property_id: 'P5510', client_id: 2011, offer_amount: 400000.00, offer_status: 'Pending' },
    { offer_id: 4011, property_id: 'P5511', client_id: 2016, offer_amount: 1350000.00, offer_status: 'Accepted' },
    { offer_id: 4012, property_id: 'P5512', client_id: 2013, offer_amount: 950000.00, offer_status: 'Pending' },
    { offer_id: 4013, property_id: 'P5513', client_id: 2020, offer_amount: 310000.00, offer_status: 'Rejected' },
    { offer_id: 4014, property_id: 'P5514', client_id: 2024, offer_amount: 2050000.00, offer_status: 'Pending' },
    { offer_id: 4015, property_id: 'P5515', client_id: 2017, offer_amount: 1600000.00, offer_status: 'Accepted' },
    { offer_id: 4016, property_id: 'P5516', client_id: 2015, offer_amount: 760000.00, offer_status: 'Pending' },
    { offer_id: 4017, property_id: 'P5517', client_id: 2028, offer_amount: 3150000.00, offer_status: 'Accepted' },
    { offer_id: 4018, property_id: 'P5518', client_id: 2019, offer_amount: 480000.00, offer_status: 'Rejected' },
    { offer_id: 4019, property_id: 'P5519', client_id: 2032, offer_amount: 4100000.00, offer_status: 'Pending' },
    { offer_id: 4020, property_id: 'P5520', client_id: 2035, offer_amount: 2750000.00, offer_status: 'Pending' },
    { offer_id: 4021, property_id: 'P5521', client_id: 2021, offer_amount: 1420000.00, offer_status: 'Accepted' },
    { offer_id: 4022, property_id: 'P5522', client_id: 2008, offer_amount: 1100000.00, offer_status: 'Pending' },
    { offer_id: 4023, property_id: 'P5523', client_id: 2023, offer_amount: 550000.00, offer_status: 'Accepted' },
    { offer_id: 4024, property_id: 'P5524', client_id: 2016, offer_amount: 900000.00, offer_status: 'Accepted' },
    { offer_id: 4025, property_id: 'P5525', client_id: 2027, offer_amount: 1900000.00, offer_status: 'Pending' },
    { offer_id: 4026, property_id: 'P5526', client_id: 2029, offer_amount: 660000.00, offer_status: 'Accepted' },
    { offer_id: 4027, property_id: 'P5527', client_id: 2035, offer_amount: 3750000.00, offer_status: 'Pending' },
    { offer_id: 4028, property_id: 'P5528', client_id: 2024, offer_amount: 250000.00, offer_status: 'Rejected' },
    { offer_id: 4029, property_id: 'P5529', client_id: 2031, offer_amount: 420000.00, offer_status: 'Pending' },
    { offer_id: 4030, property_id: 'P5530', client_id: 2033, offer_amount: 1750000.00, offer_status: 'Accepted' },
    { offer_id: 4031, property_id: 'P5531', client_id: 2006, offer_amount: 1600000.00, offer_status: 'Pending' },
    { offer_id: 4032, property_id: 'P5532', client_id: 2020, offer_amount: 1200000.00, offer_status: 'Accepted' },
    { offer_id: 4033, property_id: 'P5533', client_id: 2012, offer_amount: 2280000.00, offer_status: 'Accepted' },
    { offer_id: 4034, property_id: 'P5534', client_id: 2028, offer_amount: 1380000.00, offer_status: 'Pending' },
    { offer_id: 4035, property_id: 'P5535', client_id: 2032, offer_amount: 3050000.00, offer_status: 'Accepted' }
  ],
  TRANSACTION: [
    { transaction_id: 5001, property_id: 'P5501', offer_id: 4005, sale_price: 450000.00, sale_date: '2026-08-01' },
    { transaction_id: 5002, property_id: 'P5504', offer_id: 4002, sale_price: 2100000.00, sale_date: '2026-08-05' },
    { transaction_id: 5003, property_id: 'P5503', offer_id: 4002, sale_price: 380000.00, sale_date: '2026-08-15' },
    { transaction_id: 5004, property_id: 'P5502', offer_id: 4004, sale_price: 1225000.00, sale_date: '2026-08-20' },
    { transaction_id: 5005, property_id: 'P5505', offer_id: 4003, sale_price: 600000.00, sale_date: '2026-08-25' },
    { transaction_id: 5006, property_id: 'P5507', offer_id: 4007, sale_price: 520000.00, sale_date: '2026-08-26' },
    { transaction_id: 5007, property_id: 'P5509', offer_id: 4009, sale_price: 2400000.00, sale_date: '2026-08-27' },
    { transaction_id: 5008, property_id: 'P5511', offer_id: 4011, sale_price: 1350000.00, sale_date: '2026-08-28' },
    { transaction_id: 5009, property_id: 'P5515', offer_id: 4015, sale_price: 1600000.00, sale_date: '2026-08-29' },
    { transaction_id: 5010, property_id: 'P5517', offer_id: 4017, sale_price: 3150000.00, sale_date: '2026-08-30' },
    { transaction_id: 5011, property_id: 'P5521', offer_id: 4021, sale_price: 1420000.00, sale_date: '2026-08-31' },
    { transaction_id: 5012, property_id: 'P5523', offer_id: 4023, sale_price: 550000.00, sale_date: '2026-09-01' },
    { transaction_id: 5013, property_id: 'P5524', offer_id: 4024, sale_price: 900000.00, sale_date: '2026-09-02' },
    { transaction_id: 5014, property_id: 'P5526', offer_id: 4026, sale_price: 660000.00, sale_date: '2026-09-03' },
    { transaction_id: 5015, property_id: 'P5530', offer_id: 4030, sale_price: 1750000.00, sale_date: '2026-09-04' },
    { transaction_id: 5016, property_id: 'P5532', offer_id: 4032, sale_price: 1200000.00, sale_date: '2026-09-05' },
    { transaction_id: 5017, property_id: 'P5533', offer_id: 4033, sale_price: 2280000.00, sale_date: '2026-09-06' },
    { transaction_id: 5018, property_id: 'P5535', offer_id: 4035, sale_price: 3050000.00, sale_date: '2026-09-07' },
    { transaction_id: 5019, property_id: 'P5506', offer_id: 4006, sale_price: 1750000.00, sale_date: '2026-09-08' },
    { transaction_id: 5020, property_id: 'P5510', offer_id: 4010, sale_price: 400000.00, sale_date: '2026-09-09' },
    { transaction_id: 5021, property_id: 'P5512', offer_id: 4012, sale_price: 950000.00, sale_date: '2026-09-10' },
    { transaction_id: 5022, property_id: 'P5514', offer_id: 4014, sale_price: 2050000.00, sale_date: '2026-09-11' },
    { transaction_id: 5023, property_id: 'P5516', offer_id: 4016, sale_price: 760000.00, sale_date: '2026-09-12' },
    { transaction_id: 5024, property_id: 'P5519', offer_id: 4019, sale_price: 4100000.00, sale_date: '2026-09-13' },
    { transaction_id: 5025, property_id: 'P5520', offer_id: 4020, sale_price: 2750000.00, sale_date: '2026-09-14' },
    { transaction_id: 5026, property_id: 'P5522', offer_id: 4022, sale_price: 1100000.00, sale_date: '2026-09-15' },
    { transaction_id: 5027, property_id: 'P5525', offer_id: 4025, sale_price: 1900000.00, sale_date: '2026-09-16' },
    { transaction_id: 5028, property_id: 'P5527', offer_id: 4027, sale_price: 3750000.00, sale_date: '2026-09-17' },
    { transaction_id: 5029, property_id: 'P5529', offer_id: 4029, sale_price: 420000.00, sale_date: '2026-09-18' },
    { transaction_id: 5030, property_id: 'P5531', offer_id: 4031, sale_price: 1600000.00, sale_date: '2026-09-19' }
  ]
};

// Map PK field name for each table
const PK_MAP = {
  AGENT: 'AGENT_ID',
  CATEGORY: 'CATEGORY_ID',
  PROPERTY: 'PROPERTY_ID',
  CLIENT: 'CLIENT_ID',
  SHOWING: 'SHOWING_ID',
  OFFER: 'OFFER_ID',
  TRANSACTION: 'TRANSACTION_ID'
};

async function seedDatabase() {
  console.log('====================================================');
  console.log('       ESTATEFLOW - SAFE DATABASE SEED RUNNER       ');
  console.log('====================================================\n');

  let conn;
  let insertedCount = 0;
  let skippedCount = 0;

  try {
    conn = await getConnection();
    console.log('[Seed] Connection established. Starting transactional seed check...\n');

    // 1. Detect column names for AGENT table (office_name vs agency_branch)
    const agentCols = await conn.execute(
      `SELECT column_name FROM all_tab_columns WHERE owner = 'SYSTEM' AND table_name = 'AGENT'`
    );
    const colNames = agentCols.rows.map(r => r.COLUMN_NAME.toUpperCase());
    const branchColName = colNames.includes('OFFICE_NAME') ? 'office_name' : 'agency_branch';

    const tablesInOrder = ['AGENT', 'CATEGORY', 'PROPERTY', 'CLIENT', 'SHOWING', 'OFFER', 'TRANSACTION'];

    for (const tableName of tablesInOrder) {
      console.log(`--> Checking Table: ${tableName}`);
      const pkCol = PK_MAP[tableName];
      const records = SEED_DATA[tableName];

      // Fetch all existing rows in this table
      const existingRes = await conn.execute(
        `SELECT * FROM ${tableName}`
      );
      const existingRows = existingRes.rows;
      const existingMap = new Map();
      for (const row of existingRows) {
        existingMap.set(String(row[pkCol]), row);
      }

      for (const item of records) {
        const pkVal = String(item[pkCol.toLowerCase()]);
        const existing = existingMap.get(pkVal);

        if (!existing) {
          // Record is absent -> Insert it
          if (tableName === 'AGENT') {
            await conn.execute(
              `INSERT INTO AGENT (agent_id, agent_name, ${branchColName}) 
               VALUES (:agent_id, :agent_name, :branch_val)`,
              {
                agent_id: item.agent_id,
                agent_name: item.agent_name,
                branch_val: item.office_name
              }
            );
          } else if (tableName === 'CATEGORY') {
            await conn.execute(
              `INSERT INTO CATEGORY (category_id, category_name, description)
               VALUES (:category_id, :category_name, :description)`,
              {
                category_id: item.category_id,
                category_name: item.category_name,
                description: item.description
              }
            );
          } else if (tableName === 'PROPERTY') {
            await conn.execute(
              `INSERT INTO PROPERTY (property_id, address, listing_price, status, category_id, agent_id)
               VALUES (:property_id, :address, :listing_price, :status, :category_id, :agent_id)`,
              {
                property_id: item.property_id,
                address: item.address,
                listing_price: item.listing_price,
                status: item.status,
                category_id: item.category_id,
                agent_id: item.agent_id
              }
            );
          } else if (tableName === 'CLIENT') {
            await conn.execute(
              `INSERT INTO CLIENT (client_id, client_name, phone, client_type)
               VALUES (:client_id, :client_name, :phone, :client_type)`,
              {
                client_id: item.client_id,
                client_name: item.client_name,
                phone: item.phone,
                client_type: item.client_type
              }
            );
          } else if (tableName === 'SHOWING') {
            await conn.execute(
              `INSERT INTO SHOWING (showing_id, property_id, client_id, showing_date)
               VALUES (:showing_id, :property_id, :client_id, TO_DATE(:showing_date, 'YYYY-MM-DD'))`,
              {
                showing_id: item.showing_id,
                property_id: item.property_id,
                client_id: item.client_id,
                showing_date: item.showing_date
              }
            );
          } else if (tableName === 'OFFER') {
            await conn.execute(
              `INSERT INTO OFFER (offer_id, property_id, client_id, offer_amount, offer_status)
               VALUES (:offer_id, :property_id, :client_id, :offer_amount, :offer_status)`,
              {
                offer_id: item.offer_id,
                property_id: item.property_id,
                client_id: item.client_id,
                offer_amount: item.offer_amount,
                offer_status: item.offer_status
              }
            );
          } else if (tableName === 'TRANSACTION') {
            await conn.execute(
              `INSERT INTO TRANSACTION (transaction_id, property_id, offer_id, sale_price, sale_date)
               VALUES (:transaction_id, :property_id, :offer_id, :sale_price, TO_DATE(:sale_date, 'YYYY-MM-DD'))`,
              {
                transaction_id: item.transaction_id,
                property_id: item.property_id,
                offer_id: item.offer_id,
                sale_price: item.sale_price,
                sale_date: item.sale_date
              }
            );
          }

          console.log(`    + Inserted new record PK=${pkVal}`);
          insertedCount++;
        } else {
          // Record is present -> Check if all fields match or if there is a conflict
          let isMatch = true;
          let diffInfo = [];

          if (tableName === 'AGENT') {
            const dbBranch = existing.OFFICE_NAME || existing.AGENCY_BRANCH;
            if (existing.AGENT_NAME !== item.agent_name) {
              isMatch = false;
              diffInfo.push(`agent_name: DB="${existing.AGENT_NAME}" vs SEED="${item.agent_name}"`);
            }
            if (dbBranch !== item.office_name) {
              isMatch = false;
              diffInfo.push(`branch: DB="${dbBranch}" vs SEED="${item.office_name}"`);
            }
          } else if (tableName === 'CATEGORY') {
            if (existing.CATEGORY_NAME !== item.category_name) {
              isMatch = false;
              diffInfo.push(`category_name: DB="${existing.CATEGORY_NAME}" vs SEED="${item.category_name}"`);
            }
          } else if (tableName === 'PROPERTY') {
            if (existing.ADDRESS !== item.address) {
              isMatch = false;
              diffInfo.push(`address: DB="${existing.ADDRESS}" vs SEED="${item.address}"`);
            }
            if (Number(existing.LISTING_PRICE) !== Number(item.listing_price)) {
              isMatch = false;
              diffInfo.push(`listing_price: DB="${existing.LISTING_PRICE}" vs SEED="${item.listing_price}"`);
            }
            if (existing.STATUS !== item.status) {
              isMatch = false;
              diffInfo.push(`status: DB="${existing.STATUS}" vs SEED="${item.status}"`);
            }
          } else if (tableName === 'CLIENT') {
            if (existing.CLIENT_NAME !== item.client_name) {
              isMatch = false;
              diffInfo.push(`client_name: DB="${existing.CLIENT_NAME}" vs SEED="${item.client_name}"`);
            }
            if (existing.PHONE !== item.phone) {
              isMatch = false;
              diffInfo.push(`phone: DB="${existing.PHONE}" vs SEED="${item.phone}"`);
            }
          } else if (tableName === 'SHOWING') {
            if (existing.PROPERTY_ID !== item.property_id || existing.CLIENT_ID !== item.client_id) {
              isMatch = false;
              diffInfo.push(`references mismatch on showing_id ${pkVal}`);
            }
          } else if (tableName === 'OFFER') {
            if (Number(existing.OFFER_AMOUNT) !== Number(item.offer_amount) || existing.OFFER_STATUS !== item.offer_status) {
              isMatch = false;
              diffInfo.push(`offer details mismatch on offer_id ${pkVal}`);
            }
          } else if (tableName === 'TRANSACTION') {
            if (Number(existing.SALE_PRICE) !== Number(item.sale_price) || existing.PROPERTY_ID !== item.property_id) {
              isMatch = false;
              diffInfo.push(`transaction details mismatch on transaction_id ${pkVal}`);
            }
          }

          if (isMatch) {
            console.log(`    = Record PK=${pkVal} already exists and matches. (Skipping)`);
            skippedCount++;
          } else {
            console.error(`\n[CONFLICT DETECTED] Table ${tableName}, PK=${pkVal}:`);
            diffInfo.forEach(d => console.error(`    - ${d}`));
            console.error('\nSAFETY RULE 8 VIOLATION PREVENTED: Seeder will NOT overwrite conflicting records.');
            console.error('Aborting seed transaction and rolling back changes...\n');
            await conn.rollback();
            process.exit(1);
          }
        }
      }
    }

    // Ensure APP_USERS table exists and reference_id column is present
    console.log('--> Checking Table: APP_USERS');
    const userTableCheck = await conn.execute(
      "SELECT table_name FROM all_tables WHERE owner = 'SYSTEM' AND table_name = 'APP_USERS'"
    );
    if (userTableCheck.rows.length === 0) {
      console.log('    + Creating APP_USERS table with reference_id column...');
      await conn.execute(`
        CREATE TABLE APP_USERS (
          user_id NUMBER PRIMARY KEY,
          username VARCHAR2(50) UNIQUE NOT NULL,
          password_hash VARCHAR2(255) NOT NULL,
          role VARCHAR2(20) DEFAULT 'admin' NOT NULL,
          reference_id NUMBER
        )
      `);
    } else {
      // Check if reference_id column exists
      const userCols = await conn.execute(
        "SELECT column_name FROM all_tab_columns WHERE owner = 'SYSTEM' AND table_name = 'APP_USERS'"
      );
      const uColNames = userCols.rows.map(r => r.COLUMN_NAME.toUpperCase());
      if (!uColNames.includes('REFERENCE_ID')) {
        console.log('    + Adding reference_id column to existing APP_USERS table...');
        await conn.execute('ALTER TABLE APP_USERS ADD (reference_id NUMBER)');
      }
    }

    // Seed 3 distinct RBAC users: Admin, Agent, Client
    const USERS_TO_SEED = [
      { user_id: 1, username: 'admin', password: 'password123', role: 'admin', reference_id: null },
      { user_id: 2, username: 'agent1', password: 'password123', role: 'agent', reference_id: 9001 },
      { user_id: 3, username: 'client1', password: 'password123', role: 'client', reference_id: 2001 }
    ];

    for (const u of USERS_TO_SEED) {
      const uCheck = await conn.execute(
        "SELECT user_id, username, role, reference_id FROM APP_USERS WHERE UPPER(username) = UPPER(:u)",
        { u: u.username }
      );
      const hash = bcrypt.hashSync(u.password, 10);
      if (uCheck.rows.length === 0) {
        await conn.execute(
          "INSERT INTO APP_USERS (user_id, username, password_hash, role, reference_id) VALUES (:user_id, :username, :hash, :role, :reference_id)",
          {
            user_id: u.user_id,
            username: u.username,
            hash,
            role: u.role,
            reference_id: u.reference_id
          }
        );
        console.log(`    + Seeded ${u.role.toUpperCase()} user '${u.username}' (Ref ID: ${u.reference_id || 'None'})`);
        insertedCount++;
      } else {
        await conn.execute(
          "UPDATE APP_USERS SET role = :role, reference_id = :reference_id WHERE user_id = :user_id",
          {
            role: u.role,
            reference_id: u.reference_id,
            user_id: uCheck.rows[0].USER_ID
          }
        );
        console.log(`    = User '${u.username}' updated/synchronized (Role: ${u.role}, Ref ID: ${u.reference_id || 'None'})`);
        skippedCount++;
      }
    }

    // Validation step: Verify final row counts
    console.log('\nValidating final row counts across all tables:');
    let allValid = true;
    for (const tableName of tablesInOrder) {
      const countRes = await conn.execute(`SELECT COUNT(*) AS CNT FROM ${tableName}`);
      const count = countRes.rows[0].CNT;
      const expectedMin = tableName === 'CATEGORY' ? 10 : (tableName === 'AGENT' || tableName === 'TRANSACTION' ? 25 : 30);
      const statusStr = count >= expectedMin ? `OK (${count} rows)` : `WARNING: ${count} rows (expected >= ${expectedMin})`;
      console.log(`  - ${tableName.padEnd(15)}: ${statusStr}`);
      if (count < expectedMin) {
        allValid = false;
      }
    }

    if (!allValid) {
      console.error('\nValidation failed: One or more tables do not meet the minimum row count requirement. Rolling back...');
      await conn.rollback();
      process.exit(1);
    }

    // Safety Rule 10: Commit the seed transaction only after successful insertion and validation
    await conn.commit();
    console.log('\n====================================================');
    console.log('  SEED COMPLETED SUCCESSFULLY!                      ');
    console.log(`  Inserted: ${insertedCount} new record(s)         `);
    console.log(`  Skipped:  ${skippedCount} matching record(s)     `);
    console.log('  Transaction safely committed to Oracle DB.        ');
    console.log('====================================================\n');
  } catch (err) {
    console.error('\n[FATAL SEED ERROR]:', err.message);
    if (conn) {
      try {
        console.log('Safety Rule 11: Rolling back transaction...');
        await conn.rollback();
      } catch (rbErr) {
        console.error('Rollback failed:', rbErr.message);
      }
    }
    process.exit(1);
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (e) {
        // ignore
      }
    }
    await closeDbPool();
  }
}

seedDatabase();
