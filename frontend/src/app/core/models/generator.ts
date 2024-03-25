/* eslint-disable prefer-arrow/prefer-arrow-functions */
import * as M from "./templateModel";

export function normalExtractor(): M.TextExtractor {
  return new class {
    ofCheckbox(c: M.CheckBox): string | undefined {
      return c.text;
    }
    ofOption(o: M.Option): string | undefined {
      return o.text;
    }
    ofEnumeration(e: M.Enumeration): string | undefined {
      return e.text;
    }
    ofBlock(b: M.Block): string | undefined {
      return b.text;
    }
    ofConditional(c: M.Conditional): string | undefined {
      return c.normalText;
    }
  }();
}

export function judgementExtractor(): M.TextExtractor {
  return new class {
    ofCheckbox(c: M.CheckBox): string | undefined {
      return c.judgementText;
    }
    ofOption(o: M.Option): string | undefined {
      return o.judgementText;
    }
    ofEnumeration(e: M.Enumeration): string | undefined {
      return e.judgementText;
    }
    ofBlock(b: M.Block): string | undefined {
      return b.judgementText;
    }
    ofConditional(c: M.Conditional): string | undefined {
      return c.judgementText;
    }
  }();
}

export const makeText = (parts: M.TopLevel[], extractor: M.TextExtractor): string => {
  let result = parts.map(c => {
    if (c.kind === "category") {
      return getTexts(c.selectables, extractor)
        .map(t => expandVariablesInString(t, parts, true)).join("");
    } else if (c.kind === "block") {
      return extractor.ofBlock(c) || "";
    } else if (c.kind === "enumeration") {
      return makeEnumeration(c, parts, extractor);
    } else {
      throw new Error("unknown top level kind");
    }
  }).join("");
  const blocks = parts.filter(x => x.kind === "block");
  for (const b of blocks) {
    const regEx = new RegExp((b as M.Block).text + "(\\n|$)");
    result = result.replace(regEx, "\n");
  }
  return result;
};


export function getTexts(ss: M.Selectable[], textExtractor: M.TextExtractor): string[] {
  const ret: string[] = [];

  for (const s of ss) {
    if (s.kind === "box" && s.value && !s.enumeration) {
      const result = textExtractor.ofCheckbox(s);
      if (result) {
        ret.push(result);
      }
    } else if (s.kind === "group") {
      s.options.filter(o => s.value == o.name).forEach(o => {
        const result = textExtractor.ofOption(o);
        if (result) ret.push(result);
      })
    }
  }
  return ret;
}

export function expandVariablesInString(s: string, data: M.TopLevel[], addFullStop: boolean): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const lookup: (string) => string = (name) => {
    if (name === "%Gestern%") {
      return makeDateString(yesterday);
    } else if (name === "%Heute%") {
      return makeDateString(today);
    } else if (name === "%Morgen%") {
      return makeDateString(tomorrow);
    }
    const vars = allVariables(data);
    const matching = vars.find(v => "%" + v.id + "%" === name);
    if (matching) {
      if (textOfVariable(matching)) {
        return textOfVariable(matching);
      } else {
        return "---";
      }
    } else {
      return "---";
    }
  };
  s = s.replace(/%[^%]+%/g, lookup);
  const brackets = s.match(/(\[]*?[^\]]*?])/g);
  if (brackets != null) {
    for (const t of brackets) {
      if (t.includes("---")) {
        s = s.replace(t, "");
      }
    }
  }
  s = s.replace(/(---)/g, ""); // "Fehlzeichen" weg
  s = s.replace(/\s\s+/g, " "); // doppelt oder mehr Leerzeichen weg
  s = s.replace(/\[|\]/g, ""); // Klammern weg
  s = s.trim();
  if (addFullStop) {
    s = s.replace(/(\s*\.?\s*$)/, ". "); // Punkt am Ende einfügen, falls keiner da ist
  }
  return s;
}

export function makeDateString(d: Date): string {
  return d.toLocaleDateString("de-DE", {year: "numeric", month: "numeric", day: "numeric"});
}

export function allVariables(data: M.TopLevel[]): M.Variable[] {
  let vars: M.Variable[] = [];
  data.filter(e => e.kind === "category").forEach(c => {
    (c as M.Category).selectables.forEach(sel => {
      if (sel.kind === "box" && sel.value) {
        vars = vars.concat(sel.variables);
      } else if (sel.kind === "group") {
        sel.options.forEach(o => {
          if (sel.value === o.name) vars = vars.concat(o.variables);
        })
      }
    })
  })
  return vars;
}

export function textOfVariable(v: M.Variable): string | undefined {
  if (v.kind === "oc") {
    return v.value;
  } else if (v.kind === "mc") {
    return v.values.filter(val => val[1]).map(val => val[0]).join(", ");
  } else if (v.kind === "text") {
    return v.value;
  } else if (v.kind === "number") {
    if (v.value !== 0) {
      return "" + v.value;
    } else {
      return "";
    }
  } else if (v.kind === "date") {
    return v.value.day + "." + v.value.month + "." + v.value.year;
  }

  return assertUnreachable(v);
}

export function makeNormalCategory(c: M.Category): void {
  if (hasSelection(c)) {
    return;
  }

  for (const entry of c.selectables) {
    if (entry.kind === "box") {
      if (entry.normal) {
        entry.value = true;
      }
    } else if (entry.kind === "group") {
      for (const o of entry.options) {
        if (o.normal) {
          entry.value = o.name;
        }
      }
    }
  }
}

export function hasSelection(c: M.Category): boolean {
  for (const entry of c.selectables) {
    if (entry.kind === "box" && entry.value) {
      return true;
    } else if (entry.kind === "group" && entry.value) {
      return true;
    }
  }
  return false;
}


export function makeEnumeration(e: M.Enumeration, data: M.TopLevel[], textExtractor: M.TextExtractor): string {
  const items: string[] = getRelevantEnumerationItems(e.id, data, textExtractor);
  if (items.length === 0) {
    return "";
  } else if (items.length === 1) {
    return textExtractor.ofEnumeration(e) + items[0] + ". ";
  } else if (items.length === 2) {
    return textExtractor.ofEnumeration(e) + items[0] + " und " + items[1] + ". ";
  } else if (items.length > 2) {
    return textExtractor.ofEnumeration(e) + items.slice(0, items.length - 1).join(", ") + " und " + items[items.length - 1] + " ";
  }
}

export function getRelevantEnumerationItems(id: string, data: M.TopLevel[], textExtractor: M.TextExtractor): string[] {
  const items: string[] = [];
  data.filter(p => p.kind === "category").forEach(p => {
    (p as M.Category).selectables.filter(s => s.kind === "box" && s.value && s.enumeration === id).forEach(s => {
      const result = textExtractor.ofCheckbox(s as M.CheckBox);
      if (result) items.push(expandVariablesInString(result, data, false));
    })
  })
  return items;
}

export function assertUnreachable(x: never): never {
  throw new Error("should not be reachable: " + x);
}
