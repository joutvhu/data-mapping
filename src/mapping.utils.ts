export function isBlank(value: any): boolean {
    return value === null || value === undefined || (value.length !== undefined && value.length === 0);
}

export function isNotBlank(value: any): boolean {
    return value !== null && value !== undefined && (value.length === undefined || value.length > 0);
}

export function subclassOf(subclass: any, superclass: any): boolean {
    if (!(subclass instanceof Function) || !(superclass instanceof Function)) return false;
    let proto = subclass.prototype;
    while (proto != null) {
        if (proto instanceof superclass)
            return true;
        proto = proto.__proto__;
    }
    return false;
}
