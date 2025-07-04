
import { AssertInternalError, ModifierKey, MultiEvent, UnreachableCaseError } from '@pbkware/js-utils';

/** @public */
export abstract class UiAction {
    protected readonly _pushMultiEvent = new MultiEvent<UiAction.PushEventHandlersInterface>();

    private _commitEvent: UiAction.CommitEventHandler | undefined;
    private _inputEvent: UiAction.InputEventHandler | undefined;
    private _signalEvent: UiAction.SignalEventHandler | undefined;
    private _editedChangeEvent: UiAction.EditedChangeEventHandler | undefined;

    private _valueRequired: boolean;
    private _commitOnAnyValidInput = false;
    private _autoEchoCommit = true;
    private _autoAcceptanceTypeId = UiAction.AutoAcceptanceTypeId.Valid;
    private _autoInvalid = true;

    private _stateId = UiAction.StateId.Missing;

    private _edited = false;
    private _editedValid: boolean;
    private _editedMissing: boolean;
    private _editedInvalidErrorText: string | undefined;

    private _inputtedText = '';
    private _inputInvalid = false;
    private _inputInvalidBlockedStateId: UiAction.StateId;
    private _inputInvalidBlockedStateTitle: string | undefined;

    private _caption: string;
    private _title = '';
    private _defaultTitle = '';
    private _stateTitleActive = false;
    private _placeholder = '';

    constructor(valueRequired = true) {
        this._valueRequired = valueRequired;
        this._stateId = valueRequired ? UiAction.StateId.Missing : UiAction.StateId.Valid;
    }

    get stateId() { return this._stateId; }
    get enabled() { return this._stateId !== UiAction.StateId.Disabled; }
    get edited() { return this._edited; }
    get editedValid() { return this._editedValid; }
    get editedMissing() { return this._editedMissing; }
    get editedInvalidErrorText() { return this._editedInvalidErrorText; }
    get inputtedText() { return this._inputtedText; }
    get caption() { return this._caption; }
    get title() { return this._title; }
    get placeholder() { return this._placeholder; }

    get valueRequired() { return this._valueRequired; }
    set valueRequired(value: boolean) {
        if (value !== this._valueRequired) {
            this._valueRequired = value;
            this.notifyRequiredChangePush();
            if (this._valueRequired) {
                if (this.valueUndefined) {
                    this.pushState(UiAction.StateId.Missing);
                }
            } else {
                if (this._stateId === UiAction.StateId.Missing) {
                    if (!this.valueUndefined) {
                        throw new AssertInternalError('UASVRM09992222452');
                    } else {
                        if (this._autoAcceptanceTypeId === UiAction.AutoAcceptanceTypeId.Accepted) {
                            this.pushState(UiAction.StateId.Accepted);
                        } else {
                            this.pushState(UiAction.StateId.Valid);
                        }
                    }
                }
            }
        }
    }

    get commitOnAnyValidInput() { return this._commitOnAnyValidInput; }
    set commitOnAnyValidInput(value: boolean) { this._commitOnAnyValidInput = value; }
    get autoAcceptanceTypeId() { return this._autoAcceptanceTypeId; }
    set autoAcceptanceTypeId(value: UiAction.AutoAcceptanceTypeId) { this._autoAcceptanceTypeId = value; }
    get autoEchoCommit() { return this._autoEchoCommit; }
    set autoEchoCommit(value: boolean) { this._autoEchoCommit = value; }
    get autoInvalid() { return this._autoInvalid; }
    set autoInvalid(value: boolean) { this._autoInvalid = value; }

    get commitEvent() { return this._commitEvent; }
    set commitEvent(value: UiAction.CommitEventHandler | undefined) { this._commitEvent = value; }
    get inputEvent() { return this._inputEvent; }
    set inputEvent(value: UiAction.InputEventHandler | undefined) { this._inputEvent = value; }
    get signalEvent() { return this._signalEvent; }
    set signalEvent(value: UiAction.SignalEventHandler | undefined) { this._signalEvent = value; }
    get editedChangeEvent() { return this._editedChangeEvent; }
    set editedChangeEvent(value: UiAction.EditedChangeEventHandler | undefined) { this._editedChangeEvent = value; }

    abstract get valueUndefined(): boolean;

    finalise() {
        // for descendants (if required)
    }

    input(text: string, valid: boolean, missing: boolean, errorText: string | undefined) {
        this._inputtedText = text;

        if (valid) {
            this.checkPushInputValid();
        } else {
            if (this._autoInvalid) {
                if (!this._inputInvalid) {
                    this._inputInvalidBlockedStateId = this._stateId;
                    this._inputInvalidBlockedStateTitle = this._stateTitleActive ? this._title : undefined;
                    this._inputInvalid = true;
                }
                this.unblockedPushState(UiAction.StateId.Invalid, errorText);
            }
        }

        const commitWillNotFollow = !valid || !this._commitOnAnyValidInput;

        this.setEdited(true, valid, missing, errorText);

        // only notifyInput if a commit will not follow next
        if (commitWillNotFollow) {
            this.notifyInput();
        }
    }

    signal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        this.notifySignal(signalTypeId, downKeys);
    }

    pushState(newStateId: UiAction.StateId, stateTitleText?: string) {
        if (this._inputInvalid) {
            this._inputInvalidBlockedStateId = newStateId;
            this._inputInvalidBlockedStateTitle = stateTitleText;
        } else {
            this.unblockedPushState(newStateId, stateTitleText);
        }
    }

    pushDisabled(disabledTitleText?: string) {
        this.pushState(UiAction.StateId.Disabled, disabledTitleText);
    }

    pushReadonly() {
        this.pushState(UiAction.StateId.Readonly);
    }

    pushInvalid(invalidTitleText?: string) {
        this.pushState(UiAction.StateId.Invalid, invalidTitleText);
    }

    pushValidOrMissing(titleText?: string) {
        if (this._valueRequired && this.valueUndefined) {
            this.pushState(UiAction.StateId.Missing, titleText);
        } else {
            this.pushState(UiAction.StateId.Valid, titleText);
        }
    }

    pushAccepted(value?: boolean) {
        if (value === undefined || value) {
            this.pushState(UiAction.StateId.Accepted);
        } else {
            this.pushValidOrMissing();
        }
    }

    pushWaiting(waitingTitleText?: string) {
        this.pushState(UiAction.StateId.Waiting, waitingTitleText);
    }

    pushWarning(warningTitleText?: string) {
        this.pushState(UiAction.StateId.Warning, warningTitleText);
    }

    pushError(errorTitleText?: string) {
        this.pushState(UiAction.StateId.Error, errorTitleText);
    }

    pushCaption(value: string) {
        if (value !== this._caption) {
            this._caption = value;
            this.notifyCaptionPush();
        }
    }

    pushTitle(value: string) {
        if (value !== this._defaultTitle || this._stateTitleActive) {
            this._defaultTitle = value;
            this._title = value;
            this._stateTitleActive = false;
            this.notifyTitlePush();
        }
    }

    pushPlaceholder(value: string) {
        if (value !== this._placeholder) {
            this._placeholder = value;
            this.notifyPlaceholderPush();
        }
    }

    cancelEdit() {
        if (this.edited) {
            const newEdited = false;
            this._inputtedText = '';

            if (this._inputInvalid) {
                this.unblockedPushState(this._inputInvalidBlockedStateId, this._inputInvalidBlockedStateTitle);
                this._inputInvalid = false;
                this.repushValue(newEdited);
            } else {
                if (this._autoEchoCommit || !this.commitOnAnyValidInput) {
                    this.repushValue(newEdited);
                }
            }

            this.setEdited(newEdited, true, false, undefined);
        }
    }

    isValueOk() {
        switch (this.stateId) {
            case UiAction.StateId.Readonly:
            case UiAction.StateId.Accepted:
            case UiAction.StateId.Valid:
                return true;
            default:
                return false;
        }
    }

    isValueOkOrDisabled() {
        switch (this.stateId) {
            case UiAction.StateId.Disabled:
            case UiAction.StateId.Readonly:
            case UiAction.StateId.Accepted:
            case UiAction.StateId.Valid:
                return true;
            default:
                return false;
        }
    }

    subscribePushEvents(handlersInterface: UiAction.PushEventHandlersInterface) {
        return this._pushMultiEvent.subscribe(handlersInterface);
    }

    unsubscribePushEvents(subscriptionId: MultiEvent.SubscriptionId) {
        this._pushMultiEvent.unsubscribe(subscriptionId);
    }

    protected commit(typeId: UiAction.CommitTypeId) {
        this.checkPushInputValid();

        const inputCommit = typeId === UiAction.CommitTypeId.Input;

        if (this._autoEchoCommit && !inputCommit) {
            this.repushValue(inputCommit);
        }

        this.pushAutoAcceptance();

        this.notifyCommit(typeId);

        this.setEdited(inputCommit, true, false, undefined);
    }

    protected pushAutoAcceptance() {
        if (this._autoAcceptanceTypeId !== UiAction.AutoAcceptanceTypeId.None) {
            if (!this._valueRequired || !this.valueUndefined) {
                switch (this.autoAcceptanceTypeId) {
                    case UiAction.AutoAcceptanceTypeId.None: {
                        throw new AssertInternalError('UAPAAN2319971355');
                        // if (this._stateId === UiAction.StateId.Missing && !this._valueRequired) {
                        //     throw new AssertInternalError('UAPAAM2319971355');
                        // }
                        break;
                    }
                    case UiAction.AutoAcceptanceTypeId.Valid:
                        this.pushState(UiAction.StateId.Valid);
                        break;
                    case UiAction.AutoAcceptanceTypeId.Accepted:
                        this.pushState(UiAction.StateId.Accepted);
                        break;
                    default:
                        throw new UnreachableCaseError('UAPAAU2319971355', this.autoAcceptanceTypeId);
                }
            } else {
                switch (this._stateId) {
                    case UiAction.StateId.Invalid:
                        this._inputInvalid = true; // make sure state update is blocked
                        this.pushState(UiAction.StateId.Missing);
                        break;
                    case UiAction.StateId.Valid:
                    case UiAction.StateId.Accepted:
                        this.pushState(UiAction.StateId.Missing);
                        break;
                }
            }
        }
    }

    private notifyRequiredChangePush() {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.requiredChange !== undefined) {
                handlersInterface.requiredChange();
            }
        }
    }

    private notifyStateChangePush(oldState: UiAction.StateId, newState: UiAction.StateId) {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.stateChange !== undefined) {
                handlersInterface.stateChange(oldState, newState);
            }
        }
    }

    private notifyCaptionPush() {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.caption !== undefined) {
                handlersInterface.caption(this.caption);
            }
        }
    }

    private notifyTitlePush() {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.title !== undefined) {
                handlersInterface.title(this.title);
            }
        }
    }

    private notifyPlaceholderPush() {
        const handlersInterfaces = this._pushMultiEvent.copyHandlers();
        for (let i = 0; i < handlersInterfaces.length; i++) {
            const handlersInterface = handlersInterfaces[i];
            if (handlersInterface.placeholder !== undefined) {
                handlersInterface.placeholder(this.placeholder);
            }
        }
    }

    private notifyCommit(typeId: UiAction.CommitTypeId) {
        if (this._commitEvent !== undefined) {
            this._commitEvent(typeId);
        }
    }

    private notifyInput() {
        if (this._inputEvent !== undefined) {
            this._inputEvent();
        }
    }

    private notifySignal(signalTypeId: UiAction.SignalTypeId, downKeys: ModifierKey.IdSet) {
        if (this._signalEvent !== undefined) {
            this._signalEvent(signalTypeId, downKeys);
        }
    }

    private notifyEditedChange() {
        if (this._editedChangeEvent !== undefined) {
            this._editedChangeEvent();
        }
    }

    private setEdited(value: boolean, valid: boolean, missing: boolean, errorText: string | undefined) {
        const editedChanged = value !== this._edited;
        if (editedChanged || valid !== this._editedValid || errorText !== this._editedInvalidErrorText) {
            this._edited = value;
            this._editedValid = valid;
            this._editedMissing = missing;
            this._editedInvalidErrorText = errorText;
            this.notifyEditedChange();
        }
    }

    private unblockedPushState(newStateId: UiAction.StateId, stateTitleText: string | undefined) {
        if (stateTitleText === undefined) {
            if (this._stateTitleActive) {
                this.pushTitle(this._defaultTitle);
            }
        } else {
            this._title = stateTitleText;
            this.notifyTitlePush();
            this._stateTitleActive = true;
        }

        if (newStateId !== this._stateId) {
            const oldState = this._stateId;
            this._stateId = newStateId;
            this.notifyStateChangePush(oldState, newStateId);
        }
    }

    private checkPushInputValid() {
        if (this._inputInvalid) {
            this._inputInvalid = false;
            this.pushState(this._inputInvalidBlockedStateId, this._inputInvalidBlockedStateTitle);
        }
    }

    abstract createPushEventHandlersInterface(): UiAction.PushEventHandlersInterface;
    protected abstract repushValue(newEdited: boolean): void;
}

/** @public */
export namespace UiAction {
    export const enum StateId {
        Disabled, // value cannot be used
        Readonly, // value is acceptable but but cannot changed
        Missing, // value is committed but undefined and required
        Invalid, // value is not committed (edited) but not valid
        Valid, // value is committed, present and valid but not accepted by application
        Accepted, // value is committed, present, valid and accepted by application
        Waiting, // value is committed, present, valid and accepted by application but resulted to waiting
        Warning, // value is committed, present, valid and accepted by application but resulted in Warning
        Error, // value is committed, present, valid and accepted by application but resulted in Error
    }

    export const enum CommitTypeId {
        Implicit,
        Explicit,
        Input,
    }

    export namespace CommitType {
        export type NotInputId = UiAction.CommitTypeId.Explicit | UiAction.CommitTypeId.Implicit;
    }

    export const enum SignalTypeId {
        MouseClick,
        EnterKeyPress,
        SpacebarKeyPress,
        KeyboardShortcut,
    }

    export const enum AutoAcceptanceTypeId {
        None,
        Valid,
        Accepted,
    }

    export type CommitEventHandler = (this: void, typeId: UiAction.CommitTypeId) => void;
    export type InputEventHandler = (this: void) => void;
    export type SignalEventHandler = (this: void, signalTypeId: SignalTypeId, downKeys: ModifierKey.IdSet) => void;

    export type RequiredChangePushEventHandler = (this: void) => void;
    export type StateChangePushEventHandler = (this: void, oldState: StateId, newState: StateId) => void;
    export type CaptionPushEventHandler = (this: void, caption: string) => void;
    export type TitlePushEventHandler = (this: void, title: string) => void;
    export type PlaceholderPushEventHandler = (this: void, text: string) => void;

    export type EditedChangeEventHandler = (this: void) => void;

    export interface PushEventHandlersInterface {
        requiredChange?: RequiredChangePushEventHandler;
        stateChange?: StateChangePushEventHandler;
        caption?:  CaptionPushEventHandler;
        title?: TitlePushEventHandler;
        placeholder?: PlaceholderPushEventHandler;
    }
}
