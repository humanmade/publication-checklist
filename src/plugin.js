import ChecklistPanel from './containers/ChecklistPanel';

export const name = 'altis-publication-checklist';

export const settings = {
	icon: 'yes',
	render: () => (
		<ChecklistPanel
			shouldBlockPublish={ Boolean( window.altisPublicationChecklist.block_publish ) }
		/>
	),
};
