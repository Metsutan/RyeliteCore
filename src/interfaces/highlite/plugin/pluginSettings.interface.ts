export enum SettingsTypes {
    checkbox,
    range,
    color,
    text,
    button,
    combobox,
    textarea,
    alert,
    warning,
    info,
}

interface BaseSettings<T> {
    text: string;
    description?: string; // Optional description used for the hover title of the setting
    type: SettingsTypes;
    value: T;
    callback: Function;
    validation?: (value: T) => boolean;
    hidden?: boolean;
    disabled?: boolean;
    onLoaded?: Function; // Optional callback called when this setting is loaded from storage
}

interface RangeSettings extends BaseSettings<number> {
    type: SettingsTypes.range;
    min: number;
    max: number;
}

interface ComboBoxSettings extends BaseSettings<string> {
    type: SettingsTypes.combobox;
    options: string[]; // Array of strings used to fill the combobox
}

interface CheckboxSettings extends BaseSettings<boolean> {
    type: SettingsTypes.checkbox;
}

interface ButtonSettings extends BaseSettings<string> {
    type: SettingsTypes.button;
}

interface TextSettings extends BaseSettings<string> {
    type: SettingsTypes.text;
}
interface ColorSettings extends BaseSettings<string> {
    type: SettingsTypes.color;
}

interface TextAreaSettings extends BaseSettings<string> {
    type: SettingsTypes.textarea;
}

interface AlertSettings extends BaseSettings<string> {
    type: SettingsTypes.alert;
}

interface WarningSettings extends BaseSettings<string> {
    type: SettingsTypes.warning;
}

interface InfoSettings extends BaseSettings<string> {
    type: SettingsTypes.info;
}

export type PluginSettings =
    | RangeSettings
    | ComboBoxSettings
    | CheckboxSettings
    | ButtonSettings
    | TextSettings
    | ColorSettings
    | TextAreaSettings
    | AlertSettings
    | WarningSettings
    | InfoSettings;
