import React from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  LayoutAnimation,
  Linking,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

import {TextField} from '../../lib/MaterialTextField/index';
import GHeaderBar from '../../components/GHeaderBar';
import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';
import ModalIndicator from '../../components/ModalIndicator';

const ic_google = require('../../assets/images/ic_google.png');
const ic_facebook = require('../../assets/images/ic_facebook.png');
const ic_twitter = require('../../assets/images/ic_twitter.png');
const ic_linkedin = require('../../assets/images/ic_linkedin.png');

class SignupScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('SignupScreen start');

    this.init();
  }

  componentDidMount() {
    this.onRefresh();
  }

  componentWillUnmount() {}

  init = () => {
    this.state = {
      secureTextEntry: global.debug ? false : true,
      userName: global.debug ? 'a113' : '',
      phoneNumber: global.debug ? '3333333333' : '',
      password: global.debug ? '1234' : '',
      confirmPassword: global.debug ? '1234' : '',
    };

    this.initRef();
  };

  onRefresh = () => {};

  initRef = () => {
    this.userNameRef = (ref) => {
      this.userName = ref;
    };
    this.phoneNumberRef = (ref) => {
      this.phoneNumber = ref;
    };
    this.passwordRef = (ref) => {
      this.password = ref;
    };
    this.confirmPasswordRef = (ref) => {
      this.confirmPassword = ref;
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
    ['userName', 'phoneNumber', 'password', 'confirmPassword']
      .map((name) => ({name, ref: this[name]}))
      .forEach(({name, ref}) => {
        if (ref.isFocused()) {
          this.setState({[name]: text});
        }
      });
  };

  onSubmitUserName = () => {
    this.phoneNumber.focus();
  };

  onSubmitPhoneNumber = () => {
    this.password.focus();
  };

  onSubmitPassword = () => {
    this.confirmPassword.focus();
  };

  onSubmitConfirmPassword = () => {
    this.confirmPassword.blur();
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

  onBack = () => {
    this.props.navigation.goBack();
  };

  onSubmit = () => {
    let errors = {};

    ['userName', 'phoneNumber', 'password', 'confirmPassword'].forEach(
      (name) => {
        let value = this[name].value();

        if (!value) {
          errors[name] = 'Should not be empty';
        } else {
          if ('phoneNumber' === name) {
            const isValidPhoneNumber = Helper.validatePhoneNumber(value);
            if (!isValidPhoneNumber) {
              errors[name] = 'Phone Number is invalid';
            }
          } else if (
            ('password' === name || 'confirmPassword' === name) &&
            value.length != 4
          ) {
            errors[name] = 'Should be 4 digits';
          }
        }
      },
    );

    let {password, confirmPassword} = this.state;
    if (password !== confirmPassword) {
      errors['confirmPassword'] = 'Not match with password';
    }

    this.setState({errors});

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      const {password, userName, phoneNumber} = this.state;

      const params = {
        username: userName,
        phone: phoneNumber,
        password: password,
      };
      showPageLoader(true);
      RestAPI.signup(params, (json, err) => {
        showPageLoader(false);

        if (err !== null) {
          Helper.alertNetworkError();
        } else {
          if (json.status === 1) {
            global.me = json.data;
            success(Constants.successTitle, 'Success to signup');
            this.props.navigation.navigate('signin');
          } else {
            Alert.alert(Constants.errorTitle, json.error);
          }
        }
      });
    }
  };

  onTerm = () => {
    const url = 'http://snaplist.org/terms/terms';
    Linking.openURL(url);
  };

  onPrivacy = () => {
    const url = 'http://snaplist.org/terms/privacy-policy';
    Linking.openURL(url);
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
            {this._renderBottom()}
          </KeyboardAwareScrollView>
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
        <Text style={GStyles.titleText}>Hi, create your account</Text>
        <View style={[GStyles.titleDescription, GStyles.rowContainer]}>
          <Text style={GStyles.regularText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={() => {
              this.props.navigation.navigate('signin');
            }}>
            <Text
              style={[
                GStyles.regularText,
                {color: GStyle.linkColor, paddingLeft: 5},
              ]}>
              Log in
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  _renderInput = () => {
    let {
      errors = {},
      userName,
      phoneNumber,
      password,
      confirmPassword,
      secureTextEntry,
    } = this.state;

    return (
      <>
        <TextField
          ref={this.userNameRef}
          autoCorrect={false}
          autoCapitalize="none"
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitUserName}
          returnKeyType="next"
          label="Username"
          value={userName}
          error={errors.userName}
          containerStyle={{marginTop: 24}}
        />
        <TextField
          ref={this.phoneNumberRef}
          keyboardType="phone-pad"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPhoneNumber}
          returnKeyType="next"
          label="Phone Number"
          value={phoneNumber}
          error={errors.phoneNumber}
          containerStyle={{marginTop: 8}}
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
          returnKeyType="next"
          label="Password"
          value={password}
          error={errors.password}
          renderRightAccessory={this.renderPasswordAccessory}
          maxLength={4}
          containerStyle={{marginTop: 8}}
        />
        <TextField
          ref={this.confirmPasswordRef}
          keyboardType="number-pad"
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          clearTextOnFocus={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitConfirmPassword}
          returnKeyType="done"
          label="Confirm Password"
          value={confirmPassword}
          error={errors.confirmPassword}
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
            <Text style={GStyles.textFill}>Sign Up</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  _renderBottom = () => {
    return (
      <View style={{height: 50}}>
        <Text
          style={{
            fontFamily: 'GothamPro',
            fontSize: 13,
            lineHeight: 22,
            color: GStyle.grayColor,
          }}>
          By signing up, you agree to Stars
        </Text>
        <View style={GStyles.rowCenterContainer}>
          <TouchableOpacity onPress={this.onTerm}>
            <Text
              style={{
                fontFamily: 'GothamPro',
                fontSize: 13,
                lineHeight: 22,
                color: GStyle.linkColor,
                paddingLeft: 5,
              }}>
              Term of Service
            </Text>
          </TouchableOpacity>
          <Text
            style={{
              fontFamily: 'GothamPro',
              fontSize: 13,
              lineHeight: 22,
              color: GStyle.grayColor,
              paddingLeft: 5,
            }}>
            and
          </Text>
          <TouchableOpacity onPress={this.onPrivacy}>
            <Text
              style={{
                fontFamily: 'GothamPro',
                fontSize: 13,
                lineHeight: 22,
                color: GStyle.linkColor,
                paddingLeft: 5,
              }}>
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default SignupScreen;
