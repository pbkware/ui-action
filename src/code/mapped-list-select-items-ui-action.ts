
import { SelectItemsUiAction } from './select-items-ui-action';

// was typed-mapped-explicit-elements-array-ui-action.ts

/** @public */
export class MappedListSelectItemsUiAction<T> extends SelectItemsUiAction<T> {
    private _list = new Map<T, SelectItemsUiAction.ItemProperties<T>>();

    get list() { return this._list; }

    getItemProperties(element: T) {
        return this._list.get(element);
    }

    getItemPropertiesArray() {
        const result = new Array<SelectItemsUiAction.ItemProperties<T>>(this._list.size);
        let idx = 0;
        for (const value of this._list.values()) {
            result[idx++] = value;
        }
        return result;
    }

    pushItem(item: T, caption: string, title: string) {
        const itemProperties: SelectItemsUiAction.ItemProperties<T> = {
            item,
            caption,
            title,
        };
        this._list.set(item, itemProperties);
        this.notifyItemPush(item, caption, title);
    }

    pushList(itemPropertiesArray: SelectItemsUiAction.ItemProperties<T>[],
        filter: T[] | undefined | null = null) {
        this._list.clear();
        for (const itemProperties of itemPropertiesArray) {
            this._list.set(itemProperties.item, itemProperties);
        }
        this.notifyListPush(filter);
    }
}
