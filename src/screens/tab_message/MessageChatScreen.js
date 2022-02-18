import React, {Component} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BallIndicator,
  BackHandler,
  Button,
  Clipboard,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  LogBox,
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
  useColorScheme,
  View,
} from 'react-native';

import {SearchBar} from 'react-native-elements';

import GHeaderBar from '../../components/GHeaderBar';
import RestAPI from '../../DB/RestAPI';
import Constants from '../../DB/Constants';

import {IconButton} from 'react-native-paper';
var Sound = require('react-native-sound');

import {GStyle, GStyles, Global, Helper} from '../../utils/Global/index';
import {Dropdown} from '../../lib/MaterialDropdown/index';
import {TextField} from '../../lib/MaterialTextField/index';
import Accordion from '../../lib/Collapsible/Accordion';
import Video from 'react-native-video';

const ic_send = require('../../assets/images/ic_send.png');

import {GiftedChat, Actions, Send, Bubble} from 'react-native-gifted-chat';
import CustomActions from '../../components/elements/MessageActions';
import CustomView from '../../components/elements/MessageView';

const local_messages = require('./data/messages.js');
const local_old_messages = require('./data/old_messages.js');

const WINDOW_WIDTH = Helper.getContentWidth();

class MessageChatScreen extends Component {
  constructor(props) {
    super(props);

    console.log('MessageChatScreen start');

    this.init();
  }

  componentDidMount() {
    this._isMounted = true;
    this.onRefresh('init');
    showPageLoader(true);
    global.onSocketError = this.onSocketError;
    global.onFetchMessageList = this.onFetchMessageList;
    global.onReceiveMessageList = this.onReceiveMessageList;
    Helper.connectToServer();
  }

  componentWillUnmount() {
    Helper.disconnectSocket();

    this._isMounted = false;
    global.onFetchMessageList = null;
    global.onReceiveMessageList = null;
    global.onSocketError = null;
  }

  init = () => {
    this.state = {
      isFetching: false,
      totalCount: 0,

      chatTitle: '',
      messages: [],

      typingText: null,
    };

    this._isMounted = false;

    Sound.setCategory('Playback');
  };

  onRefresh = (type) => {
    let {isFetching, totalCount, messages} = this.state;

    if (isFetching) {
      return;
    }

    let lastMessageId = 0;
    if (type == 'more') {
      if (messages.length < totalCount) {
        lastMessageId = messages[messages.length - 1]._id;
      } else {
        return;
      }
    }

    if (type == 'init') {
      const params = {
        none: 'none',
      };

      RestAPI.get_chat_title(params, (json, err) => {
        showPageLoader(true);

        if (err !== null) {
          Helper.alertNetworkError();
        } else {
          if (json.status === 1) {
            this.setState({chatTitle: json.data.chat_title});
          } else {
            Helper.alertServerDataError();
          }
        }
      });
    } else {
      const params = {
        room_id: Helper.getChatRoomId(),
        last_message_id: lastMessageId,
        count_per_page: Constants.COUNT_PER_PAGE,
      };

      this.setState({isFetching: true});
      RestAPI.get_message_list(params, (error) => {
        if (error !== null) {
          if (type == 'init') {
            showPageLoader(false);
          } else {
            this.setState({isFetching: false});
          }
          Helper.alertNetworkError();
        }
      });
    }
  };

  onSocketError = () => {
    showPageLoader(false);
    this.setState({isFetching: false});

    Helper.alertNetworkError();
  };

  onFetchMessageList = () => {
    showPageLoader(false);
    this.setState({isFetching: false});

    const json = global._fetchedMessageList;
    this.setState({totalCount: json.data.total_count});
    this.onLoadMore(json.data.message_list);
  };

  onReceiveMessageList = () => {
    showPageLoader(false);

    const json = global._receivedMessageList;
    this.setState({totalCount: json.data.total_count});
    this.onReceive(json.data.message_list);
  };

  onBack = () => {
    Helper.disconnectSocket();
    this.props.navigation.goBack();
  };

  onSend = (messages = []) => {
    if (messages.length > 0) {
      let params = {
        room_id: Helper.getChatRoomId(),
        sender_id: global.me.id,
        receiver_id: global._roomId,
        type: Constants.MESSAGE_TYPE_TEXT,
        message: messages[0].text,
      };
      // showPageLoader(true);
      RestAPI.send_message(params, (error) => {
        if (error !== null) {
          showPageLoader(false);
          Helper.alertNetworkError();
        }
      });
    }
  };

  onPlaySound = (value) => {
    const track = new Sound(value, null, (e) => {
      if (e) {
        console.log('error loading track:', e);
      } else {
        track.play();
      }
    });
  };

  onReceive = (message_list = []) => {
    let messages = [];
    message_list.forEach((item) => {
      if (item.sender_id != global.me.id) {
        this._opponentId = item.sender_id;
      }

      const newItem = {
        _id: item.message_id,
        text: item.message,
        createdAt: item.time,
        user: {
          _id: item.sender_id == global.me.id ? 1 : item.sender_id,
          name: item.sender_name,
          avatar: item.sender_photo,
        },
      };
      messages.push(newItem);
    });

    this.setState((oldState) => {
      return {
        messages: GiftedChat.append(oldState.messages, messages),
      };
    });
  };

  onLoadMore = (message_list = []) => {
    let messages = [];
    message_list.forEach((item) => {
      if (item.message) {
        if (item.sender_id != global.me.id) {
          this._opponentId = item.sender_id;
        }

        const newItem = {
          _id: item.message_id,
          text: item.message,
          createdAt: new Date(item.time),
          user: {
            _id: item.sender_id == global.me.id ? 1 : item.sender_id,
            name: item.sender_name,
            avatar: item.sender_photo,
          },
        };
        messages.push(newItem);
      }
    });

    this.setState((oldState) => {
      return {
        messages: GiftedChat.prepend(oldState.messages, messages),
      };
    });
  };

  scrollToBottomComponent = () => {
    return (
      <View style={styles.bottomComponentContainer}>
        <IconButton
          icon="chevron-double-down"
          size={36}
          color={GStyle.activeColor}
        />
      </View>
    );
  };

  render() {
    return (
      <>
        <SafeAreaView style={GStyles.statusBar} />
        <SafeAreaView style={{...GStyles.container}}>
          {this._renderHeader()}
          {this._renderNotification()}
          {this._renderChat()}
        </SafeAreaView>
      </>
    );
  }

  _renderHeader = () => {
    return (
      <GHeaderBar
        headerTitle={global._opponentName}
        leftType="back"
        onPressLeftButton={this.onBack}
      />
    );
  };

  _renderNotification = () => {
    const {chatTitle} = this.state;

    return (
      <View style={{width: '88.1%'}}>
        <Text style={{...GStyles.regularText, fontSize: 13, marginBottom: 4}}>
          {chatTitle}
        </Text>
      </View>
    );
  };

  _renderChat = () => {
    const {messages, isFetching, totalCount} = this.state;

    let isLoadEarlier = messages.length > 0 ? true : false;
    if (isLoadEarlier) {
      isLoadEarlier = messages.length < totalCount ? true : false;
    }

    return (
      <View
        style={{
          flex: 1,
          width: '95%',
        }}>
        <GiftedChat
          messages={messages}
          onSend={this.onSend}
          loadEarlier={isLoadEarlier}
          onLoadEarlier={() => {
            this.onRefresh('more');
          }}
          isLoadingEarlier={isFetching}
          user={{_id: 1, name: 'Dick Arnold'}}
          renderBubble={this._renderBubble}
          placeholder="Type your message here..."
          showUserAvatar
          alwaysShowSend
          renderSend={this._renderSend}
          scrollToBottom
          scrollToBottomComponent={this.scrollToBottomComponent}
          renderCustomView={this._renderCustomView}
          // renderActions={this._renderCustomActions}
          renderMessageVideo={this._renderMessageVideo}
          renderMessageAudio={this._renderMessageAudio}
          renderFooter={this._renderFooter}
        />
      </View>
    );
  };

  _renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  _renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: GStyle.grayBackColor,
          },
          right: {
            backgroundColor: GStyle.activeColor,
          },
        }}
      />
    );
  };

  _renderSend = (props) => {
    return (
      <Send {...props}>
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 14,
          }}>
          <Image source={ic_send} style={{...GStyles.image, width: 24}}></Image>
        </View>
      </Send>
    );
  };

  _renderCustomView(props) {
    return <CustomView {...props} />;
  }

  _renderMessageVideo = (props) => {
    const {currentMessage} = props;
    return (
      <View
        style={{
          width: 150,
          height: 100,
          borderRadius: 13,
          overflow: 'hidden',
          margin: 3,
          borderWidth: 1,
          borderColor: 'red',
        }}>
        <Video
          source={{uri: currentMessage.video, cache: true}} // Can be a URL or a local file.
          ref={(ref) => {
            this.player = ref;
          }} // Store reference
          resizeMode="cover"
          onBuffer={this.onBuffer} // Callback when remote video is buffering
          onError={this.videoError} // Callback when video cannot be loaded
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
          }}
        />
      </View>
    );
  };

  _renderMessageAudio = (props) => {
    const {currentMessage} = props;
    return (
      <View
        style={{
          width: 150,
          height: 50,
          borderRadius: 13,
          margin: 3,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: 'red',
        }}>
        <TouchableOpacity
          onPress={() => {
            this.onPlaySound(currentMessage.audio);
          }}>
          <Text>Play</Text>
        </TouchableOpacity>
      </View>
    );
  };

  _renderFooter = (props) => {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>{this.state.typingText}</Text>
        </View>
      );
    }
    return null;
  };
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#aaa',
  },
});

export default MessageChatScreen;
