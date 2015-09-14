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

            resolver.getParameter('param3').should.have.keys('name', 'required');
            resolver.getParameter('param3')['name'].should.equal('param3');
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
            resolver.getAllParameters()[0].should.have.keys('name', 'required');
            resolver.getAllParameters()[1].should.have.keys('name', 'required');
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

            resolver.getParameter('param3').should.have.keys('name', 'required');
            resolver.getParameter('param3')['name'].should.equal('param3');
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