// (c) 2024 Xilytix Pty Ltd

import { ItemUiAction } from './item-ui-action';

// was typed-array-ui-action.ts

/** @public */
export abstract class ItemsUiAction<T> extends ItemUiAction<readonly T[]> {
    constructor(valueRequired = true) {
        super(new Array<T>(), valueRequired);
    }
}

/** @public */
export namespace ItemsUiAction {
    export type PushEventHandlersInterface<T> = ItemUiAction.PushEventHandlersInterface<readonly T[]>;
}
