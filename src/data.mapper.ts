import {ErrorConstant, MappingError} from './mapping.error';
import {subclassOf} from './mapping.utils';

export type DataMapperFunction<T> = (rs: any, index?: number) => T;
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
                map(rs: any, index?: number): T {
                    const mapperFunction: DataMapperFunction<T> = mapper as DataMapperFunction<T>;
                    return mapperFunction(rs, index);
                }
            };
        }
        return new mapperClass();
    } else throw new MappingError(ErrorConstant.PROVIDER_MAPPER, 2);
}

export abstract class DataMapper<T> {
    static parseWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any | string): T {
        const parser: DataMapper<T> = getParser(mapper);
        if (rs == null) throw new MappingError(ErrorConstant.NULL, 3);
        return parser.parse(tryParseString(rs));
    }

    static parseArrayWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any[] | string): T[] {
        const parser: DataMapper<T> = getParser(mapper);
        const result: T[] = [];
        if (rs == null) throw new MappingError(ErrorConstant.NULL, 3);
        rs = tryParseString(rs);
        if (rs instanceof Array) {
            for (let i = 0, len = rs.length; i < len; i++)
                result.push(parser.parse(rs[i], i));
        } else throw new MappingError(ErrorConstant.NOT_ARRAY, 4);
        return result;
    }

    static parseMapWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any | string): { [key: string]: T } {
        const parser: DataMapper<T> = getParser(mapper);
        const result = {};
        if (rs == null) throw new MappingError(ErrorConstant.NULL, 3);
        rs = tryParseString(rs);
        const isObj = typeof rs === 'object';
        const keys = Object.getOwnPropertyNames(rs);
        if (keys && keys.length > 0) {
            let key;
            for (let i = 0, len = keys.length; i < len; i++) {
                key = keys[i];
                if (isObj || key !== 'length' || typeof rs[key] !== 'number')
                    result[key] = parser.parse(rs[key], i);
            }
        }
        return result;
    }

    abstract map(rs: any, index?: number): T;

    parse(rs: any, index?: number): T {
        return this.map(rs, index);
    }
}
