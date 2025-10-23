-- Clear existing plans and create new investment plans
DELETE FROM investment_plans;

-- Fortune Investment Plans - All 90 days duration with DAILY returns
INSERT INTO investment_plans (name, min_amount, max_amount, daily_return_rate, duration_days, description) VALUES

-- Starter Plan - KES 50-500 (10% DAILY return)
('Starter', 50.00, 500.00, 0.10, 90, 'Perfect for beginners! 10% daily return - KES 50 grows to KES 500+ in 90 days'),

-- Growth Plan - KES 501-1000 (11% DAILY return)
('Growth', 501.00, 1000.00, 0.11, 90, 'Steady growth! 11% daily return - KES 1000 grows to KES 10,890+ in 90 days'),

-- Premium Plan - KES 1001-10000 (12% DAILY return)
('Premium', 1001.00, 10000.00, 0.12, 90, 'Premium returns! 12% daily return - KES 10000 grows to KES 118,800+ in 90 days'),

-- VIP Plan - KES 10001-50000 (13% DAILY return)
('VIP', 10001.00, 50000.00, 0.13, 90, 'VIP exclusive! 13% daily return - KES 50000 grows to KES 635,000+ in 90 days'),

-- VVIP Plan - KES 50001-100000 (14% DAILY return)
('VVIP', 50001.00, 100000.00, 0.14, 90, 'VVIP elite! 14% daily return - KES 100000 grows to KES 1,360,000+ in 90 days'),

-- Gold Plan - KES 100001-1000000 (15% DAILY return)
('Gold', 100001.00, 1000000.00, 0.15, 90, 'Gold standard! 15% daily return - KES 1M grows to KES 14,500,000+ in 90 days');

-- Note: Daily rates are actual percentages (10% = 0.10, 11% = 0.11, etc.)
-- Users earn daily profits and can withdraw daily for 90 days
-- Total returns after 90 days = Principal + (Principal × daily_rate × 90)