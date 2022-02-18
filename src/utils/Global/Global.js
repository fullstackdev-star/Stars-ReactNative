import {
  Alert,
  Dimensions,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';

import {
  checkMultiple,
  requestMultiple,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';
import Moment from 'moment';
import io from 'socket.io-client';
import changeNavigationBarColor, {
  hideNavigationBar,
  showNavigationBar,
} from 'react-native-navigation-bar-color';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

import RestAPI from '../../DB/RestAPI';
import ModalIndicator from '../../components/ModalIndicator';
import Constants from '../../DB/Constants';

const ic_membership_free = require('../../assets/images/ic_membership_free.png');
const ic_membership_basic = require('../../assets/images/ic_membership_basic.png');
const ic_membership_professional = require('../../assets/images/ic_membership_professional.png');
const ic_membership_business = require('../../assets/images/ic_membership_business.png');
const ic_membership_executive = require('../../assets/images/ic_membership_executive.png');

const Global = {
  PAY_STACK_PUB_KEY: 'pk_test_dbd30ba86e6fe5dd0cf839208fff9be36b36e260',
  MAPAPIKEY: 'AIzaSyDUNFhK6gsWN2V-A5E69R5e7vXQhLExrFw',
  base_url: 'http://wichz.com/api/',
  // crn_dev
  host_url: 'http://54.176.33.89/videoupload_backend/',
  socket_url: 'http://54.176.33.89:5000/ChatStream',
  // host_url: 'http://207.244.243.66/videoupload_backend/',
  // socket_url: 'http://207.244.243.66:5000/ChatStream',
  // host_url: 'http://192.168.1.77/',
  // socket_url: 'http://192.168.1.77:5000/ChatStream',
  user_token: '',
  selectedLat: 0.0,
  selectedLng: 0.0,

  email: '',
  first_name: '',
  last_name: '',
  username: '',
  avatar_url: '',
  created_at: 0,
  user_loc_lat: 0.0,
  user_loc_lng: 0.0,
  user_current_address: '',
  acc_tmp_lat: 0.0,
  acc_tmp_lng: 0.0,

  discounts_likes_list: [],
  cards_likes_list: [],

  category_list: [],
  search_hotkeys: [],
  search_word: '',
  selected_discount: {},
  previou_of_detail: '',

  bank_list: [],
  selected_card: {},

  selected_notification: {},
};

const Helper = {
  getWindowWidth: function () {
    return Dimensions.get('window').width;
  },

  getWindowHeight: function () {
    return Dimensions.get('window').height;
  },

  getStatusBarHeight: function () {
    return StaticSafeAreaInsets.safeAreaInsetsTop;
  },

  getBottomBarHeight: function () {
    const bottomBarHeight =
      Platform.OS === 'ios' ? StaticSafeAreaInsets.safeAreaInsetsBottom : 0;
    return bottomBarHeight;
  },

  getContentWidth: function () {
    return Dimensions.get('window').width * 0.88;
  },

  setDarkStatusBar: function () {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('black');
    }
    StatusBar.setBarStyle('light-content');
    changeNavigationBarColor('black', false);
  },

  setLightStatusBar: function () {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('white');
    }
    StatusBar.setBarStyle('dark-content');
    changeNavigationBarColor('white', true);
  },

  alertNetworkError: function () {
    Alert.alert('Error', 'Network error.');
    console.log('=======> error_url:', global._url);
  },

  alertServerDataError: function () {
    Alert.alert(Constants.errorTitle, 'Failed to get data from server');
    console.log('=======> error_url:', global._url);
  },

  isValid: function (value) {
    if (value == undefined) {
      return false;
    }
    if (value == null) {
      return false;
    }
    if (value == '') {
      return false;
    }
    if (value == 0) {
      return false;
    }

    return true;
  },

  getMembershipImage: function (membershipPlan) {
    let membershipImage = ic_membership_free;

    switch (membershipPlan) {
      case 'Basic':
        membershipImage = ic_membership_free;
        break;
      case 'Basic+':
        membershipImage = ic_membership_basic;
        break;
      case 'Professional':
        membershipImage = ic_membership_professional;
        break;
      case 'Business':
        membershipImage = ic_membership_business;
        break;
      case 'Executive':
        membershipImage = ic_membership_executive;
        break;
      default:
        membershipImage = ic_membership_free;
        break;
    }

    return membershipImage;
  },

  getCurMonthString: function () {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const d = new Date();
    return monthNames[d.getMonth()];
  },

  getLastMonthList: function () {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const d = new Date();
    const lastMonthList = [
      ...monthNames.slice(d.getMonth()),
      ...monthNames.slice(0, d.getMonth()),
    ].reverse();    

    return lastMonthList;
  },

  getDateString4Input: function (inputDateString) {
    let date = Moment(inputDateString, 'MMM DD, YYYY').toDate();
    return Moment(date).format('YYYY-MM-DD');
  },

  getDateString4Server: function (serverDateString) {
    if (!serverDateString) return '';

    let serverDate = Moment(serverDateString);
    return serverDate.format('MMM DD, YYYY');
  },

  getPastTimeString: function (serverDateString) {
    if (!serverDateString) return '';

    const nowDate = Moment.utc();
    // let serverDate = Moment.utc(serverDateString).subtract({hours: 1});
    let serverDate = Moment.utc(serverDateString);
    let pastTime = Moment.duration(nowDate.diff(serverDate)).humanize();

    return pastTime;
  },

  getPackageId4Name: function (name) {
    let packgeId = 0;
    global.package_list.forEach((item) => {
      if (item.name == name) {
        packgeId = item.id;
      }
    });
    return packgeId;
  },

  validateEmail: function (email) {
    // const rex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    // const rex = /\A(?=[a-z0-9@.!#$%&'*+/=?^_`{|}~-]{6,254}\z)(?=[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@)[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:(?=[a-z0-9-]{1,63}\.)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?=[a-z0-9-]{1,63}\z)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\z/
    const regexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regexp.test(email);
  },

  validatePhoneNumber: function (phoneNumber) {
    const regexp = /^[\+]?[0-9]{0,3}[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3,6}[-\s\.]?[0-9]{3,6}$/;
    return regexp.test(phoneNumber);
  },

  getMonth4DateString: function (monthYearString) {
    stringArray = monthYearString.split('/');
    if (stringArray.length == 2) {
      return stringArray[0];
    }
    return '';
  },

  getYear4DateString: function (monthYearString) {
    stringArray = monthYearString.split('/');
    if (stringArray.length == 2) {
      return stringArray[1];
    }
    return '';
  },

  capitalizeString: function (str) {
    if (str) {
      if (str.length > 1) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      }
    }
    return '';
  },

  getSkillName4Id: function (skillId) {
    let skillName = null;

    global.skill_list.forEach((item) => {
      if (item.id == skillId) {
        skillName = item.name;
      }
    });

    return skillName;
  },

  getFileName4Uri: function (uri) {
    let fileName = '';

    if (uri) {
      let localUri = uri;
      let uriParts = uri.split('/');
      fileName = uriParts[uriParts.length - 1];
    }

    return fileName;
  },

  getFileExt4Uri: function (uri) {
    let fileExt = '';

    if (uri) {
      let uriParts = uri.split('.');
      fileExt = uriParts[uriParts.length - 1];
    }

    return fileExt;
  },

  connectToServer: function () {
    const socket = io(Global.socket_url);
    global.socket = socket;

    socket.on('connect', () => {
      console.log('--- crn_dev --- socket_connect_id:', socket.id);

      const data = {
        room_id: Helper.getChatRoomId(),
        opponent_id: global._roomId,
        user_id: global.me.id,
      };
      socket.emit(Constants.SOCKET_LOGIN, data);
    });

    socket.on('connect_error', (error) => {
      console.log('--- crn_dev --- socket_connect_error:', error);
    });

    socket.on('connect_timeout', (timeout) => {
      console.log('--- crn_dev --- socket_connect_timeout:', timeout);
    });

    socket.on('error', (error) => {
      console.log('--- crn_dev --- socket_error:', error);
    });

    socket.on('disconnect', (reason) => {
      console.log('--- crn_dev --- socket_disconnect_reason:', reason);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(
        '--- crn_dev --- socket_reconnect_attemptNumber:',
        attemptNumber,
      );
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(
        '--- crn_dev --- socket_reconnect_attempt_attemptNumber:',
        attemptNumber,
      );
    });

    socket.on('reconnecting', (attemptNumber) => {
      console.log(
        '--- crn_dev --- socket_reconnecting_attemptNumber:',
        attemptNumber,
      );
    });

    socket.on('reconnect_error', (error) => {
      console.log('--- crn_dev --- socket_reconnect_error:', error);
    });

    socket.on('reconnect_failed', () => {
      console.log('--- crn_dev --- socket_reconnect_failed');
    });

    socket.on(Constants.SOCKET_ERROR, (errorCode) => {
      console.log(
        '--- crn_dev --- SOCKET_ERROR:',
        Constants.ERROR_CODES[errorCode.code],
      );
      Helper.callFunc(global.onSocketError);
    });

    socket.on(Constants.SOCKET_FETCH_MESSAGE_LIST, (data) => {
      global._fetchedMessageList = data;
      Helper.callFunc(global.onFetchMessageList);
    });

    socket.on(Constants.SOCKET_NEW_MESSAGE, (data) => {
      global._receivedMessageList = data;
      Helper.callFunc(global.onReceiveMessageList);
    });
  },

  disconnectSocket: function () {
    if (global.socket) {
      global.socket.disconnect();
      global.socket = null;
    }
  },

  callFunc: function (func) {
    if (func) {
      func();
    }
  },

  getChatRoomId: function () {
    let roomId = null;

    if (global._roomId < global.me.id) {
      roomId = global._roomId.toString() + '_' + global.me.id.toString();
    } else {
      roomId = global.me.id.toString() + '_' + global._roomId.toString();
    }

    return roomId;
  },

  hasAndroidPermission: async function () {
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';

    // if (Platform.OS === 'android') {
    //   PermissionsAndroid.requestMultiple([
    //     PermissionsAndroid.PERMISSIONS.CAMERA,
    //     PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    //     PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    //   ]).then((result) => {
    //     if (
    //       result['android.permission.ACCESS_COARSE_LOCATION'] &&
    //       result['android.permission.CAMERA'] &&
    //       result['android.permission.READ_CONTACTS'] &&
    //       result['android.permission.ACCESS_FINE_LOCATION'] &&
    //       result['android.permission.READ_EXTERNAL_STORAGE'] &&
    //       result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    //     ) {
    //       this.setState({
    //         permissionsGranted: true,
    //       });
    //     } else if (
    //       result['android.permission.ACCESS_COARSE_LOCATION'] ||
    //       result['android.permission.CAMERA'] ||
    //       result['android.permission.READ_CONTACTS'] ||
    //       result['android.permission.ACCESS_FINE_LOCATION'] ||
    //       result['android.permission.READ_EXTERNAL_STORAGE'] ||
    //       result['android.permission.WRITE_EXTERNAL_STORAGE'] ===
    //         'never_ask_again'
    //     ) {
    //       this.refs.toast.show(
    //         'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
    //       );
    //     }
    //   });
    // } else if (Platform.OS === 'ios') {
    //   Permissions.request('photo').then((response) => {
    //     if (response === 'authorized') {
    //       iPhotoPermission = true;
    //     }
    //     Permissions.request('contact').then((response) => {
    //       if (response === 'authorized') {
    //         iPhotoPermission = true;
    //       }
    //     });
    //   });
    // }
  },

  hasPermissions: async function () {
    let isGranted = false;

    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]).then((result) => {
        if (
          result['android.permission.READ_EXTERNAL_STORAGE'] &&
          result['android.permission.WRITE_EXTERNAL_STORAGE'] &&
          result['android.permission.CAMERA'] &&
          result['android.permission.RECORD_AUDIO'] === 'granted'
        ) {
          isGranted = true;
        } else if (
          result['android.permission.READ_EXTERNAL_STORAGE'] ||
          result['android.permission.WRITE_EXTERNAL_STORAGE'] ||
          result['android.permission.CAMERA'] ||
          result['android.permission.RECORD_AUDIO'] === 'never_ask_again'
        ) {
          console.log(
            '--- crn_dev --- :',
            'Please Go into Settings -> Applications -> APP_NAME -> Permissions and Allow permissions to continue',
          );
        }
      });
    } else if (Platform.OS === 'ios') {
      // checkMultiple([
      //   PERMISSIONS.IOS.CAMERA,
      //   PERMISSIONS.IOS.MICROPHONE,
      //   PERMISSIONS.IOS.MEDIA_LIBRARY,
      // ]).then((statuses) => {
      //   console.log(
      //     '--- crn_dev --- statuses[PERMISSIONS.IOS.CAMERA]:',
      //     statuses[PERMISSIONS.IOS.CAMERA],
      //   );
      //   console.log(
      //     '--- crn_dev --- status[PERMISSIONS.IOS.MICROPHONE]:',
      //     status[PERMISSIONS.IOS.MICROPHONE],
      //   );
      //   console.log(
      //     '--- crn_dev --- status[PERMISSIONS.IOS.MEDIA_LIBRARY]:',
      //     status[PERMISSIONS.IOS.MEDIA_LIBRARY],
      //   );
      // });

      requestMultiple([
        PERMISSIONS.IOS.CAMERA,
        PERMISSIONS.IOS.MICROPHONE,
        PERMISSIONS.IOS.PHOTO_LIBRARY,
      ]).then((statuses) => {
        console.log(
          '--- crn_dev --- statuses[PERMISSIONS.IOS.CAMERA]:',
          statuses[PERMISSIONS.IOS.CAMERA],
        );
        console.log(
          '--- crn_dev --- statuses[PERMISSIONS.IOS.MICROPHONE]:',
          statuses[PERMISSIONS.IOS.MICROPHONE],
        );
        console.log(
          '--- crn_dev --- statuses[PERMISSIONS.IOS.PHOTO_LIBRARY]:',
          statuses[PERMISSIONS.IOS.PHOTO_LIBRARY],
        );

        if (
          statuses[PERMISSIONS.IOS.CAMERA] == RESULTS.GRANTED &&
          statuses[PERMISSIONS.IOS.MICROPHONE] == RESULTS.GRANTED &&
          statuses[PERMISSIONS.IOS.PHOTO_LIBRARY] == RESULTS.GRANTED
        ) {
          isGranted = true;
        }
      });
    }

    return isGranted;
  },
};

export default Global;
export {Helper};
