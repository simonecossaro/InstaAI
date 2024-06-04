import React, {useEffect, useState} from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { getUserInfo, fetchUserProfileImagesFromDatabase, getNumberFollower, getNumberFollowed, getPostNumber, getNumberLikes } from './database';
import { getUsername, logout } from './session';

const ProfileScreen = ({navigation}) => {
    const [user, setUser] = useState(null);
    const [images, setImages] = useState([]);
    const [profileVisible, setProfileVisible] = useState(false);
    const [followerNumber, setFollowerNumber] = useState(0);
    const [followedNumber, setFollowedNumber] = useState(0);
    const [postNumber, setPostNumber] = useState(0);
    const [refreshing, setRefreshing] = React.useState(false);

    // fetch session user at rendering
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const sessionUser = await getUsername();
                const userData = await getUserInfo(sessionUser);
                setUser(userData[0]);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };
    
        fetchUserData();
    }, []);

    // fetch the images from the database
    const fetchImagesData = async () => {
        try {
            if (user) {
                const nFollower = await getNumberFollower(user.username);
                setFollowerNumber(nFollower);
                const nFollowed = await getNumberFollowed(user.username);
                setFollowedNumber(nFollowed);
                const nPost = await getPostNumber(user.username);
                setPostNumber(nPost);
                const imagesData = await fetchUserProfileImagesFromDatabase(user.username);
                setImages(imagesData);
                setProfileVisible(true);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    // when the session user is fetched, fetch the images
    useEffect(() => {
        fetchImagesData();
    }, [user]);

    // updates the images upon refresh
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchImagesData().finally(() => {
            setRefreshing(false);
        });
    }, [user]);

    const ImageItem = ({ image }) => {
        const [numberLikes, setNumberLikes] = useState(0);
    
        useEffect(() => {
            const checkLike = async () => {
                const response = await getNumberLikes(image.id);
                setNumberLikes(response);
            };
            checkLike();
        }, [image.id]);
    
        return (
            <View style={styles.imageItem}>
                <Text style={styles.username}>{image.owner}</Text>
                <Image source={{ uri: image.url }} style={{ width: 300, height: 300, marginTop: 5 }} />
                <Text>{image.description}</Text>
                <Text>{image.creation_date}</Text>
                <Text>{numberLikes} likes</Text>
            </View>
        );
    };

    // logout, return to the login screen
    const handleLogout = async () => {
        await logout();
        navigation.navigate('Auth');
    };

    return (
        <View contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Image source={require('../assets/images/icon_instaAI.png')} style={styles.logo} />
                <TouchableOpacity style={styles.button} onPress={handleLogout}>
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
            {profileVisible &&
            <ScrollView contentContainerStyle={styles.scrollContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                <Text style ={styles.nameSurname}>{user.name} {user.surname}</Text>
                <Text style ={{fontSize:20, marginLeft: 10, textAlign: 'center'}}>👤 {user.username}</Text>
                <View style={styles.statsContainer}>
                    <Text style={styles.statItem}>{postNumber} post</Text>
                    <Text style={styles.statItem}>{followerNumber} follower</Text>
                    <Text style={styles.statItem}>{followedNumber} followed</Text>
                </View>
                {images.map((image) => (
                    <ImageItem key={image.id} image={image} />
                ))}
            </ScrollView>}
        </View>
    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
    },
    imageItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    username: {
        textAlign: 'right',
        color: '#0096FF',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: 'black' 
    },    
    logo: {
        width: '40%',
        height: 40,
    },
    button: {
        backgroundColor: '#0096FF',
        paddingHorizontal: 5,
        paddingTop: 2,
        paddingBottom: 5,
        borderRadius: 5,
        height: 25,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: 80,
    },
    nameSurname: {
        fontWeight: 'bold',
        fontSize: 30,
        marginLeft: 5,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 10,
        marginTop: 5,
    },
    statItem: {
        flex: 1,
        textAlign: 'center',
        fontSize: 16,
    },
  });