// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function assertNever(n: never): never {
  throw new Error(JSON.stringify(n) + " should never be a value");
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function flatMap<X, Y>(xs: X[], f: (x: X) => Y[]): Y[] {
  let ret: Y[] = [];

  for (const x of xs) {
    ret = ret.concat(f(x));
  }

  return ret;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function displayableQuotient(numerator: number, denominator: number, fractionDigits: number = 2): string {
  const res = numerator / denominator ;
  if (isFinite(res)) {
    return res.toFixed(fractionDigits);
  } else {
    return "   ";
  }
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function levenshtein(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) {
    return bn;
  }
  if (bn === 0) {
    return an;
  }
  const matrix = new Array<number[]>(bn + 1);
  for (let i = 0; i <= bn; ++i) {
    const row = matrix[i] = new Array<number>(an + 1);
    row[0] = i;
  }
  const firstRow = matrix[0];
  for (let j = 1; j <= an; ++j) {
    firstRow[j] = j;
  }
  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1], // substitution
          matrix[i][j - 1], // insertion
          matrix[i - 1][j] // deletion
        ) + 1;
      }
    }
  }
  return matrix[bn][an];
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getAllIndexOf(searchStr: string, inputStr: string, caseSensitive: boolean): number[] {
  // searches for all occurrences of a searchString within an inputString and returns all start indexes as an array
  if (searchStr.length === 0) {
    return [];
  }

  if (!caseSensitive) {
    inputStr = inputStr.toLowerCase();
    searchStr = searchStr.toLowerCase();
  }

  let startIndex = 0;
  let index: number;
  const indexes: number[] = [];

  while ((index = inputStr.indexOf(searchStr, startIndex)) > -1) {
    indexes.push(index);
    startIndex = index + searchStr.length;
  }

  return indexes;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function splitStringFromIndexes(input: string, indexes: number[]): string[] {
  const splitText: string[] = [];
  indexes.sort();
  for (let i = 0; i < indexes.length; i++) {
    if (i === indexes.length) {
      splitText.push(input.substring(indexes[i], input.length));
    } else {
      splitText.push(input.substring(indexes[i], indexes[i + 1]));
    }
  }
  return splitText;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getDateFormatted(date: Date, addTime: boolean): string {
  let result: string;
  const day: string = ("0" + date.getDate()).slice(-2);
  const month: string = ("0" + (date.getMonth() + 1)).slice(-2);
  result = day + "." + month + "." + date.getFullYear();
  if (addTime) {
    const hour: string = ("0" + date.getHours()).slice(-2);
    const minutes: string = ("0" + date.getMinutes()).slice(-2);
    result += ", " + hour + ":" + minutes;
  }
  return result;
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  console.log(bytes);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getBase64Image(img) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);

  const dataURL = canvas.toDataURL("image/png");

  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getFileExtension(filename: string) {
  return filename.split(".").pop().toLowerCase();
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getImageDimensions(imgUrl): [number, number] {

  let width: number;
  let height: number;
  const img = new Image();

  img.src = imgUrl;
  img.onload = (event) => {
    const loadedImage = event.currentTarget as HTMLImageElement;
    width = loadedImage.width;
    height = loadedImage.height;
  };

  console.log("UTIL HERE");
  console.log(width, height);
  return [width, height];
}

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function getNextHighestValue(array, testValue): number {
  for (const value of array) {
    if (value > testValue) {
      return value;
    }
  }
  return -1;
}
