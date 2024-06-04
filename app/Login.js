import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { saveUsername } from './session';
import { checkCredentials } from './database';

const LoginScreen = ({navigation}) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleAccess = async() => {
        const responseCheckCredentials = await checkCredentials(username, password);
        if (responseCheckCredentials) {
            await saveUsername(username);
            console.log("Username added in the session");
            navigation.navigate('Home');
        } else {
            Alert.alert('Incorrect username and/or password');
        };
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/icon_instaAI.png')} 
                style={styles.logo}
            >
            </Image>
            <TextInput style={styles.input}
                placeholder="Username"
                placeholderTextColor="white"
                value={username} 
                onChangeText={setUsername}
            />
            <TextInput style={styles.input}
                placeholder="Password"
                placeholderTextColor="white"
                secureTextEntry={true}
                value={password} 
                onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.button} onPress={handleAccess}>
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <Text style={styles.text}>Are you new?</Text>
            <TouchableOpacity style={styles.transparentButton} onPress={() => navigation.navigate('Sign Up')}>
                <Text style={styles.transparentButtonText}>Sign up</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
    },
    input: {
        width: '80%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        paddingHorizontal: 10,
        color: 'white',
    },
    button: {
        width: '80%',
        height: 50,
        backgroundColor: '#1E90FF',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    transparentButton: {
        width: '80%',
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transparentButtonText: {
        color: '#1E90FF',
        fontSize: 14,
    },
    logo: {
        width: 150,
        height: 150,
        resizeMode: 'contain',
    },
    text: {
        color: 'white',
        marginTop: 15,
    },
});

export default LoginScreen;