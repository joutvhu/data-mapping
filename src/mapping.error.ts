import {isBlank, isNotBlank} from './mapping.utils';

export const ErrorConstant = {
    UNKNOWN: 'An unknown error has occurred when mapping data.',
    NULL: 'The data provided is null.',
    NOT_ARRAY: 'The data provided is not an array.',
    PROVIDER_MAPPER: 'Please provide data mapper to parse data.'
};

export class MappingError extends Error {
    public code: number;
    public messages: string[];
    public data: any;

    constructor(message?: string | string[], code?: number, data?: any) {
        let messages;
        if (message instanceof Array) {
            messages = message;
            message = message[0];
        }
        if (isBlank(message)) message = ErrorConstant.UNKNOWN;
        super(message);
        if (isNotBlank(messages)) this.messages = messages;
        this.code = code != null ? code : 1;
        this.data = data;
    }
}
