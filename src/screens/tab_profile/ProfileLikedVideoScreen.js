import React from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation, useRoute, StackActions} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {FlatGrid} from 'react-native-super-grid';
import ModalSelector from '../../lib/ModalSelector/index';
import ImagePicker from 'react-native-image-picker';
import FastImage from 'react-native-fast-image';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AntDesign from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {TextField} from '../../lib/MaterialTextField/index';
import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';

import ProfileEditScreen from './ProfileEditScreen';
import ProfileEditScreen1 from './ProfileEditScreen';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH * 0.88) / 3.0 - 3;

class ProfileLikedVideoScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileLikedVideoScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      this.onRefresh();
      Helper.callFunc(global.setBottomTabName('profile'));
    });
  }

  componentWillUnmount() {
    this.unsubscribe();

    this._isMounted = false;
  }

  init = () => {
    this.state = {
      itemDatas: [],
    };

    this._isMounted = false;
  };

  onRefresh = () => {
    let params = {
      user_id: global.me.id,
      page_number: '1',
      count_per_page: '1000',
    };
    showPageLoader(true);
    RestAPI.get_liked_video_list(params, (json, err) => {
      showPageLoader(false);

      if (err !== null) {
        Helper.alertNetworkError();
      } else {
        if (json.status === 1) {
          if (this._isMounted) {
            this.setState({itemDatas: json.data.video_list});
          }
        } else {
          Helper.alertServerDataError();
        }
      }
    });
  };

  onPressVideo = (value) => {
    const {itemDatas} = this.state;
    const selIndex = itemDatas.findIndex((obj) => obj.id === value);

    global._selIndex = selIndex;
    global._profileLikedVideoDatas = itemDatas;
    global._prevScreen = 'profile_liked_video';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  render() {
    const {itemDatas} = this.state;

    return (
      <>
        <View style={{...GStyles.centerAlign}}>
          <View
            onLayout={(event) => this.props.onLayoutView(event)}
            style={{
              width: '88%',
              height:
                122 *
                  (Math.floor(itemDatas.length / 3) +
                    Math.ceil(itemDatas.length % 3)) +
                100,
            }}>
            {this._renderVideo()}
          </View>
        </View>
      </>
    );
  }

  _renderVideo = () => {
    const {itemDatas} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginVertical: 40,
        }}>
        {itemDatas.map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'white',
                marginTop: 2,
              }}>
              <Text
                style={{
                  ...GStyles.regularText,
                  color: 'black',
                }}>
                {item.left_days} days left
              </Text>
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}
                style={{marginTop: 2}}>
                <FastImage
                  source={{
                    uri: item.thumb,
                    priority: FastImage.priority.normal,
                  }}
                  resizeMode={FastImage.resizeMode.stretch}
                  style={{
                    width: CELL_WIDTH,
                    height: 120,
                  }}
                />
                <View
                  style={{
                    ...GStyles.rowContainer,
                    position: 'absolute',
                    right: 12,
                    bottom: 12,
                  }}>
                  <FontAwesome
                    name="group"
                    style={{fontSize: 16, color: 'white'}}
                  />
                  <Text
                    style={{
                      ...GStyles.regularText,
                      fontSize: 13,
                      color: 'white',
                      marginLeft: 4,
                    }}>
                    {item.view_count}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileLikedVideoScreen {...props} navigation={navigation} route={route} />
  );
}
