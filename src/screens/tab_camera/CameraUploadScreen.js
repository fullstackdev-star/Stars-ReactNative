import React from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  Image,
  NativeEventEmitter,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view';
import ProgressBar from '../../lib/Progress/Bar';
import Dialog from 'react-native-dialog';
import {createThumbnail} from 'react-native-create-thumbnail';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import ModalSelector from '../../lib/ModalSelector/index';
import ImagePicker from 'react-native-image-picker';
import TagInput from '../../lib/react-native-tag-input/index';
import VideoUpload from '../../utils/NativeModule/NativePackage';

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

const img_default_avatar = require('../../assets/images/ic_default_avatar.png');

const WINDOW_WIDTH = Helper.getWindowWidth();

const inputProps = {
  keyboardType: 'default',
  placeholder: '',
  autoFocus: false,
  style: {
    ...GStyles.regularText,
    marginVertical: Platform.OS === 'ios' ? 10 : -2,
  },
};

class CameraUploadScreen extends React.Component {
  constructor(props) {
    super(props);

    console.log('CameraUploadScreen start');

    this.init();
  }

  componentDidMount() {
    const eventEmitter = new NativeEventEmitter(VideoUpload);
    this.eventListener = eventEmitter.addListener(
      'EventUploadProgress',
      (event) => {        
        this.setState({percent: event.percent});
        if (event.percent == 100 && event.url) {
          this.uploadVideoToBackend(event.url);
        } else if (event.percent < 0) {
          this.setState({isVisibleProgress: false});
          error(Constants.errorTitle, 'Failed to upload video');
        }
      },
    );

    this.onRefresh();

    this.unsubscribe = this.props.navigation.addListener('focus', async () => {
      if (Platform.OS === 'android') {
        Helper.setLightStatusBar();
      }
    });
  }

  componentWillUnmount() {
    if (Platform.OS === 'android') {
      this.eventListener.remove(); //Removes the listener
    }

    this.unsubscribe();
  }

  init = () => {
    this.state = {
      isVisibleProgress: false,
      isVisibleDialog: false,
      percent: 0,

      tags: [],
      text: '',

      price: '',
      description: '',
    };

    this._imageUri = null;

    this.initRef();
  };

  onRefresh = () => {};

  initRef = () => {
    this.priceRef = (ref) => {
      this.price = ref;
    };
    this.descriptionRef = (ref) => {
      this.description = ref;
    };
  };

  uploadVideoToCloudinary = () => {
    showPageLoader(true);
    createThumbnail({url: global._videoUri})
      .then((response) => {
        this._thumbUri = response.path;        
        showPageLoader(false);

        this.setState({percent: 0, isVisibleProgress: true});
        if (Platform.OS === 'android') {
          VideoUpload.upload(
            global._videoUri,
            (msg) => {
              this.uploadVideoToBackend(msg);
            },
            (msg) => {
              console.log('onError', msg);
              this.setState({isVisibleProgress: false});
              error(Constants.errorTitle, 'Failed to upload video');
            },
          );
        } else {
          VideoUpload.upload(global._videoUri, (error, respArray) => {});
        }
      })
      .catch((err) => {
        console.log({err});
        showPageLoader(false);
      });
  };

  uploadVideoToBackend = (cloudinaryUrl) => {
    const {tags, price, description} = this.state;

    const tagSet = tags.join(',');
    const params = {
      user_id: global.me.id,
      uploaded_url: cloudinaryUrl,
      image: this._thumbUri,
      tags: tagSet,
      price: price,
      description: description,
      number: (Number(global.me.upload_count) + 1).toString(),
    };
    RestAPI.add_video(params, (json, err) => {
      if (err !== null) {
        this.setState({isVisibleProgress: false});
        error(Constants.errorTitle, 'Failed to upload video');
        this.props.navigation.goBack();
      } else {
        if (json.status === 1) {
          this.setState({isVisibleProgress: false});
          global.me.upload_count = Number(global.me.upload_count) + 1;
          success(Constants.successTitle, 'Success to upload video');
          this.props.navigation.goBack();
        } else {
          this.setState({isVisibleProgress: false});
          error(Constants.errorTitle, 'Failed to upload video');
          this.props.navigation.goBack();
        }
      }
    });
  };

  onChangeTags = (tags) => {
    this.setState({tags});
  };

  onChangeTagText = (text) => {
    const lastTyped = text.charAt(text.length - 1);
    const parseWhen = [',', ' ', ';', '\n'];

    if (text.length == 1) {
      if (parseWhen.indexOf(text.charAt(0)) > -1) {
        return;
      }
    }

    this.setState({text});

    if (parseWhen.indexOf(lastTyped) > -1) {
      this.setState({
        tags: [...this.state.tags, this.state.text],
        text: '',
      });
    }
  };

  onBlurTagInput = () => {
    const {text} = this.state;

    const newText = text + ',';
    this.onChangeTagText(newText);
  };

  labelExtractor = (tag) => tag;

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
    ['price', 'description']
      .map((name) => ({name, ref: this[name]}))
      .forEach(({name, ref}) => {
        if (ref.isFocused()) {
          this.setState({[name]: text});
        }
      });
  };

  onSubmitPrice = () => {
    this.description.focus();
  };

  onPressPreview = () => {
    this.props.navigation.navigate('camera_preview');
  };

  onPressUploadVideo = () => {
    this.setState({isVisibleDialog: false});
    this.uploadVideoToCloudinary();
  };

  onPressCancelUpload = () => {
    this.setState({isVisibleDialog: false});
  };

  onSubmit = () => {
    let errors = {};

    ['price'].forEach((name) => {
      let value = this[name].value();

      if (!value) {
        errors[name] = 'Should not be empty';
      }
    });

    this.setState({errors});

    const errorCount = Object.keys(errors).length;
    if (errorCount < 1) {
      this.setState({isVisibleDialog: true});
    }
  };

  onBack = () => {
    this.props.navigation.goBack();
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.container}>
          {this._renderHeader()}
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            style={GStyles.elementContainer}>
            {this._renderTagInput()}
            {this._renderMainInputs()}
            {this._renderButton()}
          </KeyboardAwareScrollView>
          {this._renderProgress()}
          {this._renderDialog()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle="Video Upload"
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderTagInput = () => {
    const {tags} = this.state;

    return (
      <View
        style={{
          ...GStyles.borderBottom,
          flex: 1,
          marginTop: 30,
        }}>
        <Text style={{...GStyles.mediumText, marginTop: 20}}>Tags</Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#00000011',
            borderRadius: 10,
            marginTop: 8,
            paddingHorizontal: 8,
          }}>
          <TagInput
            value={tags}
            onChange={this.onChangeTags}
            labelExtractor={this.labelExtractor}
            text={this.state.text}
            onChangeText={this.onChangeTagText}
            onBlur={this.onBlurTagInput}
            tagColor="#888888"
            tagTextColor="white"
            inputProps={inputProps}
            maxHeight={200}
          />
        </View>
      </View>
    );
  };

  _renderMainInputs = () => {
    const {errors = {}, price, description} = this.state;

    return (
      <View>
        <TextField
          ref={this.priceRef}
          keyboardType="number-pad"
          autoCapitalize="none"
          autoCorrect={false}
          enablesReturnKeyAutomatically={true}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          onSubmitEditing={this.onSubmitPrice}
          returnKeyType="done"
          label="Price"
          value={price}
          error={errors.price}
          containerStyle={{marginTop: 8}}
        />
        <TextField
          ref={this.descriptionRef}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={this.onFocus}
          onChangeText={this.onChangeText}
          returnKeyType="next"
          label="Description"
          value={description}
          multiline={true}
          characterRestriction={120}
          error={errors.description}
        />
      </View>
    );
  };

  _renderButton = () => {
    return (
      <>
        <View style={{marginTop: 50}}>
          <TouchableOpacity onPress={this.onPressPreview}>
            <View style={GStyles.buttonFill}>
              <Text style={GStyles.textFill}>Preview</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View style={{marginTop: 20}}>
          <TouchableOpacity onPress={this.onSubmit}>
            <View
              style={{...GStyles.buttonFill, backgroundColor: GStyle.redColor}}>
              <Text style={GStyles.textFill}>Upload</Text>
            </View>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  _renderProgress = () => {
    const {percent, isVisibleProgress} = this.state;

    return (
      <>
        {isVisibleProgress && (
          <>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                backgroundColor: 'black',
                opacity: 0.4,
                zIndex: 100,
                elevation: 10,
              }}></View>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 101,
                elevation: 11,
              }}>
              <ProgressBar
                progress={percent * 0.01}
                width={WINDOW_WIDTH * 0.5}
                height={6}
                color={GStyle.activeColor}
                borderColor={'white'}
              />
              <Text
                style={{
                  ...GStyles.mediumText,
                  color: 'white',
                  marginTop: 10,
                }}>
                Uploading: {percent}%
              </Text>
            </View>
          </>
        )}
      </>
    );
  };

  _renderDialog = () => {
    const {isVisibleDialog} = this.state;

    return (
      <View>
        <Dialog.Container visible={isVisibleDialog}>
          <View style={{...GStyles.rowContainer}}>
            <FontAwesome
              name="warning"
              style={{
                fontSize: 20,
                color: '#f3430a',
                marginLeft: Platform.OS == 'ios' ? 8 : 0,
              }}
            />
            <Dialog.Title style={{marginLeft: 4}}>Video Upload</Dialog.Title>
          </View>
          <View>
            <Dialog.Description>
              ভিডিও আপলোড করার পর ভিডিও ডিলিট করা যাবে না. ৭ দিন পর ভিডিও অটো
              ডিলিট হয়ে যাবে।
            </Dialog.Description>
          </View>
          <Dialog.Button label="Upload" onPress={this.onPressUploadVideo} />
          <Dialog.Button label="Cancel" onPress={this.onPressCancelUpload} />
        </Dialog.Container>
      </View>
    );
  };
}

const styles = StyleSheet.create({});

export default function (props) {
  let navigation = useNavigation();
  let route = useRoute();
  return (
    <CameraUploadScreen {...props} navigation={navigation} route={route} />
  );
}
