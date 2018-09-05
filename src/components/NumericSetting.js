import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	TouchableHighlight,
	Animated,
	Dimensions,
} from 'react-native'

import { BlurView } from 'expo'

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

export default class SettingsDrawer extends React.Component {
	
	constructor(props) {
		super(props)
		if( this.props.hidden === false ) {
			this.showOrHide(false)
		}
	}
	
	state = {
		backgroundBlur: new Animated.Value(0),
		leftOffset: new Animated.Value(100),
		hidden: true
	}

	componentWillReceiveProps(nextProps) {
		console.log( 'will receive props', nextProps )
		if( 'undefined' !== typeof nextProps.hidden ) {
			this.showOrHide( nextProps.hidden )
		}
	}	
	
	render() {
		return (
			<Text>I'm a setting item thing</Text>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		display: 'flex',
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		left: 0,
		height: '20',
		width: '100%',
	}
})