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
  NativeEventEmitter,
  NativeModules,
  Platform,
  SafeAreaView,
  ScrollView,
  Slider,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';

import ProgressBar from '../../lib/Progress/Bar';
import {SearchBar} from 'react-native-elements';
import Swiper from '../../lib/Swiper/index';
import Video from 'react-native-video';
import {RNCamera} from 'react-native-camera';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import {Dropdown} from '../../lib/MaterialDropdown/index';
import {TextField} from '../../lib/MaterialTextField/index';
import Accordion from '../../lib/Collapsible/Accordion';
import {warning} from 'react-native-gifted-chat/lib/utils';

const ic_camera_flash_on = require('../../assets/images/ic_camera_flash_on.png');
const ic_camera_flash_off = require('../../assets/images/ic_camera_flash_off.png');
const ic_camera_flip = require('../../assets/images/ic_camera_flip.png');
const ic_close = require('../../assets/images/ic_close.png');

const WINDOW_WIDTH = Helper.getWindowWidth();

const flashModeOrder = {
  off: 'torch',
  torch: 'off',
};

class CameraMainScreen extends Component {
  constructor(props) {
    super(props);

    console.log('CameraMainScreen start');

    this.init();
  }

  componentDidMount() {
    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('camera'));
      Helper.setDarkStatusBar();
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    clearInterval(this.state.timer);
  }

  init = () => {
    this.state = {
      flash: 'off',
      zoom: 0,
      autoFocus: 'on',
      autoFocusPoint: {
        normalized: {x: 0.5, y: 0.5}, // normalized values required for autoFocusPointOfInterest
        drawRectPosition: {
          x: Dimensions.get('window').width * 0.5 - 32,
          y: Dimensions.get('window').height * 0.5 - 32,
        },
      },
      depth: 0,
      type: 'back',
      whiteBalance: 'auto',
      ratio: '16:9',
      recordOptions: {
        mute: false,
        maxDuration: 30,
        quality: RNCamera.Constants.VideoQuality['480p'],
      },
      isRecording: false,
      canDetectFaces: false,
      canDetectText: false,
      canDetectBarcode: false,
      faces: [],
      textBlocks: [],
      barcodes: [],

      isVisibleTimer: true,
      timer: null,
      timerProgress: 0,
    };
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onTick = () => {
    const {timerProgress} = this.state;

    this.setState({
      timerProgress: timerProgress + 1,
    });

    // console.log('test', this.state.timerProgress);
  };

  onTakeVideo = (value) => {
    const {timerProgress} = this.state;

    if (timerProgress < 10) {
      return;
    }

    global._videoUri = value;
    this.props.navigation.navigate('camera_upload');
  };

  toggleFacing = () => {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back',
    });
  };

  toggleFlash = () => {
    this.setState({
      flash: flashModeOrder[this.state.flash],
    });
  };

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on',
    });
  }

  onPressStartRecord = async () => {
    const {isRecording} = this.state;

    if (this.camera && !isRecording) {
      try {
        const promise = this.camera.recordAsync(this.state.recordOptions);

        if (promise) {
          this.setState({isRecording: true, timerProgress: 0});
          const timer = setInterval(this.onTick, 200);
          this.setState({timer});
          const data = await promise;
          this.setState({isRecording: false});
          clearInterval(timer);
          this.onTakeVideo(data.uri);
          console.warn('recoredVideo', data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  onPressStopRecord = async () => {
    await this.camera.stopRecording();
    this.setState({isRecording: false});
  };

  render() {
    return (
      <>
        {Platform.OS === 'ios' && <SafeAreaView style={styles.statusBar} />}
        <SafeAreaView style={styles.container}>
          {this._renderCamera()}
        </SafeAreaView>
      </>
    );
  }

  _renderCamera() {
    const drawFocusRingPosition = {
      top: this.state.autoFocusPoint.drawRectPosition.y - 32,
      left: this.state.autoFocusPoint.drawRectPosition.x - 32,
    };
    return (
      <RNCamera
        ref={(ref) => {
          this.camera = ref;
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        autoFocusPointOfInterest={this.state.autoFocusPoint.normalized}
        zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        androidCameraPermissionOptions={{
          title: 'Permission to use camera',
          message: 'We need your permission to use your camera',
          buttonPositive: 'Ok',
          buttonNegative: 'Cancel',
        }}
        faceDetectionLandmarks={undefined}
        onFacesDetected={null}
        onTextRecognized={null}
        onGoogleVisionBarcodesDetected={null}
        style={{flex: 1}}>
        {this._renderAll()}
      </RNCamera>
    );
  }

  _renderAll = () => {
    return (
      <View style={{flex: 1}}>
        {this._renderTimer()}
        {this._renderControls()}
        {this._renderRecording()}
      </View>
    );
  };

  _renderTimer = () => {
    const {isRecording, timerProgress} = this.state;

    return (
      <>
        {isRecording && (
          <View
            style={{
              position: 'absolute',
              width: '100%',
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ProgressBar
              progress={timerProgress / 150}
              width={WINDOW_WIDTH * 0.5}
              height={6}
              color={'red'}
              borderColor={'white'}
            />
          </View>
        )}
      </>
    );
  };

  _renderControls = () => {
    const {flash} = this.state;

    return (
      <View
        style={{
          width: '100%',
          height: 100,
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 14,
          paddingHorizontal: 20,
          zIndex: 200,
        }}>
        <TouchableOpacity
          onPress={this.onBack}
          style={{...GStyles.centerAlign, width: 40, height: 40}}>
          <Image
            source={ic_close}
            style={{...GStyles.image, width: 20, tintColor: 'white'}}></Image>
        </TouchableOpacity>
        <View style={{justifyContent: 'space-between', marginTop: 10}}>
          <TouchableOpacity onPress={this.toggleFacing}>
            <Image
              source={ic_camera_flip}
              style={{...GStyles.image, width: 28}}></Image>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.toggleFlash}>
            <Image
              source={
                flash == 'torch' ? ic_camera_flash_on : ic_camera_flash_off
              }
              style={{...GStyles.image, width: 32}}></Image>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderRecording = () => {
    const {isRecording} = this.state;
    const backgroundColor = isRecording ? 'white' : 'darkred';
    const action = isRecording
      ? this.onPressStopRecord
      : this.onPressStartRecord;
    const button = isRecording
      ? this._renderStopRecBtn()
      : this._renderRecBtn();
    return (
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          justifyContent: 'flex-end',
          zIndex: 100,
        }}>
        <View style={{alignItems: 'center', marginBottom: 10}}>
          <TouchableOpacity
            style={{...styles.recordButton, ...styles.center}}
            onPress={() => action()}>
            {button}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderStopRecBtn() {
    return <FontAwesome name="stop" size={34} color={'#FF0000'} />;
  }

  _renderRecBtn() {
    return <View style={{...styles.record}} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  statusBar: {
    flex: 0,
    backgroundColor: 'black',
  },
  flipButton: {
    width: '33%',
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flipText: {
    color: 'white',
    fontSize: 15,
  },

  recordButton: {
    height: 72,
    width: 72,
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  record: {
    height: 56,
    width: 56,
    borderRadius: 28,
    backgroundColor: '#FF0000',
  },
  center: {
    position: 'absolute',
    left: WINDOW_WIDTH / 2 - 36,
    bottom: 20,
  },
});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <CameraMainScreen {...props} navigation={navigation} route={route} />;
}
