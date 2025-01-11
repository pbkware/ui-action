// (c) 2024 Xilytix Pty Ltd

import { MultiEvent } from '@xilytix/sysutils';
import { ItemUiAction } from './item-ui-action';
import { UiAction } from './ui-action';

// was enum-ui-action.ts

/** @public */
export abstract class SelectItemUiAction<T> extends ItemUiAction<T> {
    protected override readonly _pushMultiEvent = new MultiEvent<SelectItemUiAction.PushEventHandlersInterface<T>>();

    private _filter: readonly T[] | undefined;

    get filter() { return this._filter; }

    pushFilter(value: readonly T[] | undefined) {
        this._filter = value;
        this.notifyFilterPush();
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: SelectItemUiAction.PushEventHandlersInterface<T> = {};
        return result;
    }

    override subscribePushEvents(handlersInterface: SelectItemUiAction.PushEventHandlersInterface<T>) {
        return super.subscribePushEvents(handlersInterface);
    }

    protected notifyItemPush(item: T, caption: string, title: string) {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.item !== undefined) {
                handlersInterface.item(item, caption, title);
            }
        }
    }

    protected notifyListPush(filter: T[] | undefined | null) {
        if (filter !== null) {
            this.pushFilter(filter);
        }

        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.list !== undefined) {
                handlersInterface.list();
            }
        }
    }
    private notifyFilterPush() {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.filter !== undefined) {
                handlersInterface.filter(this._filter);
            }
        }
    }
    abstract getItemProperties(item: T): SelectItemUiAction.ItemProperties<T> | undefined;
    abstract getItemPropertiesArray(): SelectItemUiAction.ItemProperties<T>[];
}

/** @public */
export namespace SelectItemUiAction {
    export const integerUndefinedValue = -99999;
    export const stringUndefinedValue = '';

    export interface ItemProperties<T> {
        item: T;
        caption: string;
        title: string;
    }

    export type ItemPushEventHandler<T> = (this: void, item: T, caption: string, title: string) => void;
    export type ListPushEventHandler = (this: void) => void;
    export type FilterPushEventHandler<T> = (this: void, value: readonly T[] | undefined) => void;

    export interface PushEventHandlersInterface<T> extends ItemUiAction.PushEventHandlersInterface<T> {
        item?: ItemPushEventHandler<T>;
        list?: ListPushEventHandler;
        filter?: FilterPushEventHandler<T>;
    }
}
