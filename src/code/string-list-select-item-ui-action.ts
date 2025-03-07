
import { MappedListSelectItemUiAction } from './mapped-list-select-item-ui-action';
import { SelectItemUiAction } from './select-item-ui-action';
import { UiAction } from './ui-action';

// was string-explicit-elements-enum-ui-action.ts

/** @public */
export class StringListSelectItemUiAction extends MappedListSelectItemUiAction<string> {
    constructor(valueRequired = true) {
        super(SelectItemUiAction.stringUndefinedValue, valueRequired);
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: SelectItemUiAction.PushEventHandlersInterface<string> = {};
        return result;
    }
}

/** @public */
export namespace StringListSelectItemUiAction {
    export type ItemProperties = SelectItemUiAction.ItemProperties<string>;
}
