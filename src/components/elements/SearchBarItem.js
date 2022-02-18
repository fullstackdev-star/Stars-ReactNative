import React, {Component} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Button,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
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
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import {SearchBar} from 'react-native-elements';

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';

const ic_search = require('../../assets/images/ic_search.png');

export default class SearchBarItem extends Component {
  constructor(props) {
    super(props);

    this.state = {searchText: ''};
  }

  onSearchFilter(text) {
    this.setState({searchText: text});
    this.props.onChangeText(text);
  }

  onSearchSubmit = () => {
    this.props.onSubmitText();
  };

  searchImage = () => {
    return <Image source={ic_search} style={{width: 16, height: 16}} />;
  };

  render() {
    const {searchText} = this.props;

    return (
      <SearchBar
        lightTheme
        searchIcon={this.searchImage}
        onChangeText={(text) => this.onSearchFilter(text)}
        onClear={(text) => this.onSearchFilter('')}
        placeholder="Search"
        value={searchText}
        returnKeyType={'search'}
        onSubmitEditing={this.onSearchSubmit}
        autoCapitalize="none"
        inputStyle={GStyles.regularText}
        containerStyle={{
          ...GStyles.shadow,
          height: 48,
          backgroundColor: 'white',
          justifyContent: 'center',
        }}
        inputContainerStyle={{
          backgroundColor: 'white',
          height: 44,
        }}
        rightIconContainerStyle={{paddingLeft: 4}}
      />
    );
  }
}

const styles = StyleSheet.create({});
