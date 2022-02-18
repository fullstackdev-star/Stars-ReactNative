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
import AsyncStorage from '@react-native-community/async-storage';
import convertToProxyURL from 'react-native-video-cache';
import Share, {ShareSheet} from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import CameraRoll from '@react-native-community/cameraroll';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ShareDialog, MessageDialog} from 'react-native-fbsdk';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Fontisto from 'react-native-vector-icons/Fontisto';

import {LogLevel, RNFFmpeg} from 'react-native-ffmpeg';

import {SearchBar} from 'react-native-elements';
import Swiper from '../../lib/Swiper/index';
import Video from 'react-native-video';
import Avatar from '../../components/elements/Avatar';
import GHeaderBar from '../../components/GHeaderBar';
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
const ic_back = require('../../assets/images/ic_back.png');

const WINDOW_HEIGHT = Helper.getWindowHeight();
const STATUS_BAR_HEIGHT = Helper.getStatusBarHeight();
const BOTTOM_BAR_HEIGHT = Helper.getBottomBarHeight();

class ProfileVideoScreen extends Component {
  constructor(props) {
    super(props);

    console.log('ProfileVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribeFocus = this.props.navigation.addListener('focus', () => {
      let {itemDatas} = this.state;

      Helper.setDarkStatusBar();

      if (itemDatas.length < 1) {
        if (global._prevScreen == 'explore_main_video') {
          itemDatas = global._exploreMainVideoDatas;
        } else if (global._prevScreen == 'profile_my_video') {
          itemDatas = global._profileMyVideoDatas;
        } else if (global._prevScreen == 'profile_liked_video') {
          itemDatas = global._profileLikedVideoDatas;
        } else if (global._prevScreen == 'profile_other') {
          itemDatas = global._profileOtherVideoDatas;
        } else {
          itemDatas = [];
        }

        this.setState({itemDatas: itemDatas});

        this.onRefresh();
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

      videoHeight: WINDOW_HEIGHT - STATUS_BAR_HEIGHT - BOTTOM_BAR_HEIGHT,
      itemDatas: [],
    };

    this._curVideoId = -1;
    this._isMounted = false;
    this._curIndex = -1;
  };

  onRefresh = () => {};

  onBack = () => {
    this.setState({isVideoPause: true});
    this.props.navigation.goBack();
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
    // this.setState({isLoading: true});
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
        // this.props.navigation.navigate('profile_other');
        const pushAction = StackActions.push('profile_other', null);
        this.props.navigation.dispatch(pushAction);
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
      <SafeAreaView>
        {this._renderVideo()}
        {this._renderShare()}
        {this._renderProgress()}
      </SafeAreaView>
    );
  }

  onLayout = () => {
    setTimeout(() => {
      this.flatlistRef.scrollToIndex({
        index: global._selIndex,
        animated: false,
      });
    }, 100);
  };

  _renderVideo = () => {
    const {itemDatas, videoHeight} = this.state;

    return (
      <View onLayout={this.onLayout} style={{zIndex: 1, elevation: 1}}>
        <FlatList
          ref={(ref) => {
            this.flatlistRef = ref;
          }}
          showsVerticalScrollIndicator={false}
          initialNumToRender={itemDatas.length}
          pagingEnabled
          data={itemDatas}
          renderItem={this._renderItem}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 60,
          }}
          keyExtractor={(item) => item.id.toString()}
          style={{backgroundColor: 'black'}}
        />
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            zIndex: 2,
            elevation: 1,
          }}>
          <TouchableOpacity
            onPress={this.onBack}
            style={{...GStyles.centerAlign, width: 50, height: 50}}>
            <Image
              source={ic_back}
              style={{width: 20, height: 14, tintColor: 'white'}}></Image>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderFooter = () => {
    const {isFetching} = this.state;

    if (!isFetching) return null;
    return <ActivityIndicator style={{color: '#000'}} />;
  };

  _renderItem = ({item, index}) => {
    const {isVideoLoading, isVideoPause, videoHeight} = this.state;

    if (this._curIndex != index || isVideoPause) {
      return (
        <View
          style={{
            width: '100%',
            height: videoHeight,
            borderWidth: 1,
            borderColor: 'black',
          }}></View>
      );
    } else {
      const isLike = item.is_like ? true : false;
      const newTagList = item.tag_list.split(',').join(' ');

      return (
        <View
          style={{
            width: '100%',
            height: videoHeight,
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
            poster={item.thumb}
            posterResizeMode="contain"
            onReadyForDisplay={this.onVideoReadyForDisplay}
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

const styles = {};

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileVideoScreen {...props} navigation={navigation} route={route} />
  );
}
