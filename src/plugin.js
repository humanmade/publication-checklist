import ChecklistPanel from './containers/ChecklistPanel';

export const name = 'hm-publication-checklist';

export const settings = {
	icon: 'yes',
	render: () => (
		<ChecklistPanel
			shouldBlockPublish={ window.hmPublicationChecklist.block_publish }
		/>
	),
};
