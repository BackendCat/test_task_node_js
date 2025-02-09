import { AtLeastOneFrom } from './ts_helpers';


/**
 * Simple js-like analog of python str.format()
 * @param string str - value containing a template
 * @param any[]  args - array with numbered parameters and structure with named params.
 * @param allowHalfRener
 * ! DANGER: last object is always interpreted as named params container.
 * (Wrote it for errors templates comfort rendering and other purposes).
 */


type FormatOptions = AtLeastOneFrom<{
    template: string,
    numbered?: any[],
    named?: Record<string, any>,
    allowMissing?: boolean,
    allowOverflow?: boolean,
}, 'numbered' | 'named'>;

const formatString = ({
    template = '',
    numbered = [],
    named = {},
    allowMissing = true,
}: FormatOptions): string => {
    let numberedIndex = 0;

    template = template.replace(/{(\w*)}/g, (match: string, key: string) => {
        if (key === '') {
            if (numberedIndex < numbered.length) {
                return numbered[numberedIndex++];
            } else if (allowMissing) {
                return '{}';
            }
            throw new Error(`No value provided for numbered placeholder at position ${numberedIndex}`);
        } else {
            const value = named[key];
            if (value !== undefined) {
                return value;
            } else if (allowMissing) {
                return match;
            }
            throw new Error(`No value provided for named placeholder '${key}'`);
        }
    });

    return template;
};


export default formatString;
