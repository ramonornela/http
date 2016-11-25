export class ModelBase {
  getDataRoot(data: any, rootProperty: string): any {
    let rootPropertyArray = rootProperty.split('.');

    for (let i = 0, length = rootPropertyArray.length; i < length; i++) {
      if (!(rootPropertyArray[i] in data)) {
        throw new Error(`Key '${rootPropertyArray[i]}' not exists`);
      }

      data = data[rootPropertyArray[i]];
    }

    return data;
  }
}
