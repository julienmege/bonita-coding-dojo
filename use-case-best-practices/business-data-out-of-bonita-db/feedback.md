# Feedback

## process d'exemple

* pas de form sur l'exemple leave request http://www.bonitasoft.com/for-you-to-read/process-library/employee-leave-management

## Connecteur DB

### Ne sait pas gérer: 

```sql
INSERT INTO "leave_request" ("user_id", "start_date", "end_date",
  "kind")
  VALUES ('${vUserId}', '${vStarDate}', '${vStarDate}', '${vKind}');

select currval('leave_request_request_id_seq');
```
    
* si séparateur = ";" : erreur SQL (select currval ne peut être appelé sans insert)
* si pas de séparateur : erreur du connecteur (ne bind pas la valeur)
* workaround : 2 appels


### Query builder 

* manque tooltip pour connaitre la syntaxe des variables '${...}'
* bouton test ne marche pas si il y a des variables
* pas accès au contrat en connecteur de sortie

## Groovy Sql

* /!\ classloader sur Sql.new Instance.

    * workaround: registerDriver(driver)
    * best practice: utiliser pool de connexion (plus dur à tester)

## Contrat 

### getUserTaskContractVariableValue(long userTaskInstanceId, String name) 

* pas d'object imbriqué 
* script au lieu de value
* pas facile de passer de simple à multiple

## Case admin : les scripts des connecteurs ne sont pas dans la liste
