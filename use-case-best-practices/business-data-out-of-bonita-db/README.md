# Manage business data out of bonita data base

## Business case

* leave request with Postgres business database


## Use case

* create a contract on task "Submit a new leave request"
    - startDate (DATE)
    - endDate (DATE)
    - kind (TEXT)
    
* create a form using UI Designer
    
* use postgres database connector to insert data and set process variable with the generated request_id

* bonus: add living app to display requests using examples: [page-apiExtensionDatasourceViewer.zip](page-apiExtensionDatasourceViewer.zip) and [Application_Data.xml](Application_Data.xml)


## Setup

* import .bos downloaded from http://www.bonitasoft.com/for-you-to-read/process-library/employee-leave-management : [leave-management-bpmn-model.bos](leave-management-bpmn-model.bos)
* parameters to connect to businessdata base : [postgresql.properties](postgresql.properties)
* postgres driver : [driver/postgresql-9.3-1102-jdbc41.jar](driver/postgresql-9.3-1102-jdbc41.jar)

## database model

```sql
CREATE TABLE leave_request
(
  request_id serial NOT NULL,
  user_id character varying(250),
  start_date date,
  end_date date,
  kind character varying(50)
);

COMMENT ON COLUMN leave_request.request_id IS 'primary key managed by postgres sequence';
COMMENT ON COLUMN leave_request.user_id IS 'user name. eg "walter.bates"';
COMMENT ON COLUMN leave_request.start_date IS 'first day of leave request';
COMMENT ON COLUMN leave_request.end_date IS 'last day of leave request';
COMMENT ON COLUMN leave_request.kind IS 'value from request_kind table';

CREATE TABLE request_kind
(
  kind character varying(50)
);

COMMENT ON COLUMN request_kind.kind IS 'business constant';
```

request_kind contains business constants:

```
kind         
-------------
RTT          
Annual leave 
```

request_id serial fiel create implicite sequence leave_request_request_id_seq

```sql
CREATE SEQUENCE leave_request_request_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
```  

### Sql tips
 
get next sequence value:
```sql
select nextval('leave_request_request_id_seq');
```

if you are in sql transaction with insert you can use:
```sql
INSERT INTO "leave_request" ("user_id", "start_date", "end_date",
  "kind")
  VALUES ('...', '...', '...', '...');

select currval('leave_request_request_id_seq');
```
