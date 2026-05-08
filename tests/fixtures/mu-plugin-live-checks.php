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

add_action( 'altis.publication-checklist.register_prepublish_checks', function () {

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

	// 2. PHP-only live check with a 'fields' allowlist.
	//    COMPLETE when the title is at least 10 characters long.
	//    The 'title' key matches the JS subscriber snapshot format sent to the REST endpoint.
	register_prepublish_check( 'php-live-check', [
		'live'      => true,
		'fields'    => [ 'title' ],
		'run_check' => function ( array $post, array $meta, array $terms ) : Status {
			$title = $post['title'] ?? '';
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
