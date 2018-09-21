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
  Modal,
  PermissionsAndroid,
} from 'react-native';

import {
  ThemeProvider,
  Image,
  Button,
  Icon,
  SearchBar,
} from 'react-native-elements';
import AsyncStorage from '@react-native-community/async-storage';
import {BallIndicator} from 'react-native-indicators';

import GStyle from '../assets/Styles';

// import Modal from "react-native-modal";
import LocationView from 'react-native-location-view';
import GHeaderBar from '../components/GHeaderBar';
import Constants from '../DB/Constants';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

const BOX_WIDTH = WINDOW_WIDTH / 1.5;

class LocationViewPage extends React.Component {
  constructor(props) {
    super(props);

    if (global.myLocation === null) {
      // this.isLocationFound = false;
      global.myLocation = {lat: 37.78825, lng: -122.4324};
    } else {
      // this.isLocationFound = true;
    }

    this.state = {
      sectionData: [],
      isPageLoader: false,

      initLat: global.myLocation.lat,
      initLng: global.myLocation.lng,
    };
  }

  activityRender() {
    return (
      <Modal transparent={true} visible={this.state.isPageLoader}>
        <View style={{flex: 1, backgroundColor: 'rgba(13,13,13,0.52)'}}>
          <BallIndicator color={GStyle.purpleColor} />
        </View>
      </Modal>
    );
  }

  watchID = null;
  prevPage = null;

  async componentDidMount() {
    const {params} = this.props.navigation.state;
    const prev = params ? params.prevPage : null;
    this.prevPage = prev;

    global.selectedAddressForStaff = null;

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: Constants.trans('Location is needed'),
          message: Constants.trans(
            'Location is needed to show your position in map and find near by services.',
          ),
          buttonNeutral: Constants.trans('Ask Me Later'),
          buttonNegative: Constants.trans('Cancel'),
          buttonPositive: Constants.trans('OK'),
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }

    this.watchID = navigator.geolocation.watchPosition(
      (position) => {
        this.setState({isPageLoader: false});
        // Create the object to update this.state.mapRegion through the onRegionChange function
        let region = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.00922 * 1.5,
          longitudeDelta: 0.00421 * 1.5,
        };
        this.setState({
          initLat: position.coords.latitude,
          initLng: position.coords.longitude,
        });
      },
      (error) => {
        this.setState({isPageLoader: false});
        console.log(error);
      },
    );
  }

  componentWillUnmount() {
    if (this.watchID) {
      navigator.geolocation.clearWatch(this.watchID);
    }
  }

  onGoBack = () => {
    if (this.prevPage) {
      this.props.navigation.navigate(this.prevPage);
    } else {
      this.props.navigation.goBack();
    }
  };
  render() {
    return (
      <ThemeProvider theme={{}}>
        <View style={mainStyles.mainView}>
          <LocationView
            style={{
              flex: 1,
            }}
            apiKey={Constants.GoogleApiKey}
            initialLocation={{
              latitude: this.state.initLat,
              longitude: this.state.initLng,
            }}
            markerColor={GStyle.purpleColor}
            actionButtonStyle={{
              backgroundColor: GStyle.purpleColor4,
              // width:BOX_WIDTH,
              alignSelf: 'center',
              marginHorizontal: 15,
              borderRadius: 23,
              height: 46,
            }}
            actionText={Constants.trans('Done')}
            onLocationSelect={(region) => {
              global.selectedAddressForStaff = region;
              // this.props.navigation.goBack()
              this.onGoBack();
            }}
          />

          <Button
            buttonStyle={{
              backgroundColor: GStyle.purpleColor4,
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
            containerStyle={{
              borderColor: 'transparent',
              borderWidth: 0,
              position: 'absolute',
              top: 15,
              left: 15,
            }}
            raised={true}
            icon={{
              name: 'arrow-left',
              type: 'feather',
              size: 30,
              color: GStyle.whiteColor,
            }}
            iconContainerStyle={{marginLeft: -3, flex: 1}}
            onPress={() => {
              this.onGoBack();
            }}
          />
        </View>
        {this.activityRender()}
      </ThemeProvider>
    );
  }
}

const mainStyles = StyleSheet.create({
  mainView: {
    flex: 1,
    backgroundColor: '#f9f9ff',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});

export default LocationViewPage;
