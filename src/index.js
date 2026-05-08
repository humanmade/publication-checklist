import { registerPlugin } from '@wordpress/plugins';

import * as Plugin from './plugin';

import { store, STORE_NAME } from './store'; // eslint-disable-line no-unused-vars
import { startSubscriber } from './store/subscriber';
import { registerPrepublishCheck, Status } from './api';

import './style.scss';

// Start the live-check subscriber.
startSubscriber();

// Expose the public API on window.altis.publicationChecklist so plugin authors
// can call registerPrepublishCheck without a build step.
window.altis = window.altis || {};
window.altis.publicationChecklist = { registerPrepublishCheck, Status };

registerPlugin( Plugin.name, Plugin.settings );
