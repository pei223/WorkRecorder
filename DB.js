// 作業データテーブル
const WorkSchema = {
  name: 'Work',
  primaryKey: 'id',
  properties : {
    id: 'int',
    name: 'string'
  }
}
// 作業時間記録テーブル
const RecordSchema = {
  name: 'Record',
  primaryKey: 'id',
  properties: {
    id: 'int',
    workId: 'int',
    seconds: 'int',
    date: 'date'  // 時分秒は0で、0〜28時までをその日とする
  }
}
export const DB_SCHEMA = {schema: [WorkSchema, RecordSchema]}

// // 作業一覧・勉強時間データを操作さするクラス
// export default class DB {
//   static realm = null;
//   constructor(){
//     if (this.realm !== null) {
//       return this
//     }
//     this.realm = new Realm({schema: [WorkSchema, RecordSchema]})
//   }
// }
