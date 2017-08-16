import Expo from 'expo';
import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	UIManager,
	LayoutAnimation,
 } from 'react-native';

class Plate extends React.Component {

	_isMounted = false;

	constructor( props ) {
		super( props );
		this.state = { weight: props.weight, size: props.size };
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentWillReceiveProps( nextProps ) {
		if( this.props !== nextProps) {
			this.setState( { weight: nextProps.weight, size: nextProps.size } );
		}
	}

	componentWillUpdate() {
		// UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental( true );
		// LayoutAnimation.spring();
		var CustomLayoutSpring = {
		    duration: 500,
		    create: {
		      type: LayoutAnimation.Types.spring,
		      property: LayoutAnimation.Properties.scaleXY,
		      springDamping: .8,
		    },
		    update: {
		      type: LayoutAnimation.Types.spring,
		      springDamping: 0.7,
		    },
		    delete: {
		      type: LayoutAnimation.Types.spring,
			  property: LayoutAnimation.Properties.scaleXY,
			  springDamping: 1,
			  initialVelocity: 0,
		    },
		  };

		 LayoutAnimation.configureNext( CustomLayoutSpring );
	}

	computePlateStyle() {
		const hScale = .5 + ( .5 * this.state.size );
		const wScale = .7 + ( .3 * this.state.size );
		return Object.assign( { ...styles.plate }, { width: styles.plate.width * wScale, height: styles.plate.height * hScale } );
	}

	render() {
		return (
			<View style={ this.computePlateStyle( this.state.size ) } >
				<Text adjustsFontSizeToFit style={ styles.text } >{ this.state.weight }</Text>
			</View>
		)
	}

}

const styles = {
	plate: {
		height: 200,
		width: 30,
		borderRadius: 3,
		borderColor: '#bbb',
		borderWidth: 0.5,
		backgroundColor: '#ccc',
		marginRight: 2,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},

	text: {
		backgroundColor: 'transparent',
		// backgroundColor: 'white',
		textAlign: 'center',
		fontSize: 16,
		lineHeight: 16,
		height: 25,
		width: '100%',
	}
}

export default Plate;
