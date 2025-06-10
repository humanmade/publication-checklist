import { registerPlugin } from '@wordpress/plugins';

import * as Plugin from './plugin';

import './style.scss';

registerPlugin( Plugin.name, Plugin.settings );
