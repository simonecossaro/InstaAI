import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { addMessageToDatabase, getMessagesUserToUser } from './database';
import { FontAwesome } from '@expo/vector-icons';
import { getUsername } from './session';

export default function ChatScreen({ route }) {
  const [messages, setMessages] = useState([]);
  const [sessionUser, setSessionUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const { otherUser } = route.params;

  // fetch session user at rendering
  useEffect(() => {
    const fetchSessionUser = async () => {
      try {
        const sessUser = await getUsername();
        setSessionUser(sessUser);
      } catch (error) {
        console.error('Error fetching session user:', error);
      }
    };
    fetchSessionUser();
  }, []);

  // when the session user is fetched, fetch the messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getMessagesUserToUser(sessionUser, otherUser);
        const mappedMessages = mapMessages(response);
        setMessages(mappedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [sessionUser, otherUser]);

  // maps messages to GiftedChat format
  const mapMessages = (messages) => {
    return messages.map((msg) => ({
      _id: msg.id,
      text: msg.message,
      createdAt: new Date(msg.datetime),
      user: {
        _id: msg.sender,
        name: msg.sender,
      },
    }));
  };

  // on send: add message to the database and append it to the chat
  const onSend = useCallback(async (newMessages = []) => {
    const sentMessage = newMessages[0];
    setMessages((prevMessages) => GiftedChat.append(prevMessages, sentMessage));
    try {
      addMessageToDatabase(sessionUser, otherUser, sentMessage.text);
    } catch (error) {
      console.error('Error adding message to database:', error);
    }
  }, [sessionUser, otherUser]);

  // function to render the chat in the correct way
  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: styles.bubbleSent,
          left: styles.bubbleReceived,
        }}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {otherUser && (
        <View style={styles.header}>
          <Text style={styles.headerText}> <FontAwesome name="user-circle-o" size={20} color="white"/> {otherUser}</Text>
        </View>
      )}
      <View style={styles.chatContainer}>
        {sessionUser && (
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{
              _id: sessionUser,
            }}
            renderBubble={renderBubble}
            renderAvatar={() => null}
            renderMessageText={(props) => (
              <Text style={{ color: 'white' }}>{props.currentMessage.text}</Text>
            )}  
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'black',
  },
  headerText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  bubbleSent: {
    maxWidth: '70%',
    backgroundColor: '#1E90FF', 
    alignSelf: 'flex-end',
    borderRadius: 20,
    marginBottom: 10,
    marginRight: 10,
    padding: 10,
  },
  bubbleReceived: {
    maxWidth: '70%',
    backgroundColor: 'black', 
    alignSelf: 'flex-start',
    borderRadius: 20,
    marginBottom: 10,
    marginLeft: 10,
    padding: 10,
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  timeText: {
    color: '#aaa', 
    fontSize: 12,
    marginTop: 5, 
  },
  customView: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
});


