<?php
/**
 * Test fixture: registers publication checks for e2e live-update tests.
 * Installed by the Playwright blueprint as a must-use plugin.
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

use Altis\Workflow\PublicationChecklist\Status;
use function Altis\Workflow\PublicationChecklist\register_prepublish_check;

// Enable publish blocking so the publish-lock test scenario works.
add_filter( 'altis.publication-checklist.block_on_failing', '__return_true' );

// Start with completed tasks expanded when the e2e suite sets this cookie, so
// it can test the show_tasks_expanded filter.
add_filter( 'altis.publication-checklist.show_tasks_expanded', function () {
	return ! empty( $_COOKIE['publication_checklist_tasks_expanded'] );
} );

// A meta key and a taxonomy for the tests that edit them. The taxonomy has no
// custom rest_base, so its REST key equals its name, which is the key the
// editor snapshot reads.
add_action( 'init', function () {
	register_post_meta( 'post', 'pc_test_meta', [
		'show_in_rest' => true,
		'single'       => true,
		'type'         => 'string',
	] );
	register_taxonomy( 'pc_test_tax', 'post', [ 'show_in_rest' => true ] );
	if ( ! term_exists( 'pc-test-term', 'pc_test_tax' ) ) {
		wp_insert_term( 'pc-test-term', 'pc_test_tax' );
	}
} );

// A classic metabox that saves a REST-registered meta key outside the block
// editor, like Yoast SEO does. Only set up when the e2e suite sets this cookie.
if ( ! empty( $_COOKIE['publication_checklist_metabox'] ) ) {
	add_action( 'init', function () {
		register_post_meta( 'post', 'pc_metabox_note', [
			'show_in_rest' => true,
			'single'       => true,
			'type'         => 'string',
		] );
	} );

	add_action( 'add_meta_boxes_post', function ( WP_Post $post ) {
		add_meta_box(
			'pc-metabox-test',
			'Checklist metabox test',
			function ( WP_Post $post ) {
				printf(
					'<input type="text" id="pc_metabox_note" name="pc_metabox_note" value="%s" />',
					esc_attr( (string) get_post_meta( $post->ID, 'pc_metabox_note', true ) )
				);
			}
		);
	} );

	add_action( 'save_post_post', function ( int $post_id ) {
		if ( isset( $_POST['pc_metabox_note'] ) ) {
			update_post_meta( $post_id, 'pc_metabox_note', sanitize_text_field( wp_unslash( $_POST['pc_metabox_note'] ) ) );
		}
	} );
}

add_action( 'altis.publication-checklist.register_prepublish_checks', function () {

	// Register only the checks that never return INCOMPLETE when the e2e suite
	// sets this cookie, so the post has no required items.
	$optional_only = ! empty( $_COOKIE['publication_checklist_optional_only'] );

	// Register the checks for the classic metabox when the e2e suite sets this cookie.
	$metabox = ! empty( $_COOKIE['publication_checklist_metabox'] );

	// 1. PHP-static check (no 'live'). Informational — does NOT block publishing.
	//    Used in the e2e suite only to verify static checks do not appear in
	//    getLiveResults() after edits. INFO status keeps it out of the
	//    isIncomplete calculation so it doesn't interfere with the lock test.
	register_prepublish_check( 'static-check', [
		'run_check' => function ( array $post, array $meta, array $terms ) : Status {
			$excerpt = $post['post_excerpt'] ?? '';
			return ! empty( trim( (string) $excerpt ) )
				? new Status( Status::COMPLETE, 'Excerpt is set' )
				: new Status( Status::INFO, 'Consider adding an excerpt' );
		},
	] );

	if ( ! $optional_only ) {
		// 2. PHP-only live check with a 'fields' allowlist.
		//    COMPLETE when the title is at least 10 characters long.
		register_prepublish_check( 'php-live-check', [
			'live'      => true,
			'fields'    => [ 'title' ],
			'run_check' => function ( array $post, array $meta, array $terms ) : Status {
				$title = $post['post_title'] ?? '';
				return strlen( trim( (string) $title ) ) >= 10
					? new Status( Status::COMPLETE, 'Title is long enough' )
					: new Status( Status::INCOMPLETE, 'Title must be at least 10 characters' );
			},
		] );

		// 3. PHP side of the dual-check pair.
		//    PHP always returns COMPLETE; the JS override in live-checks.js
		//    requires the title to contain "dual-ok" and wins in the editor UI.
		register_prepublish_check( 'dual-check', [
			'live'      => true,
			'fields'    => [ 'title' ],
			'run_check' => function ( array $post, array $meta, array $terms ) : Status {
				return new Status( Status::COMPLETE, 'PHP says OK (always)' );
			},
		] );
	}

	// 4. Normalisation parity check.
	//    Verifies that the author field is available under the WP_Post key
	//    'post_author' on both the live path (author → post_author via key_map)
	//    and the save path (get_post( ARRAY_A ) always includes post_author).
	//    INFO status so it does not block publishing or affect the lock test.
	register_prepublish_check( 'author-set', [
		'live'      => true,
		'fields'    => [ 'author' ],
		'run_check' => function ( array $post, array $meta, array $terms ) : Status {
			return ! empty( $post['post_author'] )
				? new Status( Status::INFO, 'Author assigned: ' . (int) $post['post_author'] )
				: new Status( Status::INFO, 'No author (unexpected)' );
		},
	] );

	// 5. Live check without a 'fields' allowlist.
	//    Watches every field in the snapshot. INFO status so it does not block
	//    publishing or affect the lock test.
	register_prepublish_check( 'no-fields-check', [
		'live'      => true,
		'run_check' => function ( array $post, array $meta, array $terms ) : Status {
			return new Status( Status::INFO, 'No fields allowlist' );
		},
	] );

	if ( $metabox ) {
		// 6. Checks on a meta value that a classic metabox saves. The save path
		//    passes get_post_meta() arrays (['x']) and the live path passes plain
		//    values, so read either form. The message names the check because
		//    the checklist shows messages, not ids.
		$metabox_note_check = function ( string $label ) : callable {
			return function ( array $post, array $meta, array $terms ) use ( $label ) : Status {
				$note = $meta['pc_metabox_note'] ?? '';
				if ( is_array( $note ) ) {
					$note = $note[0] ?? '';
				}
				return ! empty( trim( (string) $note ) )
					? new Status( Status::COMPLETE, $label )
					: new Status( Status::INCOMPLETE, $label );
			};
		};

		register_prepublish_check( 'metabox-static', [
			'run_check' => $metabox_note_check( 'Metabox note (saved)' ),
		] );

		register_prepublish_check( 'metabox-live', [
			'live'      => true,
			'fields'    => [ 'title', 'meta.pc_metabox_note' ],
			'run_check' => $metabox_note_check( 'Metabox note (live)' ),
		] );
	}

} );

// Enqueue the JS-side fixture after the main plugin script is registered.
add_action( 'enqueue_block_editor_assets', function () {
	wp_enqueue_script(
		'live-checks-fixture',
		WP_CONTENT_URL . '/plugins/publication-checklist/tests/fixtures/live-checks.js',
		[ 'altis_publication_checklist' ],
		'1.0.0',
		true
	);
} );
