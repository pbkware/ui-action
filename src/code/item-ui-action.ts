
import { MultiEvent } from '@pbkware/js-utils';
import { UiAction } from './ui-action';

/** @public */
export abstract class ItemUiAction<T> extends UiAction {
    protected override readonly _pushMultiEvent = new MultiEvent<ItemUiAction.PushEventHandlersInterface<T>>();

    private readonly _undefinedValue: T;

    private _value: T | undefined;
    private _definedValue: T;

    constructor(undefinedValue: T, valueRequired: boolean) {
        super(valueRequired);

        this._undefinedValue = undefinedValue;
        this._definedValue = undefinedValue;
    }

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: T | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: T | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: ItemUiAction.PushEventHandlersInterface<T> = {};
        return result;
    }

    override subscribePushEvents(handlersInterface: ItemUiAction.PushEventHandlersInterface<T>) {
        return super.subscribePushEvents(handlersInterface);
    }

    protected override repushValue(newEdited: boolean) {
        this.pushValueWithoutAutoAcceptance(this._value, newEdited);
    }

    private notifyValuePush(edited: boolean) {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.value !== undefined) {
                handlersInterface.value(this.value, edited);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = this._undefinedValue;
        }
    }

    private pushValueWithoutAutoAcceptance(value: T | undefined, edited: boolean) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace ItemUiAction {
    export type ValuePushEventHandler<T> = (this: void, value: T | undefined, edited: boolean) => void;

    export interface PushEventHandlersInterface<T> extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHandler<T>;
    }
}
