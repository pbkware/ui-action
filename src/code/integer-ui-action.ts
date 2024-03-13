// (c) 2024 Xilytix Pty Ltd

import { NumberUiAction } from './number-ui-action';

/** @public */
export class IntegerUiAction extends NumberUiAction {
    constructor(required?: boolean) {
        super(required);
        this.pushOptions(IntegerUiAction.defaultIntegerOptions);
    }
}

/** @public */
export namespace IntegerUiAction {
    export const defaultIntegerOptions: NumberUiAction.Options = {
        integer: true,
        max: undefined,
        min: undefined,
        step: 1,
        useGrouping: undefined,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    };
}
