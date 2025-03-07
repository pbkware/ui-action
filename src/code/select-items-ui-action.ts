
import { MultiEvent } from '@pbkware/js-utils';
import { ItemsUiAction } from './items-ui-action';
import { UiAction } from './ui-action';

// was typed-explicit-elements-array-ui-action.ts

/** @public */
export abstract class SelectItemsUiAction<T> extends ItemsUiAction<T> {
    protected override readonly _pushMultiEvent = new MultiEvent<SelectItemsUiAction.PushEventHandlersInterface<T>>();

    private _filter: readonly T[] | undefined;

    get filter() { return this._filter; }

    pushFilter(value: readonly T[] | undefined) {
        this._filter = value;
        this.notifyFilterPush();
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: SelectItemsUiAction.PushEventHandlersInterface<T> = {};
        return result;
    }

    override subscribePushEvents(handlersInterface: SelectItemsUiAction.PushEventHandlersInterface<T>) {
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

    abstract getItemProperties(item: T): SelectItemsUiAction.ItemProperties<T> | undefined;
    abstract getItemPropertiesArray(): SelectItemsUiAction.ItemProperties<T>[];
}

/** @public */
export namespace SelectItemsUiAction {
    export interface ItemProperties<T> {
        item: T;
        caption: string;
        title: string;
    }

    export type ItemPushEventHandler<T> = (this: void, item: T, caption: string, title: string) => void;
    export type ListPushEventHandler = (this: void) => void;
    export type FilterPushEventHandler<T> = (this: void, value: readonly T[] | undefined) => void;

    export interface PushEventHandlersInterface<T> extends ItemsUiAction.PushEventHandlersInterface<T> {
        item?: ItemPushEventHandler<T>;
        list?: ListPushEventHandler;
        filter?: FilterPushEventHandler<T>;
    }
}
