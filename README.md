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
		'run_check' => function ( array $post, array $meta, array $terms ) : Status {
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
function ( array $post, array $meta, array $terms ) : Status;
```

Your function must return an `Altis\Workflow\PublicationChecklist\Status` object. This object is marked as either complete (allow publishing), incomplete (block publishing), or informational (show as failed, but allow publishing). This status object takes the status type (which should be either `Status::COMPLETE`, `Status::INCOMPLETE`, or `Status::INFO`) and a human-readable message.

`$post` is an array of post data, matching the shape returned by `get_post( $id, ARRAY_A )`. `$meta` is an array of meta data, in the format `string $key => mixed|mixed[] $value`. `$terms` is an array of terms, in the format `string $taxonomy => int[] $terms`.

You can additionally pass data with the status object, which can be used on the frontend to assist with rendering.

By default, checks will only run against the `post` post type. You can pass the relevant type(s) as a `type` option:

```php
add_action( 'altis.publication-checklist.register_prepublish_checks', function () {
	// Pass a single type:
	register_prepublish_check( 'foo', [
		'type' => 'page',
		// ...
	] );

	// Or multiple:
	register_prepublish_check( 'foo', [
		'type' => [
			'post',
			'page',
		],
		// ...
	] );
```


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


## Enforcing checks

By default, Publication Checklist will display a warning if some items are incomplete, with a prompt to allow publishing anyway.

To enforce these checks and block publication, filter the `altis.publication-checklist.block_on_failing` value and return true from your callback. This will change the UI to disable the publish button, display a user-facing message that checks must be completed, and block requests to publish the post.


## Modifying the list view

Publication Checklist will add a Tasks column to the Posts list screen showing the status of each post. This column is only shown if statuses have been registered.

### Hiding the tasks column

To hide this column, filter the `altis.publication-checklist.show_tasks_column` value and return false from your callback. This will hide the Tasks column.

### Changing the location of the tasks column

The tasks column appears after the title column by default on supported post types.

To change which column the tasks column appears after use the `altis.publication-checklist.show_tasks_after_column` filter and return the desired column slug such as `title`, `author` or `tags` for example.


## License

Publication Checklist is licensed under the GPLv2 or later. Copyright 2019 Human Made and contributors.
