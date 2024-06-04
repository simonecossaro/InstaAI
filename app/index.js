import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './Login';
import SignUpScreen from './SignUp';
import HomeScreen from './Home';

const Stack = createStackNavigator();
const AuthStack = createStackNavigator();

const AuthScreen = () => {
  return (
    <AuthStack.Navigator initialRouteName="Splash">
      <AuthStack.Screen name="Login" component={LoginScreen} 
      options={{
        headerShown: false,
      }}/>
      <AuthStack.Screen name="Sign Up" component={SignUpScreen} 
      options = {{
        headerStyle: {
          backgroundColor: '#1E90FF',
          height: 60,
        },
      }}/>
    </AuthStack.Navigator>
  );
};

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Splash" screenOptions={{headerShown: false}}>
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
  );
};
