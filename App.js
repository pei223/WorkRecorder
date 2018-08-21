import React, {Component} from 'react'
import {
  StyleSheet,
  View,
 } from 'react-native'
import {
  Router,
  Scene,
} from 'react-native-router-flux'
import {
  Icon,
} from 'native-base'
// redux関連
import { Provider } from 'react-redux';
import { store } from './store'

import Measure from './pages/measure'
import Analysis from './pages/analysis'
import Works from './pages/works'


const focusedColor = 'deepskyblue'
const unforcusedColor = 'gainsboro'
/**
 * タブアイコン
 * props: {
 *  iconName: 表示するアイコンのキー
 * }
 */
class TabIcon extends Component {
  render() {
    let color = this.props.focused ? focusedColor : unforcusedColor
    return (
      <View style={{flex:1, flexDirection:'column', alignItems:'center', alignSelf:'center', justifyContent: 'center'}}>
        <Icon name={this.props.iconName} size={18} style={{color: color}} />
      </View>
    );
  }
}

export default class App extends Component {
  constructor(props){
    super(props)
  }
  render () {
    return (
      <Provider store={store}>
        <Router
          navigationBarStyle={styles.headerView}
          sceneStyle={styles.scenesStyle}>
          <Scene key='root' 
                  titleStyle={styles.titleStyle}
                  tabBarStyle={styles.footerView}
                  tabs={true} 
                  swipeEnabled={true}
                  labelStyle={{fontSize: 12}}
                  activeTintColor={focusedColor}
                  inactiveTintColor={unforcusedColor}>
            <Scene key='measure' 
                  component={Measure}
                  iconName='timer'
                  icon={TabIcon}
                  initial 
                  tabBarLabel='計測'
                  title='作業時間計測' />
            <Scene key='analysis' 
                  component={Analysis} 
                  iconName='md-stats'
                  icon={TabIcon}
                  tabBarLabel='集計' 
                  title='作業データ集計' />
            <Scene key='works' 
                  component={Works} 
                  iconName='paper'
                  icon={TabIcon}
                  tabBarLabel='作業一覧' 
                  title='作業一覧管理' />
          </Scene>
        </Router>
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  headerView: {
    backgroundColor: '#344560'
  },
  footerView: {
    backgroundColor: '#344560'
  },
  scenesStyle: {
    backgroundColor: '#254c87'
  },
  titleStyle: {
    color: 'white',
  }
})