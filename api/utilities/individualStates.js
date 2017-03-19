'use strict';

module.exports = { nextStates };

// Quick and dirty: Hard coded model - to be fixed later

function nextStates ( currentState ) {
	var targetStates = [];

	switch( currentState ) {
		case "Initialized": {
			targetStates = ["Validated"];
			break;
		}
		case "Validated":{
			targetStates = ["Deceased"];
			break;
		}
	}

	return targetStates;
}
