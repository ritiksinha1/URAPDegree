import cvxpy as cp
# hack to make * work as elementwise multiplication!
cp.Variable.__mul__ = lambda x, y: cp.multiply(x, y)
cp.Expression.__mul__ = lambda x, y: cp.multiply(x, y)
import numpy as np
from numpy import array
import functools
from numpy.distutils.misc_util import is_sequence
import re

class DegreeAudit:
    """ The main degree audit system that manages hierarchical requirements. """
    def __init__(self, entities = [], rules = []):
        self.entities = {}
        self.requirements = {}
        for r in entities + rules:
            self += eval(r)

    def create_entity(self, *args):
        """ Creates an entity object, representing an atomic quantity (i.e. a course, GPA). """
        e = Entity(*args)
        self.entities[e.name] = e

    def add_requirement(self, *args):
        """ Creates a requirements object, representing a combination of conditions of atomic quantities. """
        r = Requirement(*args)
        self.requirements[r.name] = r
        self.entities[r.name] = r

    def __add__(self, item):
        """ Shorthand for adding entities or requirements. """
        if not np.distutils.misc_util.is_sequence(item):
            item = [item]
        for i in item:
            self.entities[i.name] = i
            if isinstance(i, Requirement):
                self.requirements[i.name] = i
                i.entities = self.entities
        return self

    def __getitem__(self, item):
        """ Shorthand for fetching entities or requirements. """
        if item not in self.entities:
            raise ValueError("entity not found")
        return self.entities[item]

    def save(self, loc):
        lst = []
        for e in self.entities.values():
            lst.append(repr(e))
        for r in self.requirements.values():
            lst.append(repr(r))
        f = open(loc, 'w')
        f.write(repr(lst))
        f.close()

    def load(self, loc):
        lst = eval(open(loc, 'r').read())
        for l in lst:
            self += eval(l)
        return self

    def __repr__(self):
        return f'DegreeAudit({str(self.entities)}, {str(self.requirements)})'

    def __str__(self):
        return ', '.join(map(lambda x: f'{str(x[1])} satisfies {x[0]}', self.requirements.items()))

class Entity:
    def __init__(self, name, units = 4, value = False, metadata = None):
        """ Creates an entity object. The name is an alphanumeric primary key. """
        self.name = str(name)
        self.units = units
        self.metadata = metadata
        self.value = None
        self.set_value(value) #np.array([False] * size, dtype = 'uint8')
        # self._convert()

    def set_value(self, value):
        """ Sets value and converts to a CVXPY variable. """
        if not isinstance(value, np.ndarray):
            try:
                value = np.array([float(value)], dtype = 'float')
            except Exception as e:
                assert False, "must be a singular value"
        if isinstance(self.value, cp.expressions.variable.Variable) and self.value.size == len(value):
            self.value.value = value
        else:
            self.value = value
            self._convert()

    def _convert(self):
        """ Convert boolean or integer value to CVXPY variable if needed. """
        assert self.value is not None, "value is not specified"
        if isinstance(self.value, cp.expressions.variable.Variable):
            return self.value
        if isinstance(self.value, np.ndarray):
            assert self.value.dtype != np.bool, "must not be bool"
            v = cp.Variable(self.value.size)
            v.value = self.value
            self.value = v
            return self.value
        assert False, "must be of type bool or CVX variable"

    def __repr__(self):
        return f'Entity({repr(self.name)}, value = {repr(self.value.value)}, metadata = {repr(self.metadata)})'

    def __str__(self):
        return self.name

class EntityList(Entity):
    def __init__(self, name, entities):
        self.name = name
        self.entities = list(entities)

    def set_value(self, values):
        """ Sets value and converts to a CVXPY variable. """
        for entitity, value in zip(self.entities, values):
            entity.set_value(value)

    @property
    def units(self):
        return np.array([entity.units for entity in self.entities])

    @property
    def value(self):
        return [entity.value for entity in self.entities]

    def __repr__(self):
        return f'EntityList({repr(self.name)}, {repr(self.entities)})'

class Requirement(Entity):

    SUPPORTED_SYNTAX = tuple(map(re.compile, [' and ()', ' or ()', r'\$(\w+)\.units', r'\$(\w+)']))
    REPLACEMENT = (' * ', ' + ', r'self.entities["\1"].value * self.entities["\1"].units',
                   r'self.entities["\1"].value')

    """ Requirement is a subclass of Entity, so Requirements can be hierarchical! """
    def __init__(self, name, spec, entities = None):
        """ Creates a Requirement object, with name as a primary key. """
        self.name = name
        self.value = cp.Variable()
        self.value.value = False
        self.spec = spec
        self.entities = entities

        assert isinstance(spec, str), "spec must be string"
        assert entities is None or isinstance(entities, list), "entities must be list"

        self.entities = self._process_entities(entities)

    def _process_entities(self, entities):
        """ Processes entities from lists to a hashmap if needed. """
        if entities is not None:
            return {entity.name: entity for entity in entities}

    def _tokenize(self, string, return_children = False):
        children = []
        for i, syntax in enumerate(self.SUPPORTED_SYNTAX):
            if return_children:
                children.extend(re.findall(syntax, string))
            string = syntax.sub(self.REPLACEMENT[i], string)
        if return_children:
            return string, [child for child in children if child]
        return string

    def _convert(self):
        """ Convert spec to an evaluation being as lazy as possible. """
        try:
            # return eval(p.sub(r'self.entities["\1"].value', self.spec).replace(' and ', ' * ').replace(' or ', ' + '))
            return eval(self._tokenize(self.spec))
        except TypeError as msg:
            p = cp.Variable()
            p.value = False
            return p

    def satisfied(self):
        """ Returns whether the requirement is satisfied. """
        self.value = self._convert()
        ret = self.value is not None and self.value.value > 0
        return ret

    def __repr__(self):
        return f'Requirement({repr(self.name)}, {repr(self.spec)})'

    def __str__(self):
        return self.spec

def AtLeastKCourses(lst, k):
    """ Requirement specification for taking at least k courses from lst. """
    assert isinstance(k, int), "must be an int"
    lst = list(lst)
    # print(lst)
    v = cp.maximum(cp.sum(lst) - k + 0.01, 0)
    return v

def AtLeastOneCourse(lst):
    """ Requirement specification for taking at least 1 course from lst. """
    return AtLeastKCourses(lst, 1)

def AtLeastKUnits(lst, k):
    assert isinstance(k, int), "must be an int"
    lst = list(lst)
    v = cp.maximum(cp.sum(lst) - k + 0.01, 0)
    return v

def GreaterThan(var, value):
    """ Requirement specification having variable var be greater than value. """
    var = var if isinstance(var, list) else [var]
    value = value if isinstance(value, list) else [value]
    maxes = (cp.maximum(v1 - v2, 0) for v1, v2 in zip(var, value))
    return functools.reduce(cp.multiply, maxes)