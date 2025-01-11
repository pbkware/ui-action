// (c) 2024 Xilytix Pty Ltd

import { Integer, MultiEvent, newDecimal, newUndefinableDecimal, SysDecimal } from '@xilytix/sysutils';
import { UiAction } from './ui-action';

/** @public */
export class DecimalUiAction extends UiAction {
    protected override readonly _pushMultiEvent = new MultiEvent<DecimalUiAction.PushEventHandlersInterface>();

    private _value: SysDecimal | undefined;
    private _definedValue: SysDecimal = DecimalUiAction.undefinedDecimal;
    private _options = DecimalUiAction.defaultOptions;


    get valueUndefined() { return this._value === undefined; }

    get value(): SysDecimal | undefined { return this._value; }
    get definedValue(): SysDecimal { return this._definedValue; }
    get options() { return this._options; }

    commitValue(value: SysDecimal | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: SysDecimal | undefined) {
        this.pushValueWithoutAutoAcceptance(value, this.edited);
        this.pushAutoAcceptance();
    }

    pushOptions(options: DecimalUiAction.Options) {
        this._options = options;
        this.notifyOptionsPush();
    }

    override createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface {
        const result: DecimalUiAction.PushEventHandlersInterface = {};
        return result;
    }

    override subscribePushEvents(handlersInterface: DecimalUiAction.PushEventHandlersInterface) {
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

    private notifyOptionsPush() {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.options !== undefined) {
                handlersInterface.options(this.options);
            }
        }
    }

    private setDefinedValue() {
        if (this._value !== undefined) {
            this._definedValue = this._value;
        } else {
            this._definedValue = DecimalUiAction.undefinedDecimal;
        }
    }

    private pushValueWithoutAutoAcceptance(value: SysDecimal | undefined, edited: boolean) {
        this._value = newUndefinableDecimal(value);
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace DecimalUiAction {
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    export const undefinedDecimal: SysDecimal = newDecimal(-9999999999999999999.9999);
    export interface Options {
        integer?: boolean;
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
        minimumFractionDigits?: Integer;
        maximumFractionDigits?: Integer;
    }

    export type ValuePushEventHander = (this: void, value: SysDecimal | undefined, edited: boolean) => void;
    export type OptionsPushEventHandler = (this: void, options: Options) => void;

    export interface PushEventHandlersInterface extends UiAction.PushEventHandlersInterface {
        value?: ValuePushEventHander;
        options?: OptionsPushEventHandler;
    }

    export const defaultOptions: Options = {
        integer: false,
        max: undefined,
        min: undefined,
        step: undefined,
        useGrouping: undefined,
        minimumFractionDigits: undefined,
        maximumFractionDigits: undefined,
    };
}
