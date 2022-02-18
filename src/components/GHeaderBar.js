import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  SectionList,
  Alert,
  TouchableHighlight,
  ActivityIndicator,
  ViewPropTypes,
  TouchableOpacity,
} from 'react-native';

import {
  ThemeProvider,
  Image,
  Button,
  Icon,
  SearchBar,
  Avatar,
} from 'react-native-elements';

import PropTypes from 'prop-types';
import {GStyle, GStyles, Global, Helper} from '../utils/Global/index';

const HeaderBarHeight = 46;

const ic_logo = require('../assets/images/ic_logo.png');
const img_back = require('../assets/images/ic_back.png');
const img_filter = require('../assets/images/ic_filter.png');
const img_more = require('../assets/images/ic_more.png');
const img_edit = require('../assets/images/ic_edit.png');
const ic_plus = require('../assets/images/ic_plus_1.png');
const img_edit_c = require('../assets/images/ic_edit_2.png');
const img_close = require('../assets/images/ic_close.png');

const LEFT_TYPES = {
  back: {
    image: img_back,
  },
  close: {
    image: img_close,
  },
  logo: {
    image: ic_logo,
  },
};

const RIGHT_TYPES = {
  edit: {
    image: img_edit,
  },
  edit_c: {
    image: img_edit_c,
  },
  plus: {
    image: ic_plus,
  },
  more: {
    image: img_more,
  },
  filter: {
    image: img_filter,
  },
  clear: {
    isText: true,
    text: 'Clear',
  },
  save: {
    isText: true,
    text: 'Save',
  },
  skip: {
    isText: true,
    text: 'Skip this step',
  },
  cancel: {
    isText: true,
    text: 'Cancel',
  },
  next: {
    isText: true,
    text: 'Next',
  },
  add: {
    isText: true,
    text: '+Add',
  },
};

class GHeaderBar extends React.Component {
  static propTypes = {
    headerTitle: PropTypes.string.isRequired,
    leftType: PropTypes.string,
    rightType: PropTypes.string,
    onPressLeftButton: PropTypes.func,
    onPressRightButton: PropTypes.func,
    rightAvatar: PropTypes.element,
  };

  constructor(props) {
    super(props);

    console.log('GHeaderBar start');

    this.state = {};
  }

  componentDidMount() {}

  render() {
    return (
      <ThemeProvider theme={{}}>
        <View style={styles.headerView}>
          <View style={{...styles.headerContainer}}>
            {this._renderLeftPart()}
            <Text style={{...styles.titleHeader}}>
              {this.props.headerTitle}
            </Text>
            {this._renderRightPart()}
          </View>
        </View>
      </ThemeProvider>
    );
  }

  _renderLeftPart = () => {
    const {leftType} = this.props;

    if (this.props.hasOwnProperty('onPressLeftButton')) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (this.props.onPressLeftButton) {
              this.props.onPressLeftButton();
            }
          }}
          style={{...GStyles.centerAlign, width: 50, height: '100%'}}>
          <Image
            source={LEFT_TYPES[leftType].image}
            style={
              leftType == 'logo'
                ? {
                    width: 24,
                    height: 26,
                    resizeMode: 'contain',
                  }
                : {
                    width: 18,
                    height: 18,
                    resizeMode: 'contain',
                  }
            }
          />
        </TouchableOpacity>
      );
    } else {
      return <View style={{flex: 1}} />;
    }
  };

  _renderRightPart = () => {
    const {rightType} = this.props;
    if (this.props.hasOwnProperty('onPressRightButton')) {
      return (
        <TouchableOpacity
          onPress={() => {
            if (this.props.onPressLeftButton) {
              this.props.onPressRightButton();
            }
          }}>
          {RIGHT_TYPES[rightType].isText ? (
            <Text
              style={{
                color: GStyle.activeColor,
                fontFamily: 'GothamPro-Medium',
                fontSize: 14,
              }}>
              {RIGHT_TYPES[rightType].text}
            </Text>
          ) : (
            <Image
              source={RIGHT_TYPES[rightType].image}
              style={{
                width: 20,
                height: 20,
                resizeMode: 'contain',
              }}
            />
          )}
        </TouchableOpacity>
      );
    }
    if (this.props.hasOwnProperty('rightAvatar')) {
      return (
        <View style={styles.rightButtonContainer}>
          {this.props.rightAvatar}
        </View>
      );
    }
    return <View style={{flex: 1}} />;
  };
}

const styles = StyleSheet.create({
  headerView: {
    width: '100%',
    height: 50,
    zIndex: 99,
    backgroundColor: GStyle.snowColor,
    shadowColor: 'white',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 5,
    shadowOpacity: 0.3,
    elevation: 0,
  },

  headerContainer: {
    width: '100%',
    height: HeaderBarHeight,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingRight: 20,
    marginTop: 4,
    zIndex: 99,
  },

  titleHeader: {
    flex: 5,
    color: GStyle.blackColor,
    fontFamily: 'GothamPro-Medium',
    fontSize: 17,
    textAlign: 'center',
  },

  leftButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  rightButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

export default GHeaderBar;
