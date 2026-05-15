import { registerPlugin } from '@wordpress/plugins';

import * as Plugin from './plugin';

import './store'; // side-effect: registers the wp.data store
import { startSubscriber } from './store/subscriber';
import { registerPrepublishCheck, Status } from './api';

import './style.scss';

// Start the live-check subscriber.
startSubscriber();

// Expose the public API on window.publicationChecklist so plugin authors
// can call registerPrepublishCheck without a build step.
window.publicationChecklist = { registerPrepublishCheck, Status };

registerPlugin( Plugin.name, Plugin.settings );
