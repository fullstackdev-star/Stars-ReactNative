import React from 'react';
import {
    Text, View,
    TextInput ,

} from 'react-native';
import PropTypes from 'prop-types';
import {  Icon } from 'react-native-elements';
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
import ReviewStars5 from '../components/ReviewStars5';
import RestAPI from "../DB/RestAPI";
import {BallIndicator} from "react-native-indicators";

export default class ReviewModal extends React.Component {

    static propTypes = {
        
        request: PropTypes.object,
        modalVisible : PropTypes.bool,
        onPressBack: PropTypes.func.required,
        afterReviewFinish: PropTypes.func,
    };



    constructor(props){
        super(props)

        this.state={
            reviewText : "",
            isPageLoader:false,
            point:0,
        }
    }
    activityRender(){
        return  <Modal
            style={{width:'100%', height:'100%',margin:0}}
            transparent={true}
            visible={this.state.isPageLoader}>
            <View style={{ flex: 1, backgroundColor:'rgba(13,13,13,0.52)'}}>
                <BallIndicator  color={GStyle.whiteColor}  />
            </View>
        </Modal>
    }


    _onSubmit=()=>{
        let post = this.props.request;
        if(post === null){
            return
        }

        this.setState({isPageLoader:true})
        RestAPI.updateReview(post.id, this.state.reviewText, this._point, (res, err)=>{
            this.setState({isPageLoader:false})

            if(err){
                Alert.alert('Oops', 'Failed to leave comments, please try again.')
                return
            }

            if(this.props.afterReviewFinish){
                this.props.afterReviewFinish();
            }else{
                this.props.onPressBack();
            }

        })
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
    _cardModalViewRender=()=>{ 
        
        let post = this.props.request;        
        if(post === null){
            return null;
        }else{
            return <Modal
                style={{ flex: 1, margin: 0, padding: 0, backgroundColor:GStyle.purpleColor1}}
                animationType="fade"
                transparent={false}
                visible={this.props.modalVisible}>

                <View style={styles.mainContainer}>

                    <Text style={{color:GStyle.whiteColor, fontSize:20,}}>
                        Thanks for your payment!
                    </Text>
                    <Text style={{ color: GStyle.whiteColor, fontSize: 15, marginTop:10, marginBottom:10,}}>
                        Please leave review for staff and other customers.
                    </Text>
                    <ReviewStars5
                        starSize={30}
                        point={this.state.point}
                        isClickable={true}
                        onChangePoint={(point)=>{                            
                            this.setState({point:point})
                        }}
                    />

                    <TextInput
                        style={{ height: 120, width:'100%', borderColor: 'white', textAlignVertical:'top', borderWidth: 1, marginVertical:20, borderRadius:5, color:'white' }}
                        onChangeText={(reviewText) => this.setState({ reviewText })}
                        value={this.state.reviewText}
                        multiline={true}

                        // maxLength={120}
                    />

                    <TouchableOpacity onPress={() => {                        
                        this._onSubmit();
                    }}>
                        <View
                            style={{
                                width: '60%',
                                height: 35,
                                backgroundColor: GStyle.greenColor,
                                marginHorizontal: 5,
                                marginVertical: 10,
                                borderRadius: 20,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                // paddingRight:5,                      
                            }}
                        >
                            <Text style={{
                                color: 'white',
                                fontSize: 15,
                                textAlign: 'center',
                                alignSelf: 'center',
                                width: '100%',

                                    }}>
                                        Submit
                            </Text>
                        </View>


                    </TouchableOpacity>

                </View>

                {this._renderBackButton()}

                {this.activityRender()}

            </Modal>
        }
        
    }

    render() {

        return (
            this._cardModalViewRender()

        );
    }
}


const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, backgroundColor: GStyle.purpleColor1,
        justifyContent:'center',
        alignItems:'center',
        paddingHorizontal:20,

    },
});
