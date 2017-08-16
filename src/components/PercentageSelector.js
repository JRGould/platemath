import Expo from 'expo';
import React from 'react';
import {
	StyleSheet,
	Text,
	View,
	ScrollView,
	TouchableHighlight,
} from 'react-native';



class PercentageSelector extends React.Component {

	_isMounted = false;

	itemLayouts            = {};
	scrollViewWidth        = 0;
	scrollViewContentWidth = 0;

	percentSelectTimeoutObj   = {}
	animatingScroll           = false;
	animatingScrollTimeout    = 500;
	animatingScrollTimeoutObj = {};
	scrollEventThrottle       = 10;

	min  = 40;
	max  = 150;
	step = 5;

	constructor( props ) {
		super( props );
		this.state = {
			percent: 100,
			oldIndex: 0,
			currentIndex: 0,
			selectedIndex: 11,
			selectedPercent: 100,
			isVisible: this.props.isVisible || false,
		};
	}

	componentDidMount() {
		this._isMounted = true;
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	componentWillReceiveProps( nextProps ) {
		if( this.props !== nextProps ) {
			this.setState( { isVisible: nextProps.isVisible });
		}
	}

	componentWillUpdate() {
	}

	hideComponent = () => {
		this.props.updateVisibility( false );
	}

	setSelectedPercent( selectedPercent, scroll = true ) {
		this.setState( { selectedPercent } );
		this.props.applyPercentage( selectedPercent / 100 );

		if ( scroll ) {
			this.scrollToSelectedPercent( selectedPercent )
		}
	}

	getSelectedPercentX( selectedPercent ) {
		const selectedPercentLayout = this.itemLayouts[ selectedPercent ] || {x: 0, width: 0};
		const hx = selectedPercentLayout.x;
		const percentItemWidth = selectedPercentLayout.width;
		const svMaxScroll = this.scrollViewContentWidth - this.scrollViewWidth;
		const svMinScroll = 0
		const scrollViewCenterOffset = ( this.scrollViewWidth / 2 ) - ( percentItemWidth / 2 ) +10; //to offset the x box... TODO: need a better solution
		const x = Math.min( svMaxScroll,
				  Math.max( svMinScroll,
				  (hx||0) - (scrollViewCenterOffset||0) )
				);
		return x;

	}

	scrollToSelectedPercent( selectedPercent, animated = true ) {
		if( this.scrollViewRef ) {
			if( animated ) {
				this.animatingScroll = true;
				clearTimeout( this.animatingScrollTimeoutObj );
				this.animatingScrollTimeoutObj = setTimeout( () => this.animatingScroll = false, this.animatingScrollTimeout )
			}
			this.scrollViewRef.scrollTo(  { x: this.getSelectedPercentX( selectedPercent ), y: 0, animated: animated } );
		}
	}

	percentItemSelectedStyle( percentItem ) {
		if ( percentItem == this.state.selectedPercent ) {
			return styles.selectedPercentItemText;
		}
		return {};
	}

	onScroll = (e) => {
		const currentX = e.nativeEvent.contentOffset.x;
		const currentCenterX = currentX + ( this.scrollViewWidth / 2 ) + 10;
		const percentItemWidth = this.itemLayouts[100].width
		const item = Object.keys( this.itemLayouts ).reverse()[ Math.floor( currentCenterX / percentItemWidth ) ] || 100;

		if( ! this.animatingScroll ) {
			this.setSelectedPercent( item, false );
			clearTimeout( this.percentSelectTimeoutObj );
			this.percentSelectTimeoutObj = setTimeout( () => this.scrollToSelectedPercent( item, true ), 300 );
		}

	}

	renderPercentages() {
		const ret = [];
		for ( let i = this.min; i <= this.max; i += this.step ) {
			ret.push(
				<View key={ i } style={ styles.percentItem }
				onLayout={ (e) => {
					this.itemLayouts[i] = e.nativeEvent.layout;
				}}
				>
					<TouchableHighlight onPress={ () => this.setSelectedPercent( i ) } style={ styles.percentItemTouchableHighlight }>
						<Text style={ StyleSheet.flatten([ styles.percentItemText, this.percentItemSelectedStyle( i ) ]) }>{i}</Text>
					</TouchableHighlight>
				</View>
			);
		}

		return ( ret.reverse() );
	}



	render() {
		return (
			<View
			// onMoveShouldSetResponder={ () => true }
			// onResponderGrant={ this.onResponderGrant }
			// onResponderMove={ this.onResponderMove }
			// onResponderRelease={ this.onResponderRelease }
			style={ StyleSheet.flatten( [ styles.wrap, this.props.style, { height: ( this.state.isVisible ) ? 'auto' : 0 } ] ) }
			>
				<ScrollView
				horizontal={ true }
				showsHorizontalScrollIndicator={ false }
				decelerationRate={'fast'}
				scrollEventThrottle={ this.scrollEventThrottle }
				onScroll={ this.onScroll }
				onLayout={ (e) => {
					this.scrollViewWidth = e.nativeEvent.layout.width;
					setImmediate( () => this.scrollToSelectedPercent( this.state.selectedPercent, false ) );
				} }
				ref={ c => this.scrollViewRef = c }
				style={ styles.scrollView }
				>
					<View style={ styles.percentItemsContainer }
					onLayout={ (e) => {
						this.scrollViewContentWidth = e.nativeEvent.layout.width;
						console.log( e.nativeEvent.layout )
						setImmediate( () => this.scrollToSelectedPercent( this.state.selectedPercent, false ) );
					} }
					>
						{ this.renderPercentages() }
					</View>
				</ScrollView>

				<View style={{ backgroundColor: '#4f4f4f', width: 40, display: 'flex', alignContent: 'stretch', alignItems: 'stretch' }}>
					<TouchableHighlight onPress={ this.hideComponent } >
						<Text style={{ paddingVertical: 5, fontWeight: 'bold', color: 'white', textAlign: 'center' }}>X</Text>
					</TouchableHighlight>
				</View>

			</View>
		)
	}

}

const styles = StyleSheet.create({
	wrap: {
		width: '100%',
		borderRadius: 10,
		overflow: 'hidden',
		backgroundColor: '#828282',
		paddingLeft: 5,
		display: 'flex',
		flexDirection: 'row',
	},

	scrollView: {
		width: '100%',
		backgroundColor: '#828282',
		paddingHorizontal: '50%',
	},

	percentItemsContainer: {
		display: 'flex',
		flexDirection: 'row',
	},
	percentItem: {
		width: 40,

	},
	percentItemTouchableHighlight: {
		backgroundColor: '#eee',
		borderRadius: 10,
	},
	percentItemText: {
		paddingVertical: 5,
		fontSize: 16,
		color: 'white',
		backgroundColor: '#828282',
		textAlign: 'center',
	},
	selectedPercentItemText: {
		backgroundColor: '#2D9CDB',
	}

});

export default PercentageSelector;
