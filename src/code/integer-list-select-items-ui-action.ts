
import { Integer } from '@pbkware/js-utils';
import { MappedListSelectItemsUiAction } from './mapped-list-select-items-ui-action';
import { SelectItemsUiAction } from './select-items-ui-action';

// was enum-mapped-explicit-elements-array-ui-action.ts

/** @public */
export class IntegerListSelectItemsUiAction extends MappedListSelectItemsUiAction<Integer> {
}

/** @public */
export namespace  IntegerListSelectItemsUiAction {
    export type ItemProperties = SelectItemsUiAction.ItemProperties<Integer>;
}
