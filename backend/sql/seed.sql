-- =====================================================================
-- EstateFlow - Real Estate Sales Management System
-- Database Seed Script: Expanded Comprehensive Sample Data
--
-- Strict Relational Insertion Order (Foreign Key Dependencies):
--   1. AGENT
--   2. CATEGORY
--   3. PROPERTY    (references CATEGORY, AGENT)
--   4. CLIENT
--   5. SHOWING     (references PROPERTY, CLIENT)
--   6. OFFER       (references PROPERTY, CLIENT)
--   7. TRANSACTION (references PROPERTY, OFFER)
--   8. APP_USERS   (authentication credentials)
-- =====================================================================

-- 1. AGENT (30 records)
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9001, 'Sarah Jenkins', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9002, 'David Miller', 'Westside Suburban');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9003, 'Michael Chang', 'Coastal Prime');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9004, 'Amanda Ross', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9005, 'Robert Vance', 'East Valley');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9006, 'Jessica Alba', 'Westside Suburban');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9007, 'Christopher Nolan', 'Metro Central');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9008, 'Elena Rostova', 'Coastal Prime');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9009, 'Marcus Aurelius', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9010, 'Rachel Green', 'East Valley');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9011, 'Daniel Craig', 'Metro Central');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9012, 'Sophia Loren', 'Coastal Prime');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9013, 'Jonathan Byers', 'North Heights');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9014, 'Priya Sharma', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9015, 'Carlos Santana', 'Westside Suburban');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9016, 'Natalie Portman', 'North Heights');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9017, 'Anthony Hopkins', 'Metro Central');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9018, 'Samantha Jones', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9019, 'Kevin Hart', 'East Valley');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9020, 'Laura Croft', 'North Heights');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9021, 'Brandon Lee', 'Coastal Prime');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9022, 'Victoria Beckham', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9023, 'Arthur Pendelton', 'Westside Suburban');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9024, 'Hannah Abbott', 'East Valley');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9025, 'George Clooney', 'Coastal Prime');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9026, 'Olivia Wilde', 'Metro Central');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9027, 'Lucas Scott', 'North Heights');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9028, 'Megan Fox', 'Downtown Luxury');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9029, 'Trevor Noah', 'Westside Suburban');
INSERT INTO agent (agent_id, agent_name, office_name) VALUES (9030, 'Zoe Saldana', 'Metro Central');

-- 2. CATEGORY (10 records)
INSERT INTO category (category_id, category_name, description) VALUES (101, 'Residential', 'Single family homes and townhouses');
INSERT INTO category (category_id, category_name, description) VALUES (102, 'Commercial', 'Office spaces and retail');
INSERT INTO category (category_id, category_name, description) VALUES (103, 'Luxury', 'High-end premium real estate');
INSERT INTO category (category_id, category_name, description) VALUES (104, 'Land', 'Empty plots for development');
INSERT INTO category (category_id, category_name, description) VALUES (105, 'Industrial', 'Warehouses and factories');
INSERT INTO category (category_id, category_name, description) VALUES (106, 'Multi-Family', 'Apartment complexes and duplexes');
INSERT INTO category (category_id, category_name, description) VALUES (107, 'Retail', 'Shopping centers, malls, and storefronts');
INSERT INTO category (category_id, category_name, description) VALUES (108, 'Waterfront', 'Oceanfront villas and lakeside retreats');
INSERT INTO category (category_id, category_name, description) VALUES (109, 'Agricultural', 'Farms, ranches, and vineyard estates');
INSERT INTO category (category_id, category_name, description) VALUES (110, 'Historic', 'Heritage homes and registered landmark estates');

-- 3. PROPERTY (35 records)
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5501', '123 Maple St', 450000.00, 'Sold', 101, 9002);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5502', '789 Ocean Blvd', 1250000.00, 'Active', 103, 9003);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5503', '456 Pine Ave', 380000.00, 'Pending', 101, 9001);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5504', '222 Palm Dr', 2100000.00, 'Sold', 103, 9003);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5505', '555 Cedar Rd', 620000.00, 'Active', 101, 9004);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5506', '104 Sunset Strip', 1850000.00, 'Active', 103, 9006);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5507', '812 Highland Ave', 525000.00, 'Pending', 101, 9007);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5508', '340 Industrial Pkwy', 890000.00, 'Active', 105, 9008);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5509', '901 Harbor View Way', 2450000.00, 'Sold', 108, 9009);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5510', '15 Magnolia Lane', 410000.00, 'Active', 101, 9010);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5511', '620 Commerce Blvd', 1350000.00, 'Sold', 102, 9011);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5512', '77 Heritage Court', 975000.00, 'Pending', 110, 9012);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5513', '405 Valley Ridge Rd', 320000.00, 'Active', 104, 9013);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5514', '1200 Market Street', 2100000.00, 'Active', 107, 9014);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5515', '55 Meadowbrook Farm', 1650000.00, 'Sold', 109, 9015);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5516', '318 Parkview Plaza', 780000.00, 'Active', 106, 9016);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5517', '88 Lakefront Terrace', 3200000.00, 'Sold', 108, 9017);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5518', '240 Elmwood Court', 495000.00, 'Active', 101, 9018);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5519', '1600 Corporate Center', 4200000.00, 'Active', 102, 9019);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5520', '710 Vineyard Way', 2800000.00, 'Pending', 109, 9020);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5521', '45 Beacon Hill Road', 1450000.00, 'Sold', 110, 9021);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5522', '930 Logistics Way', 1150000.00, 'Active', 105, 9022);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5523', '512 Sycamore Terrace', 560000.00, 'Pending', 101, 9023);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5524', '180 Galleria Mall suite 4', 920000.00, 'Sold', 107, 9024);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5525', '64 Riverbend Road', 1950000.00, 'Active', 108, 9025);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5526', '290 Oakridge Blvd', 675000.00, 'Sold', 101, 9026);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5527', '14 Skyline Penthouse', 3850000.00, 'Active', 103, 9027);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5528', '805 Timber Creek Plot', 260000.00, 'Active', 104, 9028);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5529', '422 Willow Creek Apt', 430000.00, 'Pending', 106, 9029);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5530', '99 Grand Victorian Way', 1780000.00, 'Sold', 110, 9030);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5531', '310 Golden Gate Ave', 1620000.00, 'Active', 103, 9001);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5532', '650 Northstar Warehouse', 1250000.00, 'Pending', 105, 9002);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5533', '18 Coastal Breeze Ct', 2300000.00, 'Sold', 108, 9003);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5534', '740 Orchard Hill Farm', 1400000.00, 'Active', 109, 9004);
INSERT INTO property (property_id, address, listing_price, status, category_id, agent_id) VALUES ('P5535', '888 Broadway Plaza', 3100000.00, 'Sold', 102, 9005);

-- 4. CLIENT (35 records)
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2001, 'John Smith', '9123456780', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2002, 'Emily Davis', '9123456781', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2003, 'Mark Johnson', '9123456782', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2004, 'Sophia Brown', '9123456783', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2005, 'James Wilson', '9123456784', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2006, 'Robert Taylor', '9123456785', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2007, 'Jessica Miller', '9123456786', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2008, 'William Anderson', '9123456787', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2009, 'Olivia Martinez', '9123456788', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2010, 'Daniel Thomas', '9123456789', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2011, 'Ashley Jackson', '9123456790', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2012, 'David White', '9123456791', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2013, 'Samantha Harris', '9123456792', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2014, 'Joseph Martin', '9123456793', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2015, 'Amanda Thompson', '9123456794', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2016, 'Charles Garcia', '9123456795', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2017, 'Megan Robinson', '9123456796', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2018, 'Christopher Clark', '9123456797', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2019, 'Hannah Rodriguez', '9123456798', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2020, 'Andrew Lewis', '9123456799', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2021, 'Rachel Lee', '9123456800', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2022, 'Joshua Walker', '9123456801', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2023, 'Lauren Hall', '9123456802', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2024, 'Matthew Allen', '9123456803', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2025, 'Stephanie Young', '9123456804', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2026, 'Brandon Hernandez', '9123456805', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2027, 'Brittany King', '9123456806', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2028, 'Justin Wright', '9123456807', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2029, 'Amber Lopez', '9123456808', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2030, 'Tyler Hill', '9123456809', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2031, 'Danielle Scott', '9123456810', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2032, 'Nicholas Green', '9123456811', 'Investor');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2033, 'Kayla Adams', '9123456812', 'Buyer');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2034, 'Austin Baker', '9123456813', 'Seller');
INSERT INTO client (client_id, client_name, phone, client_type) VALUES (2035, 'Victoria Gonzalez', '9123456814', 'Investor');

-- 5. SHOWING (35 records)
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3001, 'P5502', 2001, TO_DATE('2026-08-10', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3002, 'P5503', 2003, TO_DATE('2026-08-11', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3003, 'P5505', 2005, TO_DATE('2026-08-12', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3004, 'P5502', 2004, TO_DATE('2026-08-13', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3005, 'P5505', 2001, TO_DATE('2026-08-14', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3006, 'P5506', 2006, TO_DATE('2026-08-15', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3007, 'P5507', 2009, TO_DATE('2026-08-16', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3008, 'P5508', 2008, TO_DATE('2026-08-17', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3009, 'P5509', 2012, TO_DATE('2026-08-18', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3010, 'P5510', 2011, TO_DATE('2026-08-19', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3011, 'P5511', 2016, TO_DATE('2026-08-20', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3012, 'P5512', 2013, TO_DATE('2026-08-21', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3013, 'P5513', 2020, TO_DATE('2026-08-22', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3014, 'P5514', 2024, TO_DATE('2026-08-23', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3015, 'P5515', 2017, TO_DATE('2026-08-24', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3016, 'P5516', 2015, TO_DATE('2026-08-25', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3017, 'P5517', 2028, TO_DATE('2026-08-26', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3018, 'P5518', 2019, TO_DATE('2026-08-27', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3019, 'P5519', 2032, TO_DATE('2026-08-28', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3020, 'P5520', 2035, TO_DATE('2026-08-29', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3021, 'P5521', 2021, TO_DATE('2026-08-30', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3022, 'P5522', 2008, TO_DATE('2026-08-31', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3023, 'P5523', 2023, TO_DATE('2026-09-01', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3024, 'P5524', 2016, TO_DATE('2026-09-02', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3025, 'P5525', 2027, TO_DATE('2026-09-03', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3026, 'P5526', 2029, TO_DATE('2026-09-04', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3027, 'P5527', 2035, TO_DATE('2026-09-05', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3028, 'P5528', 2024, TO_DATE('2026-09-06', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3029, 'P5529', 2031, TO_DATE('2026-09-07', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3030, 'P5530', 2033, TO_DATE('2026-09-08', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3031, 'P5531', 2006, TO_DATE('2026-09-09', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3032, 'P5532', 2020, TO_DATE('2026-09-10', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3033, 'P5533', 2012, TO_DATE('2026-09-11', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3034, 'P5534', 2028, TO_DATE('2026-09-12', 'YYYY-MM-DD'));
INSERT INTO showing (showing_id, property_id, client_id, showing_date) VALUES (3035, 'P5535', 2032, TO_DATE('2026-09-13', 'YYYY-MM-DD'));

-- 6. OFFER (35 records)
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4001, 'P5502', 2001, 1200000.00, 'Rejected');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4002, 'P5503', 2003, 380000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4003, 'P5505', 2005, 600000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4004, 'P5502', 2004, 1225000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4005, 'P5501', 2001, 450000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4006, 'P5506', 2006, 1750000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4007, 'P5507', 2009, 520000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4008, 'P5508', 2008, 850000.00, 'Rejected');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4009, 'P5509', 2012, 2400000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4010, 'P5510', 2011, 400000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4011, 'P5511', 2016, 1350000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4012, 'P5512', 2013, 950000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4013, 'P5513', 2020, 310000.00, 'Rejected');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4014, 'P5514', 2024, 2050000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4015, 'P5515', 2017, 1600000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4016, 'P5516', 2015, 760000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4017, 'P5517', 2028, 3150000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4018, 'P5518', 2019, 480000.00, 'Rejected');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4019, 'P5519', 2032, 4100000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4020, 'P5520', 2035, 2750000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4021, 'P5521', 2021, 1420000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4022, 'P5522', 2008, 1100000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4023, 'P5523', 2023, 550000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4024, 'P5524', 2016, 900000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4025, 'P5525', 2027, 1900000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4026, 'P5526', 2029, 660000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4027, 'P5527', 2035, 3750000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4028, 'P5528', 2024, 250000.00, 'Rejected');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4029, 'P5529', 2031, 420000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4030, 'P5530', 2033, 1750000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4031, 'P5531', 2006, 1600000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4032, 'P5532', 2020, 1200000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4033, 'P5533', 2012, 2280000.00, 'Accepted');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4034, 'P5534', 2028, 1380000.00, 'Pending');
INSERT INTO offer (offer_id, property_id, client_id, offer_amount, offer_status) VALUES (4035, 'P5535', 2032, 3050000.00, 'Accepted');

-- 7. TRANSACTION (30 records)
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5001, 'P5501', 4005, 450000.00, TO_DATE('2026-08-01', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5002, 'P5504', 4002, 2100000.00, TO_DATE('2026-08-05', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5003, 'P5503', 4002, 380000.00, TO_DATE('2026-08-15', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5004, 'P5502', 4004, 1225000.00, TO_DATE('2026-08-20', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5005, 'P5505', 4003, 600000.00, TO_DATE('2026-08-25', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5006, 'P5507', 4007, 520000.00, TO_DATE('2026-08-26', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5007, 'P5509', 4009, 2400000.00, TO_DATE('2026-08-27', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5008, 'P5511', 4011, 1350000.00, TO_DATE('2026-08-28', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5009, 'P5515', 4015, 1600000.00, TO_DATE('2026-08-29', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5010, 'P5517', 4017, 3150000.00, TO_DATE('2026-08-30', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5011, 'P5521', 4021, 1420000.00, TO_DATE('2026-08-31', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5012, 'P5523', 4023, 550000.00, TO_DATE('2026-09-01', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5013, 'P5524', 4024, 900000.00, TO_DATE('2026-09-02', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5014, 'P5526', 4026, 660000.00, TO_DATE('2026-09-03', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5015, 'P5530', 4030, 1750000.00, TO_DATE('2026-09-04', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5016, 'P5532', 4032, 1200000.00, TO_DATE('2026-09-05', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5017, 'P5533', 4033, 2280000.00, TO_DATE('2026-09-06', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5018, 'P5535', 4035, 3050000.00, TO_DATE('2026-09-07', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5019, 'P5506', 4006, 1750000.00, TO_DATE('2026-09-08', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5020, 'P5510', 4010, 400000.00, TO_DATE('2026-09-09', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5021, 'P5512', 4012, 950000.00, TO_DATE('2026-09-10', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5022, 'P5514', 4014, 2050000.00, TO_DATE('2026-09-11', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5023, 'P5516', 4016, 760000.00, TO_DATE('2026-09-12', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5024, 'P5519', 4019, 4100000.00, TO_DATE('2026-09-13', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5025, 'P5520', 4020, 2750000.00, TO_DATE('2026-09-14', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5026, 'P5522', 4022, 1100000.00, TO_DATE('2026-09-15', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5027, 'P5525', 4025, 1900000.00, TO_DATE('2026-09-16', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5028, 'P5527', 4027, 3750000.00, TO_DATE('2026-09-17', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5029, 'P5529', 4029, 420000.00, TO_DATE('2026-09-18', 'YYYY-MM-DD'));
INSERT INTO transaction (transaction_id, property_id, offer_id, sale_price, sale_date) VALUES (5030, 'P5531', 4031, 1600000.00, TO_DATE('2026-09-19', 'YYYY-MM-DD'));

-- 8. APP_USERS (Role-Based Access Control: Admin, Agent, Client)
-- Password hashes generated with bcrypt 10 salt rounds (default password: password123)
-- Schema: user_id, username, password_hash, role, reference_id
INSERT INTO app_users (user_id, username, password_hash, role, reference_id)
VALUES (1, 'admin', '$2b$10$WZmPhyjUL5q7kedkqb1jiu3X49VtpSlNnqTcdaf5N6DsigG8w8KQO', 'admin', NULL);

INSERT INTO app_users (user_id, username, password_hash, role, reference_id)
VALUES (2, 'agent1', '$2b$10$WZmPhyjUL5q7kedkqb1jiu3X49VtpSlNnqTcdaf5N6DsigG8w8KQO', 'agent', 9001);

INSERT INTO app_users (user_id, username, password_hash, role, reference_id)
VALUES (3, 'client1', '$2b$10$WZmPhyjUL5q7kedkqb1jiu3X49VtpSlNnqTcdaf5N6DsigG8w8KQO', 'client', 2001);

COMMIT;
