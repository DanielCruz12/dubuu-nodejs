ALTER TABLE "bookings" ADD COLUMN "selected_dates" timestamp with time zone[];

CREATE OR REPLACE FUNCTION update_product_rating() 
RETURNS TRIGGER AS $$
DECLARE
  affected_product_id INT;
BEGIN
  -- Determina el product_id afectado
  affected_product_id := COALESCE(NEW.product_id, OLD.product_id);

  UPDATE products
  SET 
    average_rating = (
      SELECT COALESCE(AVG(r.rating), 0)
      FROM ratings r
      WHERE r.product_id = affected_product_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM ratings r
      WHERE r.product_id = affected_product_id
    )
  WHERE id = affected_product_id;

  RETURN NULL; -- para DELETE, o RETURN NEW si prefieres
END;
$$ LANGUAGE plpgsql;
