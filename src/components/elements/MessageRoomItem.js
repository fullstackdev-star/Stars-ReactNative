import React, {Component} from 'react';
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

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import Avatar from './Avatar';

const MessageRoomItem = ({item, onPress}) => (
  <View style={{alignItems: 'center', marginTop: 24}}>
    <TouchableOpacity
      onPress={() => {
        onPress(item);
      }}>
      <View style={{width: '88%', flexDirection: 'row', alignItems: 'center'}}>
        {!item.is_read && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              position: 'absolute',
              backgroundColor: 'red',
              left: -16,
              top: 25,
            }}
          />
        )}
        <Avatar
          image={{uri: item.opponent_photo}}
          // status={item.opponent_status}
        />
        <View
          style={{
            marginLeft: 10,
            flex: 1,
          }}>
          <Text style={GStyles.regularText}>{item.opponent_name}</Text>
          <View style={{...GStyles.rowEndContainer, marginTop: 5}}>
            <Text
              numberOfLines={1}
              style={{
                width: '70%',
                fontFamily: 'GothamPro',
                fontSize: 13,
                color: GStyle.grayColor,
                lineHeight: 16,
              }}>
              {item.last_message}
            </Text>
            <Text
              style={{
                fontFamily: 'GothamPro',
                fontSize: 13,
                color: GStyle.grayColor,
              }}>
              {Helper.getPastTimeString(item.last_time)} ago
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

export default MessageRoomItem;
