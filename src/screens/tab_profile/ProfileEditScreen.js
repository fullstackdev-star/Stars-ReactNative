import React from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  Linking,
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

import AsyncStorage from '@react-native-community/async-storage';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ModalSelector from '../../lib/ModalSelector/index';
import ImagePicker from 'react-native-image-picker';

import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {TextField} from '../../lib/MaterialTextField/index';
import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import GHeaderBar from '../../components/GHeaderBar';
import Avatar from '../../components/elements/Avatar';

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');

class ProfileEditScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('ProfileEditScreen start');

    this.init();
  }

  componentDidMount() {}

  componentWillUnmount() {}

  init = () => {
    this.state = {
      secureTextEntry: global.debug ? false : true,
      userName: global.me.username,
      phoneNumber: global.me.phone,
      password: '',
      profilePhotoUri: global.me.photo,
      profilePhotoSelUri: null,
      profilePhotoSelPath: '',
    };

    this.initRef();
  };

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
    ['userName', 'phoneNumber', 'password']
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

  onSubmit = () => {
    const {userName, phoneNumber, password, profilePhotoSelPath} = this.state;
    let errors = {};
    const filePath =
      Platform.OS === 'android'
        ? profilePhotoSelPath
        : profilePhotoSelPath.slice(7);

    ['userName', 'phoneNumber'].forEach((name) => {
      let value = this[name].value();

      if (!value) {
        errors[name] = 'Should not be empty';
      } else {
        if ('phoneNumber' === name) {
          const isValidPhoneNumber = Helper.validatePhoneNumber(value);
          if (!isValidPhoneNumber) {
            errors[name] = 'Phone Number is invalid';
          }
        }
      }
    });

    if (password.length > 0 && password.length != 4) {
      errors['password'] = 'Should be 4 digits';
    }

    this.setState({errors});

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      const params = {
        user_id: global.me.id,
        username: userName,
        phone: phoneNumber,
        password: password,
        image: filePath,
      };

      showForcePageLoader(true);
      RestAPI.update_profile_with_image(params, (json, err) => {
        showPageLoader(false);

        if (err !== null) {
          error(Constants.errorTitle, 'Failed to update your profile');
        } else {
          if (json.status === 1) {
            global.me = json.data;
            success(Constants.successTitle, 'Success to update your profile');
          } else {
            error(Constants.errorTitle, 'Failed to update your profile');
          }
        }
      });
    }
  };

  onSignout = async () => {
    global.me = null;
    try {
      await AsyncStorage.removeItem(Constants.KEY_USERNAME);
    } catch (e) {
      // remove error
    }
    try {
      await AsyncStorage.removeItem(Constants.KEY_PASSWORD);
    } catch (e) {
      // remove error
    }

    global._prevScreen = 'profile_edit';
    this.props.navigation.navigate('signin');
  };

  onPressProfilePhoto = () => {
    const options = {
      title: 'Select Profile Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const source = {uri: response.uri};

        this.setState({
          profilePhotoSelUri: source,
          // profilePhotoSelPath: response.path,
          profilePhotoSelPath: response.uri,
        });
      }
    });
  };

  onBack = () => {
    this.props.navigation.goBack();
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
    let index = 0;
    return (
      <>
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}>
            {this._renderAvartar()}
            {this._renderMainInputs()}
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
        headerTitle="Edit Profile"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderAvartar = () => {
    const {profilePhotoUri, profilePhotoSelUri} = this.state;
    const isProfilePhotoSelected = profilePhotoSelUri == null ? false : true;

    return (
      <View style={{alignItems: 'center', marginTop: 50}}>
        <TouchableOpacity onPress={this.onPressProfilePhoto}>
          <Image
            source={img_default_avatar}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 106,
              height: 106,
            }}></Image>
          <Avatar
            image={
              isProfilePhotoSelected
                ? profilePhotoSelUri
                : profilePhotoUri
                ? {uri: profilePhotoUri}
                : img_default_avatar
            }
            size={106}
            // borderRadius={53}
            // borderWidth={2}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressProfilePhoto}>
          <Text
            style={[
              GStyles.regularText,
              {fontSize: 13, color: GStyle.linkColor, marginTop: 16},
            ]}>
            Edit photo
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  _renderMainInputs = () => {
    const {
      errors = {},
      userName,
      phoneNumber,
      password,
      secureTextEntry,
    } = this.state;

    return (
      <View style={{marginTop: 50}}>
        <TextField
          ref={this.userNameRef}
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitUserName}
          returnKeyType="next"
          label="Username"
          value={userName}
          error={errors.userName}
        />
        <TextField
          ref={this.phoneNumberRef}
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPhoneNumber}
          returnKeyType="done"
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
          returnKeyType="done"
          label="Password"
          value={password}
          error={errors.password}
          renderRightAccessory={this.renderPasswordAccessory}
          maxLength={4}
          containerStyle={{marginTop: 8}}
        />
      </View>
    );
  };

  _renderButton = () => {
    return (
      <View style={{...GStyles.centerAlign}}>
        <View style={{marginTop: 50}}>
          <TouchableOpacity onPress={this.onSubmit}>
            <View style={GStyles.buttonFill}>
              <Text style={GStyles.textFill}>Save</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 20, marginBottom: 50}}>
          <TouchableOpacity onPress={this.onSignout}>
            <View style={styles.buttonFill}>
              <Text style={styles.textFill}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  _renderBottom = () => {
    return (
      <View style={{height: 50}}>
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

const styles = StyleSheet.create({
  buttonFill: {
    ...GStyles.rowCenterContainer,
    width: 137,
    height: 30,
    justifyContent: 'center',
    backgroundColor: GStyle.grayColor,
    borderRadius: 6,
  },

  textFill: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 12,
    textAlign: 'center',
    color: 'white',
  },
});

export default ProfileEditScreen;
