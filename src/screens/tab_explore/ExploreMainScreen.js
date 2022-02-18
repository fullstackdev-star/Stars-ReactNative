import React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Button,
  Dimensions,
  FlatList,
  Image,
  Keyboard,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {useNavigation, useRoute, StackActions} from '@react-navigation/native';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import SearchBarItem from '../../components/elements/SearchBarItem';
import {TouchableNativeFeedback} from 'react-native-gesture-handler';

import ExploreVideoScreen from './ExploreVideoScreen';

const image_search = require('../../assets/images/ic_search.png');
const ic_back = require('../../assets/images/ic_back.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const WINDOW_HEIGHT = Helper.getWindowHeight();

class ExploreMainScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ExploreMainScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMount = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('explore'));
      Helper.setLightStatusBar();
      if (this.videoListRef) {
        this.videoListRef.onRefresh('init');
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMount = false;
  }

  init = () => {
    this.state = {
      isFetching: false,
      totalCount: 0,
      curPage: 1,

      searchText: '',
      keyword: '',

      itemDatas: [],
    };

    this._isMount = false;
    this.videoListRef = null;
  };

  onChangeSearchText = (text) => {
    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (text.length == 1) {
      if (parseWhen.indexOf(text.charAt(0)) > -1) {
        return;
      }
    }
    if (text.length > 1) {
      if (
        parseWhen.indexOf(text.charAt(text.length - 1)) > -1 &&
        parseWhen.indexOf(text.charAt(text.length - 2)) > -1
      ) {
        return;
      }
    }

    this.setState({searchText: text});
  };

  onSubmitSearchText = () => {
    Keyboard.dismiss();
    if (this.videoListRef) {
      this.videoListRef.scrollToTop();
    }

    const {searchText} = this.state;

    const lastTyped = searchText.charAt(searchText.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    let keyword = '';
    if (searchText.length > 0) {
      if (parseWhen.indexOf(lastTyped) > -1) {
        keyword = searchText.slice(0, searchText.length - 1);
      } else {
        keyword = searchText;
      }
    } else {
      keyword = searchText;
    }
    if (keyword == '') {
      return;
    }
    this.setState({keyword, searchText: ''});

    global._keyword = keyword;
    this.props.navigation.navigate('explore_search');
  };

  render() {
    const {keyword} = this.state;

    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
        {this._renderSearch()}
        <ExploreVideoScreen
          ref={(ref) => {
            this.videoListRef = ref;
          }}
          keyword={keyword}
        />
      </SafeAreaView>
    );
  }

  _renderSearch = () => {
    const {searchText} = this.state;

    return (
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{flex: 1, marginVertical: 4, marginHorizontal: 8}}>
          <SearchBarItem
            searchText={searchText}
            onChangeText={this.onChangeSearchText}
            onSubmitText={this.onSubmitSearchText}
          />
        </View>
        {searchText != '' && (
          <View style={{...GStyles.centerAlign, marginRight: 12}}>
            <TouchableNativeFeedback
              onPress={this.onSubmitSearchText}
              style={{...GStyles.centerAlign, height: 50}}>
              <Text style={{...GStyles.regularText, color: 'red'}}>Search</Text>
            </TouchableNativeFeedback>
          </View>
        )}
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <ExploreMainScreen {...props} navigation={navigation} route={route} />;
}
