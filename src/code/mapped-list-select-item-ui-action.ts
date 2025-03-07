
import { SelectItemUiAction } from './select-item-ui-action';

// was explicit-elements-enum-ui-action.ts

/** @public */
export class MappedListSelectItemUiAction<T> extends SelectItemUiAction<T> {
    private _list = new Map<T, SelectItemUiAction.ItemProperties<T>>();

    get list() { return this._list; }

    getItemProperties(item: T) {
        return this._list.get(item);
    }

    getItemPropertiesArray() {
        const result = new Array<SelectItemUiAction.ItemProperties<T>>(this._list.size);
        let idx = 0;
        for (const value of this._list.values()) {
            result[idx++] = value;
        }
        return result;
    }

    pushItem(item: T, caption: string, title: string) {
        const itemProperties: SelectItemUiAction.ItemProperties<T> = {
            item,
            caption,
            title,
        };
        this._list.set(item, itemProperties);
        this.notifyItemPush(item, caption, title);
    }

    pushList(itemPropertiesArray: SelectItemUiAction.ItemProperties<T>[],
        filter: T[] | undefined | null = null) {
        this._list.clear();
        for (const itemProperties of itemPropertiesArray) {
            this._list.set(itemProperties.item, itemProperties);
        }
        this.notifyListPush(filter);
    }
}
