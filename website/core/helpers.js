export function ensureArray(value) {

    if (!value)
        return [];

    return Array.isArray(value)
        ? value
        : [value];

}

export function unique(array) {

    return [...new Set(array)];

}

export function sortAlphabetically(array) {

    return [...array].sort((a, b) =>
        a.localeCompare(b)
    );

}
