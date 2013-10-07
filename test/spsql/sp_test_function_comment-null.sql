CREATE OR REPLACE FUNCTION public.sp_test_function_comment()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
END;
$function$
;
COMMENT ON FUNCTION public.sp_test_function_comment()
IS 'This is a description to a postgreSQL function :) supporting '' escapes'
