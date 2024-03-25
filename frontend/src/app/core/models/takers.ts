/*
 * Type Definitions
 */
export type Taker = (text: string) => TakeResult | undefined;

export interface TakeResult {
  lengthTaken: number;
  setter: () => void;
}

/*
 * basic takers
 */

export function text(text: string): Taker {
  return (input: string): TakeResult | undefined  => {
    const sub = input.substr(0, text.length)
    if (sub === text) {
      return {
        lengthTaken: sub.length,
        setter: () => {}
      };
    }
  }
}

export function regex(r: RegExp): Taker {
  return (input: string): TakeResult | undefined  => {
    const match = r.exec(input)
    if (match) {
      return {
        lengthTaken: match[0].length,
        setter: () => {}
      }
    }
  }
}

export const dummy:   Taker = (s: string) => { console.log("there are still dummy takers"); return undefined; }
export const fail:    Taker = (s: string) => { return undefined; }
export const success: Taker = (s: string) => { return { lengthTaken: 0, setter: () => { } }; }
export const decimal: Taker = regex(/\d+([.,]\d+)?/)

/*
 * combinators
 */

export function compound(takers: Taker[]): Taker {
  return (s: string) => {
    const results: TakeResult[] = [];

    let ss = s;
    for (let t of takers) {
      const result = t(ss);
      if (result) {
        results.push(result);
        ss = ss.substr(result.lengthTaken);
      } else {
        return undefined;
      }
    }

    return {
      lengthTaken: results.reduce((a, b) => a + b.lengthTaken, 0),
      setter: () => { results.forEach(r => r.setter()) }
    };
  }
}

export function or(takers: Taker[]): Taker {
  return (s: string) => {
    for (let taker of takers) {
      const result = taker(s);
      if (result) {
        return result;
      }
    }
  }
}

export function optional(t: Taker): Taker {
  return or([t, success]);
}

export function addSetter(t: Taker, f: (oldText: string) => void) {
  return s => {
    const result = t(s);
    if (result) {
      return {
        lengthTaken: result.lengthTaken,
        setter: () => { result.setter(); f(s.substring(0, result.lengthTaken)); }
      };
    }

    return result;
  };
}


export function logOnFail(t: Taker, msg: string): Taker {
  return s => {
    const result = t(s);
    if (result) {
      return result;
    } else {
      console.log(msg);
    }
  };
}

export function logOnSuccess(t: Taker, msg: string): Taker {
  return s => {
    const result = t(s);
    if (result) {
      console.log(msg);
      return result;
    }
  };
}


export function log(t: Taker, msgSuc: string, msgFail: string): Taker {
  return logOnSuccess(logOnFail(t, msgFail), msgSuc);
}
