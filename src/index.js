import { registerPlugin } from '@wordpress/plugins';

import * as Plugin from './plugin';

registerPlugin( Plugin.name, Plugin.settings );
