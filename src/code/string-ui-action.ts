// (c) 2024 Xilytix Pty Ltd

import { MultiEvent } from '@xilytix/sysutils';
import { UiAction } from './ui-action';

/** @public */
export class StringUiAction extends UiAction {

    private _value: string | undefined;
    private _definedValue: string = StringUiAction.undefinedString;

    private _stringPushMultiEvent = new MultiEvent<StringUiAction.PushEventHandlersInterface>();

    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: string | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: string | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    override subscribePushEvents(handlersInterface: StringUiAction.PushEventHandlersInterface) {
        const subscriptionId = super.subscribePushEvents(handlersInterface);
        return this._stringPushMultiEvent.subscribeWithId(handlersInterface, subscriptionId);
    }

    override unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._stringPushMultiEvent.unsubscribe(subscriptionId);
        super.unsubscribePushEvents(subscriptionId);
    }

    protected override repushValue(newEdited: boolean) {
        this.pushValueWithoutAutoAcceptance(this._value, newEdited);
    }

    private notifyValuePush(edited: boolean) {
        const handlersInterfaces = this._stringPushMultiEvent.copyHandlers();
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
            this._definedValue = StringUiAction.undefinedString;
        }
    }

    private pushValueWithoutAutoAcceptance(value: string | undefined, edited: boolean) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace StringUiAction {
    export const undefinedString = '';
    export type ValuePushEventHander = (this: void, value: string | undefined, edited: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
