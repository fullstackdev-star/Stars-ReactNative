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

const ExploreUserItem = ({item, onPress}) => (
  <View style={{alignItems: 'center', marginTop: 24}}>
    <TouchableOpacity
      onPress={() => {
        onPress(item);
      }}>
      <View style={{width: '88%', flexDirection: 'row', alignItems: 'center'}}>
        <Avatar
          image={{uri: item.user_photo}}
          // status={item.opponent_status}
        />
        <View
          style={{
            marginLeft: 10,
            flex: 1,
          }}>
          <Text style={GStyles.regularText}>{item.user_name}</Text>
        </View>
      </View>
    </TouchableOpacity>
  </View>
);

export default ExploreUserItem;
