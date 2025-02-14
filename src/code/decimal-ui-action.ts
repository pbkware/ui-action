// (c) 2024 Xilytix Pty Ltd

import { DecimalFactory, Integer, MultiEvent } from '@xilytix/sysutils';
import { Decimal } from 'decimal.js-light';
import { UiAction } from './ui-action';

/** @public */
export class DecimalUiAction extends UiAction {
    protected override readonly _pushMultiEvent = new MultiEvent<DecimalUiAction.PushEventHandlersInterface>();

    private _value: Decimal | undefined;
    private _definedValue: Decimal;
    private _options = DecimalUiAction.defaultOptions;

    constructor(private readonly _decimalFactory: DecimalFactory, valueRequired = true) {
        super(valueRequired);
        this._definedValue = this._decimalFactory.nullDecimal;
    }

    get valueUndefined() { return this._value === undefined; }

    get value(): Decimal | undefined { return this._value; }
    get definedValue(): Decimal { return this._definedValue; }
    get options() { return this._options; }

    commitValue(value: Decimal | undefined, typeId: UiAction.CommitTypeId) {
        this._value = value; // owns value
        this.setDefinedValue();
        this.commit(typeId);
    }

    pushValue(value: Decimal | undefined) {
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
            this._definedValue = this._decimalFactory.nullDecimal;
        }
    }

    private pushValueWithoutAutoAcceptance(value: Decimal | undefined, edited: boolean) {
        this._value = this._decimalFactory.newUndefinableDecimal(value);
        this.setDefinedValue();
        this.notifyValuePush(edited);
    }
}

/** @public */
export namespace DecimalUiAction {
    export interface Options {
        integer?: boolean;
        max?: number;
        min?: number;
        step?: number;
        useGrouping?: boolean;
        minimumFractionDigits?: Integer;
        maximumFractionDigits?: Integer;
    }

    export type ValuePushEventHander = (this: void, value: Decimal | undefined, edited: boolean) => void;
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
