<?php

namespace HM\PublicationChecklist;

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
	 * Constructor.
	 *
	 * @param string $status Status type.
	 * @param string $message Human-readable message.
	 */
	public function __construct( string $status, string $message ) {
		$this->status = $status;
		$this->message = $message;
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
}
