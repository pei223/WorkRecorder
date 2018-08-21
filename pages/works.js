import React, { Component } from 'react'
import {
  Button,
  Container,
  Content,
  Icon,
  List,
  ListItem,
  Text,
} from 'native-base'
import {
  Alert,
  AlertIOS,
  ListView,
  StyleSheet,
  View,
} from 'react-native'
// Redux関連
import { connect } from 'react-redux'
import { 
  createWork, 
  updateWork, 
  deleteWork, 
  fetchWorks, 
  ERR_ALREADY_EXIST, 
  ERR_MEASURING_WORK,
  NOT_MEASURING_ID, 
} from '../actions/works'
import { 
  deleteWorkRecords,
} from '../actions/records'


// 作業一覧管理のコンポーネント
class Works extends Component {
  /**
   * コンストラクタ
   * @param {[type]} props 親コンポーネントから受け継ぐプロパティ。
   *                       データベースを操作するdbオブジェクトを受け継ぐ
   */
  constructor (props) {
    super(props)
    // 最初に作業データ一覧を取得する
    this.props.fetchWorks()
    this.ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 })
  }


/****************************************************************************
作業データ操作関連
****************************************************************************/
  /**
   * 作業を一覧から削除
   * @param  {Number} secId  リストのリフレッシュに使用される
   * @param  {Number} rowId  行番号
   * @param  {[type]} rowMap リストのリフレッシュに使用される
   */
  deleteWork (secId, rowId, rowMap) {
    // 計測中に作業を削除しようとしたらエラーメッセージ表示
    if (NOT_MEASURING_ID !== this.props.workState.measuringId) {
      Alert.alert('エラー', '計測中は削除できません', [
        {text: 'OK', onPress: () => {}},
      ])
    } else {
      // 削除する作業データの作業時間削除
      this.props.deleteWorkRecords(this.props.workState.works[rowId].id)
      // 作業データ削除
      this.props.deleteWork(this.props.workState.works[rowId].id)
      // 再度作業一覧を取得し、レンダリングをリフレッシュする
      rowMap[`${secId}${rowId}`].props.closeRow()
    }
  }

  /**
   * 作業を一件登録する
   * @param {String} name 作業名
   */
  addWork (name) {
    // 空文字じゃなければ作業追加し更新する
    if ('' !== name){
      this.props.createWork(name)
      // 登録失敗時はエラーメッセージ表示
      if (ERR_ALREADY_EXIST === this.props.workState.err) {
        Alert.alert('エラー', 'すでに存在する作業名です', [
          {text: 'OK', onPress: () => {}},
        ])
      }
    }
  }

  /**
   * 作業を更新する
   * @param  {Number} id 作業データのID
   * @param  {String} name  作業名
   */
  updateWork (id, name) {
    if ('' !== name) {
      this.props.updateWork(id, name)
      // 計測中の作業を更新しようとしたらエラー(通常ありえない)
      if (ERR_MEASURING_WORK === this.props.workState.err) {
        console.error('計測中の作業更新エラー')
      } 
    }
  }

/**************************************************************************
レンダリング関連
**************************************************************************/
  /**
   * 作業名を入力するダイアログを表示する
   */
  inputWorkDialog () {
    AlertIOS.prompt('作業を追加', '作業名を入力してください', [
      {
        text: 'OK',
        onPress: (inputName) => this.addWork(inputName),
      },
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel'
      },
    ],
    'plain-text')
  }

  /**
   * 作業名を変更するダイアログを表示する
   */
  updateWorkDialog (work) {
    // 計測中の作業を更新しようとしたらエラーメッセージ表示
    if (work.id === this.props.workState.measuringId) {
      Alert.alert('エラー', '計測中の作業は更新できません', [
        {text: 'OK', onPress: () => {}},
      ])
      return
    }
    AlertIOS.prompt('作業を変更', '作業名を入力してください', [
      {
        text: 'OK',
        onPress: (inputName) => this.updateWork(work.id, inputName),
      },
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel'
      },
    ],
    'plain-text',
    work.name,)
  }

  /**
   * リストの一行をレンダリング
   * @param  {Object} work 出力する作業
   * @return {Component}      リストの一行のコンポーネント
   */
  renderRow (work) {
    return (
      <ListItem noIndent={true} onPress={() => this.updateWorkDialog(work)}
      style={{ backgroundColor: '#254c87' }} // 妥協策でハードコーディング
      >
        <Text style={styles.workName}>{work.name}</Text>
      </ListItem>
    )
  }

  /**
   * リストの行を右スワイプした時に表示されるボタンのレンダリング
   * @param  {[type]} data   [description]
   * @param  {Number} secId  [description]
   * @param  {Number} rowId  行番号(0~)
   * @param  {[type]} rowMap [description]
   * @return {Component}        行の右に表示されるボタン
   */
  renderRightHidden (data, secId, rowId, rowMap) {
    return (
      <Button active full danger
        onPress={() => this.deleteWork(secId, rowId, rowMap)}>
        <Icon active name='trash' />
      </Button>
    )
  }

  /**
   * 作業一覧画面のレンダリング。
   * stateが変更されたらシステムから自動で呼ばれる
   * @return {コンポーネント} レンダリングするコンポーネント
   */
  render () {
    return (
      <Container style={{backgroundColor: 'transparent'}}>
        <Content>
          <View style={styles.buttonView}>
            <Button full info onPress={() => this.inputWorkDialog()}>
              <Text style={styles.buttonText}>追加する</Text>
            </Button>
          </View>
          <List removeClippedSubviews={false}
            border
            borderColor='gainsboro'
            dataSource={this.ds.cloneWithRows(this.props.workState.works)}
            renderRow={ data => this.renderRow(data) }
            renderRightHiddenRow={ (data, secId, rowId, rowMap) => this.renderRightHidden(data, secId, rowId, rowMap) }
            rightOpenValue={-70} />
        </Content>
      </Container>
    )
  }
}


/**
 * スタイルシート
 * @type {[type]}
 */
const styles = StyleSheet.create({
  workName: {
    fontSize: 18,
    paddingTop: 4,
    paddingBottom: 4,
    color: 'white',
  },  
  // 追加ボタンのテキスト
  buttonText: {
    fontSize: 20,
    color: 'white',
  },
  buttonView: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});


// 使用するReducerの定義
// this.props.worktateを通じてアクセスできる
const mapStateToProps = state => ({
    workState: state.workState,
})
// 使用するactionの定義
const mapDispatchToProps = {
  createWork, updateWork, deleteWork, fetchWorks, deleteWorkRecords, 
}
// Reduxと関連づけてexportする
export default connect(mapStateToProps, mapDispatchToProps)(Works)