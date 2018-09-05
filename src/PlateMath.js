import React from 'react';
import {
	StyleSheet,
	Text,
	Image,
	View,
	SafeAreaView,
	TouchableHighlight,
	Vibration,
	AsyncStorage,
	AppState
 } from 'react-native'


import WeightView from './components/WeightView'
import PercentageSelector from './components/PercentageSelector'
import WeightCalc from './utils/WeightCalc'
// import SettingsDrawer from './components/SettingsDrawer'

const DEFAULT_WEIGHT_RACK = {
	lb: {
		45 : 6,
		35 : 6,
		25 : 6,
		15 : 6,
		10 : 6,
		5  : 6,
		2.5: 6
	},
	kg: {
		25 : 6,
		20 : 6,
		15 : 6,
		10 : 6,
		5  : 6,
		2.5: 6,
		1  : 6
	}
}

const DEFAULT_BAR_WEIGHT = {
	lb: 45,
	kg: 20,
}

class PlateMath extends React.Component {

	repeatTime = 20;
	repeatInterval = {};

	constructor(props) {
		super(props);

		this.state = this.defaultState;
		this.restoreState();

		AppState.addEventListener( "change", this.appStateChanged )

	}
	
	defaultState = {
		weightRacks: { ...DEFAULT_WEIGHT_RACK },
		barWeights: { ...DEFAULT_BAR_WEIGHT },
		currentPlates: [],
		weightSystem: 'lb',
		currentWeight: 150,
		multiplier: 1,
		showPercentageSelector: true,
		selectedPercent: 100,
		showConvertedWeight: true,
		appState: AppState.currentState,
		settingsDrawerHidden: true
	}
	
	appStateChanged = (appState) => {
		this.setState( {appState} )
		if ( 'active' === appState) {
			this.restoreState()
		}
	}

	saveState() {
		clearTimeout( this.saveStateDebounce )
		this.saveStateDebounce = setTimeout( () => {
			const state = JSON.stringify(this.state);
			if( state === this.savedState ) {
				return;
			}
			AsyncStorage.setItem('PLATEMATH:appState', state).catch( (error) =>  {
			}).then( () => {
				this.savedState = state
			})
		}, 500 );
	}

	async restoreState() {
		try {
			const savedState = await AsyncStorage.getItem('PLATEMATH:appState');
			const state = Object.assign( this.defaultState, JSON.parse( savedState ) )
			this.setState( state )
			return state
		} catch (error) {
			return false
		}
	}


	componentWillMount() {
		this.restoreState()
	}

	componentDidMount() {
		// this.setState({settingsDrawerHidden: false})

	}

	// shouldComponentUpdate( nextProps, nextState ) {
	// }

	// TODO:
	// maybe add flick or drag gesture on weight readout for rapid changes
	// add settings screen to customize weight rack, bar weight
	// add local storage to save weight rack customizations and current weight
	// add rounding pref (up/down/min-plates)
	// add ability to remove plates and replace with different (45->35+10)
	// add ability to add weight additivtly ( start with 10s on the bar, increasing weight will keep 10s and add even if suboptimal stacking )

	updateWeight( currentWeight, additionalState = {} ) {
		const now = Date.now();
		
		currentWeight = WeightCalc.getClosestAvailableWeight( currentWeight, this.getCurrentBarWeight(), this.getCurrentWeightRack() );
		
		const minForRack = this.getMinForRack();
		const maxForRack = this.getMaxForRack();
		
		if( currentWeight < minForRack ) currentWeight = minForRack;
		if( currentWeight > maxForRack ) currentWeight = maxForRack;
		
		const newState = { currentWeight, ...additionalState  };
		this.setState( { ...newState } )
		// this.saveState();
	}

	incrementWeight = () => {
		this.updateWeight( this.state.currentWeight + this.getMinStep() )
	}

	decrementWeight = () => {
		this.updateWeight( this.state.currentWeight - this.getMinStep() )
	}

	repeatDecrement = () => {
		this.repeatInterval = setInterval( this.decrementWeight, this.repeatTime )
	}

	repeatIncrement = () => {
		this.repeatInterval = setInterval( this.incrementWeight, this.repeatTime )
	}

	stopRepeat = () => {
		clearInterval( this.repeatInterval )
	}

	toggleWeightSystem = () => {
		let weightSystem = 'lb';
		if( this.state.weightSystem === 'lb' ) weightSystem = 'kg'
		let currentWeight = parseInt( this.convertWeight( this.state.currentWeight ) );
		this.setState({ weightSystem, currentWeight }, () => {
			this.updateWeight( this.state.currentWeight );
		} );
	};


	applyPercentage = ( selectedPercent ) => {
		const multiplier = selectedPercent / 100
		this.setState( {selectedPercent} )
		this.updateWeight( this.state.currentWeight, { multiplier } )
	};

	getPlates( currentWeight = null, multiplier = null ) {
		if( null === currentWeight ) {
			currentWeight = this.state.currentWeight;
		}

		if( null === multiplier ) {
			multiplier = this.getCurrentMultiplier();
		}

		const currentPlates = WeightCalc.getPlates(
			currentWeight * multiplier,
			this.getCurrentBarWeight(),
			this.getCurrentWeightRack()
		);


		return { currentPlates };
	}

	getCurrentMultiplier() {
		const currentMultiplier = ( this.state.showPercentageSelector ) ? this.state.multiplier : 1;
		return currentMultiplier;
	}


	convertWeight( weight ) {
		let conversionFactor = ( 'lb' === this.state.weightSystem ) ? 0.45359237 : 2.20462262185;
		return Math.round( conversionFactor * weight ) + (( 'lb' === this.state.weightSystem ) ? 'kg' : 'lb' );
	}

	getMinStep() {
		let min = Math.min.apply( null, Object.keys( this.getCurrentWeightRack() ) );

		return min * 2;
	}

	getCurrentBarWeight() {
		return this.state.barWeights[ this.state.weightSystem ];
	}

	getCurrentWeightRack() {
		return this.state.weightRacks[ this.state.weightSystem ];
	}

	getMinForRack() {
		return this.getCurrentBarWeight();
	}

	getMaxForRack() {
		let plates = Object.keys( this.getCurrentWeightRack() ).reduce( (acc, cur) => {
			let number = this.getCurrentWeightRack()[cur];
			return parseFloat( acc ) + (number * cur);
		}, 0 );

		// return plates + this.state.barWeights[this.state.weightSystem];
		return 400;
	}

	getDisplayWeight( applyMultiplier = false ) {
		// Todo: maybe call from getPlates instead of render and set it to state instead of useing as computed prop
		let weight = this.state.currentWeight * ( ( applyMultiplier ) ? this.getCurrentMultiplier() : 1 );
		weight = WeightCalc.getClosestAvailableWeight( weight, this.getCurrentBarWeight(), this.getCurrentWeightRack() );
		let ret = weight + this.state.weightSystem;

		if( this.state.showConvertedWeight ) {
			ret += ' / ' + this.convertWeight( weight )
		}

		return ret;
	}

	executeInRootContext = (callable) => {
		callable(this)
	} 

	render() {
		return (

			<View style={styles.container}>
				<SafeAreaView 
					style={{
						height: 24,
						flexBasis: 24,
						width: '100%',
						display: 'flex',
						flexDirection: 'row',
						justifyContent: 'space-between',
						padding: 20
					}}
					 >
					<View style={{ flex: 1 }} />
					{/* <TouchableHighlight underlayColor='#ececec' style={{}}  onPress={() => this.setState({settingsDrawerHidden: false})} >
						<Image source={require('../assets/Settings.png')} style={{ width: 24, height: 24, marginRight: 20}}/>
					</TouchableHighlight> */}
				</SafeAreaView>

				<WeightView
					weightRack={ this.state.weightRacks[ this.state.weightSystem ] }
					barWeight={ this.getCurrentBarWeight }
					weight={ Math.round( this.state.currentWeight * this.getCurrentMultiplier() ) }
					plates={ this.getPlates().currentPlates }
				/>


				{/*TODO: Refactor this into a standalone component*/}
				<TouchableHighlight underlayColor='#ececec' style={[styles.buttonRowTH, styles.mainWeighTextDisplay]}  onPress={this.toggleWeightSystem} >
					<View style={ styles.buttonWeightDisplay}>
						<Text style={styles.buttonTextWeightDisplay}>{ this.getDisplayWeight( this.state.showPercentageSelector ) }</Text>
					</View>
				</TouchableHighlight>

				{/*TODO: Refactor this into a standalone component*/}
				<View style={ styles.bottomControlContainer }>

					<View style={ styles.buttonRow }>
						<TouchableHighlight
							underlayColor='#ececec'
							style={[styles.buttonRowTH, { height: this.state.showPercentageSelector ? 0 : 'auto' }]}
							onPress={ this.decrementWeight }
							onLongPress={ this.repeatDecrement }
							onPressOut={ this.stopRepeat }
						>
							<View style={ styles.buttonNudge }>
								<Text style={styles.buttonText}>-</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight activeOpacity={ .8 } style={{ marginTop: 15 }} underlayColor={ '#fff' }
							onPress={ () =>  this.setState({ showPercentageSelector: !this.state.showPercentageSelector }) }
						>
							<View style={{ backgroundColor: '#f7f7f7', }}>
								<Text style={{ backgroundColor: '#f7f7f7', textAlign: 'center', paddingHorizontal: 2, paddingVertical: 4 }}>{ (( this.state.showPercentageSelector ) ?  this.getDisplayWeight( false ) + ' @ ': '' ) + Math.round( this.getCurrentMultiplier() * 100 ) + '%' }</Text>
							</View>
						</TouchableHighlight>

						<TouchableHighlight
							underlayColor='#ececec'
							style={[styles.buttonRowTH, { height: this.state.showPercentageSelector ? 0 : 'auto' }]}
							onPress={ this.incrementWeight } onLongPress={ this.repeatIncrement }
							onPressOut={ this.stopRepeat }
						>
							<View style={ styles.buttonNudge }>
								<Text style={styles.buttonText}>+</Text>
							</View>
						</TouchableHighlight>
					</View>

					<PercentageSelector
						selectedPercent={this.state.selectedPercent }
						applyPercentage={ this.applyPercentage }
						weight={ this.state.currentWeight }
						style={{ width: '100%', marginTop: 20, marginBottom: 15 }}
						updateVisibility={ v => this.setState({ showPercentageSelector: v }) }
						isVisible={ this.state.showPercentageSelector }
					/>

				</View>

				
				{/* <SettingsDrawer hidden={this.state.settingsDrawerHidden} hide={ () => this.setState({settingsDrawerHidden: true})} exec={this.executeInRootContext} /> */}
			</View>
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
	bottomControlContainer: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		alignContent: 'center',
		backgroundColor: '#f7f7f7',
		padding: 20,
	},
	weightInfoContainer: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',

	},
	slider: {
		height: 20,
		width: '100%',
		marginTop: 10,
	},
	textWeightDisplay: {
		fontSize: 18,
		textAlign: 'center',
	},
	buttonRow: {
		width: '100%',
		marginTop: 0,
		flexDirection: 'row',
		justifyContent: 'space-between',
		// backgroundColor: 'blue'
	},
	buttonRowTH: {
		justifyContent: 'center',
    	alignItems: 'center',
    	flexDirection: 'row',
	},
	buttonText: {
		textAlign: 'center',
		color: '#333',
		fontSize: 18,
		paddingVertical: 5,
	},
	buttonNudge: {
		width: 60,
	},
	buttonWeightDisplay: {
	},
	buttonTextWeightDisplay: {
		textAlign: 'center',
		color: '#333',
		fontSize: 18,
		paddingVertical: 15,
	},
});

export default PlateMath;
