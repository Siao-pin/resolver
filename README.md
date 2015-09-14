# Input Resolver

Resolver is helper object used for checking input data.

## Installation
```
npm install input-resolver --save-dev
```

## Instantiation
To start using **Resolver** you have to instantiate it. Its module exports **Resolver** constructor, not an object.

```js
var resolver = new (require('input-resolver'))();     // one-line instantiation

var resolverConstructor = require('input-resolver'); // instantiation via
var resolver = new resolverConstructor();        // construction function
```

## Add parameters
For parameters addition use `addParameter(<parameter>)` function. `<parameter>` object passed to `addParameter()`
function can accept properties:

- name (required)
- required (required)
- type
- default
- values

**type** property can be `string`, `number`, `boolean` or `object`. For optional parameters (**required** is `false`) **default**
value can be set, but be cautious: if you set **type** property for this parameter and **default** value's type doesn't
match it **Resolver** will throw an error:

```js
/* Throws: "Resolver error: default value doesn't match the param type" */
resolver.addParameter({ name: 'isActive', required: false, type: boolean, default: 'true' });
```

Also attempting to attach default value to required parameter lead to an error:
```js
/* Throws: "Resolver error: trying to set default value to required parameter" */
resolver.addParameter({ name: 'isActive', required: true, default: 'true' });
```

**values** parameter is an array of available values for parameter.

`addParameter()` returns **Resolver** object so it is chainable:

```js
resolver
    .addParameter({ name: 'username', required: true })
    .addParameter({ name: 'email', required: true })
    .addParameter({ name: 'description', required: false })
;
```

## Check input data
To check input data `resolve()` method is used:

```js
resolver
    .addParameter({ name: 'username', required: true })
    .addParameter({ name: 'email', required: true })
;

var resolved = resolver.resolve({ username: 'Ivan', email: 'ivan@russia.ru' }, function(err, data) {
    console.log(data)    
});

// output: { username: 'Ivan', email: 'ivan@russia.ru' }
```

Input object's properties that were not specified would be ignored:

```js
resolver
    .addParameter({ name: 'username', required: true })
;

var resolved = resolver.resolve({
    username: 'Ivan',
    email: 'ivan@russia.ru',
    description: 'This message will never be displayed'
}, function(err, data) {
    console.log(data);
});
// output: { username: 'Ivan' }
```

If required parameter is missing or parameter has wrong value or type the different type of Error will be returned. This
feature will help you to distinguish different error types.

### Putting it all together

```js
var resolver = new (require('input-resolver'))();

resolver
    .addParameter({ name: 'username', required: true })
    .addParameter({ name: 'email', required: true })
    .addParameter({ name: 'isActive', required: false, type: 'boolean' })
    .addParameter({ name: 'description', required: false, default: 'Default description' })
;

resolver.resolve(inputData, function(err, data) {
    if (err) {
        if ('NO_REQUIRED_PARAMETER' == err.name) {
            console.log('Some of the required parameter are not specified');
        } else if ('PARAMETER_WRONG_TYPE' == err.name) {
            console.log('"isActive" parameter has wrong type');
        }    
    } else {
        console.log('Data successfully validated');
    }
});
```

## Promises

Since v1.2.0 Input Resolver can return `Promise` object:

```js
resolver
    .addParameter({ name: 'username', required: true })
;

var promise = resolver.resolvePromise(someData);

promise
    .then(
        function(dataResolved) { /* validated data */ }, 
        function(err) { /* validation error */ }
    )
;
```
