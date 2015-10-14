# Use case best practices

This coding session required to use [BonitaBPMSubscription-7.1.2](https://drive.google.com/a/bonitasoft.com/file/d/0B1YJSVB3Qh-9WklYREpmcDZ6dFk/view?usp=sharing)

and you need to generate a [license](https://v2.customer.bonitasoft.com/license/request) 



##Use case description:

- login as walter.bates.
- create a vacation request (that create a [review task], and the related [business object]). 
- then logout/login as helen.kelly to review the vacation request into a custom page (see mokup below).
![Mockup](/use-case-best-practices/vacation-management/mockup.png?raw=true "Mockup for the review vacation page") 


##Implementation overview:

![exercice](/use-case-best-practices/vacation-management/part1_overview.jpg?raw=true "exercice overview") 


##Step by step Exercice:

1- import the .bos file contains in the "vacation-management" folder.
it contains all the process, BDM and the organization to manage vacation request.

2- Start the process [InitiateVacationAvailable] to setup the number of vacations for the members of the organization.

3- implement the rest API that build an object based on [Vacation request] and [Vacation business data].

4- implement the custom page using the UI-Designer base on the previous Rest API



