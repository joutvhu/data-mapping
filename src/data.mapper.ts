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

function getParser<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>): DataMapperFunction<T> {
    if (typeof mapper === 'function') {
        if (subclassOf(mapper, DataMapper)) {
            const mapperClass: DataMapperClass<T> = mapper as DataMapperClass<T>;
            return new mapperClass().parse;
        } else return mapper as DataMapperFunction<T>;
    } else throw new MappingError(ErrorConstant.PROVIDER_MAPPER, 3);
}

export abstract class DataMapper<T> {
    static parseWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any | string): T {
        const parser: DataMapperFunction<T> = getParser(mapper);
        return parser(tryParseString(rs));
    }

    static parseArrayWith<T>(mapper: DataMapperClass<T> | DataMapperFunction<T>, rs: any[] | string): T[] {
        const parser: DataMapperFunction<T> = getParser(mapper);
        const result: T[] = [];
        rs = tryParseString(rs);
        if (rs instanceof Array) {
            for (let i = 0, len = rs.length; i < len; i++)
                result.push(parser(rs[i], i));
        }
        return result;
    }

    abstract map(rs: any, index?: number): T;

    parse(rs: any, index?: number): T {
        if (rs != null) {
            if (rs.error) {
            }
            return this.map(rs, index);
        }
        throw new MappingError(ErrorConstant.NULL, 2);
    }
}
