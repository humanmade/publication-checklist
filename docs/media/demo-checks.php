<?php
/**
 * Demo editorial checks used to capture the README screenshots.
 *
 * Installed as a must-use plugin by docs/media/blueprint.json.
 */

use Altis\Workflow\PublicationChecklist\Status;
use function Altis\Workflow\PublicationChecklist\register_prepublish_check;

add_filter( 'altis.publication-checklist.block_on_failing', '__return_true' );

add_action( 'altis.publication-checklist.register_prepublish_checks', function () {

	register_prepublish_check( 'title-length', [
		'live'      => true,
		'fields'    => [ 'title' ],
		'run_check' => function ( array $post ) : Status {
			$length = mb_strlen( trim( (string) ( $post['post_title'] ?? '' ) ) );
			if ( $length >= 20 && $length <= 70 ) {
				return new Status( Status::COMPLETE, 'Title is between 20 and 70 characters' );
			}
			return new Status(
				Status::INCOMPLETE,
				sprintf( 'Title is between 20 and 70 characters (currently %d)', $length )
			);
		},
	] );

	register_prepublish_check( 'featured-image', [
		'live'      => true,
		'fields'    => [ 'featured_media' ],
		'run_check' => function ( array $post ) : Status {
			$media = $post['featured_media'] ?? get_post_thumbnail_id( (int) ( $post['ID'] ?? 0 ) );
			return ! empty( $media )
				? new Status( Status::COMPLETE, 'Featured image added' )
				: new Status( Status::INCOMPLETE, 'Add a featured image' );
		},
	] );

	register_prepublish_check( 'category', [
		'live'      => true,
		'fields'    => [ 'terms.categories' ],
		'run_check' => function ( array $post, array $meta, array $terms ) : Status {
			// The live path keys terms by REST base, the save path by taxonomy name.
			$ids     = array_map( 'intval', (array) ( $terms['categories'] ?? $terms['category'] ?? [] ) );
			$default = (int) get_option( 'default_category' );
			$chosen  = array_diff( $ids, [ $default ] );
			return ! empty( $chosen )
				? new Status( Status::COMPLETE, 'Category chosen' )
				: new Status( Status::INCOMPLETE, 'Choose a category other than Uncategorized' );
		},
	] );

	register_prepublish_check( 'excerpt', [
		'live'      => true,
		'fields'    => [ 'excerpt' ],
		'run_check' => function ( array $post ) : Status {
			return '' !== trim( (string) ( $post['post_excerpt'] ?? '' ) )
				? new Status( Status::COMPLETE, 'Excerpt written' )
				: new Status( Status::INFO, 'Write an excerpt' );
		},
	] );
} );

add_action( 'enqueue_block_editor_assets', function () {
	wp_enqueue_script(
		'demo-checks',
		content_url( 'mu-plugins/demo-checks.js' ),
		[ 'altis_publication_checklist', 'wp-data' ],
		'1.0.0',
		true
	);
	wp_add_inline_script(
		'demo-checks',
		'window.demoChecks = ' . wp_json_encode( [ 'defaultCategory' => (int) get_option( 'default_category' ) ] ) . ';',
		'before'
	);
} );
