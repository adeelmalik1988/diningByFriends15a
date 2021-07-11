import { process, driver, structure } from 'gremlin';

// @ts-ignore
import { MapSerializer } from 'gremlin/lib/structure/io/type-serializers';

MapSerializer.prototype.deserialize = function (obj: any) {
  const value = obj['@value'];
  if (!Array.isArray(value)) {
    throw new Error('Expected Array, obtained: ' + value);
  }
  const result = {};
  for (let i = 0; i < value.length; i += 2) {
    // @ts-ignore
    result[`${this.reader.read(value[i])}`] = this.reader.read(value[i + 1]);
  }
  return result;
};

const { withOptions, t, P, column, order } = process;
export { driver, structure, withOptions, t, P, column, order, process };