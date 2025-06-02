import ChecklistPanel from './containers/ChecklistPanel';
import PluginStatusIndicator from './containers/PluginStatusIndicator';

export const name = 'altis-publication-checklist';

export const settings = {
	icon: PluginStatusIndicator,
	render: ChecklistPanel,
};
