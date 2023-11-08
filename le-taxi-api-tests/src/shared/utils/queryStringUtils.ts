// Licensed under the AGPL-3.0 license.
// See LICENSE file in the project root for full license information.
export function toQueryString(params: any) {
    const values = Object.entries(params).map(([key, value]) => {
        if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean')
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        else if (Array.isArray(value))
            return `${encodeURIComponent(key)}=${value.map(encodeURIComponent).join(',')}`;
        else return '';
        });
    return values?.length > 0 ? `?${values.join('&')}` : '';
}