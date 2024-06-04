import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AntDesign, Octicons } from '@expo/vector-icons';
import { getUserInfo, fetchUserProfileImagesFromDatabase, checkFollow, addFollowToDatabase, removeFollowFromDatabase, getNumberFollower, getNumberFollowed } from './database';
import { addLikeToDatabase, removeLikeFromDatabase, userLikedThisPost, getNumberLikes, getPostNumber } from './database';
import { getUsername } from './session';

const SearchProfileScreen = () => {
    const [sessionUser, setSessionUser] = useState(null);
    const [user, setUser] = useState(null);
    const [images, setImages] = useState([]);
    const [profileVisible, setProfileVisible] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { searchedUser } = route.params;
    const [isFollower, setIsFollower] = useState(null);
    const [followerNumber, setFollowerNumber] = useState(0);
    const [followedNumber, setFollowedNumber] = useState(0);
    const [postNumber, setPostNumber] = useState(0);
    const [refreshing, setRefreshing] = React.useState(false);

    // function to fetch user data
    const fetchData = async () => {
        try {
            const sessUser = await getUsername();
            setSessionUser(sessUser);
            const userData = await getUserInfo(searchedUser);
            setUser(userData[0]);
            const imagesData = await fetchUserProfileImagesFromDatabase(userData[0].username);
            setImages(imagesData);
            setProfileVisible(true);
            const response = await checkFollow(sessUser, userData[0].username);
            setIsFollower(response);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };
    
    // fetch user data
    useEffect(() => {
        fetchData();
    }, [searchedUser]);

    // function to fetch profile info 
    const fetchFollow = async () => {
        try {
            if (user) {
                const nFollower = await getNumberFollower(user.username);
                setFollowerNumber(nFollower);
                const nFollowed = await getNumberFollowed(user.username);
                setFollowedNumber(nFollowed);
                const nPost = await getPostNumber(user.username);
                setPostNumber(nPost);
            }
        } catch (error) {
            console.error('Error fetching follow:', error);
        }
    };

    // fetch profile info
    useEffect(() => {
        fetchFollow();
    }, [user]);

    // pressing on the arrow takes you back
    const handleBackNavigation = () => {
        navigation.navigate("SearchBarScreen");
    };

    // add follow to the database
    const addFollow = () => {
        addFollowToDatabase(sessionUser, user.username);
        setIsFollower(true);
        setFollowerNumber(followerNumber+1);
    };

    // remove follow from the database
    const removeFollow = () => {
        removeFollowFromDatabase(sessionUser, user.username);
        setIsFollower(false);
        setFollowerNumber(followerNumber-1);
    };

    // fetch data upon refresh
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchData().then(() => {
            fetchFollow();
        }).then(() => {
            setRefreshing(false);
        }).catch((error) => {
            console.error('Error refreshing:', error);
            setRefreshing(false); 
        });
    }, []);

    const ImageItem = ({ image }) => {
        const [liked, setLiked] = useState(false);
        const [numberLikes, setNumberLikes] = useState(0);
    
        useEffect(() => {
            const checkLiked = async () => {
                const response1 = await userLikedThisPost(sessionUser, image.id);
                setLiked(response1);
                const response2 = await getNumberLikes(image.id);
                setNumberLikes(response2);
            };
            checkLiked();
        }, [sessionUser, image.id]);
    
        const handleLikePress = async (image_id) => {
            const likeStatus = Boolean(liked);
            if (likeStatus) {
                setLiked(false);
                removeLikeFromDatabase(sessionUser, image_id);
                setNumberLikes(numberLikes-1);
            } else {
                setLiked(true);
                addLikeToDatabase(sessionUser, image_id);
                setNumberLikes(numberLikes+1);
            }
        };
    
        return (
            <View style={styles.imageItem}>
                <Text style={styles.username}>{image.owner}</Text>
                <Image source={{ uri: image.url }} style={{ width: 300, height: 300, marginTop: 5 }} />
                <Text>{image.description}</Text>
                <Text>{image.creation_date}</Text>
                <TouchableOpacity onPress={() => handleLikePress(image.id)}>
                    <Text>{liked ? <Octicons name="heart-fill" size={30} color="red" /> : <Octicons name="heart" size={30} color="black" />}</Text>
                </TouchableOpacity>
                <Text>{numberLikes} likes</Text>
            </View>
        );
    };

    return (
        <View contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackNavigation}>
                    <Text><AntDesign name="arrowleft" size={24} color="white" /></Text>
                </TouchableOpacity>
                <Image source={require('../assets/images/icon_instaAI.png')} style={styles.logo} />
            </View>
            {profileVisible &&
                <ScrollView contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }>
                    <Text style={styles.nameSurname}>{user.name} {user.surname}</Text>
                    <Text style={{ fontSize: 20, marginLeft: 10, textAlign: 'center' }}>👤 {user.username}</Text>
                    <View style={styles.statsContainer}>
                        <Text style={styles.statItem}>{postNumber} post</Text>
                        <Text style={styles.statItem}>{followerNumber} follower</Text>
                        <Text style={styles.statItem}>{followedNumber} followed</Text>
                    </View>
                    {isFollower ? (
                        <TouchableOpacity onPress={removeFollow} style={styles.followedButton}>
                            <Text>Followed</Text>
                        </TouchableOpacity>
                    ) : (
                            <TouchableOpacity onPress={addFollow} style={styles.button}>
                                <Text style={{color:'white'}}>Follow</Text>
                            </TouchableOpacity>
                        )}
                    {images.map((image) => (
                        <ImageItem key={image.id} image={image} />
                    ))}
                </ScrollView>}
        </View>
    );
};

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
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: 'black',
    },
    logo: {
        width: 120,
        height: 30,
    },
    button: {
        width: '40%',
        height: 30,
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 5,
        marginBottom: 5,
        alignSelf: 'center',
    },
    followedButton: {
        width: '40%',
        height: 30,
        backgroundColor: 'gray',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginTop: 5,
        marginBottom: 5,
        alignSelf: 'center',
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
        marginLeft: 10,
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

export default SearchProfileScreen;