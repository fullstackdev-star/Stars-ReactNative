import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Video from 'react-native-video';
import SplashScreen from 'react-native-splash-screen';
import ScrollBottomSheet from 'react-native-scroll-bottom-sheet';

import Carousel from 'react-native-snap-carousel';

const windowHeight = Dimensions.get('window').height;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: true,      
    };
  }
  componentDidMount() {
    SplashScreen.hide();
  }

  render() {
    

    return (
      <View style={styles.container}>
      <ScrollBottomSheet
        componentType="FlatList"
        snapPoints={[128, '50%', windowHeight - 200]}
        initialSnapIndex={2}
        renderHandle={() => (
          <View style={styles.header}>
            <View style={styles.panelHandle} />
          </View>
        )}
        data={Array.from({ length: 200 }).map((_, i) => String(i))}
        keyExtractor={i => i}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>{`Item ${item}`}</Text>
          </View>
        )}
        contentContainerStyle={styles.contentContainerStyle}
      />
    </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainerStyle: {
    padding: 16,
    backgroundColor: '#F3F4F9',
  },
  header: {
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHandle: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
  },
  item: {
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
    alignItems: 'center',
    marginVertical: 10,
  },
});

export default App;
