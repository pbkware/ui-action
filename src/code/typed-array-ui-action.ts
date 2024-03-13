// (c) 2024 Xilytix Pty Ltd

import { MultiEvent } from '@xilytix/sysutils';
import { UiAction } from './ui-action';

/** @public */
export abstract class TypedArrayUiAction<T> extends UiAction {

    private _value: readonly T[] | undefined;
    private _definedValue: readonly T[] = TypedArrayUiAction.undefinedArray;

    private _typedArrayPushMultiEvent = new MultiEvent<TypedArrayUiAction.PushEventHandlersInterface<T>>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: readonly T[] | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: readonly T[] | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: TypedArrayUiAction.PushEventHandlersInterface<T>) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._typedArrayPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._typedArrayPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected override repushValue(newEdited: boolean) {
        this.pushValueWithoutAutoAcceptance(this._value, newEdited);
    }

    private notifyValuePush(edited: boolean) {
        const handlersInterfaces = this._typedArrayPushMultiEvent.copyHandlers();
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
            this._definedValue = TypedArrayUiAction.undefinedArray;
        }
    }

    private pushValueWithoutAutoAcceptance(value: readonly T[] | undefined, edited: boolean) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace TypedArrayUiAction {
    export const undefinedArray = [];

    export type ValuePushEventHandler<T> = (this: void, value: readonly T[] | undefined, edited: boolean) => void;

    export interface PushEventHandlersInterface<T> extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHandler<T>;
    }
}
