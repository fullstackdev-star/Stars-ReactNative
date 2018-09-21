import {StyleSheet} from 'react-native';

import Global, {Helper} from './Global';

const window_width = Helper.getWindowWidth();
const BUTTON_WIDTH = window_width * 0.88;

const GStyle = {
  activeColor: '#0C4682',
  inactiveColor: '#2574FF',
  fontColor: '#272755',
  linkColor: '#0C4682',
  grayColor: '#9393AA',
  grayBackColor: '#F0F0F0',
  lineColor: '#bbbbbb',
  modalBackColor: '#27275599',
  infoColor: '#778CA2',

  blackColor: '#000000',
  snowColor: '#FAFAFA',
  orangeColor: '#FE9870',
  greenColor: '#0EAD69',
  redColor: '#bd0008',

  buttonWhiteColor: '#FAFAFA',
  buttonRadius: 15,

  purpleColor: '#C98FD4',
  greenColor: '#5CB85C',
  lightPurple: '#EFE7F1',
  yellowColor: '#FF9C1A',
  whiteColor: 'white',
  purpleOpacityColor: '#C98FD488',
  placeholderColor: '#fff8',
  inputColor: '#333',
  modalBackground: 'rgba(13,13,13,0.52)',

  borderRadius: 9,
  loginBackColor: '#EEEEEE',

  purpleColor1: '#242B48',
  purpleColor2: '#3A2E54',
  purpleColor3: '#4D315F',
  purpleColor4: '#63346B',

  loginButtonColor: '#D38AE0',
  fbColor: '#385898',
};

const GStyles = StyleSheet.create({
  statusBar: {
    flex: 0,
    backgroundColor: GStyle.snowColor,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },

  elementContainer: {
    flex: 1,
    width: '88.1%',
    height: '100%',
  },

  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rowEndContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowCenterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  absoluteContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: GStyle.grayColor,
    paddingBottom: 8,
  },

  shadow: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: GStyle.activeColor,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.12,
    elevation: 3,
  },

  bigText: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.fontColor,
    fontSize: 24,
    lineHeight: 32,
  },

  mediumText: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.blackColor,
    fontSize: 15,
  },

  regularText: {
    fontFamily: 'GothamPro',
    color: GStyle.blackColor,
    fontSize: 15,
  },

  titleText: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.fontColor,
    fontSize: 24,
    lineHeight: 28,
    marginTop: 20,
  },

  titleDescription: {
    fontFamily: 'GothamPro',
    color: GStyle.fontColor,
    fontSize: 15,
    lineHeight: 24,
    marginTop: 20,
  },

  notifyTitle: {
    fontFamily: 'GothamPro-Medium',
    color: GStyle.fontColor,
    fontSize: 17,
    marginTop: 35,
  },

  notifyDescription: {
    fontFamily: 'GothamPro',
    color: GStyle.fontColor,
    fontSize: 13,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 20,
  },

  elementLabel: {
    color: GStyle.grayColor,
    fontFamily: 'GothamPro-Medium',
    fontSize: 13,
  },

  image: {
    width: 56,
    height: undefined,
    aspectRatio: 1 / 1,
    resizeMode: 'contain',
  },

  buttonFill: {
    justifyContent: 'center',
    backgroundColor: GStyle.activeColor,
    borderRadius: GStyle.buttonRadius,
    width: BUTTON_WIDTH,
    height: 50,
  },

  textFill: {
    fontFamily: 'GothamPro-Medium',
    fontSize: 15,
    textAlign: 'center',
    color: 'white',
  },

  miniDot: {
    width: 3,
    height: 3,
    resizeMode: 'contain',
    marginHorizontal: 4,
  },
});

export default GStyle;
export {GStyles};
