import React from 'react';
import {
    Text, View,
    TextInput ,

} from 'react-native';
import PropTypes from 'prop-types';
import { Icon, Avatar } from 'react-native-elements';
import Modal from "react-native-modal";
import GStyle from "../assets/Styles";
import PaymentScreen from "../screens/PaymentScreen";
import {
    StyleSheet,    
    Dimensions,
    SectionList,
    Alert,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,

} from 'react-native';
import ReviewStars5 from './ReviewStars5';
import RestAPI from "../DB/RestAPI";
import {BallIndicator} from "react-native-indicators";
import GHeaderBar from "./GHeaderBar";
import ReviewItem from './ReviewItem';
import Constants from '../DB/Constants';

export default class ReviewListModal extends React.Component {

    static propTypes = {        
        selStaff:PropTypes.object,
        reviewList: PropTypes.array,
        modalVisible : PropTypes.bool,
        onPressBack: PropTypes.func.required,
    };

    

    constructor(props){
        super(props)

    }


    _renderBackButton = ()=>{
        return (<TouchableOpacity
            style={{
                width: 40, height: 40,
                position: 'absolute',
                left: 15,
                top: 10,
            }}
            onPress={() => {
                this.props.onPressBack();
            }}
        >
            <Icon name='arrow-left' type='feather' size={30} color={GStyle.whiteColor} />
        </TouchableOpacity>)

    }
   

    getCurrentAvatarSource = () => {
        let {selStaff} = this.props
        if (selStaff && selStaff.user) {
            if (selStaff.user.social_image) {
                return { uri: selStaff.user.social_image }
            } else if (selStaff.user.photo) {
                return { uri: RestAPI.fullUrl(selStaff.user.photo.file) }
            }
        }

        return require('../assets/images/default_avatar.png')


    }

    renderItem = (item, index, section) => {

        return (
            <View style={styles.itemContainer}>
            
                <ReviewItem itemReview={item} />

            </View>
        );
    }


    _mainRender=()=>{ 
        
        let { reviewList} = this.props;        
        if(reviewList === null){
            return null;
        }else{
            return <Modal
                style={{ flex: 1, margin: 0, padding: 0, backgroundColor:GStyle.purpleColor1}}
                animationType="slide"
                transparent={false}
                visible={this.props.modalVisible}>
                <GHeaderBar
                    onPressLeftButton={() => {
                        this.props.onPressBack();
                    }}
                    headerTitle={Constants.trans('Reviews of Staff')}
                    rightAvatar={<Avatar
                        size={36}
                        rounded
                        // icon={{name: 'user', size:35, color:GStyle.purpleColor, type: 'font-awesome'}}
                        source={this.getCurrentAvatarSource()}
                        onPress={() => console.log("right avatar click!")}
                        activeOpacity={0.7}
                        overlayContainerStyle={{ backgroundColor: GStyle.whiteColor }}
                        containerStyle={{ borderColor: GStyle.whiteColor, borderWidth: 0, }}
                        renderPlaceholderContent={<ActivityIndicator color={GStyle.purpleColor} />}
                    />}
                />
                <View style={styles.mainContainer}>
                    
                    <View style={{width:'100%', justifyContent:'flex-start', alignItems:'center', marginTop:10,}}>
                        <SectionList
                            renderSectionHeader={({ section: { title } }) => { }}
                            renderItem={({ item, index, section }) => this.renderItem(item, index, section)}
                            sections={[{ 'title': 'Reviews', key: 0, data: this.props.reviewList }]}
                            keyExtractor={(item, index) => index + item}
                            // onRefresh={()=>{}}
                            refreshing={false}
                            onEndReached={(offset) => { }}
                        />
                    </View>
                    
                    
                    

                </View>
                

            </Modal>
        }
        
    }

    render() {

        return (
            this._mainRender()

        );
    }
}


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, backgroundColor: GStyle.purpleColor1,
        justifyContent:'flex-start',
        alignItems:'center',
        paddingHorizontal:20,

    }, 
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
        paddingVertical:20,
        borderBottomWidth: 1,
        borderBottomColor: GStyle.placeholderColor,
    },
});
