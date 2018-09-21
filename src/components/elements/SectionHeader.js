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
import CheckBox from '../../lib/Checkbox/index';

const ic_mini_money = require('../../assets/images/ic_mini_money.png');
const ic_favorite_active = require('../../assets/images/ic_favorite_active.png');
const ic_favorite_inactive = require('../../assets/images/ic_favorite_inactive.png');
const ic_star = require('../../assets/images/ic_star_active.png');
const image_search = require('../../assets/images/ic_search.png');
const img_avatar1 = require('../../assets/images/img_avatar1.png');
const img_avatar2 = require('../../assets/images/img_avatar2.png');
const img_avatar3 = require('../../assets/images/img_avatar3.png');
const img_avatar4 = require('../../assets/images/img_avatar4.png');
const img_avatar5 = require('../../assets/images/img_avatar5.png');

export default SectionHeader = ({title, count, onPress}) => (
  <View style={styles.titleContainer}>
    <View style={GStyles.rowContainer}>
      <Text style={[GStyles.mediumText, {fontSize: 17}]}>{title}</Text>
      <Text
        style={[
          GStyles.regularText,
          {lineHeight: 17, color: GStyle.grayColor, marginLeft: 4},
        ]}>
        {count}
      </Text>
    </View>

    {(() => {
      if (onPress) {
        return (
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity onPress={onPress} style={GStyles.rowContainer}>
              <Text
                style={[
                  GStyles.mediumText,
                  {fontSize: 13, color: GStyle.activeColor},
                ]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>
        );
      }
    })()}
  </View>
);

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    marginTop: 48,
  },

  rightArrowImage: {
    width: 12,
    height: 12,
    resizeMode: 'center',
    marginLeft: 4,
    marginBottom: 2,
  },
});
