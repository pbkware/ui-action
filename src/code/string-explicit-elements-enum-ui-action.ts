// (c) 2024 Xilytix Pty Ltd

import { EnumUiAction } from './enum-ui-action';
import { ExplicitElementsEnumUiAction } from './explicit-elements-enum-ui-action';

/** @public */
export class StringExplicitElementsEnumUiAction extends ExplicitElementsEnumUiAction<string> {
    constructor(valueRequired = true) {
        super(EnumUiAction.stringUndefinedValue, valueRequired);
    }
}

/** @public */
export namespace StringExplicitElementsEnumUiAction {
    export interface ElementProperties {
        element: string;
        caption: string;
        title: string;
    }
}
