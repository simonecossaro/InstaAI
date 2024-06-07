import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Octicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getImagesForSessionUser, userLikedThisPost, addLikeToDatabase, removeLikeFromDatabase, getNumberLikes } from './database';
import { getUsername} from './session';


const PrincipalScreen = () => {
    const [images, setImages] = useState([]);
    const [sessionUser, setSessionUser] = useState(null);
    const [refreshing, setRefreshing] = React.useState(false);

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

    // fetch the images that the user should see
    const fetchImagesData = async () => {
        try {
            if (sessionUser) {
                const imagesData = await getImagesForSessionUser(sessionUser);
                setImages(imagesData);
            }
        } catch (error) {
            console.error('Error fetching images:', error);
        }
    };

    // when the session user is fetched, fetch the images
    useEffect(() => {
        fetchImagesData();
    }, [sessionUser]); 

    // useFocusEffect to fetch images every time the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchImagesData();
        }, [sessionUser])
    );

    // updates the images upon refresh
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchImagesData().then(() => {
            setRefreshing(false);
        }).catch((error) => {
            console.error('Error refreshing images:', error);
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
        
        // add or remove like
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
                <Image source={require('../assets/images/icon_instaAI.png')} style={styles.logo} />
            </View>
            <ScrollView style={{marginBottom: 80}}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
                {images.map((image) => (
                    <ImageItem key={image.id} image={image} />
                ))}
            </ScrollView>
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
        paddingTop: 5,
        paddingBottom: 5,
        borderRadius: 5,
        height: 35
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    scrollContainer: {
        paddingBottom: 80
    },
  });

export default PrincipalScreen;
