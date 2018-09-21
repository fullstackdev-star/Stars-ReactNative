import React, {Component, isValidElement} from 'react';
import {
  Alert,
  BackHandler,
  Button,
  Dimensions,
  FlatList,
  Image,
  LayoutAnimation,
  ListView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import FastImage from 'react-native-fast-image';
import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';

const ic_mini_call = require('../../assets/images/ic_mini_call.png');
const ic_mini_chat = require('../../assets/images/ic_mini_chat.png');

const Avatar = ({
  image,
  size,
  borderRadius,
  onPress,
  status,
  interviewType,
  borderWidth,
  containerStyle,
}) => {
  const defaults = {
    width: 56,
    height: 56,
    // borderRadius: size ? size * 0.35 : 12,
    borderRadius: 0,
    onPress: () => {},
  };

  const statusColor = {
    online: '#49CAE9',
    offline: '#DCDCDC',
    away: '#FE8D65',
    disturb: '#FA395E',
  };

  const interviewImage = {
    chat: ic_mini_chat,
    call: ic_mini_call,
  };

  const icon_size = size ? size : defaults.width;
  const calc_size = (icon_size - 56) * 0.3 - icon_size * 0.15;
  const interviewImageMargin = calc_size > 0 ? 0 : calc_size;
  const statusMargin = (icon_size - 56) * 0.1;

  return (
    <View
      style={[
        {
          width: size ? size : defaults.width,
          height: size ? size : defaults.height,
          elevation: 3,
        },
        containerStyle,
      ]}>
      <TouchableOpacity
        onPress={onPress ? onPress : defaults.onPress}
        disabled={onPress ? false : true}>
        <FastImage
          source={{
            ...image,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
          style={{
            width: '100%',
            height: '100%',
            borderWidth: borderWidth > 0 ? borderWidth : 0,
            borderColor: 'white',
            borderRadius: borderRadius ? borderRadius : defaults.borderRadius,
          }}
        />
        {status && (
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              borderWidth: 2,
              borderColor: 'white',
              position: 'absolute',
              right: statusMargin,
              bottom: statusMargin,
              backgroundColor: statusColor[status],
            }}
          />
        )}
        {interviewType && (
          <Image
            source={interviewImage[interviewType]}
            style={{
              width: 24,
              height: 24,
              position: 'absolute',
              right: interviewImageMargin,
              bottom: interviewImageMargin,
            }}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({});

export default Avatar;
