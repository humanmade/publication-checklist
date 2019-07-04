<?php

namespace HM\PublicationChecklist;

use stdClass;

/**
 * Bootstrap.
 */
function bootstrap() {
	add_action( 'wp_enqueue_editor', __NAMESPACE__ . '\\enqueue_assets' );
	add_action( 'rest_api_init', __NAMESPACE__ . '\\register_rest_fields' );
	add_action( 'plugins_loaded', function () {
		do_action( 'hm.publication-checklist.register_prepublish_checks' );
	} );
}

/**
 * Enqueue browser assets for the editor.
 */
function enqueue_assets() {
	wp_enqueue_script(
		'workflow-pub-checklist',
		plugins_url( 'build/index.js', __DIR__ ),
		[
			'wp-block-editor',
			'wp-plugins',
		]
	);
	wp_enqueue_style(
		'workflow-pub-checklist',
		plugins_url( 'build/style.css', __DIR__ )
	);
}

/**
 * Register REST fields for check status.
 */
function register_rest_fields() {
	register_rest_field( 'post', 'prepublish_checks', [
		'get_callback' => __NAMESPACE__ . '\\get_check_status_for_api',
	] );
}

/**
 * Register a prepublish check.
 *
 * @param string $id Check ID
 * @param array $options {
 *   @var callable $run_check Callback to run the checks.
 * }
 */
function register_prepublish_check( $id, $options ) {
	$GLOBALS['workflow_checks'][ $id ] = $options;
}

/**
 * Get the check status, formatted for the REST API.
 *
 * @param array $data Raw REST API post data.
 * @return stdClass Map of check ID => status.
 */
function get_check_status_for_api( array $data ) : ?stdClass {
	/** @var WP_Post */
	$post = get_post( $data['id'], ARRAY_A );
	if ( empty( $post ) ) {
		return null;
	}
	$meta = get_post_meta( $data['id'] );

	$statuses = get_check_status( $post, $meta );
	$status_data = [];
	foreach ( $statuses as $id => $status ) {
		$status_data[ $id ] = [
			'status' => $status->get_status(),
			'message' => $status->get_message(),
		];
	}
	return (object) $status_data;
}

/**
 * Get the check status for a post.
 *
 * @param array $data Post data (may not have been saved).
 * @param array $meta Post metadata (may not have been saved).
 * @return Status[] Map of check ID => status.
 */
function get_check_status( array $data, array $meta ) : array {
	$checks = $GLOBALS['workflow_checks'];
	$status = [];
	foreach ( $checks as $id => $options ) {
		$status[ $id ] = call_user_func( $options['run_check'], $data, $meta );
	}

	return $status;
}
