// (c) 2024 Xilytix Pty Ltd

import { Integer } from '@xilytix/sysutils';
import { EnumUiAction } from './enum-ui-action';
import { ExplicitElementsEnumUiAction } from './explicit-elements-enum-ui-action';

/** @public */
export class IntegerExplicitElementsEnumUiAction extends ExplicitElementsEnumUiAction<Integer> {
    constructor(valueRequired = true) {
        super(EnumUiAction.integerUndefinedValue, valueRequired);
    }
}

/** @public */
export namespace IntegerExplicitElementsEnumUiAction {
    export interface ElementProperties {
        element: Integer;
        caption: string;
        title: string;
    }
}
