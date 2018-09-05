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
import NumericSetting from './NumericSetting'

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
		if( 'undefined' !== typeof nextProps.hidden ) {
			this.showOrHide( nextProps.hidden )
		}
	}

	showOrHide( hidden ) {
		if ( false === hidden ) {
			this._animateIn();
		} else ( 
			this._animateOut()
		)
	}
	
	_animateIn = () => {
		let { backgroundBlur, leftOffset } = this.state;
		this.setState({hidden: false})
		Animated.timing(backgroundBlur, {duration: 500, toValue: 70}).start()
		Animated.spring(leftOffset, {toValue: 0, delay: 100, bounciness: 8}).start()
	}
	
	_animateOut = () => {
		let { backgroundBlur, leftOffset } = this.state;
		Animated.timing(backgroundBlur, {duration: 500, toValue: 0}).start( () => this.setState({hidden: true}) )
		Animated.spring(leftOffset, {toValue: 100, bounciness: 10}).start()
	}
	
	
	render() {
		return (
			<AnimatedBlurView style={[styles.container, {left: (this.state.hidden ? '100%':'0%')}]} intensity={this.state.backgroundBlur} tint={'light'}>
				<Animated.View style={[styles.container, {
					left: this.state.leftOffset.interpolate({
						inputRange: [0,100],
						outputRange: ['0%', '100%']
					})
				}]} 
				>
				<TouchableHighlight onPress={this.props.hide} style={{flexBasis: '25%', opacity: 0}} underlayColor='#ffffff'><View /></TouchableHighlight>
				<SafeAreaView style={{flexBasis: '75%', backgroundColor: 'rgba(33,150,83,.8)', borderColor: 'rgb(40,140,75)', borderWidth: 2, display: 'flex'}} >
					<NumericSetting />
				</SafeAreaView>
				</Animated.View>
			</AnimatedBlurView>
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
		height: '100%',
		width: '110%',
	}
})