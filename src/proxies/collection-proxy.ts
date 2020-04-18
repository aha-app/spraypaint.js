import { SpraypaintBase } from "../model"
import { IResultProxy } from "./index"
import { JsonapiResponseDoc } from "../jsonapi-spec"

export class CollectionProxy<T extends SpraypaintBase>
  implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc
  private _collection: T[]

  constructor(collection: T[], raw_json: JsonapiResponseDoc = { data: [] }) {
    this._collection = collection
    this._raw_json = raw_json

    return new Proxy(this, {
      get(collection, prop) {
        if (prop in collection) {
          return collection[prop]
        } else if (prop in collection._collection) {
          return collection._collection[prop]
        }
      },
      has(collection, prop) {
        if (prop in collection) {
          return true
        } else if (prop in collection._collection) {
          return true
        } else {
          return false
        }
      }
    })
  }

  get raw(): JsonapiResponseDoc {
    return this._raw_json
  }

  get data(): T[] {
    return this._collection
  }

  get meta(): Record<string, any> {
    return this.raw.meta || {}
  }
}
