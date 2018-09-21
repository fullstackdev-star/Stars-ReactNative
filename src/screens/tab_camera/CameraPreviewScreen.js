import React, {Component} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BallIndicator,
  BackHandler,
  Button,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';

import {SearchBar} from 'react-native-elements';
import Swiper from '../../lib/Swiper/index';
import Video from 'react-native-video';
import Avatar from '../../components/elements/Avatar';
import CheckBox from '../../lib/Checkbox/index';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import {TextField} from '../../lib/MaterialTextField/index';
import Accordion from '../../lib/Collapsible/Accordion';
import {forEach} from 'underscore';

const ic_close = require('../../assets/images/ic_close.png');

const WINDOW_HEIGHT = Helper.getWindowHeight();

class CameraPreviewScreen extends Component {
  constructor(props) {
    super(props);

    console.log('CameraPreviewScreen start');

    this.init();
  }

  componentDidMount() {
    Helper.callFunc(global.setBottomTabName('camera'));
    Helper.setDarkStatusBar();
    this.onRefresh();
  }

  componentWillUnmount() {}

  init = () => {
    this.state = {videoUri: global._videoUri};
  };

  onRefresh = () => {};

  onBack = () => {
    this.props.navigation.goBack();
  };

  onVideoReadyForDisplay = (value) => {
    console.log('---onVideoReadyForDisplay');
  };

  onVideoBuffer = () => {
    console.log('---onVideoBuffer');
  };

  onVideoError = () => {
    console.log('---onVideoError');
  };

  onVideoLoad = () => {
    console.log('---onVideoLoad');
  };

  onVideoProgress = (value) => {};

  render() {
    return (
      <>
        {this._renderPreview()}
        {this._renderControls()}
      </>
    );
  }

  _renderPreview = () => {
    const {videoUri} = this.state;

    return (
      <View style={{width: '100%', height: '100%'}}>
        <Video
          source={{uri: videoUri}}
          resizeMode="contain"
          repeat
          paused={false}
          playWhenInactive={false}
          playInBackground={false}
          onReadyForDisplay={this.onVideoReadyForDisplay}
          onBuffer={this.onVideoBuffer}
          onError={this.onVideoError}
          onLoad={this.onVideoLoad}
          onProgress={this.onVideoProgress}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            backgroundColor: 'black',
          }}
        />
      </View>
    );
  };

  _renderControls = () => {
    const {flash} = this.state;

    return (
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: 100,
          marginTop: 14,
          paddingHorizontal: 10,
          zIndex: 1,
          elevation: 1,
        }}>
        <TouchableOpacity
          onPress={this.onBack}
          style={{
            ...GStyles.centerAlign,
            width: 40,
            height: 40,
            marginTop: 20,
          }}>
          <Image
            source={ic_close}
            style={{...GStyles.image, width: 20, tintColor: 'white'}}></Image>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = {};

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <CameraPreviewScreen {...props} navigation={navigation} route={route} />
  );
}
