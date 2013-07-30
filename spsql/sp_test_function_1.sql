CREATE OR REPLACE FUNCTION public.sp_test_function(l text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
RETURN l;
END;
$function$
