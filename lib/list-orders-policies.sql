-- List all policies on orders table
SELECT
  polname AS policy_name,
  polcmd AS command,
  pg_get_expr(polqual, polrelid) AS using_expr
FROM pg_policy
JOIN pg_class ON pg_policy.polrelid = pg_class.oid
WHERE pg_class.relname = 'orders';