import Expo from 'expo';
import React from 'react';
import {
	StyleSheet,
	Text,
	View,
 } from 'react-native';

import Plate from './Plate';
import WeightCalc from '../utils/WeightCalc';


class WeightView extends React.Component {

	_isMounted = false;

	constructor( props ) {
		super( props );
		this.state = props
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentWillReceiveProps( nextProps ) {
		if( this.props !== nextProps) {
			this.setState( nextProps );
		}
	}

	renderPlates() {
		return this.state.plates.map( ( weight, i ) => {
			return ( <Plate weight={weight} key={i} size={ WeightCalc.getPlatePercentOfMax( weight, this.state.weightRack ) } /> );
		} );
	}

	render() {
		return (
			<View style={styles.plateWrap}>
				{ this.renderPlates() }
			</View>
		)
	}

}

const styles = StyleSheet.create({
	plateWrap: {
		height: '75%',
		paddingTop: 45,
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		// transform: [ { rotate: '-90deg' } ],
	},
});

export default WeightView;
