// (c) 2024 Xilytix Pty Ltd

import { MultiEvent, newUndefinableDate } from '@xilytix/sysutils';
import { UiAction } from './ui-action';

/** @public */
export class DateUiAction extends UiAction {
    protected override readonly _pushMultiEvent = new MultiEvent<DateUiAction.PushEventHandlersInterface>();

    private _value: Date | undefined;
    private _definedValue = DateUiAction.undefinedDate;


    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: Date | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: Date | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: DateUiAction.PushEventHandlersInterface = {};
        return result;
    }

    override subscribePushEvents(handlersInterface: DateUiAction.PushEventHandlersInterface) {
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
            this._definedValue = DateUiAction.undefinedDate;
        }
    }

    private pushValueWithoutAutoAcceptance(value: Date | undefined, edited: boolean) {
        this._value = newUndefinableDate(value);
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace DateUiAction {
    export const undefinedDate = new Date(8640000000000000);

    export type ValuePushEventHander = (this: void, date: Date | undefined, edited: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
