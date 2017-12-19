import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PlateMath from './src/PlateMath.js'

export default class App extends React.Component {
  render() {
    return (
      <PlateMath />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
