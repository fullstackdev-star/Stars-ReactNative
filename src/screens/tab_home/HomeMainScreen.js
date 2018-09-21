import React, {Component} from 'react';
import {
  AppState,
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

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';

import convertToProxyURL from 'react-native-video-cache';
import Share, {ShareSheet} from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ShareDialog, MessageDialog} from 'react-native-fbsdk';

import {LogLevel, RNFFmpeg} from 'react-native-ffmpeg';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';

import {SearchBar} from 'react-native-elements';
import Swiper from '../../lib/Swiper/index';
import Video from 'react-native-video';
import Avatar from '../../components/elements/Avatar';
import ProgressModal from '../../components/ProgressModal';
import CheckBox from '../../lib/Checkbox/index';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import {Dropdown} from '../../lib/MaterialDropdown/index';
import {TextField} from '../../lib/MaterialTextField/index';
import Accordion from '../../lib/Collapsible/Accordion';
import {forEach} from 'underscore';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');
const ic_favorite_active = require('../../assets/images/ic_favorite_active.png');
const ic_favorite_inactive = require('../../assets/images/ic_favorite_inactive.png');
const ic_message = require('../../assets/images/ic_message.png');
const ic_logo = require('../../assets/images/ic_logo.png');

const WINDOW_HEIGHT = Helper.getWindowHeight();
const STATUS_BAR_HEIGHT = Helper.getStatusBarHeight();
const BOTTOM_BAR_HEIGHT = Helper.getBottomBarHeight();
const VIDEO_HEIGHT = WINDOW_HEIGHT - STATUS_BAR_HEIGHT - BOTTOM_BAR_HEIGHT;

class HomeMainScreen extends Component {
  constructor(props) {
    super(props);

    console.log('HomeMainScreen start');

    this.init();
  }

  async componentDidMount() {
    this._isMounted = true;

    SplashScreen.hide();

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('home'));
      Helper.setDarkStatusBar();
      this.onRefresh('init');
      this.setState({isVideoPause: false});

      if (this.props.navigation.canGoBack()) {
        BackHandler.removeEventListener('hardwareBackPress', this.onBack);
      } else {
        BackHandler.removeEventListener('hardwareBackPress', this.onBack);
        this.backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBack,
        );
      }
    });
    this.unsubscribeBlur = this.props.navigation.addListener('blur', () => {
      if (this._isMounted) {
        this.setState({isVideoPause: true});
      }
    });

    AppState.addEventListener('change', this.onChangeAppState);
  }

  componentWillUnmount() {
    this.unsubscribeFocus();
    this.unsubscribeBlur();
    BackHandler.removeEventListener('hardwareBackPress', this.onBack);
    AppState.removeEventListener('change', this.onChangeAppState);

    this._isMounted = false;
  }

  onChangeAppState = (nextAppState) => {
    if (nextAppState === 'active') {
      if (this.props.navigation.isFocused()) {
        this.setState({isVideoPause: false});
      }
    } else {
      this.setState({isVideoPause: true});
    }
  };

  init = () => {
    this.state = {
      isVideoLoading: true,
      isVideoPause: false,

      isVisibleProgress: false,
      percent: 0,

      isFetching: false,
      totalCount: 0,
      curPage: 1,
      itemDatas: [],
    };

    this._isMounted = false;
    this._curIndex = null;
    this._curVideoId = -1;
    this.username = null;
    this.password = null;

    Helper.hasPermissions();
  };

  onRefresh = async (type) => {
    let {isFetching, totalCount, curPage, itemDatas} = this.state;

    if (isFetching) {
      return;
    }

    if (type == 'more') {
      curPage += 1;
      const maxPage =
        (totalCount + Constants.COUNT_PER_PAGE - 1) / Constants.COUNT_PER_PAGE;
      if (curPage > maxPage) {
        return;
      }
    } else {
      curPage = 1;
    }
    this.setState({curPage});

    if (type == 'init') {
      showForcePageLoader(true);
      try {
        this.username = await AsyncStorage.getItem(Constants.KEY_USERNAME);
      } catch (e) {
        // error reading value
      }
      try {
        this.password = await AsyncStorage.getItem(Constants.KEY_PASSWORD);
      } catch (e) {
        // error reading value
      }
    } else {
      this.setState({isFetching: true});
    }
    let params = {
      user_id: global.me ? global.me.id : '0',
      page_number: type == 'more' ? curPage : '1',
      count_per_page: Constants.COUNT_PER_PAGE,
      username: this.username ? this.username : '',
      password: this.password ? this.password : '',
    };
    RestAPI.get_all_video_list(params, (json, err) => {
      if (type == 'init') {
        showPageLoader(false);
      } else {
        if (this._isMounted) {
          this.setState({isFetching: false});
        }
      }

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({totalCount: json.data.total_count});
            if (type == 'more') {
              let data = itemDatas.concat(json.data.video_list);
              this.setState({itemDatas: data});
            } else {
              this.setState({itemDatas: json.data.video_list});
              if (!global.me) {
                if (json.data.login_data.status == 1) {
                  global.me = json.data.login_data.data;

                  params = {
                    user_id: json.data.login_data.data.id,
                    one_signal_id: global._pushAppId,
                    token: global._pushToken,
                    device_id: global._deviceId,
                    device_type: Platform.OS === 'android' ? '0' : '1',
                  };
                  showForcePageLoader(true);
                  RestAPI.register_push_token(params, (json, err) => {
                    showPageLoader(false);

                    if (err !== null) {
                      Helper.alertNetworkError();
                    } else {
                      if (json.status !== 1) {
                        Helper.alertServerDataError();
                      }
                    }
                  });
                }
              }
            }
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onBack = () => {
    if (this.props.navigation.isFocused()) {
      Alert.alert(Constants.warningTitle, 'Are you sure you want to quit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    }
  };

  onVideoReadyForDisplay = (item) => {
    console.log('---onVideoReadyForDisplay');
    this.setState({isVideoLoading: false});

    if (this._curVideoId == item.id) {
      return;
    }
    this._curVideoId = item.id;

    let params = {
      video_id: item.id,
      owner_id: item.user_id,
      viewer_id: global.me ? global.me.id : 0,
      device_type: 1,
      device_identifier: global._deviceId,
    };

    RestAPI.update_video_view(params, (json, err) => {});
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

  onVideoProgress = (value) => {
    this.setState({isVideoLoading: false});
  };

  onVideoEnd = () => {};

  onViewableItemsChanged = ({viewableItems, changed}) => {
    if (changed.length > 0) {
      const item = changed[0];
      this._curIndex = item.index;
      this.setState({isVideoLoading: true});
    }
  };

  onPressAvatar = (item) => {
    if (global.me) {
      if (item.user_id == global.me.id) {
        this.props.navigation.navigate('profile');
      } else {
        global._opponentId = item.user_id;
        global._opponentName = item.user_name;
        global._opponentPhoto = item.user_photo;
        this.props.navigation.navigate('profile_other');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressLike = (isChecked, item) => {
    let {itemDatas} = this.state;

    if (global.me) {
      const params = {
        user_id: global.me.id,
        video_id: item.id,
        is_like: isChecked,
      };
      showPageLoader(true);
      RestAPI.update_like_video(params, (json, err) => {
        showPageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError();
        } else {
          if (json.status === 1) {
            item.is_like = isChecked;
            this.setState(itemDatas);
          } else {
            Helper.alertServerDataError();
          }
        }
      });
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressMessage = (item) => {
    if (global.me) {
      if (item.user_id == global.me.id) {
        return;
      } else {
        global._roomId = item.user_id;
        global._opponentName = item.user_name;
        this.props.navigation.navigate('message_chat');
      }
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onPressShare = (item) => {
    if (global.me) {
      this._item = item;
      this.Scrollable.open();
    } else {
      this.props.navigation.navigate('signin');
    }
  };

  onShareFacebook = async () => {
    this.Scrollable.close();

    if (Platform.OS === 'android') {
      const SHARE_LINK_CONTENT = {
        contentType: 'link',
        contentUrl: Constants.GooglePlayUrl,
        quote: '@' + this._item.user_name + ' #' + this._item.number,
      };

      const canShow = await ShareDialog.canShow(SHARE_LINK_CONTENT);
      if (canShow) {
        try {
          const {isCancelled, postId} = await ShareDialog.show(
            SHARE_LINK_CONTENT,
          );
          if (isCancelled) {
            warning(Constants.warningTitle, 'Share cancelled');
          } else {
            success(Constants.successTitle, 'Success to share');
          }
        } catch (error) {
          error(Constants.errorTitle, 'Failed to share');
        }
      }
    } else {
      const shareOptions = {
        title: 'Share to Facebook',
        message: '@' + this._item.user_name + ' #' + this._item.number,
        url: Constants.GooglePlayUrl,
        social: Share.Social.FACEBOOK,
      };
      Share.shareSingle(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    }
  };

  onShareFacebookMessenger = async () => {
    this.Scrollable.close();

    const SHARE_LINK_CONTENT = {
      contentType: 'link',
      contentUrl: Constants.GooglePlayUrl,
      quote: '@' + this._item.user_name + ' #' + this._item.number,
    };

    const canShow = await MessageDialog.canShow(SHARE_LINK_CONTENT);
    if (canShow) {
      try {
        const {isCancelled, postId} = await MessageDialog.show(
          SHARE_LINK_CONTENT,
        );
        if (isCancelled) {
          warning(Constants.warningTitle, 'Share cancelled');
        } else {
          success(Constants.successTitle, 'Success to share');
        }
      } catch (error) {
        error(Constants.errorTitle, 'Failed to share');
      }
    }
  };

  onShareWhatsApp = async () => {
    this.Scrollable.close();

    if (Platform.OS === 'android') {
      const shareOptions = {
        title: 'Share to WhatsApp',
        // message: '@' + this._item.user_name + ' #' + this._item.number,
        url: Constants.GooglePlayUrl,
        social: Share.Social.WHATSAPP,
      };
      Share.shareSingle(shareOptions)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } else {
      let url = 'whatsapp://send?text=' + Constants.GooglePlayUrl;
      Linking.openURL(url)
        .then((data) => {
          console.log('WhatsApp Opened');
        })
        .catch(() => {
          alert('Make sure Whatsapp installed on your device');
        });
    }
  };

  onDownloadVideo = async () => {
    this.Scrollable.close();

    if (!global.me) {
      return;
    }

    Helper.hasPermissions();

    this.setState({percent: 0, isVisibleProgress: true});

    RNFetchBlob.config({
      fileCache: true,
      appendExt: 'mp4',
    })
      .fetch('GET', this._item.url, {})
      .uploadProgress((written, total) => {
        console.log('uploaded', written / total);
      })
      .progress((received, total) => {
        const percent = Math.round((received * 100) / total);
        console.log('progress', percent);
        this.setState({percent});
      })
      .then((resp) => {
        this.setState({isVisibleProgress: false});
        success(Constants.successTitle, 'Success to download');
        const originPath = resp.path();
        const newPath = originPath + '.mp4';
        const watermarkText =
          '@' +
          this._item.user_name +
          '\n#' +
          this._item.number +
          '\n' +
          this._item.price +
          '\n' +
          this._item.description;
        const fontPath =
          Platform.OS === 'android'
            ? '/system/fonts/Roboto-Bold.ttf'
            : RNFS.DocumentDirectoryPath + '/watermark.ttf';
        const watermark = RNFS.DocumentDirectoryPath + '/watermark.png';
        const parameter =
          '-y -i ' +
          originPath +
          ' -i ' +
          watermark +
          ' -filter_complex "[1]scale=iw*0.15:-1[wm];[0][wm]overlay=x=20:y=20,drawtext=text=\'' +
          watermarkText +
          "':x=10:y=70:fontfile=" +
          fontPath +
          ':fontsize=16:fontcolor=white" ' +
          newPath;

        showForcePageLoader(true);
        RNFFmpeg.execute(parameter).then((result) => {
          console.log(`FFmpeg process exited with rc=${result}.`);
          CameraRoll.save(newPath, 'video')
            .then((gallery) => {
              resp.flush();
              showPageLoader(false);
            })
            .catch((err) => {
              showPageLoader(false);
            });
        });
      })
      .catch((err) => {
        showPageLoader(false);
        error(Constants.errorTitle, 'Failed to download');
      });
  };

  render() {
    return (
      <>
        {this._renderVideo()}
        {this._renderShare()}
        {this._renderProgress()}
      </>
    );
  }

  _renderVideo = () => {
    const {isFetching, itemDatas} = this.state;

    return (
      <FlatList
        onLayout={(event) => {
          this.setState({videoHeight: VIDEO_HEIGHT});
        }}
        showsVerticalScrollIndicator={false}
        initialNumToRender={5}
        pagingEnabled
        onRefresh={() => {
          this.onRefresh('pull');
        }}
        refreshing={isFetching}
        ListFooterComponent={this._renderFooter}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          this.onRefresh('more');
        }}
        data={itemDatas}
        renderItem={this._renderItem}
        onViewableItemsChanged={this.onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 60,
        }}
        keyExtractor={(item) => item.id.toString()}
        style={{
          width: '100%',
          height: VIDEO_HEIGHT,
          position: 'absolute',
          left: 0,
          top: 0,
          backgroundColor: 'black',
          zIndex: 1,
          elevation: 1,
        }}
      />
    );
  };

  _renderFooter = () => {
    const {isFetching} = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  _renderItem = ({item, index}) => {
    const {isVideoLoading, isVideoPause} = this.state;

    if (this._curIndex != index || isVideoPause) {
      return (
        <View
          style={{
            width: '100%',
            height: VIDEO_HEIGHT,
            borderWidth: 1,
            borderColor: 'black',
          }}></View>
      );
    } else {
      const isLike = item.is_like ? true : false;
      const newTagList = item.tag_list.split(',').join(' ');

      if (this._curIndex == index) {
        global._opponentId = item.user_id;
        global._opponentName = item.user_name;
        global._opponentPhoto = item.user_photo;
      }

      return (
        <View
          style={{
            width: '100%',
            height: VIDEO_HEIGHT,
            borderWidth: 1,
            borderColor: 'black',
          }}>
          <Video
            source={{uri: convertToProxyURL(item.url)}}
            ref={(ref) => {
              this.player = ref;
            }}
            resizeMode="contain"
            repeat
            paused={isVideoPause}
            playWhenInactive={false}
            playInBackground={false}
            poster={item.thumb}
            posterResizeMode="contain"
            onReadyForDisplay={() => {
              this.onVideoReadyForDisplay(item);
            }}
            onBuffer={this.onVideoBuffer}
            onError={this.onVideoError}
            onLoad={this.onVideoLoad}
            onProgress={this.onVideoProgress}
            onEnd={this.onVideoEnd}
            bufferConfig={{
              minBufferMs: 15000,
              maxBufferMs: 30000,
              bufferForPlaybackMs: 5000,
              bufferForPlaybackAfterRebufferMs: 5000,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              backgroundColor: 'black',
            }}
          />
          {isVideoLoading && (
            <View
              style={{
                marginTop: 16,
                height: '100%',
                alignSelf: 'center',
                position: 'absolute',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="large" color="lightgray" />
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 50,
              right: 12,
              alignItems: 'flex-end',
              zIndex: 100,
            }}>
            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={() => {
                  this.onPressLike(!isLike, item);
                }}>
                <Image
                  source={isLike ? ic_favorite_active : ic_favorite_inactive}
                  style={{...GStyles.image, width: 32}}></Image>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onPressMessage(item);
                }}
                style={{marginTop: 32}}>
                <Image
                  source={ic_message}
                  style={{
                    ...GStyles.image,
                    width: 32,
                    tintColor: 'white',
                  }}></Image>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  this.onPressShare(item);
                }}
                style={{marginTop: 32}}>
                <FontAwesome
                  name="share"
                  style={{fontSize: 30, color: 'white'}}
                />
              </TouchableOpacity>
              <View
                style={{
                  alignItems: 'center',
                  marginTop: 128,
                  marginBottom: 12,
                }}>
                <Text
                  style={{
                    ...GStyles.regularText,
                    color: 'white',
                  }}>
                  {item.left_days} days left
                </Text>
                <Text
                  style={{
                    ...GStyles.regularText,
                    color: 'black',
                    backgroundColor: 'white',
                    marginTop: 4,
                    paddingVertical: 2,
                    paddingHorizontal: 4,
                  }}>
                  #{item.number}
                </Text>
                <Avatar
                  image={{
                    uri: item.user_photo ? item.user_photo : img_default_avatar,
                  }}
                  size={48}
                  // borderRadius={29}
                  // borderWidth={1}
                  onPress={() => {
                    this.onPressAvatar(item);
                  }}
                  containerStyle={{marginTop: 4}}
                />
                <Text style={{...GStyles.regularText, color: 'white'}}>
                  {item.user_name}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              bottom: 62,
              left: 12,
              justifyContent: 'flex-end',
            }}>
            <View style={{...GStyles.rowContainer}}>
              <Text
                style={{
                  ...GStyles.mediumText,
                  color: 'black',
                  backgroundColor: 'white',
                  paddingVertical: 2,
                  paddingHorizontal: 4,
                }}>
                ৳{item.price}
              </Text>
              <View style={{flex: 1}}></View>
            </View>
            <Text
              numberOfLines={3}
              style={{
                ...GStyles.mediumText,
                lineHeight: 18,
                width: '50%',
                color: 'white',
                marginTop: 8,
              }}>
              {newTagList}
            </Text>
            <Text
              numberOfLines={5}
              style={{
                ...GStyles.mediumText,
                lineHeight: 18,
                width: '75%',
                color: 'white',
                marginTop: 8,
              }}>
              {item.description}
            </Text>
          </View>
        </View>
      );
    }
  };

  _renderShare = () => {
    return (
      <View style={{...GStyles.centerAlign, ...GStyles.absoluteContainer}}>
        <RBSheet
          ref={(ref) => {
            this.Scrollable = ref;
          }}
          height={180}
          closeOnDragDown
          openDuration={250}
          customStyles={{
            container: {
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            },
          }}>
          {this._renderShareTitle()}
          <View
            style={{...GStyles.rowContainer, justifyContent: 'space-around'}}>
            {this._renderShareFacebook()}
            {this._renderShareFacebookMessenger()}
            {this._renderShareWhatsApp()}
            {this._renderShareDownload()}
          </View>
        </RBSheet>
      </View>
    );
  };

  _renderShareTitle = () => {
    return (
      <View style={{...GStyles.centerAlign}}>
        <Text style={{...GStyles.regularText}}>Share to</Text>
      </View>
    );
  };

  _renderShareFacebook = () => {
    return (
      <TouchableOpacity
        onPress={this.onShareFacebook}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#3b5998',
          }}>
          <FontAwesome name="facebook" style={{fontSize: 30, color: 'white'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
          Facebook
        </Text>
      </TouchableOpacity>
    );
  };

  _renderShareFacebookMessenger = () => {
    return (
      <TouchableOpacity
        onPress={this.onShareFacebookMessenger}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#006fff',
          }}>
          <Fontisto name="messenger" style={{fontSize: 30, color: 'white'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
          Messenger
        </Text>
      </TouchableOpacity>
    );
  };

  _renderShareWhatsApp = () => {
    return (
      <TouchableOpacity
        onPress={this.onShareWhatsApp}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#25D366',
          }}>
          <FontAwesome name="whatsapp" style={{fontSize: 30, color: 'white'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
          WhatsApp
        </Text>
      </TouchableOpacity>
    );
  };

  _renderShareDownload = () => {
    return (
      <TouchableOpacity
        onPress={this.onDownloadVideo}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: GStyle.grayBackColor,
          }}>
          <FontAwesome name="download" style={{fontSize: 30, color: '#333'}} />
        </View>
        <Text style={{fontSize: 14, paddingTop: 10, color: '#333'}}>
          Save video
        </Text>
      </TouchableOpacity>
    );
  };

  _renderProgress = () => {
    const {percent, isVisibleProgress} = this.state;

    return (
      <ProgressModal
        percent={percent}
        isVisible={isVisibleProgress}></ProgressModal>
    );
  };

  ___renderStatusBar = () => {
    return <StatusBar backgroundColor="red" barStyle="light-content" />;
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return <HomeMainScreen {...props} navigation={navigation} route={route} />;
}
