import * as _ from 'ramda';
import { Either, isLeft, isRight, left, right } from 'fp-ts/lib/Either';

export function squareOfSecondElement(list: number[]) {
    const i = list[1];
    return _.isNil(i) ? 0 : i * i;
}

export function getGreeting(user: any) {
    // EAFP Style
    try {
        return 'Hi ' + user.name.split(' ')[0];
    } catch (ex) {
        return 'Hi ';
    }
}

export function getGreeting1(user: any) {
    // LBYL Style

    const name = user.name;

    if (_.isNil(name)) {
        return 'Hi ';
    } else {
        return 'Hi ' + user.name.split(' ')[0];
    }

    // const firstName = user.name?.split(' ')[0]
    // return 'Hi ' + (firstName || '')
}

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

type UserServiceErrors = 'USER-NOT-FOUND' | 'SERVICE-NOT-AVAILABLE';

interface UserDetails {
    name: string;
    email: string;
    age: number;
}

type getUserDetails1Type = (
    userEmail: string,
) => Promise<Either<UserServiceErrors, UserDetails>>;

export async function getQuotation2(
    userEmail: string,
    getUserDetails: getUserDetails1Type,
): Promise<number> {
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
