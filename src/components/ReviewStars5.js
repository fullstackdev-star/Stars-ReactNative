import React from 'react';
import {Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {Icon} from 'react-native-elements';

import GStyle from '../assets/Styles';

export default class ReviewStars5 extends React.Component {
  static propTypes = {
    isClickable: PropTypes.bool,
    onChangePoint: PropTypes.func,
    point: PropTypes.number,
    starSize: PropTypes.number,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  render5Stars = (point, starSize) => {
    let {isClickable, onChangePoint} = this.props;
    let points = [1, 2, 3, 4, 5];
    let mark = 0;
    if (point === null) {
      mark = 0;
    } else {
      mark = point < 0 ? 0 : point;
    }

    mark = mark > 5 ? 5 : mark;
    mark = Math.floor(mark);
    let starList = [];
    points.forEach((value, index, arr) => {
      // console.log('star loop >',value);
      starList.push(
        <Icon
          name="star"
          type="font-awesome"
          onPress={() => {
            if (isClickable === true) {
              // this.setState({point:value})
              if (onChangePoint) {
                onChangePoint(value);
              }
            }
          }}
          size={starSize}
          color={mark >= value ? GStyle.yellowColor : GStyle.whiteColor}
        />,
      );
    });
    return (
      <View
        style={{
          flexDirection: 'row',
          // alignSelf:'center',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: starSize,
          width: starSize * 6,
          marginVertical: 3,
        }}>
        {starList}
        {/*<Text style={{color:GStyle.whiteColor}}>{point}</Text>*/}
      </View>
    );
  };

  render() {
    let {point, starSize} = this.props;
    // point = point ? point : 0;
    // starSize = starSize ? starSize : 15;
    return this.render5Stars(point, starSize);
  }
}

ReviewStars5.defaultProps = {
  isClickable: false,
  onChangePoint: null,
  point: 0,
  starSize: 15,
};
