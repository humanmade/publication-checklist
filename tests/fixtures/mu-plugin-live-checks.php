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

// A typed callback at a later priority than the plugin's default, as other plugins
// register. It fatals if the plugin's WP_Error reaches it, which the REST publish
// tests catch.
add_filter( 'rest_pre_insert_post', function ( stdClass $post ) : stdClass {
	return $post;
}, 20 );

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

// A page template that posts accept, so a request can set the template key.
add_filter( 'theme_post_templates', function ( array $templates ) : array {
	$templates['pc-test-template.php'] = 'PC test template';
	return $templates;
} );

// Use the classic editor form when the e2e suite sets this cookie.
add_filter( 'use_block_editor_for_post', function ( $enabled ) {
	return ! empty( $_COOKIE['publication_checklist_classic_editor'] ) ? false : $enabled;
} );

add_action( 'altis.publication-checklist.register_prepublish_checks', function () {

	// Register only the checks that never return INCOMPLETE when the e2e suite
	// sets this cookie, so the post has no required items.
	$optional_only = ! empty( $_COOKIE['publication_checklist_optional_only'] );

	// Register a required, non-live check that needs a featured image when the
	// e2e suite sets this cookie. It reads the featured_media key of the post.
	if ( ! empty( $_COOKIE['publication_checklist_featured_image'] ) ) {
		register_prepublish_check( 'featured-image-check', [
			'run_check' => function ( array $post, array $meta, array $terms ) : Status {
				return ! empty( $post['featured_media'] )
					? new Status( Status::COMPLETE, 'Featured image is set' )
					: new Status( Status::INCOMPLETE, 'Add a featured image' );
			},
		] );
	}

	// Register a required, non-live check on the sticky, format and template
	// keys of the post when the e2e suite sets this cookie.
	if ( ! empty( $_COOKIE['publication_checklist_post_fields'] ) ) {
		register_prepublish_check( 'post-fields-check', [
			'run_check' => function ( array $post, array $meta, array $terms ) : Status {
				$ok = ! empty( $post['sticky'] )
					&& 'aside' === ( $post['post_format'] ?? '' )
					&& 'pc-test-template.php' === ( $post['template'] ?? '' );
				return $ok
					? new Status( Status::COMPLETE, 'Sticky, aside format and template are set' )
					: new Status( Status::INCOMPLETE, 'Make the post sticky, aside format and use the test template' );
			},
		] );
	}

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
