# Publication Checklist

Run checks and enforce conditions before posts are published. Built and designed for the WordPress block editor.

Publication Checklist provides a framework for building out prepublish checks, with flexibility to fit your workflows.


## Creating checks

The core of a check is a function that receives the post's data and meta, and returns a `Status` object. This status object indicates whether publish should be blocked or not.

For example, to enforce setting a value for the "foo" meta key:

```php
use function Altis\Workflow\PublicationChecklist\register_prepublish_check;
use Altis\Workflow\PublicationChecklist\Status;

add_action( 'altis.publication-checklist.register_prepublish_checks', function () {
	register_prepublish_check( 'foo', [
		'run_check' => function ( array $post, array $meta ) : Status {
			if ( isset( $meta['foo'] ) ) {
				return new Status( Status::COMPLETE, 'Foo completed' );
			}

			return new Status( Status::INCOMPLETE, 'Missing foo data' );
		},
	] );
} );
```

Checks are registered via the `Altis\Workflow\PublicationChecklist\register_prepublish_check` function with a unique ID. This function should be called on the `altis.publication-checklist.register_prepublish_checks` action.

Your check function receives the post data as an array, and the post's meta data as an array. Your function should only use this data to run the check, as this may represent data before it is saved to the database. Specifically, your function's signature should be:

```php
function ( array $post, array $meta ) : Status;
```

Your function must return a `Altis\Workflow\PublicationChecklist\Status` object. This object is marked as either complete (allow publishing), incomplete (block publishing), or informational (show as failed, but allow publishing). This status object takes the status type (which should be either `Status::COMPLETE`, `Status::INCOMPLETE`, or `Status::INFO`) and a human-readable message.

You can additionally pass data with the status object, which can be used on the frontend to assist with rendering.


## Displaying check status

By default, Publication Checklist will render a simple checklist of all checks.

You can override a specific item to render richer UI if needed. For example, you may wish to integrate deeply into the block editor, or allow users to correct failing checks inline. This UI is directly inserted into the React element tree and replaces the default output.

Publication Checklist exposes a `altis-publishing-workflow.item.{check_id}` filter using [`withFilters`](https://github.com/WordPress/gutenberg/tree/master/packages/components/src/higher-order/with-filters) to allow overriding the list item component.

For example, to wrap the default status message with a link to a documentation page for the `foo` check:

```jsx
import { Fragment } from '@wordpress/element';

addFilter( 'altis-publishing-workflow.item.image-texts', 'foo/link-message', () => {
	return props => {
		return (
			<Fragment>
				{ props.renderStatusIcon() }
				<a href="http://example.com/">{ props.message }</a>
			</Fragment>
		);
	};
} );
```

Your component receives the following props:

```jsx
const propTypes = {
	// Check ID.
	name: PropTypes.string.isRequired,

	// Human-readable message returned from the backend.
	message: PropTypes.string.isRequired,

	// Status string.
	status: PropTypes.oneOf( [ 'complete', 'incomplete', 'info' ] ).isRequired,

	// Function to render the status of the current check.
	// () => ReactElement
	renderStatusIcon: PropTypes.func.isRequired,

	// Additional data from the backend.
	data: PropTypes.any,
};
```

To enable advanced functionality, you may want to wrap this component in [selectors which provide data about the post](https://developer.wordpress.org/block-editor/data/data-core-block-editor/). Note that the backend acts as the canonical source of all check data, so changes to check status will require saving to the backend to take effect.


## License

Publication Checklist is licensed under the GPLv2 or later. Copyright 2019 Human Made and contributors.


