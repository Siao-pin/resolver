var should = require('should');

describe('Resolver', function() {
    describe('addParameter()', function () {
        it('should throw error if added parameter is not valid', function () {
            var resolver = getResolver();

            (function() {
                resolver.addParameter(123);
            }).should.throw();

            (function() {
                resolver.addParameter('string');
            }).should.throw();

            (function() {
                resolver.addParameter(true);
            }).should.throw();

            (function() {
                resolver.addParameter(null);
            }).should.throw();

            (function() {
                resolver.addParameter([]);
            }).should.throw();

            (function() {
                resolver.addParameter({});
            }).should.throw();

            (function() {
                resolver.addParameter({ key: 'value' });
            }).should.throw();

            (function() {
                resolver.addParameter({ name : 'Fuck' });
            }).should.throw();

            (function() {
                resolver.addParameter({ name : 'Fuck', required: 'some string' })
            }).should.throw();

            (function() {
                resolver.addParameter({
                  name: 'Fuck',
                  required: true,
                  parent: ''
                })
            }).should.throw();

            (function() {
                resolver
                    .addParameter({
                        name: 'oldFuck',
                        required: true,
                        type: 'number'
                    })
                    .addParameter({
                      name: 'Fuck',
                      required: true,
                      parent: 'oldFuck'
                    })
                ;
            }).should.throw();
        });

        it('should throw error if parameter type is not valid', function() {
            var resolver = getResolver();

            (function() {
                resolver.addParameter({ name: 'param', required: true, type: 'wrongtype'});
            }).should.throw('Resolver error: wrong type "wrongtype"');
        });

        it('should throw error while attempting to set default value to required parameter', function() {
            var resolver = getResolver();

            (function() {
                resolver.addParameter({ name: 'param', required: true, default: 'default value'});
            }).should.throw('Resolver error: trying to set default value to required parameter');
        });

        it('should throw error if parameter type is set and default value\'s type doesn\'t match', function() {
            var resolver = getResolver();

            (function() {
                resolver.addParameter({ name: 'param', required: false, type: 'number', default: 'default value'});
            }).should.throw('Resolver error: default value doesn\'t match the param type');
        });

        it('should throw error if parameter\'s values is not an array', function() {
            var resolver = getResolver();

            (function() {
                resolver.addParameter({ name: 'param', required: true, values: 'not an array'});
            }).should.throw('Resolver error: available values is not an array');
        });

        it('should throw error if parameter\'s values is an empty array', function() {
            var resolver = getResolver();

            (function() {
                resolver.addParameter({ name: 'param', required: true, values: []});
            }).should.throw('Resolver error: available values array is empty');
        });

        it('should return parameter with available properties only', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
                .addParameter({ name: 'param3', required: true, some: 1, awesome: true })
                .addParameter({ name: 'param4', required: true })
            ;

            resolver.getParameter('param3').should.have.keys(
                'name', 'required', 'parent'
            );
            resolver.getParameter('param3')['name'].should.equal('param3');
        });

        it('should throw error if trying to overwrite parent parameter',
            function() {
                var resolver = getResolver();

                (function() {
                    resolver
                        .addParameter({
                            name: 'param1',
                            required: true,
                            parent: 'parent'
                        })
                        .addParameter({
                            name: 'parent',
                            required: true,
                            parent: null
                        });
                }).should.throw();
            });
    });

    describe('getAllParameters()', function() {
        it('should return an array with two objects if two valid parameters were added', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: false })
            ;

            resolver.getAllParameters().should.have.length(2);
            resolver.getAllParameters()[0].should.have.keys(
                'name', 'required', 'parent'
            );
            resolver.getAllParameters()[1].should.have.keys(
                'name', 'required', 'parent'
            );
        });

        it('should return two parameters if "parent" property ' +
        'set for only parameter', function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
            ;

            resolver.getAllParameters().should.have.length(2);
            resolver.getAllParameters()[0].name.should.be.equal('parent');
            should(resolver.getAllParameters()[0].parent).be.exactly(null);
            resolver.getAllParameters()[1].name.should.be.equal('param1');
            resolver.getAllParameters()[1].parent.should.be.exactly('parent');
        });

        it('should return 4 parameters if different "parent" properties ' +
        'set for 2 parameters', function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent1'
                })
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent2'
                })
            ;

            resolver.getAllParameters().should.have.length(4);
            resolver.getAllParameters()[0].should.have.properties({
                name: 'parent2',
                required: true,
                parent: null
            });
            resolver.getAllParameters()[1].should.have.properties({
                name: 'parent1',
                required: true,
                parent: null
            });
            resolver.getAllParameters()[2].should.have.properties({
                name: 'param1',
                required: true,
                parent: 'parent1'
            });
            resolver.getAllParameters()[3].should.have.properties({
                name: 'param1',
                required: true,
                parent: 'parent2'
            });
        });

        it('should return 3 parameters if the same "parent" property ' +
        'set for 2 parameters', function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param2',
                    required: true,
                    parent: 'parent'
                })
            ;

            resolver.getAllParameters().should.have.length(3);
            resolver.getAllParameters()[0].should.have.properties({
                name: 'parent',
                required: true,
                parent: null
            });
            resolver.getAllParameters()[1].should.have.properties({
                name: 'param1',
                required: true,
                parent: 'parent'
            });
            resolver.getAllParameters()[2].should.have.properties({
                name: 'param2',
                required: true,
                parent: 'parent'
            });
        });
    });

    describe('getParameter()', function() {
        it('should return null if no parameters were added', function() {
            var resolver = getResolver();

            (resolver.getParameter('some_parameter') === null).should.be.true;
        });

        it('should return null if parameter doesn\'t exist', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
                .addParameter({ name: 'param3', required: true })
            ;

            (resolver.getParameter('abscent parameter') === null).should.be.true;
        });

        it('should return parameter if parameter exists', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
                .addParameter({ name: 'param3', required: true })
                .addParameter({ name: 'param4', required: true })
            ;

            resolver.getParameter('param3').should.have.keys(
                'name', 'required', 'parent'
            );
            resolver.getParameter('param3')['name'].should.equal('param3');
        });

        it('should return no parameter parent defined and not exists',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
                .addParameter({ name: 'param3', required: true })
                .addParameter({ name: 'param4', required: true })
            ;

            should(resolver.getParameter('param3', 'parent')).be.exactly(null);
        });

        it('should return parameter for defined parent',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
                .addParameter({ name: 'param3', required: true })
                .addParameter({ name: 'param3', required: false, parent: 'parent' })
                .addParameter({ name: 'param4', required: true })
            ;

            resolver.getParameter('param3', 'parent').should.have.properties({
                name: 'param3',
                required: false,
                parent: 'parent'
            });
        });
    });

    describe('resolve()', function() {
        it('should return error if no parameters were added', function() {
            var resolver = getResolver();
            resolver.resolve({ param1: 'value1', param2: 'value2' }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('NO_RESOLVER_PARAMETERS');
            });
        });

        it('should return error if empty data was provided', function() {
            var resolver = getResolver();
            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
                .addParameter({ name: 'param3', required: true })
                .addParameter({ name: 'param4', required: true })
            ;

            resolver.resolve({}, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('EMPTY_DATA');
            });
        });

        it('should return error if even one of the required parameters is not specified', function() {
            var resolver = getResolver();
            resolver
                .addParameter({ name: 'param1', required: false })
                .addParameter({ name: 'param2', required: false })
                .addParameter({ name: 'param3', required: true })
                .addParameter({ name: 'param4', required: false })
            ;

            resolver.resolve({ param2: 'value', param1: 123, param4: true }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('NO_REQUIRED_PARAMETER');
                err.message.should.equal('Resolver error: "param3" required parameter not found');
            });
        });

        it('should return error if parameter has wrong type', function() {
            var resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, type: 'string' });

            resolver.resolve({ param: 123 }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_TYPE');
                err.message.should.equal('Resolver error: "param" has wrong type');
            });

            resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, type: 'number' });

            resolver.resolve({ param: 'string' }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_TYPE');
                err.message.should.equal('Resolver error: "param" has wrong type');
            });

            resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, type: 'boolean' });

            resolver.resolve({ param: 'string' }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_TYPE');
                err.message.should.equal('Resolver error: "param" has wrong type');
            });

            resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, type: 'string' });

            resolver.resolve({ param: {'loginsMap': {'test':'test'}} }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_TYPE');
                err.message.should.equal('Resolver error: "param" has wrong type');
            });

            resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, type: 'object' });

            resolver.resolve({ param: 'string' }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_TYPE');
                err.message.should.equal('Resolver error: "param" has wrong type');
            });

            resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, type: 'array' });

            resolver.resolve({ param: 'string' }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_TYPE');
                err.message.should.equal('Resolver error: "param" has wrong type');
            });
        });

        it('should return error if parameter\'s value was not found in specified values list', function() {
            var resolver = getResolver();
            resolver.addParameter({ name: 'param', required: true, values: [1, 1000, 10000] });

            resolver.resolve({ param: 123 }, function(err, data) {
                should(err).Error;
                should(data).exactly(undefined);
                err.name.should.equal('PARAMETER_WRONG_VALUE');
                err.message.should.equal('Resolver error: "param" has wrong value');
            });
        });

        it('should successfully validate two parameters with no additional constraints', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
            ;

            var data = {
                param1: 'some value',
                param2: 321
            };

            resolver.resolve(data, function(err, validated) {
                (err === null).should.be.true;
                validated.should.have.properties(data);
            });
        });

        it('should successfully validate and filter only two parameters with no additional constraints', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: false })
            ;

            var data = {
                param1: 'some value',
                param2: 321,
                param3: true,
                param4: null
            };

            resolver.resolve(data, function(err, validated) {
                (err === null).should.be.true;
                validated.should.have.properties({
                    param1: 'some value',
                    param2: 321
                });
            });
        });

        it('should successfully validate object-type parameter', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true, type: 'object' })
            ;

            var data = {
                param1: {'loginsMap': {'test':'test'}}
            };

            resolver.resolve(data, function(err, validated) {
                (err === null).should.be.true;
                validated.should.have.properties(data);
            });
        });

        it('should successfully validate array-type parameter', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true, type: 'array' })
            ;

            var data = {
                param1: ['value1', 'value2', 'value3']
            };

            resolver.resolve(data, function(err, validated) {
                (err === null).should.be.exactly(true);
                should(validated).have.properties(data);
            });
        });

        it('should paste default value to abscent optional parameter', function() {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: false, default: 321 })
            ;

            var data = {
                param1: 'some value'
            };

            resolver.resolve(data, function(err, validated) {
                (err === null).should.be.true;
                validated.should.have.properties({
                    param1: 'some value',
                    param2: 321
                });
            });
        });

        it('should fail if parameter\'s parent is not provided',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({name: 'param1', required: true, parent: 'parent'})
            ;

            var data = {
                param1: 'some value'
            };

            resolver.resolve(data, function(err, validated) {
                (err === null).should.be.true;
                should(err).Error;
                should(validated).exactly(undefined);
                err.name.should.equal('NO_REQUIRED_PARAMETER');
                err.message.should.equal('Resolver error: "parent" required parameter not found');
            });
        });

        it('should fail if parameter defined outside of the its parent',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({name: 'param1', required: true, parent: 'parent'})
            ;

            var data = {
                parent: {},
                param1: 'some value'
            };

            resolver.resolve(data, function(err, validated) {
                should(err).Error;
                should(validated).exactly(undefined);
                err.name.should.equal('NO_REQUIRED_PARAMETER');
                err.message.should.equal('Resolver error: "param1" required parameter not found');
            });
        });

        it('should succeed if parameter defined inside of its parent',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
            ;

            var data = {
                parent: {
                    param1: 'some value'
                }
            };

            resolver.resolve(data, function(err, validated) {
                should(err).be.exactly(null);
                validated.should.have.properties({
                    parent: {param1: 'some value'}
                });
                should(validated.param1).be.exactly(undefined);
            });
        });

        it('should succeed if parameters defined inside of its parent',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param2',
                    required: true,
                    parent: 'parent'
                })
            ;

            var data = {
                parent: {
                    param1: 'some value',
                    param2: 'another value'
                }
            };

            resolver.resolve(data, function(err, validated) {
                should(err).be.exactly(null);
                validated.should.have.properties(data);
                should(validated.param1).be.exactly(undefined);
                should(validated.param2).be.exactly(undefined);
            });
        });

        it('should succeed if 2 parameters defined inside of its parent and' +
        ' 1 outside',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param2',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param3',
                    required: true
                })
            ;

            var data = {
                parent: {
                    param1: 'some value',
                    param2: 'another value'
                },
                param3: 'blah'
            };

            resolver.resolve(data, function(err, validated) {
                should(err).be.exactly(null);
                validated.should.have.properties(data);
                should(validated.param1).be.exactly(undefined);
                should(validated.param2).be.exactly(undefined);
                should(validated.param3).be.exactly('blah');
            });
        });

        it('should succeed if 2 parameters defined inside of its parent and' +
        ' 2 inside another parent',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param2',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param3',
                    required: true,
                    parent: 'parent2'
                })
                .addParameter({
                    name: 'param4',
                    required: true,
                    parent: 'parent2'
                })
            ;

            var data = {
                parent: {
                    param1: 'some value',
                    param2: 'another value'
                },
                parent2: {
                    param3: 1,
                    param4: 2
                }
            };

            resolver.resolve(data, function(err, validated) {
                should(err).be.exactly(null);
                validated.should.have.properties(data);
                should(validated.param1).be.exactly(undefined);
                should(validated.param2).be.exactly(undefined);
                should(validated.param3).be.exactly(undefined);
                should(validated.param4).be.exactly(undefined);
            });
        });

        it('should succeed if 2 parameters defined inside of its parent and' +
        ' 1 inside another parent (one is optional)',
        function() {
            var resolver = getResolver();

            resolver
                .addParameter({
                    name: 'param1',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param2',
                    required: true,
                    parent: 'parent'
                })
                .addParameter({
                    name: 'param3',
                    required: false,
                    parent: 'parent2'
                })
                .addParameter({
                    name: 'param4',
                    required: true,
                    parent: 'parent2'
                })
            ;

            var data = {
                parent: {
                    param1: 'some value',
                    param2: 'another value'
                },
                parent2: {
                    param4: 2
                }
            };

            resolver.resolve(data, function(err, validated) {
                should(err).be.exactly(null);
                validated.should.have.properties(data);
                should(validated.param1).be.exactly(undefined);
                should(validated.param2).be.exactly(undefined);
                should(validated.param4).be.exactly(undefined);
            });
        });
    });

    describe('resolvePromise()', function() {
        it('should return Promise object', function() {
            var resolver = getResolver();
            var promise = resolver.resolvePromise({});

            promise.should.be.an.Object;
            (promise instanceof Promise).should.be.exactly(true);
        });

        it ('should be rejected if no parameters were specified', function() {
            var resolver = getResolver();
            var promise = resolver.resolvePromise({});

            promise
                .catch(function(err) {
                    err.name.should.equal('NO_RESOLVER_PARAMETERS');
                })
            ;
        });

        it ('should be fulfilled if data were successfully resolved', function(itdone) {
            var resolver = getResolver();

            resolver
                .addParameter({ name: 'param1', required: true })
                .addParameter({ name: 'param2', required: true })
            ;

            var data = {
                param1: 'some value',
                param2: 321
            };

            var promise = resolver.resolvePromise(data);

            promise
                .then(function(validated) {
                    validated.should.have.properties(data);
                    itdone();
                })
            ;
        });
    });
});

function getResolver()
{
    var resolverConstructor = require('../index');
    return new resolverConstructor();
}