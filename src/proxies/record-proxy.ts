import { SpraypaintBase } from "../model"
import { IResultProxy } from "./index"
import { JsonapiResponseDoc } from "../jsonapi-spec"

export class RecordProxy<T extends SpraypaintBase> implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc
  private _record: T

  constructor(record: T, raw_json: JsonapiResponseDoc) {
    this._record = record
    this._raw_json = raw_json

    return new Proxy(this, {
      // Map calls for attributes on the relation to the model.
      get(relation, prop, receiver) {
        if (prop in relation) {
          return relation[prop]
        } else {
          return relation._record[prop]
        }
      },
      set(relation, prop, value) {
        if (prop in relation) {
          relation[prop] = value
          return true
        } else {
          relation._record[prop] = value
          return true
        }
      }
    })
  }

  get raw(): JsonapiResponseDoc {
    return this._raw_json
  }

  get data(): T {
    return this._record
  }

  get meta(): Record<string, any> {
    return this.raw.meta || {}
  }
}
