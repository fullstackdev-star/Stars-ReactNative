import React, {useState} from 'react';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import {} from 'react-native';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';

const App = () => {  
  const [photo, setPhoto] = useState(
    'https://res.cloudinary.com/ogcodes/image/upload/v1581387688/m0e7y6s5zkktpceh2moq.jpg',
  );
  
  const selectPhotoTapped = () => {
    const options = {
      title: 'Select Photo',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const uri = response.uri;
        const type = response.type;
        const name = response.fileName;
        const source = {
          uri,
          type,
          name,
        };
        console.log('test', source)
        cloudinaryUpload(source);
      }
    });
  };
  const cloudinaryUpload = (photo) => {
    const data = new FormData();
    data.append('file', photo);
    data.append('upload_preset', 'videoupload');
    data.append('cloud_name', 'dickwork');
    fetch('https://api.cloudinary.com/v1_1/dickwork/image/upload', {
      method: 'post',
      body: data,
    })
      .then((res) => res.json())
      .then((data) => {
        setPhoto(data.secure_url);
      })
      .catch((err) => {
        Alert.alert('An Error Occured While Uploading');
      });
  };

  return (
    <View>
      <View style={styles.imageContainer}>
        <Image source={{ uri: 'https://res.cloudinary.com/ogcodes/image/upload/v1581387688/m0e7y6s5zkktpceh2moq.jpg' }} style={styles.backgroundImage}></Image>
      </View>
      <View style={styles.uploadContainer}>
        <Text style={styles.uploadContainerTitle}>ImagePicker to Cloudinary</Text>
        <TouchableOpacity onPress={selectPhotoTapped} style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>

    </View >
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    backgroundColor: '#fe5b29',
    height: Dimensions.get('window').height,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  uploadContainer: {
    backgroundColor: '#f6f5f8',
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    position: 'absolute',
    bottom: 0,
    width: Dimensions.get('window').width,
    height: 200,
  },
  uploadContainerTitle: {
    alignSelf: 'center',
    fontSize: 25,
    margin: 20,
  },
  uploadButton: {
    borderRadius: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 7,
      height: 5,
    },
    shadowOpacity: 1.58,
    shadowRadius: 9,
    elevation: 4,
    margin: 10,
    padding: 10,
    backgroundColor: '#fe5b29',
    width: Dimensions.get('window').width - 60,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#f6f5f8',
    fontSize: 20,
    fontFamily: 'Roboto',
  },
});
export default App;
