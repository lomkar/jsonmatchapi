import { v4 as uuidv4 } from "uuid";
import InfoError from "../errors/InfoError";

interface JsonValue {
  [key: string]: JsonValue | JsonValue[] | string | number | boolean | null;
}

export interface JsonDataWithId {
  id: string;
  [key: string]:
    | JsonValue
    | JsonValue[]
    | JsonDataWithId
    | JsonDataWithId[]
    | string
    | number
    | boolean
    | null;
}

function generateIds(
  data: JsonDataWithId | JsonDataWithId[] | JsonValue | JsonValue[]
) {
  if (Array.isArray(data)) {
    data.forEach((i) => {
      // i.id = new Date().toString();
      return generateIds(i);
    });
  } else if (typeof data === "object" && data !== null) {
    let ifIdPresent = false;
    for (const key in data) {
      if (data.hasOwnProperty("id")) {
        ifIdPresent = true;
      }
    }
    if (!ifIdPresent) {
      data.id = uuidv4();
    }

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];
        if (
          Array.isArray(value) ||
          (typeof value === "object" && value !== null)
        ) {
          generateIds(value);
        }
      }
    }
    return data;
  } else {
    return data;
  }
  return data;
}
// addIdRecursively(data);

export const generateUniqueIdToJson = (obj: JsonDataWithId) => {
  return generateIds(obj);
};

export const generateIdForObject = (obj: any) => {
  if (typeof obj === "object" && obj !== null) {
    let ifIdPresent = false;
    for (const key in obj) {
      if (obj.hasOwnProperty("id")) {
        ifIdPresent = true;
      }
    }

    if (!ifIdPresent) {
      obj.id = uuidv4();
    }
  }
  return obj;
};

export const checkIfJSON = (text: unknown) => {
  if (typeof text !== "string") {
    throw new InfoError("Not a valid json");
    return false;
  }
  try {
    JSON.parse(text);
    return true;
  } catch (error) {
    console.log("ERROR", error);
    throw new InfoError("Not a valid json");
    return false;
  }
};
