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
import FastImage from 'react-native-fast-image';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {FlatGrid} from 'react-native-super-grid';
import ModalSelector from '../../lib/ModalSelector/index';
import ImagePicker from 'react-native-image-picker';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {TextField} from '../../lib/MaterialTextField/index';
import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();
const CELL_WIDTH = (WINDOW_WIDTH * 0.88) / 3.0 - 2;

class ProfileOtherScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileOtherScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;

    this.unsubscribe = this.props.navigation.addListener('focus', () => {
      Helper.callFunc(global.setBottomTabName('profile_other'));
      Helper.setLightStatusBar();
      this.onRefresh();
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
      user_id: global._opponentId,
      page_number: '1',
      count_per_page: '1000',
    };
    showPageLoader(true);
    RestAPI.get_user_video_list(params, (json, err) => {
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
    global._profileOtherVideoDatas = itemDatas;
    global._prevScreen = 'profile_other';
    const pushAction = StackActions.push('profile_video', null);
    this.props.navigation.dispatch(pushAction);
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    const {itemDatas} = this.state;

    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}>
            {this._renderAvartar()}
            {this._renderVideo()}
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Profile"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderAvartar = () => {
    const {profilePhotoUri} = this.state;

    return (
      <View style={{alignItems: 'center', marginVertical: 20}}>
        <View>
          <Avatar
            image={{uri: global._opponentPhoto}}
            size={106}
            // borderRadius={53}
            // borderWidth={2}
          />
        </View>
        <Text style={{...GStyles.regularText, marginTop: 8}}>
          {global._opponentName}
        </Text>
      </View>
    );
  };

  _renderVideo = () => {
    const {itemDatas} = this.state;

    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginVertical: 50,
        }}>
        {itemDatas.map((item, i) => {
          return (
            <View
              key={i}
              style={{
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'white',
              }}>
              <View
                style={{
                  ...GStyles.centerAlign,
                  width: 52,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: 'lightgray',
                  marginVertical: 4,
                }}>
                <Text style={{...GStyles.mediumText}}>{item.number}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  this.onPressVideo(item.id);
                }}>
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
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
      // <View
      //   style={{
      //     flex: 1,
      //     flexDirection: 'row',
      //     flexWrap: 'wrap',
      //     marginVertical: 20,
      //   }}>
      //   {itemDatas.map((item, i) => {
      //     return (
      //       <View
      //         key={i}
      //         style={{
      //           alignItems: 'center',
      //           borderWidth: 1,
      //           borderColor: 'white',
      //         }}>
      //         <TouchableOpacity
      //           onPress={() => {
      //             this.onPressVideo(item.id);
      //           }}>
      //           <Image
      //             source={{uri: item.thumb}}
      //             style={{
      //               width: CELL_WIDTH,
      //               height: 120,
      //               resizeMode: 'stretch',
      //               borderRadius: 12,
      //             }}
      //           />
      //         </TouchableOpacity>
      //       </View>
      //     );
      //   })}
      // </View>
    );
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <ProfileOtherScreen {...props} navigation={navigation} route={route} />
  );
}
