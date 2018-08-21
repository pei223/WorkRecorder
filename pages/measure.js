import React, { Component } from 'react'
import {
  Linking,
  Picker,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  Container,
  Content,
  Button,
  Icon,
  Right,
} from 'native-base'
import { connect } from 'react-redux'
sprintf = require('sprintf').sprintf

import config from '../config.json'
import { 
  fetchWorks,
  startMeasuring,
  doneMeasuring,
  receiveWorkDeleted,
  NOT_MEASURING_ID,
} from '../actions/works'
import { 
  createRecord,
  readRecord,
 } from '../actions/records'


class Measure extends Component {
  constructor (props) {
    super(props)
    this.props.fetchWorks()
    // 作業選択初期値
    this.DEFAULT_SELECTED_ROWID = -1
    this.state = {
      selectedRowId: this.DEFAULT_SELECTED_ROWID,
      workTime: 0,
    }
    // タイマーオブジェクトのID
    this.timerId = null
  }

  /****************************************************************************
  時間計測操作関連
  ****************************************************************************/
  /**
   * 作業時間計測を開始する
   */
  startTimer () {
    let work = this.props.workState.works[this.state.selectedRowId]
    // 計測中でない、作業データが選択されているなら計測開始する
    if ((this.DEFAULT_SELECTED_ROWID !== this.state.selectedRowId) && (null === this.timerId)) {
      this.props.startMeasuring(work.id)
      // １秒ごとタイマーを更新する
      this.timerId = setInterval(function() {
        this.setState({workTime: this.state.workTime + 1})
      }.bind(this), 1000)
    }
  }

  /**
   * 作業時間計測を停止する
   */
  stopTimer () {
    // 計測中かつ作業データが選択されているなら計測開始する
    if ((this.DEFAULT_SELECTED_ROWID !== this.state.selectedRowId) && (null !== this.timerId)) {
      // 作業時間の登録・更新
      this.props.createRecord(
          this.props.workState.measuringId, new Date(), this.state.workTime)
      // 作業計測終了を知らせる
      this.props.doneMeasuring()
      // タイマーを止める
      clearTimeout(this.timerId)
      this.timerId = null
    }
  }

  /**
   * 作業内容をツイートする画面を表示する
   */
  tweetWork () {
    // 作業が選択されていなければ終了
    if (this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId) return
    let hours = Math.floor(this.state.workTime / (60 * 60))
    let minutes = Math.floor((this.state.workTime / 60) % 60)
    let text = this.props.workState.works[this.state.selectedRowId].name + 'を'
    if (0 !== hours)    text += hours + '時間'
    if (0 !== minutes)  text += minutes + '分'
    text += '勉強しました。'
    // ツイート内容を設定してTwitterを開く
    url  = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + 
            '&hashtags=' + encodeURIComponent(config.hashtag)
    Linking.openURL(url)
  }

  /**
   * 作業変更時の処理
   * 今日勉強した作業なら時間を引き継ぐ
   * @param  {Number} rowId 作業一覧配列のデータ番号
   */
  changeWork (rowId) {
    // 作業が選択されたらその作業の勉強時間を取得する
    let workTime = 0
    if (this.DEFAULT_SELECTED_ROWID !== rowId) {
      // 作業時間をrecordStateに設定
      this.props.readRecord(this.props.workState.works[rowId].id, new Date())
      // 作業時間取得
      workTime = this.props.recordState.seconds
    }
    this.setState({workTime: workTime, selectedRowId: rowId})
  }

  /**************************************************************************
  レンダリング関連
  **************************************************************************/
  /**
   * 作業一覧用の作業データのレンダリング
   * @param  {Object} work 作業データ。作業のname、idを持つ
   * @param  {Number} index   作業データの配列のインデックス
   * @return {Component}         作業データをレンダリングしたコンポーネント
   */
  renderPickerItem (work, index) {
    return (
      <Picker.Item label={work.name} key={index} value={index} />
    )
  }

  /**
   * 作業が登録されていない場合の作業表示欄のレンダリング
   * @return {Component} 作業が登録されていない場合の作業表示コンポーネント
   */
  renderNoWorkBlock () {
    return (
      <View style={styles.workNameBox}>
        <Text style={styles.workName}>作業を登録してください</Text>
      </View>
    )
  }

  /**
   * 作業時間計測ボタンのレンダリング
   * @return {Component} 計測開始・終了ボタンのコンポーネント
   */
  renderToggleButton () {
    return (
      NOT_MEASURING_ID !== this.props.workState.measuringId?
        <Button full danger disabled={this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId}
          onPress={() => this.stopTimer()}>
          <Text style={styles.buttonText}>STOP</Text>
        </Button>
         :
        <Button full success disabled={this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId}
          onPress={() => this.startTimer()}>
          <Text style={styles.buttonText}>START</Text>
        </Button>
    )
  }

  /**
   * タイマー部分のレンダリング
   * @return {Component} タイマー部分のコンポーネント
   */
  renderTimer () {
    let hours = sprintf('%d', Math.floor(this.state.workTime / (60 * 60)))
    let minutes = sprintf('%02d', Math.floor((this.state.workTime / 60) % 60))
    let seconds = sprintf('%02d', this.state.workTime % 60)
    return (
      <View style={styles.timer} >
        <Text style={styles.timerText}>{ hours + ' : ' + minutes + ' : ' + seconds}</Text>
      </View>
    )
  }

  /**
   * ツイートボタンのレンダリング
   * @return {Component} ツイートボタンのコンポーネント
   */
  renderTweetButton () {
    // 勉強時間が0もしくは作業が選択されていないならツイートボタンを無効にする
    let disabled = (0 === this.state.workTime) || (this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId)
    // 計測中でなければレンダリングする
    return (
      NOT_MEASURING_ID !== this.props.workState.measuringId? <View /> :
      <View style={styles.tweetButtonView}>
        <Right>
          <Button iconLeft disabled={disabled} onPress={() => this.tweetWork()}>
            <Icon type='FontAwesome' name='twitter' />
            <Text style={styles.tweetButtonText}>　ツイートする　</Text>
          </Button>
        </Right>
      </View>
    )
  }

  /**
   * 時間計測画面のレンダリング。
   * stateが変更されたらシステムから自動で呼ばれる
   * @return {コンポーネント} レンダリングするコンポーネント
   */
  render () {
    // 削除後は作業時間を取得する
    // TODO ほんとはrenderないでrender呼び出すのダメだけどそれ以外書きようがないし無限ループしない保証ある
    if (this.props.workState.isDeleted) {
      this.props.receiveWorkDeleted()
      // 末尾が削除されていたら選択なしにする
      if (this.state.selectedRowId === this.props.workState.works.length) {
        this.changeWork(this.DEFAULT_SELECTED_ROWID)
      } 
      // 再度作業時間を取得し直す
      else {
        this.changeWork(this.state.selectedRowId)
      }
    }
    // 作業選択、表示コンポーネント
    let workBlock = ''
    // データがないなら作業を登録してくださいと表示する
    if (0 === this.props.workState.works.length){
      workBlock = this.renderNoWorkBlock()
    }
    else {
      // 計測中なら作業名を表示
      // 計測前なら作業一覧から選択
      workBlock = NOT_MEASURING_ID !== this.props.workState.measuringId?
        <View style={styles.workNameBox}>
          <Text style={styles.workName}>
            { this.props.workState.works[this.state.selectedRowId].name }
          </Text>
          <Text/><Text/>
          <Text style={styles.measuringText}>{ '計測中' }</Text>
        </View>
        :
        <Picker onValueChange={ (itemValue) => this.changeWork(itemValue) }
          iosHeader='選択してください' mode='dropdown'
          selectedValue={this.state.selectedRowId}
          enabled={this.DEFAULT_SELECTED_ROWID === this.state.selectedRowId}
          itemStyle={styles.pickerItemStyle}>
            <Picker.Item key={'unselectable'} label={'--作業名を選択してください--'}
              value={this.DEFAULT_SELECTED_ROWID} />
            { this.props.workState.works.map((work, index) => {
                return this.renderPickerItem(work, index)
              }) }
        </Picker>
    }

    return (
      <Container  style={{backgroundColor: 'transparent'}}>
        <Content>
          { workBlock }
          { this.renderTimer() }
          <View style={styles.toggleButton}>
            {this.renderToggleButton()}
          </View>
          { this.renderTweetButton() }
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  pickerItemStyle: {
    color: 'white'
  },
  // 計測時の作業名
  workName: {
    fontSize: 30,
    color: 'white',
  },
  // 「計測中」の文字
  measuringText: {
    fontSize: 20,
    color: 'white',
  },
  // 計測時の作業名のView
  workNameBox: {
    marginTop: 40,
    marginBottom: 40,
    alignItems: 'center',
    color: 'white',
  },
  // タイマーの開始・終了ボタン
  toggleButton: {
    marginTop: 25,
  },
  // タイマーのボタンのテキスト
  buttonText: {
    fontSize: 22,
    color: 'white',
  },
  // タイマーのView
  timer: {
    alignItems: 'center',
  },
  // タイマーの計測時間
  timerText: {
    fontSize: 60,
    color: 'white',
  },

  // ツイートボタンのView
  tweetButtonView: {
    alignItems: 'center',
    marginTop: 25,
  },
  // ツイートボタン内のテキスト
  tweetButtonText: {
    fontSize: 18,
    color: 'white',
  },
})


// 使用するReducerの定義
// this.props.recordState, workStateを通じてアクセスできる
const mapStateToProps = state => ({
    workState: state.workState,
    recordState: state.recordState,
})

// 使用するactionの定義
// コンポーネント上で使うイベントハンドラとして関数を準備する
const mapDispatchToProps = {  
  fetchWorks, startMeasuring, doneMeasuring, receiveWorkDeleted,
  readRecord, createRecord,
}

// Reduxと関連づけてexportする
export default connect(mapStateToProps, mapDispatchToProps)(Measure)