import React, { Component } from 'react'
import {
  StyleSheet,
  Text,
  View,
} from 'react-native'
import {
  Button,
  Container,
  Content,
} from 'native-base'
import { 
  VictoryAxis, 
  VictoryBar, 
  VictoryChart, 
  VictoryTheme, 
} from 'victory-native'
// Redux関連
import { connect } from 'react-redux'
import { 
  dailyRecords, 
  weeklyRecords, 
  monthlyRecords,
  SUMMARY_TYPE_DAILY,
  SUMMARY_TYPE_WEEKLY,
  SUMMARY_TYPE_MONTHLY,
 } from '../actions/records'


class Analysis extends Component {
  constructor (props) {
    super(props)
    this.props.dailyRecords(new Date())
    this.LABEL_LENGTH_LIMIT = 5
  }

  /************************************************************************************
   * 描画部分
   ************************************************************************************/
  render () {
    const tickValues = []   // ラベルのインデックス？
    const labels = []       // X軸のラベル
    const renderData = []   // レンダリングするデータ
    // 集計したデータをpropsのDBオブジェクトから取得する
    let data = this.props.recordState.records
    for (let i=0;i<data.length;i++){
      // renderData.push({num: i+1, minutes: Math.floor(data[i].seconds / 60)})
      renderData.push({num: i+1, minutes: Math.floor(data[i].seconds)})
      tickValues.push(i+1)
      // 長すぎる作業名は丸め込む
      let label = data[i].name 
      if (label.length >= this.LABEL_LENGTH_LIMIT) 
          label = label.substring(0, this.LABEL_LENGTH_LIMIT) + '..'
      labels.push(label)
    }
    return (
      <Container  style={{backgroundColor: 'transparent'}}>
        <Content>
          <View style={styles.buttonContainer}>
            <Button info style={styles.button}
                    bordered={SUMMARY_TYPE_DAILY !== this.props.recordState.summaryType} 
                    onPress={() => this.props.dailyRecords(new Date())}>
              <Text style={SUMMARY_TYPE_DAILY !== this.props.recordState.summaryType ? styles.selectedButtonText : styles.buttonText}>一日</Text>
            </Button>
            <Button info style={styles.button} 
                    bordered={SUMMARY_TYPE_WEEKLY !== this.props.recordState.summaryType} 
                    onPress={() => this.props.weeklyRecords()}>
              <Text style={SUMMARY_TYPE_WEEKLY !== this.props.recordState.summaryType ? styles.selectedButtonText : styles.buttonText}>週</Text>
            </Button>
            <Button info style={styles.button} 
                    bordered={SUMMARY_TYPE_MONTHLY !== this.props.recordState.summaryType} 
                    onPress={() => this.props.monthlyRecords()}>
              <Text style={SUMMARY_TYPE_MONTHLY !== this.props.recordState.summaryType ? styles.selectedButtonText : styles.buttonText}>月</Text>
            </Button>
          </View>
          <View style={styles.chartContainer}>
            <VictoryChart
              theme={VictoryTheme.material}
              domainPadding={50}
              animate={{duration: 500}} 
              >
              <VictoryAxis
                style={labelAxisStyle}
                tickValues={tickValues}
                tickFormat={labels} />
              <VictoryAxis
                style={axisStyle}
                dependentAxis
                tickFormat={(x) => (x + '分')} />
              <VictoryBar
                style={barStyle}
                data={renderData}
                x='num'
                y='minutes' />
            </VictoryChart>
          </View>
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  // ボタン内のテキスト
  buttonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'white',
  },
  // 選択されていない時のボタン内のテキスト
  selectedButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'skyblue',
  },
  // ボタンを内包するView
  buttonContainer: {
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 10,
  },
  // ボタン
  button: {
    justifyContent: 'center',
    flex: 1,
    width: '100%',
    margin: 10
  },
  // チャートを内包するView
  chartContainer: {
    justifyContent: 'center',
  },
})
const labelAxisStyle = {
  tickLabels: {stroke: '#bfd8ff', angle: 45},
}
const axisStyle = {
  tickLabels: {stroke: '#bfd8ff'},
}
const barStyle = {
  data: { fill: '#bfd8ff', } 
}

// 使用するReducerの定義
// this.props.recordStateを通じてアクセスできる
const mapStateToProps = state => ({
    recordState: state.recordState
})

// 使用するactionの定義
// コンポーネント上で使うイベントハンドラとして関数を準備する
const mapDispatchToProps = {  
    dailyRecords, weeklyRecords, monthlyRecords,
}

// Reduxと関連づけてexportする
export default connect(mapStateToProps, mapDispatchToProps)(Analysis)