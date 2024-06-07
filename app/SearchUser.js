import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { getUsersFromDatabase } from './database';
import { getUsername } from './session';

const SearchUserScreen = () => {
    const [sessionUser, setSessionUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredUsers, setFilteredUsers] = useState([]);
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);
    const [isListVisible, setListVisible] = useState(false);

    // makes the filtered list of users visible
    const handleSearch = (query) => {
        setListVisible(true);
        setSearchQuery(query);
        const filtered = users.filter(user => user.toLowerCase().includes(query.toLowerCase()));
        setFilteredUsers(filtered);
    };

    // opens the profile
    const handlePress = (username) => {
        visitProfile(username);
    };

    // function to visit the profile
    const visitProfile = (searchedUsername) => {
        navigation.navigate('SearchProfile', { searchedUser: searchedUsername });
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

    // when the session user is fetched, fetch the user list
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await getUsersFromDatabase();
                const usernamesList = usersToList(response);
                setUsers(usernamesList);
                setFilteredUsers(usernamesList);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, [sessionUser]);

    return (
        <View>
            <SearchBar
                style={styles.bar}
                placeholder="Search users..."
                onChangeText={handleSearch}
                value={searchQuery}
            />
            {isListVisible && 
                <FlatList
                    data={filteredUsers}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.userButton} onPress={() => handlePress(item)}>
                            <Text style={styles.userButtonText}>👤{item}</Text>
                        </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.toString()}
                />
            }
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        backgroundColor: 'white', 
        borderColor: 'black', 
        padding: 10, 
        marginTop: 40, 
        marginLeft: 10, 
        marginBottom: 10
    },
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
});

export default SearchUserScreen;
