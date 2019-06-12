import { registerPlugin } from '@wordpress/plugins';

import * as Plugin from './plugin';
import './store';

registerPlugin( Plugin.name, Plugin.settings );
