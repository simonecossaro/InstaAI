import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { addUserToDatabase, isUsernameAvailable } from './database';

const SignUpScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [dateSelected, setDateSelected] = useState(false);

    // check all data inserted 
    const checkRegistrationData = async() => {
        if (username == '' || password == '' || name == '' || surname == '') {
            return [false, "Insert all the fields"];
        }
        const checkUsernameValidity = await isUsernameAvailable(username);
        const indexAt = email.indexOf('@');
        const indexPoint = email.indexOf('.');
        if ( indexAt == -1 || indexPoint == -1 ) {
            return [false, "Incorrect email"];
        }
        const today = Date.now();
        const formattedToday = formatDateYMD(today);
        const formattedInputDate = formatDateYMD(dateOfBirth);
        if (formattedInputDate >= formattedToday ){
            return [false, "Incorrect date of birth"];
        }
        if (!checkUsernameValidity){
            return [false, "Username not available. Insert another one."];
        } else{
            return [true, "No errors"];
        }
    };

    // try to add user to the database
    const handleSignUpPress = async() => {
        const checkRegistration = await checkRegistrationData();
        if (checkRegistration[0]){
            try {
                addUserToDatabase(username, password, name, surname, email, formatDateYMD(dateOfBirth));
                Alert.alert("Registration done");
            } catch (error) {
                alert("Registration not done");
                console.log('Error: ', error);
            }
        } else {
            Alert.alert(checkRegistration[1]);
        }
    };

    // map to day/month/year format
    const formatDateDMY = (date) => {
        const formattedDate = new Date(date);
        const day = formattedDate.getDate();
        const month = formattedDate.getMonth() + 1;
        const year = formattedDate.getFullYear();
        return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
    };

    // map to year/month/day format
    const formatDateYMD = (date) => {
        const formattedDate = new Date(date);
        const day = formattedDate.getDate();
        const month = formattedDate.getMonth() + 1;
        const year = formattedDate.getFullYear();
        return `${year}/${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day}`;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <View style={styles.container}>
                <TextInput
                    style={styles.input}
                    placeholder="Name"
                    placeholderTextColor="white"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Surname"
                    placeholderTextColor="white"
                    value={surname}
                    onChangeText={setSurname}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="white"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    placeholderTextColor="white"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="white"
                    secureTextEntry={true}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
                    <View>
                        {dateSelected ? <Text style={styles.inputText}>{formatDateDMY(dateOfBirth)}</Text> : <Text style={styles.inputText}>Date of Birth</Text>}
                    </View>
                </TouchableOpacity>
                {showDatePicker && (
                    <RNDateTimePicker
                        testID="dateTimePicker"
                        value={dateOfBirth}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            const currentDate = selectedDate || dateOfBirth;
                            setShowDatePicker(false);
                            setDateOfBirth(currentDate);
                            setDateSelected(true);
                        }}
                    />
                )}
                <TouchableOpacity style={styles.button} onPress={handleSignUpPress}>
                    <Text style={styles.buttonText}>Sign up</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
    inputText: {
        color: 'white',
        textAlignVertical: 'center',
        paddingTop: 13,
    },
    button: {
        width: '40%',
        height: 40,
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
});

export default SignUpScreen;