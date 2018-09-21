import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';

import TestScreen from '../screens/test/TestScreen';
import TempScreen from '../screens/test/TempScreen';

import MainTabNavigator from './MainTabNavigator';

import SigninScreen from '../screens/auth/SigninScreen';
import SignupScreen from '../screens/auth/SignupScreen';

import CameraUploadScreen from '../screens/tab_camera/CameraUploadScreen';
import CameraPreviewScreen from '../screens/tab_camera/CameraPreviewScreen';

import MessageChatScreen from '../screens/tab_message/MessageChatScreen';

import ExploreSearchScreen from '../screens/tab_explore/ExploreSearchScreen';

import ProfileEditScreen from '../screens/tab_profile/ProfileEditScreen';
import ProfileVideoScreen from '../screens/tab_profile/ProfileVideoScreen';
import ProfileOtherScreen from '../screens/tab_profile/ProfileOtherScreen';

import {GStyle, GStyles, Global, Helper} from '../utils/Global/index';

// import WorkScreen from '../screens/modal/CProfessionalsSendOfferModal';
// import WorkScreen from '../screens/auth/FCAccountStep1Screen';
// import WorkScreen from '../screens/tab_home/HomeUploadScreen';
const WINDOW_HEIGHT = Helper.getWindowWidth();

const Stack = createStackNavigator();

const config = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={{colors: {background: 'black'}}}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}>
        {/* <Stack.Screen name="test" component={TestScreen} /> */}
        {/* <Stack.Screen name="temp" component={TempScreen} /> */}
        {/* <Stack.Screen name="work" component={WorkScreen} /> */}

        {/* --- start --- */}
        <Stack.Screen name="main_tab_navigator" component={MainTabNavigator} />

        {/* --- Auth --- */}
        <Stack.Screen name="signin" component={SigninScreen} />
        <Stack.Screen name="signup" component={SignupScreen} />

        {/* --- camera tab --- */}
        <Stack.Screen name="camera_upload" component={CameraUploadScreen} />
        <Stack.Screen name="camera_preview" component={CameraPreviewScreen} />

        {/* --- message tab --- */}
        <Stack.Screen name="message_chat" component={MessageChatScreen} />

        {/* --- explore tab --- */}
        <Stack.Screen name="explore_search" component={ExploreSearchScreen} />

        {/* --- profile tab --- */}
        <Stack.Screen name="profile_edit" component={ProfileEditScreen} />
        <Stack.Screen
          name="profile_video"
          component={ProfileVideoScreen}
          options={{
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            gestureResponseDistance: {horizontal: WINDOW_HEIGHT},
            cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
          }}
        />
        <Stack.Screen name="profile_other" component={ProfileOtherScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
