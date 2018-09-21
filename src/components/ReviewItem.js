import React from 'react';
import {
    Text, View,
    StyleSheet,
} from 'react-native';
import PropTypes from 'prop-types';
import { Icon, Avatar} from 'react-native-elements';

import GStyle from "../assets/Styles";
import ReviewStars5 from "../components/ReviewStars5"

export default class ReviewItem extends React.Component {


    static propTypes = {
        itemReview: PropTypes.object,
    };

    constructor(props) {
        super(props);
    }

    componentDidMount(){

    }

    getAvatarofDetail = () => {

        let review = this.props.itemReview;
        
        if (review) {

            let customer = review.customer;

            if (customer.social_image) {

                return { uri: customer.social_image }
            } else if (customer.photo) {

                return { uri: RestAPI.fullUrl(customer.photo.file) }
            }

        }

        return require('../assets/images/default_avatar.png')

    }

    render() {
        let item = this.props.itemReview;
        let reqPost = item.request;
        let customer = item.customer;
        let fName = customer ? customer.first_name : '';
        let lName = customer ? customer.last_name : '';
        let point = reqPost ? reqPost.review_point : 0;
        let comment = reqPost ? reqPost.review_comment : '';
        // point = point ? point : 0;
        // starSize = starSize ? starSize : 15;

        return (
            <View style={styles.container}>
                <View style={styles.avatarCotainer}>
                    <Avatar
                        size={40}
                        rounded
                        // icon={{name: 'user', size:35, color:GStyle.purpleColor, type: 'font-awesome'}}
                        source={this.getAvatarofDetail()}
                        onPress={() => console.log("Works!")}
                        activeOpacity={0.7}
                        overlayContainerStyle={{ backgroundColor: GStyle.purpleColor2 }}
                        containerStyle={{ marginTop: 0, borderColor: GStyle.whiteColor, borderWidth: 1, }}
                    />
                </View>
                <View style={styles.detailView}>
                    <Text style={{color:GStyle.whiteColor, fontSize:18,}}>
                        {fName} {lName}
                    </Text>
                    <ReviewStars5
                        point={point}
                        starSize={16}
                    />
                    <Text style={{color:GStyle.whiteColor, fontSize:15,}} numberOfLines={10}>
                        {comment}
                    </Text>
                    
                </View>
            </View>
        );
    }
}

ReviewItem.defaultProps = {
    itemReview: null,
}


const styles = StyleSheet.create({
    container: {
        width:'100%',
        backgroundColor: GStyle.purpleColor1,
        flexDirection:'row',        
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        
    },
    avatarCotainer:{
        width:50,
        justifyContent:'flex-start',
        alignItems:'flex-start',
    },
    detailView:{
        flex:1,
        justifyContent:'flex-start',
        alignItems:'flex-start',
        
    }
});
