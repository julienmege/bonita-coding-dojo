# Vacation-management

This coding session required to use [BonitaBPMSubscription-7.1.2](https://drive.google.com/a/bonitasoft.com/file/d/0B1YJSVB3Qh-9WklYREpmcDZ6dFk/view?usp=sharing)

and you need to generate a [license](https://v2.customer.bonitasoft.com/license/request) 



##Use case description:

- login as walter.bates.
- create a vacation request (that create a [review task], and the related [business object]). 
- then logout/login as helen.kelly to review the vacation request into a custom page (see mokup below).
![Mockup](./mockup.png?raw=true "Mockup for the review vacation page") 


##Implementation overview:

![exercice](./part1_overview.jpg?raw=true "exercice overview") 


##Step by step:

Topics: Living application, custom page, BDM & rest api extension

- Download and install studio 7.1.2
- `git clone git@github.com:julienmege/bonita-coding-dojo.git`
- Import the .bos file contains in the "vacation-management" folder. It contains all the process, BDM and the organization to manage vacation request.
- Run `InitiateVacationAvailable` as walter.bates to setup the number of vacations for the members of the organization.
- Run `NewVacationRequest` as walter.bates to get some data going.

### Step 1
Build the UI which list helen.kelly tasks
- URL to grad Review request for current user
- Current user: `../API/system/session/current`
- Task Review request: `../API/bpm/humanTask?p=0&c=10&o=priority=DESC&f=state=ready&f=user_id={{user.user_id}}&f=name=Review Request`

/!\ Don't waste to much time on approve/refuse all request tool bar.

### Step 2
Mock what you need to update UI as required
Rest API will return
```JSON
[
    {
        "task": {
	          "id": 7
        },
        "vacationRequest": {
            "comments": null,
            "requesterBonitaBPMId": 4,
            "startDate": "2015-10-15T00:00:00+0000",
            "numberOfDays": 1,
            "returnDate": "2015-10-15T00:00:00+0000"
        }
    }
]
```

### Step 3
Build Rest API Extension to attach BDM information to task
- Documentation http://documentation.bonitasoft.com/how-access-and-display-business-data-custom-page-0
- Seed https://github.com/Bonitasoft-Community/rest-api-sql-data-source
- Permissions `task_visualization`
- Url to access `../API/extension/reviewRequests`

### Step 4
Wire all up.

### Step 5
Execute tasks 
```
POST {“status”: “approved”, “comment”: “Ok”} ../API/bpm/userTask/{{ $item.task.id }}/execution
```
Use fragment to have comment per task

/!\ POST doesn't work in the UI Designer during preview due to some redirection issues but it should work fine once in the Portal.

### Step 6
Create living app to let helen kelly use the Review Vacation Requests application.
