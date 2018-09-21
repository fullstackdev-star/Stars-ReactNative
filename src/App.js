import React, {useState, useEffect} from 'react';
import {StyleSheet, View} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import OneSignal from 'react-native-onesignal'; // Import package from node modules
import AppNavigator from './navigation/AppNavigator';
import {MenuProvider} from 'react-native-popup-menu';

import FlashMessage, {
  showMessage,
  hideMessage,
} from 'react-native-flash-message';
import ZMsg, {MsgTypes} from '../src/components/ZMsg/ZMsg';
import PageLoaderIndicator from '../src/components/PageLoaderIndicator';

import RestAPI from './DB/RestAPI';
import Constants from './DB/Constants';

function App() {
  const zMsgRef = React.useRef();

  const [msgTitle, setmsgTitle] = useState('Stars');
  const [msgtext, setmsgtext] = useState('');
  const [msgType, setMsgType] = useState(MsgTypes.success);
  const [showFullLoader, setShowFullLoader] = useState(false);
  const [isShowPageLoader, setIsShowPageLoader] = useState(false);

  useEffect(() => {
    OneSignal.setLogLevel(6, 0);

    // Replace 'YOUR_ONESIGNAL_APP_ID' with your OneSignal App ID.
    OneSignal.init('554fe736-56e1-48ed-900e-7630f4991c00', {
      kOSSettingsKeyAutoPrompt: false,
      kOSSettingsKeyInAppLaunchURL: false,
      kOSSettingsKeyInFocusDisplayOption: 2,
    });
    OneSignal.inFocusDisplaying(2); // Controls what should happen if a notification is received while the app is open. 2 means that the notification will go directly to the device's notification center.

    // The promptForPushNotifications function code will show the iOS push notification prompt. We recommend removing the following code and instead using an In-App Message to prompt for notification permission (See step below)
    OneSignal.promptForPushNotificationsWithUserResponse(myiOSPromptCallback);

    OneSignal.addEventListener('received', onReceived);
    OneSignal.addEventListener('opened', onOpened);
    OneSignal.addEventListener('ids', onIds);

    return () => {
      OneSignal.removeEventListener('received', onReceived);
      OneSignal.removeEventListener('opened', onOpened);
      OneSignal.removeEventListener('ids', onIds);
    };
  }, []);

  const onReceived = (notification) => {
    console.log('Notification received: ', notification);
  };

  const onOpened = (openResult) => {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  };

  const onIds = async (device) => {
    console.log('Device info: ', device);
    global._pushToken = device.pushToken;
    global._pushAppId = device.userId;

    const deviceId = await DeviceInfo.getUniqueId();
    global._deviceId = deviceId;
    console.log('--- crn_dev --- deviceId:', deviceId);
  };

  global.success = (title, text) => {
    showMessage({
      message: title,
      description: text,
      type: 'success',
      icon: 'auto',
    });
  };
  global.warning = (title, text) => {
    showMessage({
      message: title,
      description: text,
      type: 'warning',
      icon: 'auto',
    });
  };

  global.error = (title, text) => {
    showMessage({
      message: title,
      description: text,
      type: 'error',
      icon: 'auto',
    });
  };

  global.failed = (title, text, type = MsgTypes.failed) => {
    console.log('failed > set null for both button actions');
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null;
    if (zMsgRef.current) {
      setmsgTitle(title);
      setmsgtext(text);
      setMsgType(type);
      setShowFullLoader(false);
      zMsgRef.current.showMsg();
    }
  };

  global.alertOk = (title, text, onTapOk, type = MsgTypes.success) => {
    console.log('alertOk > set null for both button actions');
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null;
    if (zMsgRef.current) {
      global.onTapOkMsgButton = onTapOk;
      setmsgTitle(title);
      setmsgtext(text);
      setMsgType(type);
      setShowFullLoader(false);

      zMsgRef.current.showMsg();
    }
  };

  global.confirm = (title, text, onTapOk, onTapCancel) => {
    console.log('Confirm > set null for both button actions');
    global.onTapOkMsgButton = null;
    global.onTapCancelMsgButton = null;
    if (zMsgRef.current) {
      console.log('confirm > set both buttons actions');
      global.onTapOkMsgButton = onTapOk;
      global.onTapCancelMsgButton = onTapCancel;

      setmsgTitle(title);
      setmsgtext(text);
      setMsgType(MsgTypes.confirm);
      setShowFullLoader(false);

      console.log(
        typeof global.onTapOkMsgButton,
        typeof global.onTapCancelMsgButton,
      );

      zMsgRef.current.showMsg();
    }
  };

  global.showForcePageLoader = (isShow) => {
    setIsShowPageLoader(isShow);
  };

  global.showPageLoader = (isShow) => {
    setIsShowPageLoader(false);
  };

  const onTapOkMsg = () => {
    if (global.onTapOkMsgButton) {
      console.log('Called onTapOkMsgButton');
      global.onTapOkMsgButton();
    } else {
      console.log('onTapOkMsgButtons is null');
    }
  };

  const onTapCancelMsg = () => {
    if (global.onTapCancelMsgButton) {
      console.log('Called onTapCancelMsgButton');
      global.onTapCancelMsgButton();
    } else {
      console.log('onTapCancelMsgButton is null');
    }
  };

  return (
    <>
      <View style={styles.container}>
        <MenuProvider>
          <AppNavigator />
        </MenuProvider>
        <FlashMessage position="top" />
        <ZMsg
          ref={zMsgRef}
          isLoadingIndicator={showFullLoader}
          title={msgTitle}
          text={msgtext}
          type={msgType}
          onTapOkButton={() => {
            onTapOkMsg();
          }}
          onTapCancelButton={() => {
            onTapCancelMsg();
          }}
        />
        <PageLoaderIndicator isPageLoader={isShowPageLoader} />
      </View>
    </>
  );
}

function myiOSPromptCallback(permission) {
  // do something with permission value
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;
