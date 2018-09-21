import React from 'react';
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
  LayoutAnimation,
  Linking,
  LogBox,
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
  View,
} from 'react-native';

import AsyncStorage from '@react-native-community/async-storage';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import {TextField} from '../../lib/MaterialTextField/index';
import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';

import GHeaderBar from '../../components/GHeaderBar';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

const image_logo = require('../../assets/images/ic_logo.png');
const image_google = require('../../assets/images/ic_google.png');
const image_facebook = require('../../assets/images/ic_facebook.png');
const image_twitter = require('../../assets/images/ic_twitter.png');

class SigninScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('SigninScreen start');

    this.init();
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.onBack,
    );
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBack);
  }

  init = () => {
    this.state = {
      secureTextEntry: global.debug ? false : true,
      userName: global.debug ? '1234567890' : '',
      password: global.debug ? '1234' : '',
    };

    this.initRef();
  };

  onBack = () => {
    if (this.props.navigation.isFocused()) {
      if (global._prevScreen == 'profile_edit') {
        Alert.alert(Constants.warningTitle, 'Are you sure you want to quit?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          {text: 'YES', onPress: () => BackHandler.exitApp()},
        ]);
        return true;
      } else {
        this.props.navigation.goBack();
        return true;
      }
    }
  };

  initRef = () => {
    this.userNameRef = (ref) => {
      this.userName = ref;
    };
    this.passwordRef = (ref) => {
      this.password = ref;
    };
  };

  onFocus = () => {
    let {errors = {}} = this.state;

    for (let name in errors) {
      let ref = this[name];

      if (ref && ref.isFocused()) {
        delete errors[name];
      }
    }

    this.setState({errors});
  };

  onChangeText = (text) => {
    ['userName', 'password']
      .map((name) => ({name, ref: this[name]}))
      .forEach(({name, ref}) => {
        if (ref.isFocused()) {
          this.setState({[name]: text});
        }
      });
  };

  onSubmitUserName = () => {
    this.password.focus();
  };

  onSubmitPassword = () => {
    this.password.blur();
  };

  onAccessoryPress = () => {
    this.setState(({secureTextEntry}) => ({secureTextEntry: !secureTextEntry}));
  };

  renderPasswordAccessory = () => {
    let {secureTextEntry} = this.state;

    let name = secureTextEntry ? 'visibility' : 'visibility-off';

    return (
      <MaterialIcon
        size={24}
        name={name}
        color={TextField.defaultProps.baseColor}
        onPress={this.onAccessoryPress}
        suppressHighlighting={true}
      />
    );
  };

  onForgetPassword = () => {
    this.props.navigation.navigate('fc_forget_password');
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  onSubmit = async () => {
    let {errors = {}} = this.state;

    ['userName', 'password'].forEach((name) => {
      let value = this[name].value();

      if (!value) {
        errors[name] = 'Should not be empty';
      } else {
        if ('userName' === name) {
          const isValidPhoneNumber = Helper.validatePhoneNumber(value);
          if (!isValidPhoneNumber) {
            errors[name] = 'Phone Number is invalid';
          }
        } else if ('password' === name && value.length != 4) {
          errors[name] = 'Should be 4 digits';
        }
      }
    });

    this.setState({errors});

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      const {userName, password} = this.state;

      try {
        await AsyncStorage.setItem(Constants.KEY_USERNAME, userName);
      } catch (e) {
        // saving error
      }
      try {
        await AsyncStorage.setItem(Constants.KEY_PASSWORD, password);
      } catch (e) {
        // saving error
      }

      let params = {
        username: userName,
        password: password,
      };
      showPageLoader(true);
      RestAPI.login(params, (json, err) => {
        showPageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError();
        } else {
          if (json.status === 1) {
            global.me = json.data;

            params = {
              user_id: json.data.id,
              one_signal_id: global._pushAppId,
              token: global._pushToken,
              device_id: global._deviceId,
              device_type: Platform.OS === 'android' ? '0' : '1',
            };
            showPageLoader(true);
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

            this.props.navigation.navigate('main_tab_navigator');
          } else {
            Alert.alert(Constants.errorTitle, json.error);
          }
        }
      });
    }
  };

  onSignup = () => {
    this.props.navigation.navigate('signup');
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}>
            {this._renderTitle()}
            {this._renderInput()}
            {this._renderButton()}
          </KeyboardAwareScrollView>
          {this._renderBottom()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle=""
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderTitle = () => {
    return (
      <>
        <Image
          source={image_logo}
          style={[GStyles.image, {width: 54, marginTop: 40}]}
        />
        <Text style={[GStyles.titleText, {fontSize: 30, lineHeight: 36}]}>
          Welcome back!
        </Text>
        <Text style={{...GStyles.titleDescription}}>
          Login to manage your account
        </Text>
      </>
    );
  };

  _renderInput = () => {
    let {userName, password, errors = {}, secureTextEntry} = this.state;

    return (
      <>
        <TextField
          ref={this.userNameRef}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitUserName}
          returnKeyType="next"
          label="Phone Number"
          value={userName}
          error={errors.userName}
          containerStyle={{marginTop: 24}}
        />
        <TextField
          ref={this.passwordRef}
          keyboardType="number-pad"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          clearTextOnFocus={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPassword}
          returnKeyType="done"
          label="Password"
          value={password}
          error={errors.password}
          renderRightAccessory={this.renderPasswordAccessory}
          maxLength={4}
          containerStyle={{marginTop: 8}}
        />
      </>
    );
  };

  _renderButton = () => {
    return (
      <View style={{marginVertical: 50}}>
        <TouchableOpacity onPress={this.onSubmit}>
          <View style={GStyles.buttonFill}>
            <Text style={GStyles.textFill}>Log In</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  ___renderSocial = () => {
    return (
      <View style={{marginTop: 32}}>
        <Text
          style={[
            GStyles.regularText,
            {fontSize: 14, color: GStyle.grayColor, marginVertical: 10},
          ]}>
          Or Sign in with
        </Text>
        <View style={[GStyles.rowContainer, {marginTop: 20}]}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Google Login is clicked.');
            }}>
            <Image source={image_google} style={[GStyles.image, {width: 45}]} />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginLeft: 15}}
            onPress={() => {
              Alert.alert('Facebook Login is clicked.');
            }}>
            <Image
              source={image_facebook}
              style={[GStyles.image, {width: 45}]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{marginLeft: 15}}
            onPress={() => {
              Alert.alert('Twitter Login is clicked.');
            }}>
            <Image
              source={image_twitter}
              style={[GStyles.image, {width: 45}]}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderBottom = () => {
    return (
      <View style={[GStyles.rowContainer, {marginBottom: 10}]}>
        <Text
          style={{
            fontFamily: 'GothamPro',
            color: GStyle.grayColor,
            fontSize: 13,
          }}>
          Don`t have an account?
        </Text>
        <TouchableOpacity onPress={this.onSignup}>
          <Text
            style={{
              fontFamily: 'GothamPro',
              fontSize: 13,
              color: GStyle.linkColor,
              paddingLeft: 5,
            }}>
            Sign up
          </Text>
        </TouchableOpacity>
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default SigninScreen;
