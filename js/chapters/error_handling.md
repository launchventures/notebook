# Error handling 

During development, developer always tries to think about what can go wrong. Developer tries to handle these errors / exceptions in the code. Usually this includes: 

- Safely access data in data structure
    - Checking the length of list 
    - Check Key exists in the dictionary 
- Database constraint errors 
    - Duplicate Email address or username
    - Primary key violation
- Domain specific errors 
    - Email is not verified 
    - Shopping cart can have maximum 10 items
- Infrastructure errors 
    - File does not exist 
    - Network time out
    - Any error occurring outside system boundary

## EAFP vs LBYL

Python community has discussed two patterns for error handling & it applies to other programming languages also. 

### EAFP (Easier to ask for forgiveness than permission)  

In this pattern, we consider our assumptions about data/object structure are correct & catches an exception if the assumption proves false.

For example, we assume user object has the name property. If user object not have name property then calling split function on undefined will raise an exception.
```javascript
export function getGreeting(user) {
    // EAFP Style
    try{
        return 'Hi ' + user.name.split(' ')[0]
    }catch (ex) {
        return 'Hi '
    }
}
```

### LBYL (Look before you leap)

This coding pattern explicitly tests for pre-conditions before making calls or lookups. So before using name property we will check whether name is null or not.


```javascript
import * as _ from 'ramda';
export function getGreeting1(user) {
    // LBYL Style

    const name = user.name

    if(_.isNil(name)) {
       return 'Hi '
    }else {
        return 'Hi ' + user.name.split(' ')[0]
    }

    // const firstName = user.name?.split(' ')[0]
    // return 'Hi ' + (firstName || '')
    
}
```

### Notes 

- We should do the parsing or validation of the data at the system edges using libraries like [Joi](https://hapi.dev/module/joi/),[ajv](https://github.com/ajv-validator/ajv) or [io-ts](https://github.com/gcanti/io-ts).
- For safely accessing data, prefer using LBYL style. We can use the default values if the value is not present. In this case [pathOr](https://ramdajs.com/docs/#pathOr), [propOr](https://ramdajs.com/docs/#propOr) functions or [Short-circuit evaluation](https://en.wikipedia.org/wiki/Short-circuit_evaluation) helps us to write the expression in single line and handle the null values very well.
- If libraries you use throws the exceptions then prefer the EAFP style. DB exceptions, Infrastructure error can be handle using this categories. 

Let's look better ways to handle domain specific errors.

## Error as values 

We should try converting run time errors to compile time errors as much as possible. When you make error as first class citizens in your code it enforces developer to handle the exceptions, so that code will not get compiled if exception are not handled. 

Lets take simple example of Quotation service. Quotation service gets the user details from another service & returns the quotation depending on the user's age. 

User service rejects the promise if service is down or user not found. 

```typescript
export async function getQuotation(userEmail: string, getUserDetails: any): Promise<number> {
    const userDetails = await getUserDetails(userEmail);
    if (userDetails.age < 30) {
        return 500;
    } else {
        return 300;
    }
}
```

Though we did not handle the promise rejection, this code will get compiled successfully. But it will raise the exception at the runtime if promise gets rejected.
We can handle the promise rejection by wrapping it in try catch block.

```typescript
export async function getQuotation1(userEmail: string, getUserDetails: any): Promise<number> {
    try {
        const userDetails = await getUserDetails(userEmail);
        if (userDetails.age < 30) {
            return 500;
        } else {
            return 300;
        }
    } catch (ex) {
        console.error('Error in getting user details');
    }
    return 0;
}
```

Now let's try to catch the mistake of not handling errors during compile time.
Many language have introduced `Maybe` or `Optional`, `Either` or `Result` Type. During computation function call may return success value or failure value. 
`Maybe` or `Optional` type indicates that value may not be present, but it does not indicate why failure is occurred. Using `Either` or `Result` type 
you can encode both values. `Either` or `Result` can hold either `Right` or `Left` value. `Right` encodes the success case & `Left` encodes the failure with error message. In our example, we can represent the failure cases `User not found` or `Service not available` using `Left` & `Right` will represent the user details

```typescript
type getUserDetailsType = (
    userEmail: string,
) => Promise<Either<UserServiceErrors, UserDetails>>;

export async function getQuotation(userEmail: string, getUserDetails: getUserDetailsType): Promise<number> {
    const userDetailsOrError = await getUserDetails(userEmail);
    if (isRight(userDetailsOrError)) {
        const userDetails = userDetailsOrError.right;
        if (userDetails.age < 30) {
            return 500;
        } else {
            return 300;
        }
    } else {
        return 0;
    }
}

```

### TODO
Write example with composing the function & Reactive streams. 


# References 

- [Idiomatic Python: EAFP versus LBYL](https://devblogs.microsoft.com/python/idiomatic-python-eafp-versus-lbyl/ )
- [Domain modeling made functional Chapter 10: Working with errors](https://www.oreilly.com/library/view/domain-modeling-made/9781680505481/)
- [Parse, don’t validate](https://lexi-lambda.github.io/blog/2019/11/05/parse-don-t-validate/)
- [Getting started with fp-ts: Either vs Validation](https://dev.to/gcanti/getting-started-with-fp-ts-either-vs-validation-5eja)
