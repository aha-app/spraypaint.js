import { SpraypaintBase } from "../model"
import { IResultProxy } from "./index"
import { JsonapiResponseDoc } from "../jsonapi-spec"
import { Scope } from "../scope"

export class CollectionProxy<T extends SpraypaintBase>
  implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc
  private _collection: T[]
  private _scope: Scope<T> | undefined

  constructor(
    collection: T[],
    raw_json: JsonapiResponseDoc = { data: [] },
    scope?: Scope<T>
  ) {
    this._collection = collection
    this._raw_json = raw_json
    this._scope = scope

    return new Proxy(this, {
      get(target, prop, receiver) {
        if (prop in target._collection) {
          return Reflect.get(target._collection, prop, receiver._collection)
        } else {
          return Reflect.get(target, prop, receiver)
        }
      },
      has(target, prop) {
        if (prop in target._collection) {
          return true
        } else {
          return Reflect.has(target, prop)
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

  async reload() {
    if (this._scope) {
      const newCollection = await this._scope.reload()
      this._collection = <T[]>newCollection.data
      this._raw_json = newCollection.raw
    }
  }
}
