import { SpraypaintBase } from "../model"
import { IResultProxy } from "./index"
import { JsonapiResponseDoc } from "../jsonapi-spec"
import { Scope } from "../scope"

export class RecordProxy<T extends SpraypaintBase> implements IResultProxy<T> {
  private _raw_json: JsonapiResponseDoc
  private _record: T
  private _scope: Scope<T> | undefined

  constructor(record: T, raw_json: JsonapiResponseDoc, scope?: Scope<T>) {
    this._record = record
    this._raw_json = raw_json
    this._scope = scope

    return new Proxy(this, {
      // Map calls for attributes on the relation to the model.
      get(relation, prop, receiver) {
        if (prop in relation) {
          return Reflect.get(relation, prop, receiver)
        } else {
          return Reflect.get(relation._record, prop, receiver._record)
        }
      },
      set(relation, prop, value) {
        if (prop in relation) {
          return Reflect.set(relation, prop, value)
        } else {
          return Reflect.set(relation._record, prop, value)
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

  async reload() {
    if (this._scope) {
      const newCollection = await this._scope.reload()
      this._record = <T>newCollection.data
      this._raw_json = newCollection.raw
    }
  }
}
