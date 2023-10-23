## Workflow
```bash
export LC_ALL=en_US.utf-8
export LANG=en_US.utf-8
export FLASK_ENV=development
export FLASK_APP=main.py
flask run -p 1368 # you may use screen command to run the flask service
```

## APIs
1. getCoursesByMajor
   
   To get courses by given major.
    - request POST  
        ```json
       {
           "data": {
                "major": "Computer Science"
           }
       }
       ```
   - response
        ```json
        {
            "code": 200,
            "data": {
                "course_id": [
                   "Computer Science_39K",
                   "Computer Science_189",
                   "Computer Science_9H",
                   "Computer Science_261",
                   "Computer Science_282"
               ],
           "course_title": [
               "Freshman/Sophomore Seminar",
               "Introduction to Knowledge-Based Systems and Languages",
               "Python for Programmers",
               "Security in Computer Systems",
               "Algebraic Algorithms"
               ]
           }
       }
        ```

2. saveRule
   
   To save the rule. 
    - request POST
        ```json
        {
            "data": {
                "rule_name": "test",
                "entities": [
                    {
                        "name": "LowerDivs",
                        "courses": ["CS_61A", "CS_61B", "EECS_16B"]
                    },
                    {
                        "name": "EECSUpperDivs",
                        "courses": ["EECS_C106A", "EECS_C106B", "EECS_149", "EECS_151"]
                    }
                ],
                "requirements": [
                    {
                        "name": "Lower_Division_CS",         
                        "type": "All",
                        "courses": "LowerDivs"
                    },
                    {
                        "name": "CSUpperDivs",
                        "type": "AtLeastOneCourse",
                        "courses": "EECSUpperDivs"
                    },
                    {
                        "name": "CSUpperDivs2",
                        "type": "AtLeastKCourses",
                        "courses": "EECSUpperDivs",
                        "k": 2
                    },
                    {
                        "name": "CSUpperDivs3",
                        "type": "AtLeastKUnits",
                        "courses": "EECSUpperDivs",
                        "units": 24
                    },
                    {
                        "name": "GPA_req",
                        "type": "GreaterThan",
                        "GPA": 2
                    },
                    {
                        "name": "ReqAndTest",
                        "type": "ReqAnd",
                        "reqs": ["GPA_req", "CSUpperDivs3"]
                    },
                    {
                        "name": "ReqOrTest",
                        "type": "ReqOr",
                        "reqs": ["GPA_req", "CSUpperDivs3"]
                    } 
                ]
            }
        }
        ```

    - response
        ```json
        {"code": 200}
        ```
3. getRule
   
   To retrieve the rule by rule_name.
    - request POST
        ```json
        {
            "data": {
                "rule_name": "test"
            }
        }
        ```
    - response
        ```json
        {
            "code": 200
            "data": {
                "rule_name": "test",
                "entities": [
                    {
                        "name": "LowerDivs",
                        "courses": ["CS_61A", "CS_61B", "EECS_16B"]
                    },
                    {
                        "name": "EECSUpperDivs",
                        "courses": ["EECS_C106A", "EECS_C106B", "EECS_149", "EECS_151"]
                    }
                ],
                "requirements": [
                    {
                        "name": "Lower_Division_CS",         
                        "type": "All",
                        "courses": "LowerDivs",
                    },
                    {
                        "name": "CSUpperDivs",
                        "type": "AtLeastOneCourse",
                        "courses": "EECSUpperDivs",
                    },
                    {
                        "name": "CSUpperDivs2",
                        "type": "AtLeastKCourse",
                        "courses": "EECSUpperDivs",
                        "k": 2,
                    },
                    {
                        "name": "CSUpperDivs3",
                        "type": "AtLeastKUnits",
                        "courses": "EECSUpperDivs",
                        "units": 24,
                    },
                    {
                        "name": "GPA_req",
                        "type": "GreaterThan",
                        "GPA": 2,
                    } 
                ]     
            }
        }
        ```


4. checkRule
   
   To check if given taken courses and GPA satisfy the rule requirements or not.
   - request POST
       ```json
        {
            "data": {
                "rule_name": "test",
                "taken_courses": ["CS_61A", "CS_61B", "EECS_16B"],
                "GPA": 3.0
            }
        }
       ```
   - response
       ```json
       {
           "code": 200
           "data": {
               "rule_name": "test",
               "entities": [
                   {
                       "name": "LowerDivs",
                       "courses": ["CS_61A", "CS_61B", "EECS_16B"]
                   },
                   {
                       "name": "EECSUpperDivs",
                       "courses": ["EECS_C106A", "EECS_C106B", "EECS_149", "EECS_151"]
                   }
               ],
               "requirements": [
                   {
                       "name": "Lower_Division_CS",         
                       "type": "All",
                       "courses": "LowerDivs",
                       "satisfied": "True"
                   },
                   {
                       "name": "CSUpperDivs",
                       "type": "AtLeastOneCourse",
                       "courses": "EECSUpperDivs",
                       "satisfied": "False"
                   },
                   {
                       "name": "CSUpperDivs2",
                       "type": "AtLeastKCourse",
                       "courses": "EECSUpperDivs",
                       "k": 2,
                       "satisfied": "False"
                   },
                   {
                       "name": "CSUpperDivs3",
                       "type": "AtLeastKUnits",
                       "courses": "EECSUpperDivs",
                       "units": 24,
                       "satisfied": "False"
                   },
                   {
                       "name": "GPA_req",
                       "type": "GreaterThan",
                       "GPA": 2,
                       "satisfied": "True"
                   },
                   {
                        "name": "ReqAndTest",
                        "type": "ReqAnd",
                        "reqs": ["GPA_req", "CSUpperDivs3"],
                        "satisfied": "False"
                    },
                    {
                        "name": "ReqOrTest",
                        "type": "ReqOr",
                        "reqs": ["GPA_req", "CSUpperDivs3"],
                        "satisfied": "True"
                    } 
               ]     
           }
       }
       ```
