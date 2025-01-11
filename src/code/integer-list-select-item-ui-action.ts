// (c) 2024 Xilytix Pty Ltd

import { Integer } from '@xilytix/sysutils';
import { MappedListSelectItemUiAction } from './mapped-list-select-item-ui-action';
import { SelectItemUiAction } from './select-item-ui-action';
import { UiAction } from './ui-action';

// was integer-explicit-elements-enum-ui-action.ts

/** @public */
export class IntegerListSelectItemUiAction extends MappedListSelectItemUiAction<Integer> {
    constructor(valueRequired = true) {
        super(SelectItemUiAction.integerUndefinedValue, valueRequired);
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: SelectItemUiAction.PushEventHandlersInterface<Integer> = {};
        return result;
    }
}

/** @public */
export namespace IntegerListSelectItemUiAction {
    export type ItemProperties = SelectItemUiAction.ItemProperties<Integer>;
}
