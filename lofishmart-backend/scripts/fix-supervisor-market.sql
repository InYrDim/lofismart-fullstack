-- Quick fix: Assign supervisor1 to 'lelong' outlet
-- Run this in MySQL to fix the stock count visibility issue for SPVR role

-- First, find the lelong outlet ID
SELECT id, name FROM profile WHERE name LIKE '%lelong%';

-- Then update supervisor1's market_id (replace 'LELONG_ID' with the actual ID from above)
-- Example: UPDATE user SET market_id = 'LELONG_ID' WHERE username = 'supervisor1';

-- Or run this combined statement:
UPDATE user 
SET market_id = (
    SELECT id FROM profile 
    WHERE name LIKE '%lelong%' 
    LIMIT 1
) 
WHERE username = 'supervisor1';

-- Verify the change
SELECT u.username, u.name, u.role_id, u.market_id, p.name as outlet_name
FROM user u
LEFT JOIN profile p ON u.market_id = p.id
WHERE u.username = 'supervisor1';
