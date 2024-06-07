import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { getUsersFromDatabase, getChats } from './database';
import { getUsername } from './session';

const ChatSearchScreen = () => {
    const [sessionUser, setSessionUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [isListVisible, setListVisible] = useState(false);
    const [chats, setChats] = useState([]);
    const [refreshing, setRefreshing] = React.useState(false);

    // makes the filtered list of users visible
    const handleSearch = (query) => {
        setListVisible(true);
        setSearchQuery(query);
        const filtered = users.filter(user => user.toLowerCase().includes(query.toLowerCase()));
        setFilteredUsers(filtered);
    };

    // opens the chat
    const handleChatPress = async (otherUser) => {
        navigation.navigate('ChatScreen', { otherUser });
    };

    // creates the user list
    const usersToList = (response) => {
        const usernameList = [];
        response.forEach(item => {
            if (item.username !== sessionUser){
                usernameList.push(item.username);
            }
        });
        return usernameList;
    };

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

    // fetch chats from the database
    const fetchChats = async () => {
        try{
            const responseChats = await getChats(sessionUser);
            setChats(responseChats);
        } catch(error) {
            console.error('Error during fetchChats:', error);
        }
    };

    // when the session user is fetched, fetch the chats
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsersFromDatabase();
                const usernamesList = usersToList(response);
                setUsers(usernamesList);
                setFilteredUsers(usernamesList);
                fetchChats();
            } catch (error) {
                console.error('Error during use effect:', error);
            }
        };
        fetchUsers();
    }, [sessionUser]);

    // updates the chats upon refresh 
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchChats().then(() => {
            setRefreshing(false);
        }).catch((error) => {
            console.error('Error refreshing images:', error);
            setRefreshing(false); 
        });
    }, []);

    const ChatItem = ({ messages }) => {
        const indexLastMessage = messages.length-1;
        const lastMessage = messages[indexLastMessage];
        const lastMessageDate = lastMessage.datetime;
        let otherUser = "";
        
        if (lastMessage.sender === sessionUser){
            otherUser = lastMessage.recipient;
        } else {
            otherUser = lastMessage.sender;
        }
    
        return (
            <View style={styles.chatItem}>
                <TouchableOpacity onPress={() => handleChatPress(otherUser)}>
                    <View style={styles.headerChat}>
                        <Text style={styles.usernameChat}>{otherUser}</Text>
                        <Text style={styles.dateChat}>{lastMessageDate}</Text>
                    </View>
                    <Text>{lastMessage.message}</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View>
            <SearchBar
                style={{ backgroundColor: 'white', borderColor: 'black', padding: 10, marginTop: 40, marginLeft: 10, marginBottom: 10 }}
                placeholder="Search users..."
                onChangeText={handleSearch}
                value={searchQuery}
            />
            {isListVisible && 
                <FlatList
                    data={filteredUsers}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.userButton} onPress={() => handleChatPress(item)}>
                            <Text style={styles.userButtonText}>👤{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.toString()}
                />
            }
            <ScrollView style={{marginBottom: 80}}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                {chats.map((chat, index) => (
                    <ChatItem key={index} messages={chat} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    userButton: {
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 1,
    },
    userButtonText: {
        color: 'black',
        fontSize: 18,
        textAlign: 'left'
    },
    chatItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    headerChat: {
        flexDirection: 'row',
    },
    usernameChat: {
        flex: 1,
        color: '#1E90FF',
        fontWeight: 'bold',
        textAlign: 'left',
    },
    dateChat: {
        flex: 1,
        color: 'gray',
        textAlign: 'right',
    }

});

export default ChatSearchScreen;
