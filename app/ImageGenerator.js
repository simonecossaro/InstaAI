import React, { useState, useEffect } from 'react';
import { ScrollView, Text, Button, ActivityIndicator, Image, TouchableOpacity, TextInput, StyleSheet, Modal, View, Pressable, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import {addImageToDatabase} from './database.js';
import { getUsername } from './session.js';

const ImageGenerator = () => {
  const [imageURL, setImageURL] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imageGenerated, setImageGenerated] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState('');
  const [sessionUser, setSessionUser] = useState(null); 
  let base64data = null;

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

  // request to the API
  async function query(data) {
    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        headers: { Authorization: "Bearer XXXXXX" },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    const result = await response.blob();
    return result;
  };

  const showModal = () => {
      setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const generateImage = async () => {
    try{
      setIsLoading(true);

      query({"inputs": prompt}).then((blob) => {
        const fileReaderInstance = new FileReader();
        fileReaderInstance.readAsDataURL(blob);
        fileReaderInstance.onload = () => {
          base64data = fileReaderInstance.result;
          setImageURL(base64data);
          setIsLoading(false);
          setImageGenerated(true);
        }
      });
    } catch (error) {
        console.log('Error during image generation: ', error);
    }
  };

  // date to string
  const formatDate = (date) => {
    const formattedDate = new Date(date);
    const day = formattedDate.getDate();
    const month = formattedDate.getMonth() + 1;
    const year = formattedDate.getFullYear();
    const hour = formattedDate.getHours();
    const minute = formattedDate.getMinutes();
    const seconds = formattedDate.getSeconds();
    return `${year}/${month < 10 ? '0' + month : month}/${day < 10 ? '0' + day : day} ${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}:${seconds < 10 ? '0' + seconds : seconds}`;
  }; 

  // add image to the database
  const handlePost = () => {
    const creation_date = Date.now();
    const formattedDate = formatDate(creation_date);
    try {
      addImageToDatabase(imageURL, sessionUser, description, formattedDate);
      Alert.alert('Post created');
    } catch (error) {
      console.log('Error adding image to the database: ', error);
      Alert.alert('Error: post not created');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/icon_instaAI.png')} style={styles.logo} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TextInput
            style={styles.input}
            placeholder="Insert the prompt to generate your image..."
            value={prompt}
            onChangeText={text => setPrompt(text)}
            multiline={true}
            textAlignVertical="top"
          />
        </KeyboardAvoidingView>
        <TouchableOpacity style={styles.button} onPress={generateImage}>
          <Text style={styles.buttonText}>Generate image</Text>
        </TouchableOpacity>
        {isLoading && <ActivityIndicator size="large" color="#1E90FF"/>}
        {imageURL && <Image source={{ uri: imageURL }} style={styles.image} />}
        {imageGenerated && <TouchableOpacity style={styles.postButton} onPress={showModal}><Text style={styles.buttonText}>Post</Text></TouchableOpacity>}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={hideModal}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Insert a description</Text>
              <TextInput 
                placeholder="Your description" 
                value={description} 
                onChangeText={setDescription} 
                style={styles.modalInput}
              />
              <Pressable
                style={[styles.modalButton, styles.buttonClose]}
                onPress={handlePost}>
                <Text style={styles.textStyle}>Post</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.buttonClose]}
                onPress={hideModal}>
                <Text style={styles.textStyle}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

export default ImageGenerator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollViewContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 30,
    marginBottom: 20,
    width: 300, 
  },
  button: {
    width: '70%',
    height: 50,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  postButton: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 5,
    borderColor: 'black',
    borderWidth: 1,
    width: '30%',
    height: 40,
    backgroundColor: '#1E90FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: 'black',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    width: 180,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: 'black',
  },
  logo: {
    width: '40%',
    height: 40,
  },
});
