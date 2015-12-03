# Vacation-management

This coding session required to use [BonitaBPMSubscription-7.1.2](https://drive.google.com/a/bonitasoft.com/file/d/0B1YJSVB3Qh-9WklYREpmcDZ6dFk/view?usp=sharing)

and you need to generate a [license](https://v2.customer.bonitasoft.com/license/request) 



##Use case description:

- login as `walter.bates`.
- create a vacation request (that create a [review task], and the related [business object]). 
- then logout/login as `helen.kelly` to review the vacation request into a custom page (see mokup below).
![Mockup](./mockup.png?raw=true "Mockup for the review vacation page") 


##Implementation overview:

![exercice](./part1_overview.jpg?raw=true "exercice overview") 


##Step by step:

Topics: Living application, custom page, BDM & rest api extension

- Download and install studio 7.1.2
- `git clone git@github.com:julienmege/bonita-coding-dojo.git`
- Import the .bos file contains in the "vacation-management" folder. It contains all the process, BDM and the organization to manage vacation request.
- Run `InitiateVacationAvailable` as `walter.bates` to setup the number of vacations for the members of the organization.
- Run `NewVacationRequest` as `walter.bates` to get some data going.
- Log in as `helen.kelly`. You should have Walter Bates vacation request to validate.

### Step 1
Build a custom page which list current user Review Request tasks.
- Grab current user: `../API/system/session/current`
- List review request tasks: `../API/bpm/humanTask?p=0&c=10&o=priority=DESC&f=state=ready&f=user_id={{user.user_id}}&f=name=Review request`

/!\ Don't waste to much time on approve/refuse all request tool bar.
/!\ Table/DataTable widgets doesn't support actions. Containers do.

### Step 2
We now need to get the business data associated to the task in order to show business information.
To finish the UI you can mock the REST API resource with the following JSON.
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

Label `{{ $item.vacationRequest.numberOfDays }} days from {{ $item.vacationRequest.startDate | date:'dd/MM/yy' }} to {{ $item.vacationRequest.returnDate | date:'dd/MM/yy'}}`

### Step 3
Build Rest API Extension to attach BDM information to task. We are trying to return something like:
```JSON
[
    {
        "task": { "id": 1 },
        "vacationRequest": { /* ... */ }
    },
    {
        "task": { "id": 2 },
        "vacationRequest": { /* ... */ }
    },
    {
        "task": { "id": 3 },
        "vacationRequest": { /* ... */ }
    }
]
```

You are already good to go using [review-requests-api-extension](./review-requests-api-extension) seed.

Take also a look at:
- Documentation http://documentation.bonitasoft.com/how-access-and-display-business-data-custom-page-0
- Official seed https://github.com/Bonitasoft-Community/rest-api-sql-data-source

Couple of thing to get started
- Take a look at the API permissions. We'll give the same permissions as task list page. `reviewRequests.permissions=task_visualization`
- Once deployed in the Portal, it should be accessible from [http://localhost:8080/bonita/API/extension/reviewRequests](http://localhost:8080/bonita/API/extension/reviewRequests)
- Also accessible from a UI Designer External API variable using `../API/extension/reviewRequests`.

What left?
- Use engine API to access task and business object. Note that the task context is your entry point to the business data reference.
- Good to know. To list current user available tasks use `.searchMyAvailableHumanTasks()`
- You also need to configure and add the business object DAO libs built by the studio to the project. You can find more about it in the documentation.
To get auto completion and build maven working you need to modify your `pom.xml`.
```XML
<dependency>
    <groupId>org.bonitasoft.bdm</groupId>
    <artifactId>bdm-dao</artifactId>
    <version>1.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/src/main/resources/lib/bdm-dao.jar</systemPath>
</dependency>
<dependency>
    <groupId>org.bonitasoft.bdm</groupId>
    <artifactId>bdm-model</artifactId>
    <version>1.0</version>
    <scope>system</scope>
    <systemPath>${project.basedir}/src/main/resources/lib/bdm-model.jar</systemPath>
</dependency>
```

/!\ You need to cast Business data reference when accessed using task's context. e.g. `context.get("vacationRequest_ref") as SimpleBusinessDataReference`

### Step 4
Wire all up. Modify previous mocked JSON variable to directly access your brand new REST API extension!

URL: `../API/extension/reviewRequests`

### Step 5
We now need to implement tasks execution to approve or refuse vacation requests.
- Verb: `POST``
- URL to call: `../API/bpm/userTask/{{ $item.task.id }}/execution`
- Data to send: `{"status": "approved", "comments": "Ok"}`

/!\ POST doesn't work in the UI Designer during preview due to some redirection issues but it should work fine once in the Portal.

### Step 6
Create living app to let helen kelly use the Review Vacation Requests application.
