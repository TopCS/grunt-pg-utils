CREATE TABLE IF NOT EXISTS test_sp
(
  id integer
);
INSERT INTO test_sp ( id ) VALUES ( 1 );
INSERT INTO test_sp ( id ) VALUES ( 2 );
INSERT INTO test_sp ( id ) VALUES ( 3 );
INSERT INTO test_sp ( id ) VALUES ( 4 );
SELECT * FROM test_sp;
DELETE FROM test_sp;