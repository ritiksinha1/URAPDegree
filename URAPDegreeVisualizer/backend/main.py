import os
import json
import pandas as pd
import numpy as np
import re

from degree_audit import DegreeAudit, Entity, EntityList, Requirement
from flask import Flask, jsonify, make_response
from flask import request
from flask_cors import CORS, cross_origin
from os.path import isfile, join



RULE_DIR = '../../scribe_parser-main/scribe/'
COURSELIST_DIR = '../../scribe_parser-main/course_lists/'
# course_des = '/research/AskOski/system_versions/2022-04-16-22-06/explore/course_description_final.tsv'
course_des = './CSNAME_to_ID_lookup.csv'
course_des_df = pd.read_csv(course_des, sep='\t', index_col=0)

app = Flask(__name__)


# format: entities is a dictionary: keys are the name of the requirement, 
# values are the array of courses.
# on front end, if you try having a requirement with the same name
# as an existing one, raise an error
globalEntities = {}
#requirements: key = name of req, value = array: [completionLogic, entityName, or/and, [children]]
globalRequirements = {}


#metadata: degree = file to write/read
metadata = {"degree": "", "can_edit_reqs": "false", "can_see_course_lists": "false"}

@app.route("/getCoursesByMajor/<major>", methods=["POST", "GET"])
def get_courses_by_major(major):
    major = major.replace("_", " ")
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        courses = course_des_df[(course_des_df['DISC'] == major) & (course_des_df['IPEDS'] == 'SUNY Cortland')]
        print(courses['DISC'].str.cat(courses['NUM'], sep = " ").tolist())
        response = {'code': 200, 'data': {'course_id': courses['DISC'].str.cat(courses['NUM'], sep = "_").tolist(), 'course_title': courses['SHORT_TITLE'].tolist()}}
        response = jsonify(response)
        return _corsify_actual_response(response)
    else:
        raise RuntimeError("boop")

@app.route("/createDegree/<name>", methods = ["POST", "OPTIONS"])
def create_degree(name):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        with open(os.path.join(RULE_DIR, name + '.json'), 'w') as outfile:
            json.dump(["Requirement('Overall', '')"], outfile)
        response = jsonify("finished")
        return _corsify_actual_response(response)
    else:
        raise RuntimeError("boop")

@app.route("/saveRule", methods=["POST", "GET"])
def save_rule():
    data = request.json['data']
    rule_name = data['rule_name']
    rule = data['rule']
    with open(os.path.join(RULE_DIR, rule_name), 'w') as outfile:
        json.dump(rule, outfile)
    response = {'code': 200}
    return json.dumps(response)


@app.route("/getRule", methods=["POST", "GET"])
def get_rule():
    data = request.json['data']
    rule_name = data['rule_name']
    print('=' * 10)
    print(os.path.join(RULE_DIR, rule_name))
    response = {'code': 200, 'data': json.load(open(os.path.join(RULE_DIR, rule_name)))}
    return json.dumps(response)

@app.route("/setDegree/<info>", methods = ["POST", "OPTIONS"])
def set_degree(info):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        metadata["degree"] = info
        return _corsify_actual_response(jsonify(metadata))
    else:
        raise RuntimeError("boop")

@app.route("/saveEntity/<info>", methods=["POST", "OPTIONS"])
def save_entity(info):
    info = info.split('-')
    info[1] = info[1:]
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        print("x")
    elif request.method=="POST":
        globalEntities[info[0]] = info[1]
        response = globalEntities
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/saveRequirement/<info>", methods=["POST", "OPTIONS"])
def save_requirement(info):
    info = info.split('-')
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        globalRequirements[info[0]] = [info[1], info[2]]
        response = globalRequirements
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/saveRequirementOthers/<info>", methods=["POST", "OPTIONS"])
def save_requirement_others(info):
    info = info.split('-')
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        globalRequirements[info[0]] = [info[1], info[2]]
        response = globalRequirements
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/saveRequirementCategory/<info>", methods=["POST", "OPTIONS"])
def save_requirement_category(info):
    info = info.split('-')
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        print("x")
    elif request.method=="POST":
        #info[0] = name of category, info[1] = OR/AND, {} for children
        if(info[0] in globalRequirements):
            #if already saved but changing the Or/And value
            globalRequirements[info[0]][0] = info[1]
        else:
            globalRequirements[info[0]] = [info[1], {}]
        response = globalRequirements
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/requirementUpdateChildren/<info>", methods=["POST", "OPTIONS"])
def requirement_update_children(info):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        print("x")
    elif request.method=="POST":
        info = info.split('-')
        # name of parent - index of child - name of child
        globalRequirements[info[0]][1][info[1]] = info[2]
        response = globalRequirements
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/requirementDeleteChildren/<info>", methods=["POST", "OPTIONS"])
def requirement_delete_children(info):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        print("x")
    elif request.method=="POST":
        info = info.split('-')
        # name of parent - index of child - name of child
        if info[1] not in globalRequirements[info[0]][1]:
            return _corsify_actual_response(jsonify("nothing to delete"))
        name = globalRequirements[info[0]][1][info[1]]
        del globalRequirements[info[0]][1][info[1]]
        print(name)
        if name == "units_req" or name == "residence_req" or name == "GPA_req":
            toDelete = []
            for i in globalRequirements[info[0]][1]:
                if globalRequirements[info[0]][1][i] == "units_req":
                    toDelete.append(i)
                    del globalRequirements["units_req"]
                elif globalRequirements[info[0]][1][i] == "residence_req":
                    toDelete.append(i)
                    del globalRequirements["residence_req"]
                elif globalRequirements[info[0]][1][i] == "GPA_req":
                    toDelete.append(i)
                    del globalRequirements["GPA_req"]
            for index in toDelete:
                del globalRequirements[info[0]][1][index]

        del globalRequirements[name]
        response = globalRequirements
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/clearRequirements", methods=["POST", "OPTIONS"])
def clear_requirements():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        globalEntities.clear()
        globalRequirements.clear()
        response = globalRequirements
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/getAllSubjects", methods=["POST"])
def get_all_subjects():
    print(course_des_df['SUNY_ID'].value_counts())
    response = {'code': 200, 'data': {'course_subject': course_des_df[course_des_df['IPEDS'] == 'SUNY Cortland']['DISC'].tolist()}}
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST" or request.method=="GET":
        x = []
        [x.append(y) for y in response['data']['course_subject'] if y not in x]
        print(x)
        response = {'code': 200, 'data': {'course_subject': x}}
        response['data']['course_subject'].sort()
        response = response['data']['course_subject']
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")
    

@app.route("/getRules", methods=["POST"])
def get_rules():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        rule_name = metadata["degree"]
        deg_audit = DegreeAudit()
        data = json.load(open(os.path.join(RULE_DIR, rule_name + '.json')))
        response = {'code': 200}
        requirements = data
        #for deg_req in deg_audit.requirements:
         #   for idx, req in enumerate(requirements):
          #      if req['name'] == deg_req:
           #         requirements[idx]['satisfied'] = str(deg_audit[deg_req].satisfied()[0])
        response['data'] = data
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/getCourseListRules/<listName>", methods=["POST"])
def get_course_list_rules(listName):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        data = json.load(open(os.path.join(RULE_DIR + "course_lists/", listName + '.json')))
        response = {'code': 200}
        requirements = data
        response['data'] = data
        return _corsify_actual_response(jsonify(response))
    else:
        raise RuntimeError("boop")

@app.route("/getExistingRules", methods=["POST"])
def get_existing_rules():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        files = [f.split(".")[0] for f in os.listdir(RULE_DIR) if isfile(join(RULE_DIR, f)) and ".json" in f]
        return _corsify_actual_response(jsonify(files))
    else:
        raise RuntimeError("boop")

@app.route("/getExistingCourseList", methods=["POST"])
def get_existing_course_list():
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        files = [f.split(".")[0] for f in os.listdir(RULE_DIR + "course_lists/") if isfile(join(RULE_DIR + "course_lists/", f)) and ".json" in f]
        return _corsify_actual_response(jsonify(files))
    else:
        raise RuntimeError("boop")


def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route("/saveRules", methods=["POST"])
def save_rules():
    # requirements type: All, AtLeastOneCourse, AtLeastKCourses, AtLeastKUnits, GreaterThan
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
        print("x")
    elif request.method=="POST":
        data = {}
        print('yo')
        data['rule_name'] = metadata["degree"]
        data["entities"] = []

        
        for x in globalEntities:
            data["entities"].append({"name": x, "courses": globalEntities[x]})
        data["requirements"] = []
        for x in globalRequirements:
            if globalRequirements[x][0] == "GreaterThan" and x=="GPA_req":
                data["requirements"].append({"name": x, "type": "GreaterThan", "GPA": globalRequirements[x][1]})
            elif globalRequirements[x][0] == "GreaterThan" and x=="units_req":
                data["requirements"].append({"name": x, "type": "GreaterThan", "units": globalRequirements[x][1]})
            elif globalRequirements[x][0] == "GreaterThan" and x=="residence_req":
                data["requirements"].append({"name": x, "type": "GreaterThan", "residence_units": globalRequirements[x][1]})    
            elif globalRequirements[x][0] == "AND":
                data["requirements"].append({"name": x, "type": "ReqAnd", "reqs": list(globalRequirements[x][1].values())})
            elif globalRequirements[x][0] == "OR":
                data["requirements"].append({"name": x, "type": "ReqOr", "reqs": list(globalRequirements[x][1].values())})
            elif(re.match("all", globalRequirements[x][0].lower())):
                data["requirements"].append({"name": x, "type": "All", "courses": globalRequirements[x][1]})
            elif(re.match("at least 1 course", globalRequirements[x][0].lower())):
                k_found = re.search("[0-9]+", globalRequirements[x][0].lower())
                data["requirements"].append({"name": x, "type": "AtLeastOneCourse", "courses": globalRequirements[x][1]})
            elif(re.match("at least .+ courses", globalRequirements[x][0].lower())):
                k_found = re.search("[0-9]+", globalRequirements[x][0].lower())
                data["requirements"].append({"name": x, "type": "AtLeastKCourses", "courses": globalRequirements[x][1], "k": k_found.group()})
            elif(re.match("at least .+ units", globalRequirements[x][0].lower())):
                units_found = re.search("[0-9]+", globalRequirements[x][0].lower())
                data["requirements"].append({"name": x, "type": "AtLeastKUnits", "courses": globalRequirements[x][1], "units": units_found.group()})

            
        rule_name = data['rule_name']
        entities = data['entities']
        requirements = data['requirements']
        # TODO: will retrieve from enrollments data
        taken_courses = []
        #taken_courses = ["CS_61A", "CS_61B", "EECS_16B"]
        GPA = 3.0
        
        #deg_audit = DegreeAudit()
        #deg_audit += Entity('GPA')
        courses_dict = {}
        for entity in entities:
            courses = entity['courses']
            name = entity['name']
            courses_dict[name] = courses
            #courses = {i: Entity(i) for i in courses}
            #deg_audit += EntityList(name, courses.values())
            #deg_audit += courses.values()
            
        for requirement in requirements:
            name = requirement['name']
            type = requirement['type']
            requirement_detail = ''
            if type == 'All':
                courses = requirement['courses']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'All({courseList})'
            elif type == 'AtLeastOneCourse':
                courses = requirement['courses']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'AtLeastOneCourse({courseList})'
            elif type == 'AtLeastKCourses':
                courses = requirement['courses']
                k = requirement['k']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'AtLeastKCourses({courseList}, {k})'
            elif type == 'AtLeastKUnits':
                courses = requirement['courses']
                units = requirement['units']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'AtLeastKUnits({courseList}, {units})'
            elif type == 'GreaterThan' and name == "GPA_req":
                req_GPA = requirement['GPA']
                requirement_detail = f'GreaterThan($GPA, {req_GPA})'
            elif type == 'GreaterThan' and name == "units_req":
                req_units = requirement['units']
                requirement_detail = f'GreaterThan($Credits, {req_units})'
            elif type == 'GreaterThan' and name == "residence_req":
                req_units = requirement['residence_units']
                requirement_detail = f'GreaterThan($ResidenceCredits, {req_units})'
            elif type == 'ReqAnd':
                reqs = requirement['reqs']
                for i in reqs:
                    requirement_detail += f'${i} and '
                requirement_detail = requirement_detail[:-5]
            elif type == 'ReqOr':
                reqs = requirement['reqs']
                for i in reqs:
                    requirement_detail += f'${i} or '
                requirement_detail = requirement_detail[:-4]
            #deg_audit += Requirement(name, requirement_detail)
            requirement["detail"] = requirement_detail
        

        scribeParsedFormat = []
        for x in data["requirements"]:
            parsedString = "Requirement('" + x["name"] + "', '" + x["detail"] + "')"
            scribeParsedFormat.append(parsedString)

        with open(os.path.join(RULE_DIR, rule_name + '.json'), 'w') as outfile:
            json.dump(scribeParsedFormat, outfile)

        response = {'code': 200}
        return _corsify_actual_response(jsonify(globalRequirements))
    else:
        raise RuntimeError("boop")
    
@app.route("/saveCourseList/<info>", methods = ["POST"])
def save_course_list(info):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        entities = []
        for x in globalEntities:
            entities.append({"name": x, "courses": globalEntities[x]})

        courses_dict = {}
        for entity in entities:
            courses = entity['courses']
            name = entity['name']
            courses_dict[name] = courses
            courses = {i: Entity(i) for i in courses}

        toVisit = [info]
        data = []
        while toVisit:
            currentReq = toVisit.pop(0)
            if globalRequirements[currentReq][0] == "GreaterThan" and currentReq=="GPA_req":
                data.append({"name": currentReq, "type": "GreaterThan", "GPA": globalRequirements[currentReq][1]})
            elif globalRequirements[currentReq][0] == "GreaterThan" and currentReq=="units_req":
                data.append({"name": currentReq, "type": "GreaterThan", "units": globalRequirements[currentReq][1]})
            elif globalRequirements[currentReq][0] == "GreaterThan" and currentReq=="residence_req":
                data.append({"name": currentReq, "type": "GreaterThan", "residence_units": globalRequirements[currentReq][1]})    
            elif globalRequirements[currentReq][0] == "AND":
                data.append({"name": currentReq, "type": "ReqAnd", "reqs": list(globalRequirements[currentReq][1].values())})
                toVisit += list(globalRequirements[currentReq][1].values())
            elif globalRequirements[currentReq][0] == "OR":
                data.append({"name": currentReq, "type": "ReqOr", "reqs": list(globalRequirements[currentReq][1].values())})
                toVisit += list(globalRequirements[currentReq][1].values())
            elif(re.match("all", globalRequirements[currentReq][0].lower())):
                data.append({"name": currentReq, "type": "All", "courses": globalRequirements[currentReq][1]})
            elif(re.match("at least 1 course", globalRequirements[currentReq][0].lower())):
                k_found = re.search("[0-9]+", globalRequirements[currentReq][0].lower())
                data.append({"name": currentReq, "type": "AtLeastOneCourse", "courses": globalRequirements[currentReq][1]})
            elif(re.match("at least .+ courses", globalRequirements[currentReq][0].lower())):
                k_found = re.search("[0-9]+", globalRequirements[currentReq][0].lower())
                data.append({"name": currentReq, "type": "AtLeastKCourses", "courses": globalRequirements[currentReq][1], "k": k_found.group()})
            elif(re.match("at least .+ units", globalRequirements[currentReq][0].lower())):
                units_found = re.search("[0-9]+", globalRequirements[currentReq][0].lower())
                data.append({"name": currentReq, "type": "AtLeastKUnits", "courses": globalRequirements[currentReq][1], "units": units_found.group()})
        
        for requirement in data:
            name = requirement['name']
            type = requirement['type']
            requirement_detail = ''
            if type == 'All':
                courses = requirement['courses']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'All({courseList})'
            elif type == 'AtLeastOneCourse':
                courses = requirement['courses']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'AtLeastOneCourse({courseList})'
            elif type == 'AtLeastKCourses':
                courses = requirement['courses']
                k = requirement['k']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'AtLeastKCourses({courseList}, {k})'
            elif type == 'AtLeastKUnits':
                courses = requirement['courses']
                units = requirement['units']
                courseList = '['
                for i in courses_dict[courses]:
                    courseList += f'${i}, '
                courseList = courseList[:-2]
                courseList += ']'
                requirement_detail = f'AtLeastKUnits({courseList}, {units})'
            elif type == 'GreaterThan' and name == "GPA_req":
                req_GPA = requirement['GPA']
                requirement_detail = f'GreaterThan($GPA, {req_GPA})'
            elif type == 'GreaterThan' and name == "units_req":
                req_units = requirement['units']
                requirement_detail = f'GreaterThan($Credits, {req_units})'
            elif type == 'GreaterThan' and name == "residence_req":
                req_units = requirement['residence_units']
                requirement_detail = f'GreaterThan($ResidenceCredits, {req_units})'
            elif type == 'ReqAnd':
                reqs = requirement['reqs']
                for i in reqs:
                    requirement_detail += f'${i} and '
                requirement_detail = requirement_detail[:-5]
            elif type == 'ReqOr':
                reqs = requirement['reqs']
                for i in reqs:
                    requirement_detail += f'${i} or '
                requirement_detail = requirement_detail[:-4]
            requirement["detail"] = requirement_detail


        courseListParsedFormat = []

        for x in data:
            parsedString = "Requirement('" + x["name"] + "', '" + x["detail"] + "')"
            courseListParsedFormat.append(parsedString)

        with open(os.path.join(RULE_DIR + "course_lists/" + info + '.json'), 'w') as outfile:
            json.dump(courseListParsedFormat, outfile)

        return _corsify_actual_response(jsonify("success"))

@app.route("/login/<info>", methods = ["POST"])
def login(info):
    if request.method == "OPTIONS":
        return _build_cors_preflight_response()
    elif request.method=="POST":
        with open('password.json') as passwordFile:
            file_content = passwordFile.read()
        pw_json = json.loads(file_content)
        print(pw_json)
        if info in pw_json:
            if pw_json[info] == "guest":
                metadata["can_edit_reqs"]="false"
                metadata["can_see_course_lists"]="false"
            else:
                metadata["can_edit_reqs"]="true"
                metadata["can_see_course_lists"]="true"
            return _corsify_actual_response(jsonify("success"))
        else:
            return _corsify_actual_response(jsonify("fail"))



@app.route("/canSeeCourseLists", methods=["POST"])
def canSeeCourseLists():
    return _corsify_actual_response(jsonify(metadata["can_see_course_lists"]))

@app.route("/canEditReqs", methods=["POST"])
def canEditReqs():
    return _corsify_actual_response(jsonify(metadata["can_edit_reqs"]))

