/// <reference types="bignumber.js" />
import BigNumber from 'bignumber.js';
import { Comparable } from './core/compare';
import { Currency } from './intl/currency';
export { Currency } from './intl/currency';
export { BigNumber } from 'bignumber.js';
export declare class Money implements Comparable<Money> {
    constructor(currency: Currency, amount: BigNumber | number);
    constructor(currency: string, amount: BigNumber | number);
    private _currency;
    readonly currency: Currency;
    private _amount;
    readonly amount: BigNumber;
    plus(amount: BigNumber | number | string): Money;
    minus(amount: BigNumber | number | string): Money;
    times(amount: BigNumber | number | string): Money;
    dividedBy(amount: BigNumber | number | string): Money;
    compareTo(money: Money | BigNumber | number): number;
}
