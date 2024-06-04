import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to save the username of the session user
export const saveUsername = async (username) => {
    try { 
        await AsyncStorage.setItem('username', username);
    } catch (error) {
        console.error('Error saving username of session user:', error);
    }
};

// Function to recover the username of the session user
export const getUsername = async () => {
    try {
        const username = await AsyncStorage.getItem('username');
        return username;
    } catch (error) {
        console.error('Error recovering username of session user:', error);
        return null;
    }
};

// Function to logout
export const logout = async () => {
    try {
        await AsyncStorage.removeItem('username');
    } catch (error) {
        console.error('Errore during logout:', error);
    }
};