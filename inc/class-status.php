<?php

namespace Altis\Workflow\PublicationChecklist;

/**
 * Status indicator.
 *
 * Each status item represents a single check in the checklist, and the status
 * of that check: either complete (allow publish), incomplete (block publish),
 * or info (failed, but don't block publish).
 */
class Status {
	const COMPLETE = 'complete';
	const INCOMPLETE = 'incomplete';
	const INFO = 'info';

	/**
	 * Status type.
	 *
	 * One of the status constants (`complete`, `incomplete`, `info`).
	 *
	 * @var string
	 */
	protected $status;

	/**
	 * Human-readable message explaining the status.
	 *
	 * @var string
	 */
	protected $message;

	/**
	 * Additional data about the check status.
	 *
	 * This data is passed to the frontend, and can be used to assist with
	 * custom UI.
	 *
	 * @var mixed
	 */
	protected $data;

	/**
	 * Constructor.
	 *
	 * @param string $status Status type.
	 * @param string $message Human-readable message.
	 * @param mixed $data Additional data about the check.
	 */
	public function __construct( string $status, string $message, $data = null ) {
		$this->status = $status;
		$this->message = $message;
		$this->data = $data;
	}

	/**
	 * Get the status type.
	 *
	 * @return string One of the status constants (`complete`, `incomplete`, `info`)
	 */
	public function get_status() : string {
		return $this->status;
	}

	/**
	 * Get the status message.
	 *
	 * @return string Human-readable message explaining the status.
	 */
	public function get_message() : string {
		return $this->message;
	}

	/**
	 * Get additional data about the status.
	 *
	 * @return mixed Additional data about the check status.
	 */
	public function get_data() {
		return $this->data;
	}
}
