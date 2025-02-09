// export type AtLeastOneFrom<T, Keys extends keyof T = keyof T> =
//     Omit<T, Keys> & { [K in Keys]: NonNullable<T[K]> };
//
//
// export type AtListOne<T> = { [K in keyof T]: Omit<T, K> }[keyof T];
//
//
// export type StrictOne<T> = { [K in keyof T]: Pick<T, K> }[keyof T];


export type AtLeastOneFrom<T, Keys extends keyof T = keyof T> =
    Omit<T, Keys> & { [K in Keys]: NonNullable<T[K]> };


// Not fully correct behavior:
export type AtListOne<T> = {
    [K in keyof T]: Omit<T, K> & { [P in K]: T[K] };
}[keyof T];


export type StrictOne<T> = {
    [K in keyof T]: Omit<T, K> & { [P in K]: T[K] };
}[keyof T];
