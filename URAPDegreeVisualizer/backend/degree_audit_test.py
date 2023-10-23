from degree_audit import *

lower_divs = ['CS_61A', 'CS_61B', 'CS_61C', 'EECS_16A', 'EECS_16B']

# assume there exists CS100, CS101, CS102, ..., CS189
cs_upper_divs = [f'CS_{i}' for i in range(100, 190)]

ee_upper_divs = ['EE_C128', 'EE_130', 'EE_140', 'EE_143', 'EE_192']
eecs_upper_divs = ['EECS_C106A', 'EECS_C106B', 'EECS_149', 'EECS_151']

# design upper divs
design_upper_divs = ['CS_152', 'CS_160', 'CS_161', 'CS_162', 'CS_164', 'CS_168', 'CS_169', 'CS_182', 'CS_184', 'CS_186']
design_upper_divs += ['EE_C128', 'EE_130', 'EE_140', 'EE_143', 'EE_192']
design_upper_divs += ['EECS_C106A', 'EECS_C106B', 'EECS_149', 'EECS_151']

all_upper_divs = cs_upper_divs + ee_upper_divs + eecs_upper_divs

print(all_upper_divs)

deg_audit = DegreeAudit()

# add GPA variable to degree audit
deg_audit += Entity('GPA')

# add courses 61ABC and a CS lower div requirement
lower_divs_list = {i: Entity(i) for i in lower_divs}
deg_audit += lower_divs_list.values()
deg_audit += EntityList('LowerDivs', lower_divs_list.values())


# add upper div courses and CS upper div requirements
upper_divs_list = {i: Entity(i) for i in all_upper_divs}
deg_audit += upper_divs_list.values()
deg_audit += EntityList('UpperDivs', upper_divs_list.values())

# add design upper divs
design_list = {i: upper_divs_list[i] for i in design_upper_divs}
deg_audit += EntityList('Design', design_list.values())

# add cs upper divs
cs_upper_divs_list = {i: upper_divs_list[i] for i in cs_upper_divs}
deg_audit += EntityList('CSUpperDivs', cs_upper_divs_list.values())

deg_audit += Requirement('Lower_Division_CS', '$CS_61A and $CS_61B and $EECS_16B')
deg_audit += Requirement('Design_CS', f"AtLeastOneCourse([$CS_152, $CS_160, $CS_161, $CS_162, $CS_164, $CS_168, $CS_169, $CS_182, $CS_184, $CS_186, $EE_C128, $EE_130, $EE_140, $EE_143, $EE_192, $EECS_C106A, $EECS_C106B, $EECS_149, $EECS_151])")
deg_audit += Requirement('Upper_Major_CS', f'AtLeastKCourses($CSUpperDivs, 2)')
deg_audit += Requirement('Upper_All_EECS', f'AtLeastKCourses($UpperDivs, 2)')
deg_audit += Requirement('Num_UpperDivs', f'AtLeastKUnits($UpperDivs.units, 27)')
deg_audit += Requirement('GPA_Req', f'GreaterThan($GPA, 2)')

#deg_audit += Requirement('some_group_1', f'$Design_CS or $Upper_Major_CS')

deg_audit += Requirement('CS', '$Design_CS and $Upper_Major_CS and $Upper_All_EECS and ' + \
                         '$Lower_Division_CS and $Num_UpperDivs and $GPA_Req')

# 'CS61A AND (CS61B OR CS61C AND CS70) OR DATA8 AND (PSYCH 1 OR PSYCH 2)'
# CS 61A, B, C, ......, CS 70

print(deg_audit['Design_CS'])

print(f"Should NOT satisfy lower div requirements: {deg_audit['Lower_Division_CS'].satisfied()}")
print(f"Should NOT satisfy design requirements: {deg_audit['Design_CS'].satisfied()}")
print(f"Should NOT satisfy upper CS major requirements: {deg_audit['Upper_Major_CS'].satisfied()}")
print(f"Should NOT satisfy upper EECS major requirements: {deg_audit['Upper_All_EECS'].satisfied()}")
print(f"Should NOT satisfy number of upper divs requirements: {deg_audit['Num_UpperDivs'].satisfied()}")
print(f"Should NOT satisfy CS degree requirements: {deg_audit['CS'].satisfied()}")

deg_audit['CS_61A'].set_value(True)
deg_audit['CS_61B'].set_value(True)

# should still not be satisfied
print(f"Should NOT satisfy lower div requirements yet: {deg_audit['Lower_Division_CS'].satisfied()}")

deg_audit['EECS_16A'].set_value(True)
deg_audit['EECS_16B'].set_value(True)
print(f"Should satisfy lower div requirements: {deg_audit['Lower_Division_CS'].satisfied()}")
print(f"Should NOT satisfy CS degree requirements: {deg_audit['CS'].satisfied()}")

deg_audit['CS_164'].set_value(True)
print(f"Should satisfy design requirements: {deg_audit['Design_CS'].satisfied()}")
print(f"Should NOT satisfy CS degree requirements: {deg_audit['CS'].satisfied()}")

deg_audit['GPA'].set_value(1.5)

print(f"Should satisfy lower div requirements: {deg_audit['Lower_Division_CS'].satisfied()}")
print(f"Should satisfy design requirements: {deg_audit['Design_CS'].satisfied()}")
print(f"Should satisfy upper CS major requirements: {deg_audit['Upper_Major_CS'].satisfied()}")
print(f"Should satisfy upper EECS major requirements: {deg_audit['Upper_All_EECS'].satisfied()}")
print(f"Should satisfy number of upper divs requirements: {deg_audit['Num_UpperDivs'].satisfied()}")
print(f"Should NOT satisfy GPA requirements: {deg_audit['GPA_Req'].satisfied()}")
print(f"Should NOT complete the CS major: {deg_audit['CS'].satisfied()}")

print('\n[INFO] save')
for r in deg_audit.requirements:
    print(f'{r}:', deg_audit[r].satisfied())

deg_audit.save('./rules/test.txt')
deg_audit_load = deg_audit.load('./rules/test.txt')
print(deg_audit_load)

print('\n[INFO] load')
for r in deg_audit_load.requirements:
    print(f'{r}:', deg_audit[r].satisfied())