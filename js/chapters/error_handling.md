# Error handling

While writing software, developers try to think about what can go wrong and put in place measures to handle errors / exceptions. Usually these include:

- Safely access data
  - Checking the length of a list
  - Checking a key exists in a dictionary
  - Checking a variable is not null
- Database constraint errors
  - Unique constraint violations, e.g., duplicate email address
  - Primary key violations
- Domain specific errors
  - Email is not verified
  - Shopping cart can have a maximum of 10 items
- Infrastructure errors
  - File does not exist
  - Network time out
  - Any error occurring outside system boundary

  Modern programming languages allow two main approaches: exceptions, and errors as values.

## EAFP vs LBYL

The following describes two common error handling methods—"Easier to Ask for Forgiveness than Permission" (EAFP), and "Look Befor You Leap" (LBYL)—along with the advantages and disadvantages of each of them.

### EAFP

In this pattern, we consider that our assumptions about the structure of our data or object are correct & catch it with an exception if proven false.

For example, we assume user object has the 'name' property and if it actually doesn't, then calling split function below on undefined will raise an exception.

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
export function getGreeting(user) {
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

- We should parse or validate data at the system edges using libraries like [Joi](https://hapi.dev/module/joi/),[ajv](https://github.com/ajv-validator/ajv) or [io-ts](https://github.com/gcanti/io-ts).
- For safely accessing data, prefer using LBYL style. We can use default values if the value is not present. In this case [pathOr](https://ramdajs.com/docs/#pathOr), [propOr](https://ramdajs.com/docs/#propOr) functions or [Short-circuit evaluation](https://en.wikipedia.org/wiki/Short-circuit_evaluation) help us write the expression in a single line and they handle the null values very well.
- If the libraries you are using throw exceptions then prefer the EAFP style. DB exceptions, Infrastructure error can be handle using this style.

Let's look at better ways to handle domain specific errors.

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
export async function getQuotation(userEmail: string, getUserDetails: any): Promise<number> {
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
