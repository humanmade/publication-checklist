import { registerStore } from '@wordpress/data';

import * as actions from './actions';
import name from './name';
import reducer from './reducer';
import * as selectors from './selectors';

const PublicationChecklistStore = registerStore( name, {
	actions,
	reducer,
	selectors,
} );

export default PublicationChecklistStore;
