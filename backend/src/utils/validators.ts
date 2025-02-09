/**
 * These validators are common for few modules.
 * The idea of such interfaces comes from frontend.
 * !They return value only ON error, otherwise - null.
 * Same API I used everywhere.
 */


export type ErrorAdvice = string;

export type Validator = (validated: any) => ErrorAdvice | null;

export type ValidatorsChain = Validator[];

export type SchemaValidator = Record<string, ValidatorsChain | Validator>;


export const validateField = (
    value: any,
    validators: ValidatorsChain | Validator
): ErrorAdvice | null => {
    if (!Array.isArray(validators)) {
        validators = [validators]
    }
    for (let validator of validators) {
        const error = validator(value);
        if (error) return error;
    }
    return null;
};


/* I know, there are cool schema validators, but it looks like
*  their usage is not allowed.
*/
export type ValidationAdvices = Record<string, ErrorAdvice[]>;

export const validateSchema = (
    target: Record<string, any>,
    schemaValidator: SchemaValidator,
    allowSkip: boolean = false,
): ValidationAdvices => {
    const errors: ValidationAdvices = {};

    for (const [key, validators] of Object.entries(schemaValidator)) {
        const value = target[key];
        if (allowSkip && !value) {
            continue;
        }
        const validationErrors: ErrorAdvice[] = [];

        const validatorsArray = Array.isArray(validators)
            ? validators : [validators];

        for (let validator of validatorsArray) {
            const error = validateField(value, validator);
            if (error) {
                validationErrors.push(error);
            }
        }
        if (validationErrors.length) {
            errors[key] = validationErrors;
        }
    }
    return errors;
};


interface Lengthed {
    length: number;
};

export const getLengthValidator = (length: number): Validator => {
    return (value: Lengthed): string | null =>
        value.length > length
            ? `Значение этого поля не должно превышать ${length} символов.`
            : null;
};


export const getOneFromValidator = (allowedVals: any[] | object): Validator => {
    return (value: any): string | null =>
        Object.values(allowedVals).includes(value)
            ?`Значение "${value}" не разрешено для этого поля.`
            : null;
};


export const getOneFromTypeValidator = (allowedTypes: any): Validator => {
    const types = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
    let typeStrings =  types.map(allowedType => typeof allowedType
    );

    return (value: any): string | null =>
        !typeStrings.includes(typeof value)
            ? `Тип значения не соответствует ожидаемому.`
            : null;
};


export const validators = {
    lenIs255: getLengthValidator(255),
    isString: getOneFromTypeValidator(""),
    isBool: getOneFromTypeValidator(false),
    isDate: getOneFromTypeValidator(Date),
};
