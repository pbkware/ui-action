// (c) 2024 Xilytix Pty Ltd

import { MultiEvent } from '@pbkware/js-utils';
import { UiAction } from './ui-action';

/** @public */
export class BooleanUiAction extends UiAction {
    protected override readonly _pushMultiEvent = new MultiEvent<BooleanUiAction.PushEventHandlersInterface>();

    private _value: boolean | undefined = undefined;
    private _definedValue: boolean = BooleanUiAction.undefinedBoolean;


    get valueUndefined() { return this._value === undefined; }

    get value() { return this._value; }
    get definedValue() { return this._definedValue; }

    commitValue(value: boolean | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value;
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: boolean | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: BooleanUiAction.PushEventHandlersInterface = {};
        return result;
    }

    override subscribePushEvents(handlersInterface: BooleanUiAction.PushEventHandlersInterface) {
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
            this._definedValue = BooleanUiAction.undefinedBoolean;
        }
    }

    private pushValueWithoutAutoAcceptance(value: boolean | undefined, edited: boolean) {
        this._value = value;
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace BooleanUiAction {
    export const undefinedBoolean = false; // not much else that can be used here

    export type ValuePushEventHander = (this: void, value: boolean | undefined, edited: boolean) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
    }
}
