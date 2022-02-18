import React, {Component} from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {GStyle, GStyles, Global, Helper} from '../utils/Global/index';
import HomeTabScreen from '../screens/tab_home/HomeTabScreen';
import CameraMainScreen from '../screens/tab_camera/CameraMainScreen';
import ExploreMainScreen from '../screens/tab_explore/ExploreMainScreen';
import MessageMainScreen from '../screens/tab_message/MessageMainScreen';
import ProfileMainScreen from '../screens/tab_profile/ProfileMainScreen';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

const ic_tab_home = require('../assets/images/ic_tab_home.png');
const ic_tab_professionals = require('../assets/images/ic_tab_projects.png');
const ic_tab_camera = require('../assets/images/ic_tab_camera.png');
const ic_tab_profile = require('../assets/images/ic_tab_profile.png');
const ic_tab_messages = require('../assets/images/ic_tab_messages.png');

const Tab = createBottomTabNavigator();

let BOTTOM_TAB_HEIGHT = 50 + Helper.getBottomBarHeight();

class MainTabNavigator extends Component {
  constructor(props) {
    super(props);

    console.log('MainTabNavigator start');

    this.init();
  }

  init = () => {
    this.state = {
      curTabName: 'home',
    };

    global.setBottomTabName = (curTabName) => {
      this.setState({curTabName});
    };
  };

  render() {
    const {curTabName} = this.state;

    return (
      <>
        <SafeAreaView
          style={{
            flex: 0,
            backgroundColor:
              curTabName == 'home' || curTabName == 'camera'
                ? 'transparent'
                : 'white',
          }}
        />
        <Tab.Navigator
          initialRouteName="home"
          tabBarOptions={{
            activeTintColor: curTabName == 'home' ? 'white' : GStyle.blackColor,
            inactiveTintColor:
              curTabName == 'home' ? 'white' : GStyle.grayColor,
            style: {
              height: BOTTOM_TAB_HEIGHT,
              backgroundColor: curTabName == 'home' ? 'transparent' : 'white',
              position:
                curTabName == 'home' ||
                curTabName == 'camera' ||
                curTabName == 'profile_other'
                  ? 'absolute'
                  : 'relative',
              elevation: 0,
              // borderTopWidth: 0,
            },
          }}
          // sceneContainerStyle={{backgroundColor: 'transparent'}}
        >
          <Tab.Screen
            name="camera"
            component={CameraMainScreen}
            options={{
              tabBarLabel: 'Camera',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_camera}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
              style: {
                backgroundColor: 'white',
              },
              tabBarVisible: false,
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                if (!global.me) {
                  e.preventDefault();
                  this.props.navigation.navigate('signin');
                }
              },
            })}
          />
          <Tab.Screen
            name="home"
            component={HomeTabScreen}
            options={{
              tabBarLabel: 'Home',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_home}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
              tabBarVisible: curTabName == 'profile_other' ? false : true,
            }}
          />
          <Tab.Screen
            name="explore"
            component={ExploreMainScreen}
            options={{
              tabBarLabel: 'Explore',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_professionals}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
            }}
          />
          <Tab.Screen
            name="message"
            component={MessageMainScreen}
            options={{
              tabBarLabel: 'Message',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_messages}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                if (!global.me) {
                  e.preventDefault();
                  this.props.navigation.navigate('signin');
                }
              },
            })}
          />
          <Tab.Screen
            name="profile"
            component={ProfileMainScreen}
            options={{
              tabBarLabel: 'Me',
              tabBarIcon: ({color, size}) => (
                <Image
                  source={ic_tab_profile}
                  style={{...GStyles.image, width: 20, tintColor: color}}
                />
              ),
            }}
            listeners={({navigation, route}) => ({
              tabPress: (e) => {
                if (!global.me) {
                  e.preventDefault();
                  this.props.navigation.navigate('signin');
                }
              },
            })}
          />
        </Tab.Navigator>
      </>
    );
  }
}

export default MainTabNavigator;
