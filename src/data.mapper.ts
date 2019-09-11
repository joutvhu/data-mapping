import {ErrorConstant, MappingError} from './mapping.error';
import {subclassOf} from './mapping.utils';

export type DataMapperFunction<T> = (rs: any, index?: number, data?: any) => T;
export type DataMapperClass<T> = new() => DataMapper<T>;

function tryParseString(rs: any): any {
    if (typeof rs === 'string') {
        try {
            return JSON.parse(rs);
        } catch (e) {
        }
    }
    return rs;
}

function getParser<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>): DataMapper<T> {
    if (typeof mapper === 'function') {
        let mapperClass: DataMapperClass<T>;
        if (subclassOf(mapper, DataMapper)) {
            mapperClass = mapper as DataMapperClass<T>;
        } else {
            mapperClass = class extends DataMapper<T> {
                map(rs: any, index?: number, data?: any): T {
                    const mapperFunction: DataMapperFunction<T> = mapper as DataMapperFunction<T>;
                    return mapperFunction(rs, index, data);
                }
            };
        }
        return new mapperClass();
    } else throw new MappingError(ErrorConstant.PROVIDER_MAPPER, 2);
}

export interface MapperComfig<T> {
    ignore?: 'null' | ((result: T, index?: number) => boolean);
    [key: string]: any;
}

function checkIgnore<T>(ignore?: 'null' | ((result: T, index?: number) => boolean)): ((result: T, index?: number) => boolean) {
    if (ignore) {
        if (ignore === 'null')
            return (result: T) => result == null;
        else if (typeof ignore === 'function')
            return ignore;
    }
    return () => false;
}

export abstract class DataMapper<T> {
    static parseWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any | string, options?: MapperComfig<T>): T {
        const parser: DataMapper<T> = getParser(mapper);
        if (rs == null) throw new MappingError(ErrorConstant.NULL, 3);
        const result = parser.parse(tryParseString(rs), undefined, options);
        const isIgnore = checkIgnore(options && options.ignore || undefined);
        if (isIgnore(result)) throw new MappingError(ErrorConstant.IGNORED, 4);
        return result;
    }

    static parseArrayWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any[] | string, options?: MapperComfig<T>): T[] {
        const parser: DataMapper<T> = getParser(mapper);
        const result: T[] = [];
        if (rs == null) throw new MappingError(ErrorConstant.NULL, 3);
        rs = tryParseString(rs);
        if (rs instanceof Array) {
            const isIgnore = checkIgnore(options && options.ignore || undefined);
            for (let i = 0, len = rs.length; i < len; i++) {
                const item = parser.parse(rs[i], i, options);
                if (isIgnore(item, i)) continue;
                result.push(item);
            }
        } else throw new MappingError(ErrorConstant.NOT_ARRAY, 4);
        return result;
    }

    static parseMapWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any | string, options?: MapperComfig<T>): { [key: string]: T } {
        const parser: DataMapper<T> = getParser(mapper);
        const result = {};
        if (rs == null) throw new MappingError(ErrorConstant.NULL, 3);
        rs = tryParseString(rs);
        const isObj = typeof rs === 'object';
        const keys = Object.getOwnPropertyNames(rs);
        if (keys && keys.length > 0) {
            let key;
            const isIgnore = checkIgnore(options && options.ignore || undefined);
            for (let i = 0, len = keys.length; i < len; i++) {
                key = keys[i];
                if (isObj || key !== 'length' || typeof rs[key] !== 'number') {
                    const item = parser.parse(rs[key], i, options);
                    if (isIgnore(item, i)) continue;
                    result[key] = item;
                }
            }
        }
        return result;
    }

    abstract map(rs: any, index?: number, data?: any): T;

    parse(rs: any, index?: number, data?: any): T {
        return this.map(rs, index, data);
    }
}
